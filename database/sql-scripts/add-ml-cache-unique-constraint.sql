-- Add unique constraint to ml_cache table to prevent duplicate records
-- This ensures only one record per barangay per cycle

-- First, verify no duplicates exist
SELECT 
  barangay_id, 
  cycle_id, 
  COUNT(*) as count
FROM ml_cache
GROUP BY barangay_id, cycle_id
HAVING COUNT(*) > 1;

-- If duplicates exist, clean them first:
-- node scripts/clean-ml-cache-duplicates.js

-- Add the unique constraint
ALTER TABLE ml_cache 
ADD CONSTRAINT ml_cache_barangay_cycle_unique 
UNIQUE (barangay_id, cycle_id);

-- Verify the constraint was added
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'ml_cache'::regclass
  AND conname = 'ml_cache_barangay_cycle_unique';

-- Test the constraint (should fail with duplicate key error)
-- INSERT INTO ml_cache (barangay_id, cycle_id, data) 
-- VALUES (10, 18, '{}');  -- This should fail if record already exists

-- Success message
SELECT 'Unique constraint added successfully!' as status;
