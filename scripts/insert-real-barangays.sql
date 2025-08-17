-- Insert Real Barangays into SIGLA Database
-- First clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE assignment;
TRUNCATE TABLE survey;
TRUNCATE TABLE survey_target;
TRUNCATE TABLE barangay;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert the 8 real barangays
INSERT INTO `barangay` (`barangay_name`, `seal`, `description`, `is_active`, `households`, `population`, `captain`, `currentStatus`, `history`) VALUES
('Balasinon', 'no', 'A progressive barangay known for its agricultural activities.', 1, 855, 3420, 'Maria Santos', 'Active', '[{"year":"2024","status":"In Progress"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Completed"},{"year":"2021","status":"Completed"}]'),

('Poblacion', 'yes', 'The central barangay and seat of municipal government.', 1, 2187, 8750, 'Juan Dela Cruz', 'Active', '[{"year":"2024","status":"Completed"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Completed"},{"year":"2021","status":"Completed"}]'),

('Buguis', 'no', 'A peaceful barangay with rich cultural heritage.', 1, 722, 2890, 'Ana Rodriguez', 'Active', '[{"year":"2024","status":"In Progress"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Completed"},{"year":"2021","status":"Completed"}]'),

('Tanwalang', 'no', 'A growing barangay with excellent road connectivity.', 1, 1140, 4560, 'Pedro Martinez', 'Active', '[{"year":"2024","status":"Completed"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Pending"},{"year":"2021","status":"Completed"}]'),

('Luparan', 'no', 'A small but vibrant barangay nestled in the hills.', 1, 537, 2150, 'Lisa Garcia', 'Active', '[{"year":"2024","status":"Pending"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Completed"},{"year":"2021","status":"Pending"}]'),

('Carre', 'no', 'Known for its strong community spirit and local festivals.', 1, 920, 3680, 'Roberto Santos', 'Active', '[{"year":"2024","status":"In Progress"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Completed"},{"year":"2021","status":"Completed"}]'),

('Talas', 'yes', 'A barangay famous for its natural springs and eco-tourism.', 1, 1280, 5120, 'Carmen Reyes', 'Active', '[{"year":"2024","status":"Completed"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Completed"},{"year":"2021","status":"Completed"}]'),

('Solongvale', 'no', 'The smallest barangay with stunning valley views.', 1, 495, 1980, 'Diego Fernandez', 'Active', '[{"year":"2024","status":"In Progress"},{"year":"2023","status":"Completed"},{"year":"2022","status":"Pending"},{"year":"2021","status":"Pending"}]');

-- Verify the data
SELECT 
  barangay_id,
  barangay_name,
  population,
  households,
  captain,
  is_active
FROM barangay
ORDER BY barangay_name;
