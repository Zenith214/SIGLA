-- ============================================
-- CPAP Spreadsheet Columns Migration
-- Add 6 new columns to support full spreadsheet functionality
-- Run this in Supabase SQL Editor
-- ============================================

-- Add new columns to cpap_items table
ALTER TABLE cpap_items 
ADD COLUMN IF NOT EXISTS observation TEXT,
ADD COLUMN IF NOT EXISTS plan_of_action TEXT,
ADD COLUMN IF NOT EXISTS activity TEXT,
ADD COLUMN IF NOT EXISTS financial_requirements VARCHAR(255),
ADD COLUMN IF NOT EXISTS committed_to_be_committed TEXT,
ADD COLUMN IF NOT EXISTS actual_date DATE;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cpap_items'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! 6 new columns added to cpap_items table.';
END $$;
