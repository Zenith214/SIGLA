-- ============================================================================
-- NEED FOR ACTION (NFA) BINARY FIELD ROLLBACK
-- ============================================================================
-- This script rolls back the NFA binary field migration by:
-- 1. Restoring original suggestion field names
-- 2. Removing newly added binary fields
--
-- WARNING: This will remove all binary field data. Use with caution.
-- ============================================================================

-- ============================================================================
-- STEP 1: FINANCIAL ADMINISTRATION SECTION - ROLLBACK
-- ============================================================================

-- Projects Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_projects',
  '{suggestionsProjects}',
  COALESCE(data->'need_for_action_suggestion_projects', 'null'::jsonb)
) - 'need_for_action_suggestion_projects'
WHERE section_key = 'financial'
  AND data ? 'need_for_action_suggestion_projects';

-- Financial Transparency Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_financial',
  '{suggestionsFinancial}',
  COALESCE(data->'need_for_action_suggestion_financial', 'null'::jsonb)
) - 'need_for_action_suggestion_financial'
WHERE section_key = 'financial'
  AND data ? 'need_for_action_suggestion_financial';

-- Social Programs Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_social_programs',
  '{suggestionsSocialPrograms}',
  COALESCE(data->'need_for_action_suggestion_social_programs', 'null'::jsonb)
) - 'need_for_action_suggestion_social_programs'
WHERE section_key = 'financial'
  AND data ? 'need_for_action_suggestion_social_programs';

-- Corruption Perception Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_corruption',
  '{suggestionsCorruption}',
  COALESCE(data->'need_for_action_suggestion_corruption', 'null'::jsonb)
) - 'need_for_action_suggestion_corruption'
WHERE section_key = 'financial'
  AND data ? 'need_for_action_suggestion_corruption';

-- ============================================================================
-- STEP 2: DISASTER PREPAREDNESS SECTION - ROLLBACK
-- ============================================================================

-- Disaster Information Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_disaster_info',
  '{suggestionsDisasterInfo}',
  COALESCE(data->'need_for_action_suggestion_disaster_info', 'null'::jsonb)
) - 'need_for_action_suggestion_disaster_info'
WHERE section_key = 'disaster'
  AND data ? 'need_for_action_suggestion_disaster_info';

-- Evacuation Resources Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_evacuation',
  '{suggestionsEvacuation}',
  COALESCE(data->'need_for_action_suggestion_evacuation', 'null'::jsonb)
) - 'need_for_action_suggestion_evacuation'
WHERE section_key = 'disaster'
  AND data ? 'need_for_action_suggestion_evacuation';

-- ============================================================================
-- STEP 3: SAFETY & PEACE ORDER SECTION - ROLLBACK
-- ============================================================================

-- Barangay Tanods Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_tanods',
  '{suggestionsTanods}',
  COALESCE(data->'need_for_action_suggestion_tanods', 'null'::jsonb)
) - 'need_for_action_suggestion_tanods'
WHERE section_key = 'safety'
  AND data ? 'need_for_action_suggestion_tanods';

-- Lupon/Dispute Resolution Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_lupon',
  '{suggestionsLupon}',
  COALESCE(data->'need_for_action_suggestion_lupon', 'null'::jsonb)
) - 'need_for_action_suggestion_lupon'
WHERE section_key = 'safety'
  AND data ? 'need_for_action_suggestion_lupon';

-- Anti-Drug Programs Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_anti_drug',
  '{suggestionsAntiDrug}',
  COALESCE(data->'need_for_action_suggestion_anti_drug', 'null'::jsonb)
) - 'need_for_action_suggestion_anti_drug'
WHERE section_key = 'safety'
  AND data ? 'need_for_action_suggestion_anti_drug';

-- ============================================================================
-- STEP 4: SOCIAL PROTECTION SECTION - ROLLBACK
-- ============================================================================

-- Health Services Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_health_services',
  '{suggestionsHealthServices}',
  COALESCE(data->'need_for_action_suggestion_health_services', 'null'::jsonb)
) - 'need_for_action_suggestion_health_services'
WHERE section_key = 'social'
  AND data ? 'need_for_action_suggestion_health_services';

-- Women & Children Protection Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_women_children_protection',
  '{suggestionsWomenChildrenProtection}',
  COALESCE(data->'need_for_action_suggestion_women_children_protection', 'null'::jsonb)
) - 'need_for_action_suggestion_women_children_protection'
WHERE section_key = 'social'
  AND data ? 'need_for_action_suggestion_women_children_protection';

-- Community Participation Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_community_participation',
  '{suggestionsCommunityParticipation}',
  COALESCE(data->'need_for_action_suggestion_community_participation', 'null'::jsonb)
) - 'need_for_action_suggestion_community_participation'
WHERE section_key = 'social'
  AND data ? 'need_for_action_suggestion_community_participation';

-- ============================================================================
-- STEP 5: BUSINESS FRIENDLINESS SECTION - ROLLBACK
-- ============================================================================

-- Business Clearance Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_business_clearance',
  '{suggestionsBusinessClearance}',
  COALESCE(data->'need_for_action_suggestion_business_clearance', 'null'::jsonb)
) - 'need_for_action_suggestion_business_clearance'
WHERE section_key = 'business'
  AND data ? 'need_for_action_suggestion_business_clearance';

-- ============================================================================
-- STEP 6: ENVIRONMENTAL MANAGEMENT SECTION - ROLLBACK
-- ============================================================================

-- Waste Management Indicator - Restore original field name
UPDATE survey_section
SET data = jsonb_set(
  data - 'need_for_action_binary_waste_management',
  '{suggestionsWasteManagement}',
  COALESCE(data->'need_for_action_suggestion_waste_management', 'null'::jsonb)
) - 'need_for_action_suggestion_waste_management'
WHERE section_key = 'environmental'
  AND data ? 'need_for_action_suggestion_waste_management';

-- ============================================================================
-- STEP 7: DROP INDEXES
-- ============================================================================

-- Drop the GIN index created for NFA binary fields
DROP INDEX IF EXISTS idx_survey_section_data_nfa_binary;

-- Drop the section_key index if it was created by the migration
-- (Only drop if it didn't exist before the migration)
-- DROP INDEX IF EXISTS idx_survey_section_key;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Query to verify rollback success
-- Run these queries after rollback to confirm data restoration

-- 1. Count records with old field names restored
SELECT 
  section_key,
  COUNT(*) as total_records,
  COUNT(CASE WHEN data ? 'suggestionsProjects' THEN 1 END) as has_old_suggestions_projects,
  COUNT(CASE WHEN data ? 'need_for_action_binary_projects' THEN 1 END) as has_binary_projects,
  COUNT(CASE WHEN data ? 'need_for_action_suggestion_projects' THEN 1 END) as has_new_suggestion_projects
FROM survey_section
WHERE section_key = 'financial'
GROUP BY section_key;

-- 2. Check for any remaining new field names
SELECT 
  section_key,
  COUNT(*) as count_with_new_fields
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
GROUP BY section_key;
