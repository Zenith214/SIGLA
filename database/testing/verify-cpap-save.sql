-- Verify CPAP data is being saved correctly
-- Run this in Supabase SQL Editor after saving CPAP data

-- 1. Check the most recent CPAP items (replace YOUR_CPAP_ID with actual ID)
SELECT 
  id,
  cpap_id,
  priority_area,
  target_output,
  observation,
  plan_of_action,
  activity,
  actual_output,
  accomplishment_status,
  actual_date,
  financial_requirements,
  committed_to_be_committed,
  updated_at
FROM cpap_items
WHERE cpap_id = 18  -- Replace with your CPAP ID
ORDER BY id DESC
LIMIT 10;

-- 2. Check if specific fields have data
SELECT 
  id,
  CASE WHEN observation IS NOT NULL AND observation != '' THEN '✓' ELSE '✗' END as has_observation,
  CASE WHEN plan_of_action IS NOT NULL AND plan_of_action != '' THEN '✓' ELSE '✗' END as has_plan,
  CASE WHEN activity IS NOT NULL AND activity != '' THEN '✓' ELSE '✗' END as has_activity,
  CASE WHEN actual_output IS NOT NULL AND actual_output != '' THEN '✓' ELSE '✗' END as has_actual_output,
  CASE WHEN accomplishment_status IS NOT NULL AND accomplishment_status != '' THEN '✓' ELSE '✗' END as has_status,
  CASE WHEN actual_date IS NOT NULL AND actual_date != '' THEN '✓' ELSE '✗' END as has_actual_date,
  LEFT(observation, 50) as observation_preview,
  LEFT(actual_output, 50) as actual_output_preview
FROM cpap_items
WHERE cpap_id = 18  -- Replace with your CPAP ID
ORDER BY id;

-- 3. Count items by service area
SELECT 
  priority_area,
  COUNT(*) as item_count,
  COUNT(CASE WHEN actual_output IS NOT NULL AND actual_output != '' THEN 1 END) as items_with_actual_output
FROM cpap_items
WHERE cpap_id = 18  -- Replace with your CPAP ID
GROUP BY priority_area
ORDER BY priority_area;

-- 4. Check the CPAP record itself
SELECT 
  id,
  barangay_id,
  cycle_id,
  status,
  created_at,
  updated_at,
  (SELECT COUNT(*) FROM cpap_items WHERE cpap_id = cpaps.id) as total_items
FROM cpaps
WHERE id = 18;  -- Replace with your CPAP ID
