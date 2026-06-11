-- ============================================================================
-- NFA ANALYTICS PERFORMANCE VERIFICATION SCRIPT
-- ============================================================================
-- This script verifies that the NFA analytics queries are using indexes
-- properly and performing efficiently.
--
-- Run this script after the NFA binary field migration to ensure optimal
-- query performance.
-- ============================================================================

-- ============================================================================
-- STEP 1: Verify Indexes Exist
-- ============================================================================

\echo '=== Verifying Indexes ==='
\echo ''

-- Check GIN index on survey_section.data
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'survey_section'
  AND indexname = 'idx_survey_section_data_nfa_binary';

-- Check section_key index
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'survey_section'
  AND indexname = 'idx_survey_section_key';

\echo ''
\echo 'Expected: 2 indexes should be listed above'
\echo ''

-- ============================================================================
-- STEP 2: Verify Index Usage in Queries
-- ============================================================================

\echo '=== Verifying Index Usage ==='
\echo ''

-- Test query with EXPLAIN to verify index usage
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*)
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_projects';

\echo ''
\echo 'Expected: Should show "Index Scan" or "Bitmap Index Scan"'
\echo ''

-- ============================================================================
-- STEP 3: Test NFA Rate Calculation Query
-- ============================================================================

\echo '=== Testing NFA Rate Calculation ==='
\echo ''

-- Get a sample cycle_id and barangay_id for testing
DO $$
DECLARE
  test_cycle_id INTEGER;
  test_barangay_id INTEGER;
BEGIN
  -- Get first active cycle
  SELECT cycle_id INTO test_cycle_id
  FROM survey_cycle
  WHERE is_active = true
  LIMIT 1;

  -- Get first active barangay
  SELECT barangay_id INTO test_barangay_id
  FROM barangay
  WHERE is_active = true
  LIMIT 1;

  RAISE NOTICE 'Using test_cycle_id: %, test_barangay_id: %', test_cycle_id, test_barangay_id;
END $$;

-- Run sample NFA rate calculation
WITH test_params AS (
  SELECT 
    (SELECT cycle_id FROM survey_cycle WHERE is_active = true LIMIT 1) as cycle_id,
    (SELECT barangay_id FROM barangay WHERE is_active = true LIMIT 1) as barangay_id
)
SELECT 
  'Financial - Projects' as indicator,
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
FROM survey_section, test_params
WHERE section_key = 'financial'
  AND survey_cycle_id = test_params.cycle_id
  AND barangay_id = test_params.barangay_id
  AND data ? 'need_for_action_binary_projects';

\echo ''
\echo 'Expected: Should return NFA rate calculation results'
\echo ''

-- ============================================================================
-- STEP 4: Performance Benchmark
-- ============================================================================

\echo '=== Performance Benchmark ==='
\echo ''

-- Benchmark single indicator query
EXPLAIN (ANALYZE, BUFFERS, TIMING)
WITH test_params AS (
  SELECT 
    (SELECT cycle_id FROM survey_cycle WHERE is_active = true LIMIT 1) as cycle_id,
    (SELECT barangay_id FROM barangay WHERE is_active = true LIMIT 1) as barangay_id
)
SELECT 
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count
FROM survey_section, test_params
WHERE section_key = 'financial'
  AND survey_cycle_id = test_params.cycle_id
  AND barangay_id = test_params.barangay_id
  AND data ? 'need_for_action_binary_projects';

\echo ''
\echo 'Expected: Execution time should be < 100ms for typical datasets'
\echo ''

-- ============================================================================
-- STEP 5: Verify Data Integrity
-- ============================================================================

\echo '=== Verifying Data Integrity ==='
\echo ''

-- Check that binary fields exist in survey sections
SELECT 
  section_key,
  COUNT(*) as total_sections,
  COUNT(*) FILTER (WHERE data ? 'need_for_action_binary_projects') as has_projects_binary,
  COUNT(*) FILTER (WHERE data ? 'need_for_action_binary_financial') as has_financial_binary,
  COUNT(*) FILTER (WHERE data ? 'need_for_action_binary_tanods') as has_tanods_binary,
  COUNT(*) FILTER (WHERE data ? 'need_for_action_binary_healthServices') as has_health_binary
FROM survey_section
WHERE section_key IN ('financial', 'safety', 'social')
GROUP BY section_key
ORDER BY section_key;

\echo ''
\echo 'Expected: Should show counts of sections with binary fields'
\echo ''

-- ============================================================================
-- STEP 6: Verify Binary Value Distribution
-- ============================================================================

\echo '=== Verifying Binary Value Distribution ==='
\echo ''

-- Check distribution of binary values
WITH binary_values AS (
  SELECT 
    data->>'need_for_action_binary_projects' as binary_value
  FROM survey_section
  WHERE section_key = 'financial'
    AND data ? 'need_for_action_binary_projects'
)
SELECT 
  COALESCE(binary_value, 'NULL') as binary_value,
  COUNT(*) as count,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM binary_values)::numeric) * 100, 1) as percentage
FROM binary_values
GROUP BY binary_value
ORDER BY count DESC;

\echo ''
\echo 'Expected: Should show distribution of Yes/No/Oo/Hindi values'
\echo ''

-- ============================================================================
-- STEP 7: Test Cross-Barangay Query Performance
-- ============================================================================

\echo '=== Testing Cross-Barangay Query Performance ==='
\echo ''

EXPLAIN (ANALYZE, BUFFERS, TIMING)
WITH test_params AS (
  SELECT cycle_id
  FROM survey_cycle
  WHERE is_active = true
  LIMIT 1
)
SELECT 
  b.barangay_id,
  b.barangay_name,
  COUNT(*) as total_responses,
  COUNT(*) FILTER (
    WHERE (ss.data->>'need_for_action_binary_projects') IN ('Yes', 'Oo')
  ) as yes_count
FROM survey_section ss
INNER JOIN barangay b ON ss.barangay_id = b.barangay_id
CROSS JOIN test_params
WHERE ss.section_key = 'financial'
  AND ss.survey_cycle_id = test_params.cycle_id
  AND ss.data ? 'need_for_action_binary_projects'
GROUP BY b.barangay_id, b.barangay_name
ORDER BY yes_count DESC
LIMIT 10;

\echo ''
\echo 'Expected: Should complete in < 500ms for typical datasets'
\echo ''

-- ============================================================================
-- STEP 8: Summary Statistics
-- ============================================================================

\echo '=== Summary Statistics ==='
\echo ''

-- Overall statistics
SELECT 
  'Total survey sections' as metric,
  COUNT(*)::text as value
FROM survey_section
UNION ALL
SELECT 
  'Sections with NFA binary fields',
  COUNT(*)::text
FROM survey_section
WHERE data::text LIKE '%need_for_action_binary_%'
UNION ALL
SELECT 
  'Unique service areas',
  COUNT(DISTINCT section_key)::text
FROM survey_section
UNION ALL
SELECT 
  'Unique cycles',
  COUNT(DISTINCT survey_cycle_id)::text
FROM survey_section
UNION ALL
SELECT 
  'Unique barangays',
  COUNT(DISTINCT barangay_id)::text
FROM survey_section;

\echo ''
\echo '=== Verification Complete ==='
\echo ''
\echo 'Review the output above to ensure:'
\echo '1. Both indexes exist (GIN and section_key)'
\echo '2. Queries are using indexes (Index Scan or Bitmap Index Scan)'
\echo '3. Query execution times are acceptable'
\echo '4. Binary fields exist in survey sections'
\echo '5. Binary values are properly distributed'
\echo ''
