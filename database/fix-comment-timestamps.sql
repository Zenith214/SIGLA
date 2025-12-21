-- Fix timestamp columns to use TIMESTAMPTZ (timestamp with timezone)
-- This ensures proper timezone handling

-- Update cpap_comments table
ALTER TABLE cpap_comments 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Update default values
ALTER TABLE cpap_comments 
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Also fix cpap_notifications table if it exists
ALTER TABLE cpap_notifications 
  ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

ALTER TABLE cpap_notifications 
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Verify the changes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('cpap_comments', 'cpap_notifications')
  AND column_name LIKE '%created_at%'
ORDER BY table_name, column_name;
