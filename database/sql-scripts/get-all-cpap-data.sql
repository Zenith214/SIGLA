-- Get ALL data from ALL CPAP columns
-- This query retrieves complete CPAP information including all spreadsheet fields

-- 1. Get all CPAP items with ALL columns
SELECT 
  ci.id,
  ci.cpap_id,
  ci.priority_area,
  ci.target_output,
  ci.success_indicator,
  ci.responsible_person,
  ci.timeline_start,
  ci.timeline_end,
  ci.actual_output,
  ci.accomplishment_status,
  ci.remarks,
  -- Spreadsheet-specific columns
  ci.observation,
  ci.plan_of_action,
  ci.activity,
  ci.financial_requirements,
  ci.committed_to_be_committed,
  ci.actual_date,
  ci.created_at,
  ci.updated_at,
  -- CPAP header info
  c.barangay_id,
  c.cycle_id,
  c.status,
  c.submitted_at,
  c.approved_at,
  c.admin_comments,
  -- Barangay info
  b.barangay_name,
  -- Cycle info
  sc.name as cycle_name,
  sc.year as cycle_year
FROM cpap_items ci
JOIN cpaps c ON ci.cpap_id = c.id
LEFT JOIN barangay b ON c.barangay_id = b.barangay_id
LEFT JOIN survey_cycle sc ON c.cycle_id = sc.cycle_id
ORDER BY c.id DESC, ci.id DESC;

-- 2. Get all CPAP items for a specific CPAP (replace 18 with your CPAP ID)
SELECT 
  id,
  cpap_id,
  priority_area,
  observation,
  plan_of_action,
  activity,
  target_output,
  actual_output,
  accomplishment_status,
  success_indicator,
  responsible_person,
  timeline_start,
  timeline_end,
  actual_date,
  financial_requirements,
  committed_to_be_committed,
  remarks,
  created_at,
  updated_at
FROM cpap_items
WHERE cpap_id = 18
ORDER BY id;

-- 3. Get CPAP header information with item count
SELECT 
  c.id,
  c.barangay_id,
  b.barangay_name,
  c.cycle_id,
  sc.name as cycle_name,
  sc.year as cycle_year,
  c.status,
  c.created_at,
  c.updated_at,
  c.submitted_at,
  c.approved_at,
  c.admin_comments,
  COUNT(ci.id) as total_items
FROM cpaps c
LEFT JOIN barangay b ON c.barangay_id = b.barangay_id
LEFT JOIN survey_cycle sc ON c.cycle_id = sc.cycle_id
LEFT JOIN cpap_items ci ON c.id = ci.cpap_id
GROUP BY c.id, b.barangay_name, sc.name, sc.year
ORDER BY c.id DESC;

-- 4. Get detailed view with all columns for a specific CPAP (replace 18 with your CPAP ID)
SELECT 
  ci.*,
  c.status as cpap_status,
  b.barangay_name,
  sc.name as cycle_name,
  sc.year as cycle_year
FROM cpap_items ci
JOIN cpaps c ON ci.cpap_id = c.id
LEFT JOIN barangay b ON c.barangay_id = b.barangay_id
LEFT JOIN survey_cycle sc ON c.cycle_id = sc.cycle_id
WHERE ci.cpap_id = 18
ORDER BY ci.id;

-- 5. Check which fields have data (data completeness check)
SELECT 
  cpap_id,
  COUNT(*) as total_items,
  COUNT(observation) as has_observation,
  COUNT(plan_of_action) as has_plan_of_action,
  COUNT(activity) as has_activity,
  COUNT(target_output) as has_target_output,
  COUNT(actual_output) as has_actual_output,
  COUNT(accomplishment_status) as has_accomplishment_status,
  COUNT(actual_date) as has_actual_date,
  COUNT(financial_requirements) as has_financial_requirements,
  COUNT(committed_to_be_committed) as has_committed,
  COUNT(success_indicator) as has_success_indicator,
  COUNT(responsible_person) as has_responsible_person
FROM cpap_items
WHERE cpap_id = 18
GROUP BY cpap_id;

-- 6. Get all CPAPs with their items (full export)
SELECT 
  c.id as cpap_id,
  b.barangay_name,
  sc.name as cycle_name,
  sc.year as cycle_year,
  c.status as cpap_status,
  c.created_at as cpap_created_at,
  c.submitted_at,
  c.approved_at,
  ci.id as item_id,
  ci.priority_area,
  ci.observation,
  ci.plan_of_action,
  ci.activity,
  ci.target_output,
  ci.actual_output,
  ci.accomplishment_status,
  ci.success_indicator,
  ci.responsible_person,
  ci.timeline_start,
  ci.timeline_end,
  ci.actual_date,
  ci.financial_requirements,
  ci.committed_to_be_committed,
  ci.remarks,
  ci.created_at as item_created_at,
  ci.updated_at as item_updated_at
FROM cpaps c
LEFT JOIN barangay b ON c.barangay_id = b.barangay_id
LEFT JOIN survey_cycle sc ON c.cycle_id = sc.cycle_id
LEFT JOIN cpap_items ci ON c.id = ci.cpap_id
ORDER BY c.id DESC, ci.id;

-- 7. Export to CSV format (copy results and save as CSV)
-- This query formats data nicely for Excel/CSV export
SELECT 
  b.barangay_name as "Barangay",
  sc.year as "Year",
  ci.priority_area as "Service Area",
  ci.observation as "Observation",
  ci.plan_of_action as "Plan of Action",
  ci.activity as "Activity",
  ci.target_output as "Output",
  ci.actual_output as "Actual Output",
  ci.accomplishment_status as "Status",
  ci.actual_date as "Actual Date",
  ci.financial_requirements as "Financial Requirements",
  ci.responsible_person as "Responsible Person",
  ci.committed_to_be_committed as "Committed/To be Committed",
  ci.success_indicator as "Means of Verification",
  ci.timeline_start as "Start Date",
  ci.timeline_end as "End Date",
  c.status as "CPAP Status"
FROM cpap_items ci
JOIN cpaps c ON ci.cpap_id = c.id
LEFT JOIN barangay b ON c.barangay_id = b.barangay_id
LEFT JOIN survey_cycle sc ON c.cycle_id = sc.cycle_id
WHERE ci.cpap_id = 18  -- Replace with your CPAP ID
ORDER BY ci.priority_area, ci.id;
