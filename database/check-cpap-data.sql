-- Check if the new columns have data
SELECT 
  id,
  priority_area,
  target_output,
  observation,
  plan_of_action,
  activity,
  financial_requirements,
  committed_to_be_committed,
  actual_date
FROM cpap_items
ORDER BY id DESC
LIMIT 5;
