-- ============================================================================
-- GPS VERIFICATION MIGRATION
-- ============================================================================
-- This migration adds GPS verification fields to the survey_response table
-- to support quality control verification of interview locations.
--
-- Purpose: Enable supervisors to verify that interviews were conducted at
-- assigned locations by comparing pre-assigned spot locations with actual
-- GPS coordinates captured during the interview.
--
-- Requirements: 5.4, 5.5, 5.6, 5.7
-- ============================================================================

-- Add verification_location column to store GPS coordinates captured at household
-- Format: { lat: number, lng: number, accuracy?: number, timestamp?: number }
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS verification_location JSONB;

COMMENT ON COLUMN survey_response.verification_location IS 
'GPS coordinates captured when FI confirms arrival at household. Used for quality control verification against assigned spot location.';

-- Add gps_verification_status column to track verification state
-- Values: 'pending', 'verified', 'flagged', 'reviewed'
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS gps_verification_status VARCHAR(20) DEFAULT 'pending';

COMMENT ON COLUMN survey_response.gps_verification_status IS 
'Status of GPS verification: pending (not yet verified), verified (within threshold), flagged (exceeds threshold), reviewed (manually reviewed by supervisor)';

-- Add gps_distance_meters column to store calculated distance
-- Stores the distance in meters between assigned spot and actual interview location
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS gps_distance_meters INTEGER;

COMMENT ON COLUMN survey_response.gps_distance_meters IS 
'Distance in meters between assigned spot location and actual GPS capture location. Calculated on survey submission.';

-- Create index for efficient querying of flagged interviews
-- This index helps supervisors quickly find interviews that need review
CREATE INDEX IF NOT EXISTS idx_survey_response_gps_flagged 
ON survey_response(gps_verification_status) 
WHERE gps_verification_status = 'flagged';

COMMENT ON INDEX idx_survey_response_gps_flagged IS 
'Partial index for efficiently querying flagged interviews that exceed GPS verification threshold';

-- Create index for verification location queries
CREATE INDEX IF NOT EXISTS idx_survey_response_verification_location 
ON survey_response USING GIN (verification_location) 
WHERE verification_location IS NOT NULL;

COMMENT ON INDEX idx_survey_response_verification_location IS 
'GIN index for querying surveys with verification location data';

-- Create composite index for cycle-aware GPS verification queries
CREATE INDEX IF NOT EXISTS idx_survey_response_cycle_gps_status 
ON survey_response(survey_cycle_id, gps_verification_status) 
WHERE gps_verification_status IN ('flagged', 'pending');

COMMENT ON INDEX idx_survey_response_cycle_gps_status IS 
'Composite index for efficiently querying GPS verification status within specific survey cycles';
