-- ============================================================================
-- NFA BINARY ANALYTICS QUERIES
-- ============================================================================
-- This file documents optimized SQL query patterns for analytics using the
-- new need_for_action_binary fields. These queries are designed to work with
-- the GIN indexes created during the NFA binary field migration.
--
-- Requirements: 4.1, 4.2, 4.5
-- ============================================================================

-- ============================================================================
-- QUERY PATTERN 1: Calculate NFA Rate for a Single Service Indicator
-- ============================================================================
-- This query calculates the NFA Rate for a specific service indicator
-- Formula: NFA Rate = (COUNT where binary = "Yes" or "Oo") / (TOTAL COUNT) × 100
--
-- Example: Calculate NFA Rate for Financial Administration - Projects

SELECT 
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = $1  -- Parameter: cycle ID
  AND barangay_id = $2;     -- Parameter: barangay ID

-- ============================================================================
-- QUERY PATTERN 2: Calculate NFA Rate for All Indicators in a Service Area
-- ============================================================================
-- This query calculates NFA Rates for all indicators within a service area
-- Example: All indicators in Financial Administration

WITH financial_indicators AS (
  SELECT 
    'projects' as indicator,
    'need_for_action_binary_projects' as binary_field
  UNION ALL SELECT 'financial', 'need_for_action_binary_financial'
  UNION ALL SELECT 'socialPrograms', 'need_for_action_binary_socialPrograms'
  UNION ALL SELECT 'corruption', 'need_for_action_binary_corruption'
)
SELECT 
  fi.indicator,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>fi.binary_field) IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (data->>fi.binary_field) IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section ss
CROSS JOIN financial_indicators fi
WHERE ss.section_key = 'financial'
  AND ss.survey_cycle_id = $1
  AND ss.barangay_id = $2
  AND ss.data ? fi.binary_field  -- Only include sections that have this field
GROUP BY fi.indicator, fi.binary_field
ORDER BY fi.indicator;

-- ============================================================================
-- QUERY PATTERN 3: Calculate NFA Rate Across All Service Areas
-- ============================================================================
-- This query calculates aggregate NFA Rate across all service areas
-- Useful for overall barangay performance metrics

WITH service_area_indicators AS (
  SELECT 'financial' as service_area, 'need_for_action_binary_projects' as binary_field
  UNION ALL SELECT 'financial', 'need_for_action_binary_financial'
  UNION ALL SELECT 'financial', 'need_for_action_binary_socialPrograms'
  UNION ALL SELECT 'financial', 'need_for_action_binary_corruption'
  UNION ALL SELECT 'disaster', 'need_for_action_binary_disasterInfo'
  UNION ALL SELECT 'disaster', 'need_for_action_binary_evacuation'
  UNION ALL SELECT 'safety', 'need_for_action_binary_tanods'
  UNION ALL SELECT 'safety', 'need_for_action_binary_lupon'
  UNION ALL SELECT 'safety', 'need_for_action_binary_antiDrug'
  UNION ALL SELECT 'social', 'need_for_action_binary_healthServices'
  UNION ALL SELECT 'social', 'need_for_action_binary_womenChildrenProtection'
  UNION ALL SELECT 'social', 'need_for_action_binary_communityParticipation'
  UNION ALL SELECT 'business', 'need_for_action_binary_businessClearance'
  UNION ALL SELECT 'environmental', 'need_for_action_binary_wasteManagement'
),
service_area_stats AS (
  SELECT 
    sai.service_area,
    COUNT(*) as total_responses,
    COUNT(*) FILTER (
      WHERE (ss.data->>sai.binary_field) IN ('Yes', 'Oo')
    ) as yes_count
  FROM survey_section ss
  INNER JOIN service_area_indicators sai ON ss.section_key = sai.service_area
  WHERE ss.survey_cycle_id = $1
    AND ss.barangay_id = $2
    AND ss.data ? sai.binary_field
  GROUP BY sai.service_area
)
SELECT 
  service_area,
  total_responses,
  yes_count,
  CASE 
    WHEN total_responses > 0 THEN 
      ROUND((yes_count::numeric / total_responses::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM service_area_stats
ORDER BY service_area;

-- ============================================================================
-- QUERY PATTERN 4: Compare NFA Rates Across Multiple Barangays
-- ============================================================================
-- This query compares NFA Rates for a specific indicator across barangays
-- Useful for ranking and comparative analytics

SELECT 
  b.barangay_id,
  b.barangay_name,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section ss
INNER JOIN barangay b ON ss.barangay_id = b.barangay_id
WHERE ss.section_key = 'financial'
  AND ss.survey_cycle_id = $1
  AND ss.data ? 'need_for_action_binary_projects'
GROUP BY b.barangay_id, b.barangay_name
ORDER BY nfa_rate_percentage DESC;

-- ============================================================================
-- QUERY PATTERN 5: Trend Analysis - Compare NFA Rates Across Cycles
-- ============================================================================
-- This query compares NFA Rates for the same indicator across different cycles
-- Useful for tracking improvement over time

SELECT 
  sc.cycle_id,
  sc.name as cycle_name,
  sc.year,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section ss
INNER JOIN survey_cycle sc ON ss.survey_cycle_id = sc.cycle_id
WHERE ss.section_key = 'financial'
  AND ss.barangay_id = $1
  AND ss.data ? 'need_for_action_binary_projects'
GROUP BY sc.cycle_id, sc.name, sc.year
ORDER BY sc.year DESC, sc.cycle_id DESC;

-- ============================================================================
-- QUERY PATTERN 6: Verify NFA Rate Independence from Suggestions
-- ============================================================================
-- This query demonstrates that NFA Rate is calculated independently of
-- suggestion field content (Requirements 4.5)

SELECT 
  'With Suggestions' as category,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = $1
  AND barangay_id = $2
  AND data ? 'need_for_action_binary_projects'
  AND COALESCE(data->>'need_for_action_suggestion_projects', '') != ''

UNION ALL

SELECT 
  'Without Suggestions' as category,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = $1
  AND barangay_id = $2
  AND data ? 'need_for_action_binary_projects'
  AND COALESCE(data->>'need_for_action_suggestion_projects', '') = '';

-- ============================================================================
-- QUERY PATTERN 7: Performance Test Query
-- ============================================================================
-- This query tests performance with large datasets
-- Should complete in < 100ms with proper indexes

EXPLAIN ANALYZE
SELECT 
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (
        WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
      )::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END as nfa_rate_percentage
FROM survey_section
WHERE section_key = 'financial'
  AND survey_cycle_id = 1
  AND barangay_id = 1
  AND data ? 'need_for_action_binary_projects';

-- ============================================================================
-- INDEX VERIFICATION QUERIES
-- ============================================================================
-- These queries verify that the necessary indexes exist and are being used

-- Check if GIN index exists on survey_section.data
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'survey_section'
  AND indexname = 'idx_survey_section_data_nfa_binary';

-- Check if section_key index exists
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'survey_section'
  AND indexname = 'idx_survey_section_key';

-- Verify index usage in query plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT COUNT(*)
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_projects';

-- ============================================================================
-- PERFORMANCE OPTIMIZATION NOTES
-- ============================================================================
-- 
-- 1. GIN Index Usage:
--    - The GIN index on survey_section.data (jsonb_path_ops) is optimized
--      for containment queries using the ? operator
--    - Use data ? 'field_name' to check field existence efficiently
--    - Use data->>'field_name' to extract text values
--
-- 2. COUNT FILTER Syntax:
--    - COUNT(*) FILTER (WHERE condition) is more efficient than
--      SUM(CASE WHEN condition THEN 1 ELSE 0 END)
--    - Supported in PostgreSQL 9.4+
--
-- 3. Query Optimization Tips:
--    - Always filter by section_key first (indexed)
--    - Add survey_cycle_id and barangay_id filters when available
--    - Use data ? 'field_name' to ensure field exists before extraction
--    - Avoid OR conditions on JSONB fields; use IN operator instead
--
-- 4. Expected Performance:
--    - Single indicator query: < 50ms for 10,000 rows
--    - All indicators query: < 200ms for 10,000 rows
--    - Cross-barangay comparison: < 500ms for 100 barangays
--
-- 5. Monitoring:
--    - Use EXPLAIN ANALYZE to verify index usage
--    - Monitor query execution time in production
--    - Consider materialized views for frequently accessed aggregations
--
-- ============================================================================
