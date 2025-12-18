-- ============================================================================
-- NEED FOR ACTION (NFA) BINARY FIELD MIGRATION
-- ============================================================================
-- This migration updates the survey_section JSONB data structure to support
-- the two-part "Need for Action" component across all service indicators.
--
-- Purpose: Add binary yes/no fields and rename existing suggestion fields
-- to follow the standardized naming convention for all 14 service indicators
-- across 6 service areas.
--
-- Requirements: 2.5, 3.3
-- ============================================================================

-- ============================================================================
-- MIGRATION OVERVIEW
-- ============================================================================
-- This migration performs the following operations on survey_section.data JSONB:
--
-- 1. ADD new binary fields for all service indicators:
--    - need_for_action_binary_{indicator}
--
-- 2. RENAME existing suggestion fields to standardized format:
--    - suggestionsProjects → need_for_action_suggestion_projects
--    - suggestionsFinancial → need_for_action_suggestion_financial
--    - etc. (for all 14 indicators)
--
-- 3. BACKFILL binary field values based on existing suggestion data:
--    - Set to "Yes" if suggestion exists and is non-empty
--    - Set to "No" if suggestion is null or empty
--
-- Service Indicators by Section:
-- - Financial Administration: projects, financial, social_programs, corruption
-- - Disaster Preparedness: disaster_info, evacuation
-- - Safety & Peace Order: tanods, lupon, anti_drug
-- - Social Protection: health_services, women_children_protection, community_participation
-- - Business Friendliness: business_clearance
-- - Environmental Management: waste_management
-- ============================================================================

-- ============================================================================
-- STEP 1: FINANCIAL ADMINISTRATION SECTION
-- ============================================================================

-- Projects Indicator
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
  AND data ? 'suggestionsProjects';

-- Financial Transparency Indicator
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
  AND data ? 'suggestionsFinancial';

-- Social Programs Indicator
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
  AND data ? 'suggestionsSocialPrograms';

-- Corruption Perception Indicator
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
  AND data ? 'suggestionsCorruption';

-- ============================================================================
-- STEP 2: DISASTER PREPAREDNESS SECTION
-- ============================================================================

-- Disaster Information Indicator
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
  AND data ? 'suggestionsDisasterInfo';

-- Evacuation Resources Indicator
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
  AND data ? 'suggestionsEvacuation';

-- ============================================================================
-- STEP 3: SAFETY & PEACE ORDER SECTION
-- ============================================================================

-- Barangay Tanods Indicator
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
  AND data ? 'suggestionsTanods';

-- Lupon/Dispute Resolution Indicator
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
  AND data ? 'suggestionsLupon';

-- Anti-Drug Programs Indicator
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
  AND data ? 'suggestionsAntiDrug';

-- ============================================================================
-- STEP 4: SOCIAL PROTECTION SECTION
-- ============================================================================

-- Health Services Indicator
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
  AND data ? 'suggestionsHealthServices';

-- Women & Children Protection Indicator
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
  AND data ? 'suggestionsWomenChildrenProtection';

-- Community Participation Indicator
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
  AND data ? 'suggestionsCommunityParticipation';

-- ============================================================================
-- STEP 5: BUSINESS FRIENDLINESS SECTION
-- ============================================================================

-- Business Clearance Indicator
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
  AND data ? 'suggestionsBusinessClearance';

-- ============================================================================
-- STEP 6: ENVIRONMENTAL MANAGEMENT SECTION
-- ============================================================================

-- Waste Management Indicator
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
  AND data ? 'suggestionsWasteManagement';

-- ============================================================================
-- STEP 7: CREATE INDEXES FOR EFFICIENT QUERYING
-- ============================================================================

-- Create GIN index on survey_section.data for efficient JSONB queries
-- This index helps with queries that filter on NFA binary fields
CREATE INDEX IF NOT EXISTS idx_survey_section_data_nfa_binary 
ON survey_section USING GIN (data jsonb_path_ops);

COMMENT ON INDEX idx_survey_section_data_nfa_binary IS 
'GIN index for efficiently querying NFA binary fields in survey_section JSONB data';

-- Create index for section_key to optimize section-specific queries
CREATE INDEX IF NOT EXISTS idx_survey_section_key 
ON survey_section(section_key);

COMMENT ON INDEX idx_survey_section_key IS 
'Index for efficiently filtering survey sections by section_key';

-- ============================================================================
-- STEP 8: ADD VALIDATION CONSTRAINT (OPTIONAL)
-- ============================================================================

-- Add a check constraint to ensure binary values are valid
-- Note: This is a soft constraint - it validates new data but doesn't fail on existing data
-- Uncomment if you want to enforce strict validation:

-- ALTER TABLE survey_section
-- ADD CONSTRAINT check_nfa_binary_values
-- CHECK (
--   -- Check that all binary fields contain only valid values
--   (data->>'need_for_action_binary_projects' IS NULL OR data->>'need_for_action_binary_projects' IN ('Yes', 'No', 'Oo', 'Hindi'))
--   AND (data->>'need_for_action_binary_financial' IS NULL OR data->>'need_for_action_binary_financial' IN ('Yes', 'No', 'Oo', 'Hindi'))
--   -- Add similar checks for all other indicators...
-- );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Query to verify migration success
-- Run these queries after migration to confirm data integrity

-- 1. Count records with new binary fields
SELECT 
  section_key,
  COUNT(*) as total_records,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as has_binary_projects,
  COUNT(CASE WHEN data ? 'need_for_action_suggestion_projects' THEN 1 END) as has_suggestion_projects,
  COUNT(CASE WHEN data ? 'suggestionsProjects' THEN 1 END) as has_old_suggestions_projects
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;

-- 2. Sample records to verify field transformation
SELECT 
  section_id,
  section_key,
  data->>'need_for_action_binary_projects' as binary_projects,
  data->>'need_for_action_suggestion_projects' as suggestion_projects,
  data->>'suggestionsProjects' as old_suggestions_projects
FROM survey_section
WHERE section_key = 'financial'
LIMIT 10;

-- 3. Check for any remaining old field names
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

-- 4. Verify binary value distribution
SELECT 
  section_key,
  data->>'need_for_action_binary_projects' as binary_value,
  COUNT(*) as count
FROM survey_section
WHERE section_key = 'financial'
  AND data ? 'need_for_action_binary_projects'
GROUP BY section_key, data->>'need_for_action_binary_projects'
ORDER BY section_key, binary_value;
