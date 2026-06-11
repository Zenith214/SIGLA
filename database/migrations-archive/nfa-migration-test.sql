-- ============================================================================
-- NFA BINARY FIELD MIGRATION - COMPREHENSIVE TEST SCRIPT (PostgreSQL)
-- ============================================================================
-- This script tests the migration by:
-- 1. Creating test data with various scenarios
-- 2. Running a subset of the migration
-- 3. Verifying the results
-- 4. Cleaning up test data
--
-- Usage: Run this script in a test/staging environment before production
-- Requirements: 3.3, 3.4, 3.5
-- ============================================================================

\echo '========================================='
\echo 'NFA MIGRATION TEST - STARTING'
\echo '========================================='
\echo ''

-- ============================================================================
-- STEP 1: CREATE TEST DATA
-- ============================================================================

\echo 'STEP 1: Creating test data...'
\echo ''

-- Create test survey response
INSERT INTO survey_response (response_id, questionnaire_number, barangay_id, interviewer_id, status, created_at)
VALUES 
  (999999, 'TEST-NFA-001', 1, 1, 'completed', NOW())
ON CONFLICT (response_id) DO NOTHING;

-- Financial section with mixed suggestions
INSERT INTO survey_section (section_id, response_id, section_name, section_key, status, data, created_at)
VALUES (
  999991,
  999999,
  'Financial Administration',
  'financial',
  'completed',
  '{"suggestionsProjects": "Need more transparency in project selection", "suggestionsFinancial": "Publish budget reports monthly", "suggestionsSocialPrograms": "", "suggestionsCorruption": null}'::jsonb,
  NOW()
)
ON CONFLICT (section_id) DO UPDATE 
SET data = '{"suggestionsProjects": "Need more transparency in project selection", "suggestionsFinancial": "Publish budget reports monthly", "suggestionsSocialPrograms": "", "suggestionsCorruption": null}'::jsonb;

-- Disaster section with empty/null suggestions
INSERT INTO survey_section (section_id, response_id, section_name, section_key, status, data, created_at)
VALUES (
  999992,
  999999,
  'Disaster Preparedness',
  'disaster',
  'completed',
  '{"suggestionsDisasterInfo": "", "suggestionsEvacuation": null}'::jsonb,
  NOW()
)
ON CONFLICT (section_id) DO UPDATE 
SET data = '{"suggestionsDisasterInfo": "", "suggestionsEvacuation": null}'::jsonb;

-- Safety section with whitespace-only suggestions
INSERT INTO survey_section (section_id, response_id, section_name, section_key, status, data, created_at)
VALUES (
  999993,
  999999,
  'Safety & Peace Order',
  'safety',
  'completed',
  '{"suggestionsTanods": "   ", "suggestionsLupon": "\t\n", "suggestionsAntiDrug": "More patrols needed"}'::jsonb,
  NOW()
)
ON CONFLICT (section_id) DO UPDATE 
SET data = '{"suggestionsTanods": "   ", "suggestionsLupon": "\t\n", "suggestionsAntiDrug": "More patrols needed"}'::jsonb;

-- Social section with mixed data
INSERT INTO survey_section (section_id, response_id, section_name, section_key, status, data, created_at)
VALUES (
  999994,
  999999,
  'Social Protection',
  'social',
  'completed',
  '{"suggestionsHealthServices": "Need more health workers", "suggestionsWomenChildrenProtection": null, "suggestionsCommunityParticipation": ""}'::jsonb,
  NOW()
)
ON CONFLICT (section_id) DO UPDATE 
SET data = '{"suggestionsHealthServices": "Need more health workers", "suggestionsWomenChildrenProtection": null, "suggestionsCommunityParticipation": ""}'::jsonb;

-- Business section
INSERT INTO survey_section (section_id, response_id, section_name, section_key, status, data, created_at)
VALUES (
  999995,
  999999,
  'Business Friendliness',
  'business',
  'completed',
  '{"suggestionsBusinessClearance": "Faster processing needed"}'::jsonb,
  NOW()
)
ON CONFLICT (section_id) DO UPDATE 
SET data = '{"suggestionsBusinessClearance": "Faster processing needed"}'::jsonb;

-- Environmental section
INSERT INTO survey_section (section_id, response_id, section_name, section_key, status, data, created_at)
VALUES (
  999996,
  999999,
  'Environmental Management',
  'environmental',
  'completed',
  '{"suggestionsWasteManagement": ""}'::jsonb,
  NOW()
)
ON CONFLICT (section_id) DO UPDATE 
SET data = '{"suggestionsWasteManagement": ""}'::jsonb;

\echo 'Test data created successfully.'
\echo ''

-- ============================================================================
-- STEP 2: DISPLAY PRE-MIGRATION DATA
-- ============================================================================

\echo 'STEP 2: Pre-migration data:'
\echo ''

SELECT 
  section_id,
  section_key,
  data->>'suggestionsProjects' as old_suggestions_projects,
  data->>'suggestionsFinancial' as old_suggestions_financial,
  data->>'suggestionsSocialPrograms' as old_suggestions_social,
  data->>'suggestionsCorruption' as old_suggestions_corruption
FROM survey_section
WHERE response_id = 999999 AND section_key = 'financial';

\echo ''

-- ============================================================================
-- STEP 3: RUN MIGRATION ON TEST DATA
-- ============================================================================

\echo 'STEP 3: Running migration on test data...'
\echo ''

-- Financial section - Projects indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_projects}',
    CASE 
      WHEN data->>'suggestionsProjects' IS NOT NULL 
           AND TRIM(data->>'suggestionsProjects') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_projects}',
  COALESCE(data->'suggestionsProjects', 'null'::jsonb)
) - 'suggestionsProjects'
WHERE section_key = 'financial'
  AND response_id = 999999
  AND data ? 'suggestionsProjects';

-- Financial section - Financial Transparency indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_financial}',
    CASE 
      WHEN data->>'suggestionsFinancial' IS NOT NULL 
           AND TRIM(data->>'suggestionsFinancial') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_financial}',
  COALESCE(data->'suggestionsFinancial', 'null'::jsonb)
) - 'suggestionsFinancial'
WHERE section_key = 'financial'
  AND response_id = 999999
  AND data ? 'suggestionsFinancial';

-- Financial section - Social Programs indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_social_programs}',
    CASE 
      WHEN data->>'suggestionsSocialPrograms' IS NOT NULL 
           AND TRIM(data->>'suggestionsSocialPrograms') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_social_programs}',
  COALESCE(data->'suggestionsSocialPrograms', 'null'::jsonb)
) - 'suggestionsSocialPrograms'
WHERE section_key = 'financial'
  AND response_id = 999999
  AND data ? 'suggestionsSocialPrograms';

-- Financial section - Corruption indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_corruption}',
    CASE 
      WHEN data->>'suggestionsCorruption' IS NOT NULL 
           AND TRIM(data->>'suggestionsCorruption') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_corruption}',
  COALESCE(data->'suggestionsCorruption', 'null'::jsonb)
) - 'suggestionsCorruption'
WHERE section_key = 'financial'
  AND response_id = 999999
  AND data ? 'suggestionsCorruption';

-- Disaster section - Disaster Info indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_disaster_info}',
    CASE 
      WHEN data->>'suggestionsDisasterInfo' IS NOT NULL 
           AND TRIM(data->>'suggestionsDisasterInfo') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_disaster_info}',
  COALESCE(data->'suggestionsDisasterInfo', 'null'::jsonb)
) - 'suggestionsDisasterInfo'
WHERE section_key = 'disaster'
  AND response_id = 999999
  AND data ? 'suggestionsDisasterInfo';

-- Disaster section - Evacuation indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_evacuation}',
    CASE 
      WHEN data->>'suggestionsEvacuation' IS NOT NULL 
           AND TRIM(data->>'suggestionsEvacuation') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_evacuation}',
  COALESCE(data->'suggestionsEvacuation', 'null'::jsonb)
) - 'suggestionsEvacuation'
WHERE section_key = 'disaster'
  AND response_id = 999999
  AND data ? 'suggestionsEvacuation';

-- Safety section - Tanods indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_tanods}',
    CASE 
      WHEN data->>'suggestionsTanods' IS NOT NULL 
           AND TRIM(data->>'suggestionsTanods') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_tanods}',
  COALESCE(data->'suggestionsTanods', 'null'::jsonb)
) - 'suggestionsTanods'
WHERE section_key = 'safety'
  AND response_id = 999999
  AND data ? 'suggestionsTanods';

-- Safety section - Lupon indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_lupon}',
    CASE 
      WHEN data->>'suggestionsLupon' IS NOT NULL 
           AND TRIM(data->>'suggestionsLupon') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_lupon}',
  COALESCE(data->'suggestionsLupon', 'null'::jsonb)
) - 'suggestionsLupon'
WHERE section_key = 'safety'
  AND response_id = 999999
  AND data ? 'suggestionsLupon';

-- Safety section - Anti-Drug indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_anti_drug}',
    CASE 
      WHEN data->>'suggestionsAntiDrug' IS NOT NULL 
           AND TRIM(data->>'suggestionsAntiDrug') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_anti_drug}',
  COALESCE(data->'suggestionsAntiDrug', 'null'::jsonb)
) - 'suggestionsAntiDrug'
WHERE section_key = 'safety'
  AND response_id = 999999
  AND data ? 'suggestionsAntiDrug';

-- Social section - Health Services indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_health_services}',
    CASE 
      WHEN data->>'suggestionsHealthServices' IS NOT NULL 
           AND TRIM(data->>'suggestionsHealthServices') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_health_services}',
  COALESCE(data->'suggestionsHealthServices', 'null'::jsonb)
) - 'suggestionsHealthServices'
WHERE section_key = 'social'
  AND response_id = 999999
  AND data ? 'suggestionsHealthServices';

-- Social section - Women & Children Protection indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_women_children_protection}',
    CASE 
      WHEN data->>'suggestionsWomenChildrenProtection' IS NOT NULL 
           AND TRIM(data->>'suggestionsWomenChildrenProtection') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_women_children_protection}',
  COALESCE(data->'suggestionsWomenChildrenProtection', 'null'::jsonb)
) - 'suggestionsWomenChildrenProtection'
WHERE section_key = 'social'
  AND response_id = 999999
  AND data ? 'suggestionsWomenChildrenProtection';

-- Social section - Community Participation indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_community_participation}',
    CASE 
      WHEN data->>'suggestionsCommunityParticipation' IS NOT NULL 
           AND TRIM(data->>'suggestionsCommunityParticipation') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_community_participation}',
  COALESCE(data->'suggestionsCommunityParticipation', 'null'::jsonb)
) - 'suggestionsCommunityParticipation'
WHERE section_key = 'social'
  AND response_id = 999999
  AND data ? 'suggestionsCommunityParticipation';

-- Business section - Business Clearance indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_business_clearance}',
    CASE 
      WHEN data->>'suggestionsBusinessClearance' IS NOT NULL 
           AND TRIM(data->>'suggestionsBusinessClearance') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_business_clearance}',
  COALESCE(data->'suggestionsBusinessClearance', 'null'::jsonb)
) - 'suggestionsBusinessClearance'
WHERE section_key = 'business'
  AND response_id = 999999
  AND data ? 'suggestionsBusinessClearance';

-- Environmental section - Waste Management indicator
UPDATE survey_section
SET data = jsonb_set(
  jsonb_set(
    data,
    '{need_for_action_binary_waste_management}',
    CASE 
      WHEN data->>'suggestionsWasteManagement' IS NOT NULL 
           AND TRIM(data->>'suggestionsWasteManagement') != '' 
      THEN '"Yes"'::jsonb
      ELSE '"No"'::jsonb
    END
  ),
  '{need_for_action_suggestion_waste_management}',
  COALESCE(data->'suggestionsWasteManagement', 'null'::jsonb)
) - 'suggestionsWasteManagement'
WHERE section_key = 'environmental'
  AND response_id = 999999
  AND data ? 'suggestionsWasteManagement';

\echo 'Migration completed on test data.'
\echo ''

-- ============================================================================
-- STEP 4: VERIFY MIGRATION RESULTS
-- ============================================================================

\echo 'STEP 4: Verifying migration results...'
\echo ''

\echo 'Financial section results:'
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_projects' as binary_projects,
  data->>'need_for_action_suggestion_projects' as suggestion_projects,
  data->>'need_for_action_binary_financial' as binary_financial,
  data->>'need_for_action_suggestion_financial' as suggestion_financial,
  data->>'need_for_action_binary_social_programs' as binary_social,
  data->>'need_for_action_binary_corruption' as binary_corruption
FROM survey_section
WHERE response_id = 999999 AND section_key = 'financial';

\echo ''
\echo 'Disaster section results:'
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_disaster_info' as binary_disaster,
  data->>'need_for_action_binary_evacuation' as binary_evacuation
FROM survey_section
WHERE response_id = 999999 AND section_key = 'disaster';

\echo ''
\echo 'Safety section results:'
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_tanods' as binary_tanods,
  data->>'need_for_action_binary_lupon' as binary_lupon,
  data->>'need_for_action_binary_anti_drug' as binary_anti_drug
FROM survey_section
WHERE response_id = 999999 AND section_key = 'safety';

\echo ''
\echo 'Social section results:'
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_health_services' as binary_health,
  data->>'need_for_action_binary_women_children_protection' as binary_women,
  data->>'need_for_action_binary_community_participation' as binary_community
FROM survey_section
WHERE response_id = 999999 AND section_key = 'social';

\echo ''
\echo 'Business section results:'
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_business_clearance' as binary_business
FROM survey_section
WHERE response_id = 999999 AND section_key = 'business';

\echo ''
\echo 'Environmental section results:'
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_waste_management' as binary_waste
FROM survey_section
WHERE response_id = 999999 AND section_key = 'environmental';

\echo ''

-- ============================================================================
-- STEP 5: VERIFY NO OLD FIELDS REMAIN
-- ============================================================================

\echo 'STEP 5: Checking for old field names (should be 0)...'
\echo ''

SELECT 
  COUNT(*) as old_fields_remaining
FROM survey_section
WHERE response_id = 999999
  AND (
    data ? 'suggestionsProjects'
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
  );

\echo ''

-- ============================================================================
-- STEP 6: VERIFY BINARY VALUES ARE CORRECT
-- ============================================================================

\echo 'STEP 6: Verifying binary values match expectations...'
\echo ''

-- This query should show the expected binary values based on the test data
SELECT 
  'Financial - Projects' as test_case,
  data->>'need_for_action_binary_projects' as actual_value,
  'Yes' as expected_value,
  CASE WHEN data->>'need_for_action_binary_projects' = 'Yes' THEN 'PASS' ELSE 'FAIL' END as result
FROM survey_section
WHERE response_id = 999999 AND section_key = 'financial'
UNION ALL
SELECT 
  'Financial - Financial',
  data->>'need_for_action_binary_financial',
  'Yes',
  CASE WHEN data->>'need_for_action_binary_financial' = 'Yes' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'financial'
UNION ALL
SELECT 
  'Financial - Social Programs',
  data->>'need_for_action_binary_social_programs',
  'No',
  CASE WHEN data->>'need_for_action_binary_social_programs' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'financial'
UNION ALL
SELECT 
  'Financial - Corruption',
  data->>'need_for_action_binary_corruption',
  'No',
  CASE WHEN data->>'need_for_action_binary_corruption' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'financial'
UNION ALL
SELECT 
  'Disaster - Disaster Info',
  data->>'need_for_action_binary_disaster_info',
  'No',
  CASE WHEN data->>'need_for_action_binary_disaster_info' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'disaster'
UNION ALL
SELECT 
  'Disaster - Evacuation',
  data->>'need_for_action_binary_evacuation',
  'No',
  CASE WHEN data->>'need_for_action_binary_evacuation' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'disaster'
UNION ALL
SELECT 
  'Safety - Tanods',
  data->>'need_for_action_binary_tanods',
  'No',
  CASE WHEN data->>'need_for_action_binary_tanods' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'safety'
UNION ALL
SELECT 
  'Safety - Lupon',
  data->>'need_for_action_binary_lupon',
  'No',
  CASE WHEN data->>'need_for_action_binary_lupon' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'safety'
UNION ALL
SELECT 
  'Safety - Anti-Drug',
  data->>'need_for_action_binary_anti_drug',
  'Yes',
  CASE WHEN data->>'need_for_action_binary_anti_drug' = 'Yes' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'safety'
UNION ALL
SELECT 
  'Social - Health Services',
  data->>'need_for_action_binary_health_services',
  'Yes',
  CASE WHEN data->>'need_for_action_binary_health_services' = 'Yes' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'social'
UNION ALL
SELECT 
  'Social - Women & Children',
  data->>'need_for_action_binary_women_children_protection',
  'No',
  CASE WHEN data->>'need_for_action_binary_women_children_protection' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'social'
UNION ALL
SELECT 
  'Social - Community Participation',
  data->>'need_for_action_binary_community_participation',
  'No',
  CASE WHEN data->>'need_for_action_binary_community_participation' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'social'
UNION ALL
SELECT 
  'Business - Business Clearance',
  data->>'need_for_action_binary_business_clearance',
  'Yes',
  CASE WHEN data->>'need_for_action_binary_business_clearance' = 'Yes' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'business'
UNION ALL
SELECT 
  'Environmental - Waste Management',
  data->>'need_for_action_binary_waste_management',
  'No',
  CASE WHEN data->>'need_for_action_binary_waste_management' = 'No' THEN 'PASS' ELSE 'FAIL' END
FROM survey_section
WHERE response_id = 999999 AND section_key = 'environmental';

\echo ''

-- ============================================================================
-- STEP 7: CLEANUP TEST DATA
-- ============================================================================

\echo 'STEP 7: Cleaning up test data...'
\echo ''

DELETE FROM survey_section WHERE response_id = 999999;
DELETE FROM survey_response WHERE response_id = 999999;

\echo 'Test data cleaned up.'
\echo ''

\echo '========================================='
\echo 'NFA MIGRATION TEST - COMPLETED'
\echo '========================================='
\echo ''
\echo 'All tests should show PASS in the result column.'
\echo 'If any tests show FAIL, review the migration logic.'
\echo ''
