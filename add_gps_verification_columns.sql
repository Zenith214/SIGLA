-- Add GPS verification columns to survey_response table
-- Run this migration in your Supabase SQL editor

-- Add verification_location column (JSONB to store GPS coordinates)
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS verification_location JSONB;

-- Add gps_verification_status column
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS gps_verification_status VARCHAR(20) DEFAULT 'pending';

-- Add gps_distance_meters column (distance from assigned spot)
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS gps_distance_meters DECIMAL(10, 2);

-- Add comments for documentation
COMMENT ON COLUMN survey_response.verification_location IS 'GPS coordinates captured at household for quality control verification';
COMMENT ON COLUMN survey_response.gps_verification_status IS 'Status of GPS verification: pending, verified, or flagged';
COMMENT ON COLUMN survey_response.gps_distance_meters IS 'Distance in meters from assigned spot to verification location';

-- Create index for GPS verification status queries
CREATE INDEX IF NOT EXISTS idx_survey_response_gps_status 
ON survey_response(gps_verification_status);

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'survey_response'
AND column_name IN ('verification_location', 'gps_verification_status', 'gps_distance_meters')
ORDER BY ordinal_position;
