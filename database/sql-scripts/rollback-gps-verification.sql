-- ============================================================================
-- GPS Verification Rollback
-- Removes GPS verification columns added for CSIS workflow
-- WARNING: This will delete all GPS verification data!
-- ============================================================================

-- Remove GPS verification index
DROP INDEX IF EXISTS idx_survey_responses_gps_flagged;

-- Remove GPS verification columns from survey_response table
ALTER TABLE survey_response 
DROP COLUMN IF EXISTS verification_location,
DROP COLUMN IF EXISTS gps_verification_status,
DROP COLUMN IF EXISTS gps_distance_meters;

-- ============================================================================
-- Rollback Complete
-- 
-- The following columns have been removed:
-- - verification_location (JSONB): GPS coordinates captured at household
-- - gps_verification_status (VARCHAR): Status of GPS verification
-- - gps_distance_meters (INTEGER): Distance from assigned spot
-- 
-- Note: This rollback does NOT affect:
-- - Existing survey response data
-- - Barangay data
-- - User data
-- - Other survey fields
-- ============================================================================
