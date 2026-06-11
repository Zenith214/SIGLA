-- Add progress column to cpap_items table
-- This simplifies progress tracking with clear status options

ALTER TABLE cpap_items 
ADD COLUMN IF NOT EXISTS progress VARCHAR(50);

-- Add comment to explain the column
COMMENT ON COLUMN cpap_items.progress IS 'Implementation progress status: Ongoing, Delayed, Completed';

-- Optional: Set default value for existing rows
UPDATE cpap_items 
SET progress = CASE 
  WHEN accomplishment_status ILIKE '%completed%' THEN 'Completed'
  WHEN accomplishment_status ILIKE '%delayed%' THEN 'Delayed'
  WHEN accomplishment_status ILIKE '%progress%' THEN 'Ongoing'
  ELSE NULL
END
WHERE progress IS NULL AND accomplishment_status IS NOT NULL;
