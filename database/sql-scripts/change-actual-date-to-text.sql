-- Change actual_date column from DATE to TEXT to allow flexible input
-- This allows users to enter dates (2025-12-21) or text descriptions (Within the year, 4th quarter, etc.)

ALTER TABLE cpap_items 
ALTER COLUMN actual_date TYPE TEXT;

-- Verify the change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cpap_items' AND column_name = 'actual_date';
