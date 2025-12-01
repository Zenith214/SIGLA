-- ============================================================================
-- NEED FOR ACTION (NFA) BINARY FIELD MIGRATION - TEXT/JSON VERSION
-- ============================================================================
-- This migration is adapted for databases where the data column is TEXT
-- containing JSON strings (not JSONB).
--
-- IMPORTANT: This script first converts the data column from TEXT to JSONB,
-- then performs the migration, which is more efficient and reliable.
-- ============================================================================

-- ============================================================================
-- STEP 0: CONVERT DATA COLUMN FROM TEXT TO JSONB
-- ============================================================================

-- Check if conversion is needed
DO $$
BEGIN
  -- Check if data column is text
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'survey_section' 
    AND column_name = 'data' 
    AND data_type = 'text'
  ) THEN
    RAISE NOTICE 'Converting data column from TEXT to JSONB...';
    
    -- Convert the column type
    ALTER TABLE survey_section 
    ALTER COLUMN data TYPE jsonb USING data::jsonb;
    
    RAISE NOTICE 'Conversion complete!';
  ELSE
    RAISE NOTICE 'Data column is already JSONB, skipping conversion.';
  END IF;
END $$;

-- ============================================================================
-- NOW RUN THE STANDARD MIGRATION
-- ============================================================================
-- The rest of the migration is identical to nfa-binary-field-migration.sql
-- since we've converted to JSONB
-- ============================================================================

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
  AND data ? 'suggestionsWasteManagement';

-- ============================================================================
-- CREATE INDEXES FOR EFFICIENT QUERYING
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_survey_section_data_nfa_binary 
ON survey_section USING GIN (data jsonb_path_ops);

CREATE INDEX IF NOT EXISTS idx_survey_section_key 
ON survey_section(section_key);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Migration complete!' as status;

SELECT 
  section_key,
  COUNT(*) as total,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as with_binary_projects,
  COUNT(CASE WHEN data ? 'suggestionsProjects' THEN 1 END) as with_old_suggestions
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;
