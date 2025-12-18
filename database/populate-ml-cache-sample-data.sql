-- Populate ML Cache with Sample Data
-- This script generates sample analytics data for testing the dashboard
-- Replace this with actual computed data from survey responses in production

-- Clear existing data (optional)
-- TRUNCATE TABLE ml_cache;

-- Insert sample data for cycle 18 (adjust cycle_id as needed)
-- This assumes you have barangays with IDs 10, 17, and others

INSERT INTO ml_cache (
  cycle_id,
  barangay_id,
  cache_key,
  endpoint,
  data,
  expires_at,
  computed_at
)
SELECT 
  18 as cycle_id,
  b.barangay_id,
  'analytics_' || b.barangay_id || '_18' as cache_key,
  '/api/analytics' as endpoint,
  jsonb_build_object(
    'financial_assistance_satisfaction', 65 + (random() * 30)::numeric(5,2),
    'financial_assistance_need_action', 10 + (random() * 20)::numeric(5,2),
    'financial_assistance_awareness', 60 + (random() * 35)::numeric(5,2),
    'financial_assistance_availment', 55 + (random() * 40)::numeric(5,2),
    
    'disaster_preparedness_satisfaction', 60 + (random() * 35)::numeric(5,2),
    'disaster_preparedness_need_action', 15 + (random() * 25)::numeric(5,2),
    'disaster_preparedness_awareness', 55 + (random() * 40)::numeric(5,2),
    'disaster_preparedness_availment', 50 + (random() * 45)::numeric(5,2),
    
    'health_services_satisfaction', 70 + (random() * 25)::numeric(5,2),
    'health_services_need_action', 5 + (random() * 15)::numeric(5,2),
    'health_services_awareness', 65 + (random() * 30)::numeric(5,2),
    'health_services_availment', 60 + (random() * 35)::numeric(5,2),
    
    'peace_and_order_satisfaction', 75 + (random() * 20)::numeric(5,2),
    'peace_and_order_need_action', 5 + (random() * 10)::numeric(5,2),
    'peace_and_order_awareness', 70 + (random() * 25)::numeric(5,2),
    'peace_and_order_availment', 65 + (random() * 30)::numeric(5,2),
    
    'infrastructure_satisfaction', 55 + (random() * 35)::numeric(5,2),
    'infrastructure_need_action', 20 + (random() * 30)::numeric(5,2),
    'infrastructure_awareness', 50 + (random() * 40)::numeric(5,2),
    'infrastructure_availment', 45 + (random() * 45)::numeric(5,2),
    
    'environmental_management_satisfaction', 60 + (random() * 30)::numeric(5,2),
    'environmental_management_need_action', 15 + (random() * 25)::numeric(5,2),
    'environmental_management_awareness', 55 + (random() * 35)::numeric(5,2),
    'environmental_management_availment', 50 + (random() * 40)::numeric(5,2)
  ) as data,
  NOW() + INTERVAL '7 days' as expires_at,
  NOW() as computed_at
FROM barangay b
WHERE b.is_active = true
ON CONFLICT (cache_key) DO UPDATE
SET 
  data = EXCLUDED.data,
  computed_at = EXCLUDED.computed_at,
  expires_at = EXCLUDED.expires_at,
  is_stale = false;

-- Verify the data was inserted
SELECT 
  ml.cycle_id,
  b.barangay_name,
  ml.data->>'financial_assistance_satisfaction' as fin_satisfaction,
  ml.data->>'health_services_satisfaction' as health_satisfaction,
  ml.computed_at
FROM ml_cache ml
JOIN barangay b ON b.barangay_id = ml.barangay_id
WHERE ml.cycle_id = 18
ORDER BY b.barangay_name;

-- Note: In production, you should compute these values from actual survey responses
-- using aggregation queries on the survey_response and survey_answer tables
