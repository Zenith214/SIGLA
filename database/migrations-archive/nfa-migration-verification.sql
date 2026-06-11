-- ============================================================================
-- NFA BINARY FIELD MIGRATION - VERIFICATION SCRIPT
-- ============================================================================
-- This script provides comprehensive verification queries to confirm
-- the success of the NFA binary field migration.
--
-- Run this script after migration to ensure data integrity.
-- ============================================================================

-- ============================================================================
-- SECTION 1: OVERALL MIGRATION STATUS
-- ============================================================================

\echo '========================================='
\echo 'SECTION 1: OVERALL MIGRATION STATUS'
\echo '========================================='
\echo ''

-- Count total survey sections by type
\echo 'Total survey sections by type:'
SELECT 
  section_key,
  COUNT(*) as total_sections
FROM survey_section
GROUP BY section_key
ORDER BY section_key;

\echo ''

-- ============================================================================
-- SECTION 2: FIELD PRESENCE CHECK
-- ============================================================================

\echo '========================================='
\echo 'SECTION 2: FIELD PRESENCE CHECK'
\echo '========================================='
\echo ''

-- Check for new binary fields across all sections
\echo 'Sections with new binary fields:'
SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as has_binary_projects,
  COUNT(CASE WHEN data ? 'need_for_action_binary_financial' THEN 1 END) as has_binary_financial,
  COUNT(CASE WHEN data ? 'need_for_action_binary_social_programs' THEN 1 END) as has_binary_social_programs,
  COUNT(CASE WHEN data ? 'need_for_action_binary_corruption' THEN 1 END) as has_binary_corruption
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;

\echo ''

SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_disaster_info' THEN 1 END) as has_binary_disaster_info,
  COUNT(CASE WHEN data ? 'need_for_action_binary_evacuation' THEN 1 END) as has_binary_evacuation
FROM survey_section
WHERE section_key = 'disaster'
GROUP BY section_key;

\echo ''

SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_tanods' THEN 1 END) as has_binary_tanods,
  COUNT(CASE WHEN data ? 'need_for_action_binary_lupon' THEN 1 END) as has_binary_lupon,
  COUNT(CASE WHEN data ? 'need_for_action_binary_anti_drug' THEN 1 END) as has_binary_anti_drug
FROM survey_section
WHERE section_key = 'safety'
GROUP BY section_key;

\echo ''

SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_health_services' THEN 1 END) as has_binary_health_services,
  COUNT(CASE WHEN data ? 'need_for_action_binary_women_children_protection' THEN 1 END) as has_binary_women_children,
  COUNT(CASE WHEN data ? 'need_for_action_binary_community_participation' THEN 1 END) as has_binary_community
FROM survey_section
WHERE section_key = 'social'
GROUP BY section_key;

\echo ''

SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_business_clearance' THEN 1 END) as has_binary_business
FROM survey_section
WHERE section_key = 'business'
GROUP BY section_key;

\echo ''

SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_waste_management' THEN 1 END) as has_binary_waste
FROM survey_section
WHERE section_key = 'environmental'
GROUP BY section_key;

\echo ''

-- ============================================================================
-- SECTION 3: OLD FIELD NAME CHECK
-- ============================================================================

\echo '========================================='
\echo 'SECTION 3: OLD FIELD NAME CHECK'
\echo '========================================='
\echo ''

-- Check for any remaining old field names (should be 0)
\echo 'Records with old field names (should be 0):'
SELECT 
  section_key,
  COUNT(*) as count_with_old_fields
FROM survey_section
WHERE data ? 'suggestionsProjects'
   OR data ? 'suggestionsFinancial'
   OR data ? 'suggestionsSocialPrograms'
   OR data ? 'suggestionsCorruption'
   OR data ? 'suggestionsDisasterInfo'
   OR data ? 'suggestionsEvacuation'
   OR data ? 'suggestionsTanods'
   OR data ? 'suggestionsLupon'
   OR data ? 'suggestionsAntiDrug'
   OR data ? 'suggestionsHealthServices'
   OR data ? 'suggestionsWomenChildrenProtection'
   OR data ? 'suggestionsCommunityParticipation'
   OR data ? 'suggestionsBusinessClearance'
   OR data ? 'suggestionsWasteManagement'
GROUP BY section_key;

\echo ''

-- ============================================================================
-- SECTION 4: BINARY VALUE DISTRIBUTION
-- ============================================================================

\echo '========================================='
\echo 'SECTION 4: BINARY VALUE DISTRIBUTION'
\echo '========================================='
\echo ''

-- Check binary value distribution for each section
\echo 'Binary value distribution - Financial Administration:'
SELECT 
  'projects' as indicator,
  data->>'need_for_action_binary_projects' as binary_value,
  COUNT(*) as count
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_projects'
GROUP BY binary_value
UNION ALL
SELECT 
  'financial' as indicator,
  data->>'need_for_action_binary_financial' as binary_value,
  COUNT(*) as count
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_financial'
GROUP BY binary_value
UNION ALL
SELECT 
  'social_programs' as indicator,
  data->>'need_for_action_binary_social_programs' as binary_value,
  COUNT(*) as count
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_social_programs'
GROUP BY binary_value
UNION ALL
SELECT 
  'corruption' as indicator,
  data->>'need_for_action_binary_corruption' as binary_value,
  COUNT(*) as count
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_corruption'
GROUP BY binary_value
ORDER BY indicator, binary_value;

\echo ''

-- ============================================================================
-- SECTION 5: DATA INTEGRITY CHECK
-- ============================================================================

\echo '========================================='
\echo 'SECTION 5: DATA INTEGRITY CHECK'
\echo '========================================='
\echo ''

-- Check that binary and suggestion fields are paired correctly
\echo 'Pairing check - Binary fields should have corresponding suggestion fields:'
SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' 
                     AND data ? 'need_for_action_suggestion_projects' THEN 1 END) as paired_projects,
  COUNT(CASE WHEN data ? 'need_for_action_binary_financial' 
                     AND data ? 'need_for_action_suggestion_financial' THEN 1 END) as paired_financial
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;

\echo ''

-- Check for invalid binary values
\echo 'Invalid binary values (should be empty):'
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_projects' as invalid_value
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_projects'
  AND data->>'need_for_action_binary_projects' NOT IN ('Yes', 'No', 'Oo', 'Hindi')
LIMIT 10;

\echo ''

-- ============================================================================
-- SECTION 6: SAMPLE DATA INSPECTION
-- ============================================================================

\echo '========================================='
\echo 'SECTION 6: SAMPLE DATA INSPECTION'
\echo '========================================='
\echo ''

-- Sample records to verify field transformation
\echo 'Sample migrated records (Financial Administration):'
SELECT 
  section_id,
  data->>'need_for_action_binary_projects' as binary_projects,
  CASE 
    WHEN LENGTH(data->>'need_for_action_suggestion_projects') > 50 
    THEN SUBSTRING(data->>'need_for_action_suggestion_projects', 1, 50) || '...'
    ELSE data->>'need_for_action_suggestion_projects'
  END as suggestion_projects,
  data->>'need_for_action_binary_financial' as binary_financial,
  CASE 
    WHEN LENGTH(data->>'need_for_action_suggestion_financial') > 50 
    THEN SUBSTRING(data->>'need_for_action_suggestion_financial', 1, 50) || '...'
    ELSE data->>'need_for_action_suggestion_financial'
  END as suggestion_financial
FROM survey_section
WHERE section_key = 'financial'
LIMIT 5;

\echo ''

-- ============================================================================
-- SECTION 7: INDEX VERIFICATION
-- ============================================================================

\echo '========================================='
\echo 'SECTION 7: INDEX VERIFICATION'
\echo '========================================='
\echo ''

-- Check that indexes were created
\echo 'Indexes on survey_section table:'
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'survey_section'
  AND (indexname LIKE '%nfa%' OR indexname LIKE '%section_key%')
ORDER BY indexname;

\echo ''

-- ============================================================================
-- SECTION 8: PERFORMANCE CHECK
-- ============================================================================

\echo '========================================='
\echo 'SECTION 8: PERFORMANCE CHECK'
\echo '========================================='
\echo ''

-- Test query performance with EXPLAIN
\echo 'Query plan for binary field filtering (should use index):'
EXPLAIN (ANALYZE, BUFFERS)
SELECT COUNT(*)
FROM survey_section
WHERE section_key = 'financial'
  AND data @> '{"need_for_action_binary_projects": "Yes"}';

\echo ''

-- ============================================================================
-- SECTION 9: SUMMARY STATISTICS
-- ============================================================================

\echo '========================================='
\echo 'SECTION 9: SUMMARY STATISTICS'
\echo '========================================='
\echo ''

-- Overall migration summary
\echo 'Migration summary:'
SELECT 
  'Total survey sections' as metric,
  COUNT(*)::text as value
FROM survey_section
UNION ALL
SELECT 
  'Sections with new binary fields' as metric,
  COUNT(*)::text as value
FROM survey_section
WHERE data ? 'need_for_action_binary_projects'
   OR data ? 'need_for_action_binary_financial'
   OR data ? 'need_for_action_binary_social_programs'
   OR data ? 'need_for_action_binary_corruption'
   OR data ? 'need_for_action_binary_disaster_info'
   OR data ? 'need_for_action_binary_evacuation'
   OR data ? 'need_for_action_binary_tanods'
   OR data ? 'need_for_action_binary_lupon'
   OR data ? 'need_for_action_binary_anti_drug'
   OR data ? 'need_for_action_binary_health_services'
   OR data ? 'need_for_action_binary_women_children_protection'
   OR data ? 'need_for_action_binary_community_participation'
   OR data ? 'need_for_action_binary_business_clearance'
   OR data ? 'need_for_action_binary_waste_management'
UNION ALL
SELECT 
  'Sections with old field names (should be 0)' as metric,
  COUNT(*)::text as value
FROM survey_section
WHERE data ? 'suggestionsProjects'
   OR data ? 'suggestionsFinancial'
   OR data ? 'suggestionsSocialPrograms'
   OR data ? 'suggestionsCorruption'
   OR data ? 'suggestionsDisasterInfo'
   OR data ? 'suggestionsEvacuation'
   OR data ? 'suggestionsTanods'
   OR data ? 'suggestionsLupon'
   OR data ? 'suggestionsAntiDrug'
   OR data ? 'suggestionsHealthServices'
   OR data ? 'suggestionsWomenChildrenProtection'
   OR data ? 'suggestionsCommunityParticipation'
   OR data ? 'suggestionsBusinessClearance'
   OR data ? 'suggestionsWasteManagement';

\echo ''
\echo '========================================='
\echo 'VERIFICATION COMPLETE'
\echo '========================================='
\echo ''
\echo 'Review the results above to confirm:'
\echo '1. All sections have new binary fields'
\echo '2. No old field names remain'
\echo '3. Binary values are valid (Yes/No or Oo/Hindi)'
\echo '4. Binary and suggestion fields are properly paired'
\echo '5. Indexes were created successfully'
\echo ''
