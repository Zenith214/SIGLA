-- Performance Optimization Indexes for Analytics Dashboard
-- These indexes improve query performance for frequently accessed data

-- ============================================================================
-- ML Cache Table Indexes
-- ============================================================================

-- Index on cycle_id for filtering by cycle
CREATE INDEX IF NOT EXISTS idx_ml_cache_cycle_id 
ON ml_cache(cycle_id);

-- Index on barangay_id for filtering by barangay
CREATE INDEX IF NOT EXISTS idx_ml_cache_barangay_id 
ON ml_cache(barangay_id);

-- Composite index for cycle and barangay lookups (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_ml_cache_cycle_barangay 
ON ml_cache(cycle_id, barangay_id);

-- Indexes for service area satisfaction scores (used in rankings)
CREATE INDEX IF NOT EXISTS idx_ml_cache_financial_satisfaction 
ON ml_cache(cycle_id, financial_assistance_satisfaction DESC);

CREATE INDEX IF NOT EXISTS idx_ml_cache_disaster_satisfaction 
ON ml_cache(cycle_id, disaster_preparedness_satisfaction DESC);

CREATE INDEX IF NOT EXISTS idx_ml_cache_health_satisfaction 
ON ml_cache(cycle_id, health_services_satisfaction DESC);

CREATE INDEX IF NOT EXISTS idx_ml_cache_peace_satisfaction 
ON ml_cache(cycle_id, peace_and_order_satisfaction DESC);

CREATE INDEX IF NOT EXISTS idx_ml_cache_infrastructure_satisfaction 
ON ml_cache(cycle_id, infrastructure_satisfaction DESC);

CREATE INDEX IF NOT EXISTS idx_ml_cache_environmental_satisfaction 
ON ml_cache(cycle_id, environmental_management_satisfaction DESC);

-- ============================================================================
-- Cycle Awards Table Indexes
-- ============================================================================

-- Index on barangay_id for award history lookups
CREATE INDEX IF NOT EXISTS idx_cycle_award_barangay_id 
ON cycle_award(barangay_id);

-- Index on cycle_id for cycle-specific award queries
CREATE INDEX IF NOT EXISTS idx_cycle_award_cycle_id 
ON cycle_award(cycle_id);

-- Composite index for barangay award history
CREATE INDEX IF NOT EXISTS idx_cycle_award_barangay_cycle 
ON cycle_award(barangay_id, cycle_id);

-- Index on is_awardee for filtering winners
CREATE INDEX IF NOT EXISTS idx_cycle_award_is_awardee 
ON cycle_award(is_awardee) WHERE is_awardee = true;

-- Index on awarded_date for chronological sorting
CREATE INDEX IF NOT EXISTS idx_cycle_award_awarded_date 
ON cycle_award(awarded_date DESC);

-- ============================================================================
-- Survey Cycles Table Indexes
-- ============================================================================

-- Index on year for temporal queries
CREATE INDEX IF NOT EXISTS idx_survey_cycle_year 
ON survey_cycle(year DESC);

-- Index on cycle_id (if not already primary key)
CREATE INDEX IF NOT EXISTS idx_survey_cycle_id 
ON survey_cycle(cycle_id);

-- ============================================================================
-- Survey Response Table Indexes
-- ============================================================================

-- Index on barangay_id for response filtering
CREATE INDEX IF NOT EXISTS idx_survey_response_barangay_id 
ON survey_response(barangay_id);

-- Index on survey_cycle_id for cycle-specific queries
CREATE INDEX IF NOT EXISTS idx_survey_response_cycle_id 
ON survey_response(survey_cycle_id);

-- Composite index for barangay responses per cycle
CREATE INDEX IF NOT EXISTS idx_survey_response_barangay_cycle 
ON survey_response(barangay_id, survey_cycle_id);

-- ============================================================================
-- Barangay Table Indexes
-- ============================================================================

-- Index on barangay_name for search functionality
CREATE INDEX IF NOT EXISTS idx_barangay_name 
ON barangay(barangay_name);

-- Index on barangay_id (if not already primary key)
CREATE INDEX IF NOT EXISTS idx_barangay_id 
ON barangay(barangay_id);

-- ============================================================================
-- Materialized View for Award Statistics
-- ============================================================================

-- Drop existing materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS award_statistics;

-- Create materialized view for award leaderboard
CREATE MATERIALIZED VIEW award_statistics AS
SELECT 
  b.barangay_id,
  b.barangay_name as name,
  COUNT(ca.id) as total_awards,
  MAX(sc.year) as last_award_year,
  EXTRACT(YEAR FROM CURRENT_DATE)::integer - COALESCE(MAX(sc.year), 0) as years_since_last_award,
  ROUND(
    COUNT(ca.id)::numeric / 
    NULLIF(
      (SELECT COUNT(DISTINCT survey_cycle_id) 
       FROM survey_response 
       WHERE barangay_id = b.barangay_id), 
      0
    )::numeric * 100, 
    2
  ) as win_rate,
  -- Calculate consecutive streak
  (
    SELECT MAX(streak_length)
    FROM (
      SELECT 
        COUNT(*) as streak_length
      FROM (
        SELECT 
          sc2.year,
          sc2.year - ROW_NUMBER() OVER (ORDER BY sc2.year) as streak_group
        FROM cycle_award ca2
        JOIN survey_cycle sc2 ON ca2.cycle_id = sc2.cycle_id
        WHERE ca2.barangay_id = b.barangay_id 
          AND ca2.is_awardee = true
      ) grouped
      GROUP BY streak_group
    ) streaks
  ) as consecutive_streak,
  -- Award history as JSON array
  COALESCE(
    (
      SELECT json_agg(
        json_build_object(
          'year', sc3.year,
          'cycle_id', ca3.cycle_id,
          'awarded_date', ca3.awarded_date
        ) ORDER BY sc3.year DESC
      )
      FROM cycle_award ca3
      JOIN survey_cycle sc3 ON ca3.cycle_id = sc3.cycle_id
      WHERE ca3.barangay_id = b.barangay_id 
        AND ca3.is_awardee = true
    ),
    '[]'::json
  ) as award_history
FROM barangay b
LEFT JOIN cycle_award ca ON b.barangay_id = ca.barangay_id AND ca.is_awardee = true
LEFT JOIN survey_cycle sc ON ca.cycle_id = sc.cycle_id
GROUP BY b.barangay_id, b.barangay_name;

-- Create indexes on materialized view
CREATE INDEX idx_award_stats_total_awards ON award_statistics(total_awards DESC);
CREATE INDEX idx_award_stats_win_rate ON award_statistics(win_rate DESC);
CREATE INDEX idx_award_stats_consecutive_streak ON award_statistics(consecutive_streak DESC);
CREATE INDEX idx_award_stats_last_award_year ON award_statistics(last_award_year DESC);
CREATE INDEX idx_award_stats_barangay_id ON award_statistics(barangay_id);

-- ============================================================================
-- Refresh Function for Materialized View
-- ============================================================================

-- Create function to refresh award statistics
CREATE OR REPLACE FUNCTION refresh_award_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY award_statistics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Query Result Caching (PostgreSQL Configuration)
-- ============================================================================

-- Note: These settings should be applied at the database level
-- Uncomment and adjust based on your server resources

-- Enable query result caching
-- ALTER DATABASE your_database_name SET shared_buffers = '256MB';
-- ALTER DATABASE your_database_name SET effective_cache_size = '1GB';
-- ALTER DATABASE your_database_name SET work_mem = '16MB';
-- ALTER DATABASE your_database_name SET maintenance_work_mem = '64MB';

-- ============================================================================
-- Analyze Tables for Query Planner
-- ============================================================================

-- Update statistics for query planner optimization
ANALYZE ml_cache;
ANALYZE cycle_award;
ANALYZE survey_cycle;
ANALYZE survey_response;
ANALYZE barangay;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check index usage
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Check table sizes
-- SELECT 
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- Maintenance Schedule
-- ============================================================================

-- Recommended: Refresh materialized view after data updates
-- Can be scheduled via cron job or triggered after award updates:
-- SELECT refresh_award_statistics();

-- Recommended: Run ANALYZE periodically (e.g., daily)
-- Can be scheduled via cron job:
-- ANALYZE;

COMMENT ON MATERIALIZED VIEW award_statistics IS 'Cached award statistics for leaderboard performance. Refresh after award updates.';
COMMENT ON FUNCTION refresh_award_statistics() IS 'Refreshes the award_statistics materialized view. Call after updating awards.';
