-- Fix ml_cache unique constraint to allow multiple endpoints per barangay/cycle
-- This allows caching ml-funnel-analysis, community-voice-analysis, and ai-executive-summary separately

-- Drop the old constraint that only allows one entry per barangay/cycle
ALTER TABLE ml_cache DROP CONSTRAINT IF EXISTS ml_cache_barangay_cycle_unique;

-- Add new constraint that allows multiple endpoints per barangay/cycle
ALTER TABLE ml_cache ADD CONSTRAINT ml_cache_barangay_cycle_endpoint_unique 
  UNIQUE (barangay_id, cycle_id, endpoint);

-- Verify the constraints
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'ml_cache'::regclass;
