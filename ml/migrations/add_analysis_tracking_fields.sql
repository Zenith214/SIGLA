-- Add analysis tracking fields to survey_target table
ALTER TABLE survey_target
ADD COLUMN analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN analysis_date TIMESTAMP;

-- Create index for faster querying of unanalyzed completed targets
CREATE INDEX idx_survey_target_analyzed_percentage ON survey_target(analyzed, percentage);

-- Update existing records to mark them as not analyzed
UPDATE survey_target SET analyzed = FALSE WHERE analyzed IS NULL;