-- Drop existing function if it exists (needed when changing return type)
DROP FUNCTION IF EXISTS get_award_leaderboard(INTEGER, INTEGER);

-- Create function to get award leaderboard with statistics
CREATE OR REPLACE FUNCTION get_award_leaderboard(
  p_year_filter INTEGER DEFAULT NULL,
  p_cycle_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
  barangay_id_out INTEGER,
  name_out TEXT,
  total_awards_out BIGINT,
  consecutive_streak_out BIGINT,
  longest_streak_out BIGINT,
  win_rate_out NUMERIC,
  last_award_year_out INTEGER,
  years_since_last_award_out INTEGER,
  first_time_winner_out BOOLEAN,
  award_history_out JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_awards AS (
    SELECT 
      ca.barangay_id,
      ca.cycle_id,
      sc.year
    FROM cycle_awards ca
    JOIN survey_cycle sc ON ca.cycle_id = sc.cycle_id
    WHERE 
      ca.is_awardee = true
      AND (p_year_filter IS NULL OR sc.year = p_year_filter)
      AND (p_cycle_filter IS NULL OR ca.cycle_id = p_cycle_filter)
  ),
  award_years AS (
    SELECT 
      fa.barangay_id,
      fa.year,
      LAG(fa.year) OVER (PARTITION BY fa.barangay_id ORDER BY fa.year) as prev_year
    FROM (SELECT DISTINCT barangay_id, year FROM filtered_awards) fa
  ),
  streak_groups AS (
    SELECT 
      ay.barangay_id,
      ay.year,
      SUM(CASE WHEN ay.year - COALESCE(ay.prev_year, ay.year - 2) > 1 THEN 1 ELSE 0 END) 
        OVER (PARTITION BY ay.barangay_id ORDER BY ay.year) as streak_group
    FROM award_years ay
  ),
  streak_calculations AS (
    SELECT 
      sg.barangay_id,
      sg.streak_group,
      COUNT(*) as streak_length,
      MIN(sg.year) as streak_start,
      MAX(sg.year) as streak_end,
      MAX(sg.year) = EXTRACT(YEAR FROM CURRENT_DATE) - 1 OR 
      MAX(sg.year) = EXTRACT(YEAR FROM CURRENT_DATE) as is_current
    FROM streak_groups sg
    GROUP BY sg.barangay_id, sg.streak_group
  ),
  barangay_streaks AS (
    SELECT 
      sc.barangay_id,
      MAX(CASE WHEN sc.is_current THEN sc.streak_length ELSE 0 END) as consecutive_streak,
      MAX(sc.streak_length) as longest_streak
    FROM streak_calculations sc
    GROUP BY sc.barangay_id
  ),
  total_cycles AS (
    SELECT COUNT(DISTINCT cycle_id) as cycle_count
    FROM survey_cycle
    WHERE 
      (p_year_filter IS NULL OR year = p_year_filter)
      AND (p_cycle_filter IS NULL OR cycle_id = p_cycle_filter)
  ),
  award_history_agg AS (
    SELECT 
      fa.barangay_id,
      jsonb_agg(
        jsonb_build_object(
          'year', fa.year,
          'cycle_id', fa.cycle_id,
          'award_type', 'SGLGB Award'
        ) ORDER BY fa.year DESC
      ) as history
    FROM filtered_awards fa
    GROUP BY fa.barangay_id
  )
  SELECT 
    b.barangay_id as barangay_id_out,
    b.barangay_name as name_out,
    COALESCE(COUNT(DISTINCT fa.cycle_id), 0) as total_awards_out,
    COALESCE(bs.consecutive_streak, 0)::BIGINT as consecutive_streak_out,
    COALESCE(bs.longest_streak, 0)::BIGINT as longest_streak_out,
    CASE 
      WHEN tc.cycle_count > 0 THEN 
        ROUND(COALESCE(COUNT(DISTINCT fa.cycle_id), 0)::numeric / tc.cycle_count::numeric, 2)
      ELSE 0
    END as win_rate_out,
    MAX(fa.year)::INTEGER as last_award_year_out,
    CASE 
      WHEN MAX(fa.year) IS NOT NULL THEN 
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER - MAX(fa.year)::INTEGER
      ELSE NULL
    END as years_since_last_award_out,
    COALESCE(COUNT(DISTINCT fa.cycle_id), 0) = 1 as first_time_winner_out,
    COALESCE(aha.history, '[]'::jsonb) as award_history_out
  FROM barangay b
  CROSS JOIN total_cycles tc
  LEFT JOIN filtered_awards fa ON b.barangay_id = fa.barangay_id
  LEFT JOIN barangay_streaks bs ON b.barangay_id = bs.barangay_id
  LEFT JOIN award_history_agg aha ON b.barangay_id = aha.barangay_id
  GROUP BY b.barangay_id, b.barangay_name, bs.consecutive_streak, bs.longest_streak, tc.cycle_count, aha.history
  ORDER BY total_awards_out DESC, win_rate_out DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_award_leaderboard(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_award_leaderboard(INTEGER, INTEGER) TO anon;
