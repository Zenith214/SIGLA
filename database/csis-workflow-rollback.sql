-- ============================================================================
-- CSIS Workflow Rollback
-- Removes tables and enums added for CSIS workflow
-- WARNING: This will delete all data in the new tables!
-- ============================================================================

-- Remove foreign key constraints from survey_response
ALTER TABLE "survey_response" 
DROP CONSTRAINT IF EXISTS "survey_response_questionnaire_id_fkey",
DROP CONSTRAINT IF EXISTS "survey_response_spot_id_fkey",
DROP CONSTRAINT IF EXISTS "survey_response_questionnaire_id_key";

-- Remove indexes from survey_response
DROP INDEX IF EXISTS "survey_response_questionnaire_id_idx";
DROP INDEX IF EXISTS "survey_response_spot_id_idx";

-- Remove columns from survey_response
ALTER TABLE "survey_response" 
DROP COLUMN IF EXISTS "questionnaire_id",
DROP COLUMN IF EXISTS "spot_id",
DROP COLUMN IF EXISTS "visit_count";

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS "visits" CASCADE;
DROP TABLE IF EXISTS "questionnaires" CASCADE;
DROP TABLE IF EXISTS "spots" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "VisitOutcome";
DROP TYPE IF EXISTS "QuestionnaireStatus";
DROP TYPE IF EXISTS "SpotStatus";

-- ============================================================================
-- Rollback Complete
-- ============================================================================
