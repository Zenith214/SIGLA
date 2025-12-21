-- Check if actual_output and accomplishment_status are being saved
SELECT 
  id,
  priority_area,
  target_output,
  actual_output,
  accomplishment_status,
  actual_date,
  updated_at
FROM cpap_items
WHERE cpap_id = 18  -- Replace with your CPAP ID
ORDER BY id
LIMIT 10;
