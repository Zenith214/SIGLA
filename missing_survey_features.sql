-- Missing Survey Features for SIGLA Database
-- Add these to your existing sigla_db database

-- --------------------------------------------------------

--
-- Add missing indexes for better performance
--

CREATE INDEX `idx_survey_response_status` ON `survey_response` (`status`);
CREATE INDEX `idx_survey_response_interviewer` ON `survey_response` (`interviewer_id`);
CREATE INDEX `idx_survey_response_barangay` ON `survey_response` (`barangay_id`);
CREATE INDEX `idx_survey_section_status` ON `survey_section` (`status`);
CREATE INDEX `idx_survey_answer_response` ON `survey_answer` (`response_id`);
CREATE INDEX `idx_survey_validation_type` ON `survey_validation` (`validation_type`);

-- --------------------------------------------------------

--
-- Create view for easy survey progress tracking
--

CREATE VIEW `survey_progress_view` AS
SELECT 
  sr.response_id,
  sr.survey_number,
  b.barangay_name,
  CONCAT(u.firstName, ' ', u.lastName) as interviewer_name,
  sr.status,
  sr.progress,
  sr.started_at,
  sr.completed_at,
  COUNT(ss.section_id) as total_sections,
  COUNT(CASE WHEN ss.status = 'completed' THEN 1 END) as completed_sections
FROM survey_response sr
LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
LEFT JOIN user u ON sr.interviewer_id = u.id
LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
GROUP BY sr.response_id;

-- --------------------------------------------------------

--
-- Create trigger for automatic progress calculation
--

DELIMITER $$

CREATE TRIGGER `update_survey_progress` 
AFTER UPDATE ON `survey_section`
FOR EACH ROW
BEGIN
  DECLARE total_sections INT;
  DECLARE completed_sections INT;
  
  -- Count total sections for this response
  SELECT COUNT(*) INTO total_sections 
  FROM survey_section 
  WHERE response_id = NEW.response_id;
  
  -- Count completed sections for this response
  SELECT COUNT(*) INTO completed_sections 
  FROM survey_section 
  WHERE response_id = NEW.response_id AND status = 'completed';
  
  -- Update progress percentage
  UPDATE survey_response 
  SET progress = ROUND((completed_sections / total_sections) * 100)
  WHERE response_id = NEW.response_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Add default survey sections template
--

INSERT INTO `survey_section` (`section_name`, `section_key`, `status`) VALUES
('Survey Initialization', 'initialization', 'pending'),
('Respondent Selection', 'kish-grid', 'pending'),
('Financial Administration', 'financial', 'pending'),
('Disaster Preparedness', 'disaster', 'pending'),
('Safety & Peace Order', 'safety', 'pending'),
('Social Protection', 'social', 'pending'),
('Business Friendliness', 'business', 'pending'),
('Environmental Management', 'environmental', 'pending'),
('Summary & Review', 'summary', 'pending');

-- --------------------------------------------------------

--
-- Create additional useful views
--

-- View for survey statistics
CREATE VIEW `survey_statistics_view` AS
SELECT 
  COUNT(*) as total_surveys,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_surveys,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_surveys,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_surveys,
  AVG(progress) as average_progress,
  COUNT(DISTINCT interviewer_id) as active_interviewers,
  COUNT(DISTINCT barangay_id) as barangays_surveyed
FROM survey_response;

-- View for interviewer performance
CREATE VIEW `interviewer_performance_view` AS
SELECT 
  u.id,
  CONCAT(u.firstName, ' ', u.lastName) as interviewer_name,
  COUNT(sr.response_id) as total_surveys,
  COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) as completed_surveys,
  AVG(sr.progress) as average_progress,
  MAX(sr.created_at) as last_survey_date
FROM user u
LEFT JOIN survey_response sr ON u.id = sr.interviewer_id
WHERE u.role = 'Interviewer'
GROUP BY u.id;

-- View for barangay survey status
CREATE VIEW `barangay_survey_status_view` AS
SELECT 
  b.barangay_id,
  b.barangay_name,
  COUNT(sr.response_id) as total_surveys,
  COUNT(CASE WHEN sr.status = 'completed' THEN 1 END) as completed_surveys,
  AVG(sr.progress) as average_progress,
  MAX(sr.created_at) as last_survey_date
FROM barangay b
LEFT JOIN survey_response sr ON b.barangay_id = sr.barangay_id
GROUP BY b.barangay_id;

-- --------------------------------------------------------

--
-- Create stored procedures for common operations
--

DELIMITER $$

-- Procedure to create a new survey response
CREATE PROCEDURE `create_survey_response`(
  IN p_survey_number VARCHAR(50),
  IN p_barangay_id INT,
  IN p_interviewer_id INT,
  IN p_location_lat DECIMAL(10,8),
  IN p_location_lng DECIMAL(11,8),
  IN p_location_address TEXT
)
BEGIN
  DECLARE new_response_id INT;
  
  -- Insert new survey response
  INSERT INTO survey_response (
    survey_number, 
    barangay_id, 
    interviewer_id, 
    location_lat, 
    location_lng, 
    location_address,
    status
  ) VALUES (
    p_survey_number,
    p_barangay_id,
    p_interviewer_id,
    p_location_lat,
    p_location_lng,
    p_location_address,
    'draft'
  );
  
  SET new_response_id = LAST_INSERT_ID();
  
  -- Create survey sections for this response
  INSERT INTO survey_section (response_id, section_name, section_key, status)
  SELECT new_response_id, section_name, section_key, 'pending'
  FROM survey_section 
  WHERE response_id IS NULL;
  
  SELECT new_response_id as response_id;
END$$

-- Procedure to update survey section
CREATE PROCEDURE `update_survey_section`(
  IN p_response_id INT,
  IN p_section_key VARCHAR(50),
  IN p_status ENUM('pending','in_progress','completed'),
  IN p_data JSON
)
BEGIN
  UPDATE survey_section 
  SET 
    status = p_status,
    data = p_data,
    started_at = CASE WHEN p_status = 'in_progress' AND started_at IS NULL THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE completed_at END,
    updated_at = NOW()
  WHERE response_id = p_response_id AND section_key = p_section_key;
END$$

-- Procedure to get survey progress
CREATE PROCEDURE `get_survey_progress`(IN p_response_id INT)
BEGIN
  SELECT 
    sr.*,
    b.barangay_name,
    CONCAT(u.firstName, ' ', u.lastName) as interviewer_name,
    COUNT(ss.section_id) as total_sections,
    COUNT(CASE WHEN ss.status = 'completed' THEN 1 END) as completed_sections
  FROM survey_response sr
  LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
  LEFT JOIN user u ON sr.interviewer_id = u.id
  LEFT JOIN survey_section ss ON sr.response_id = ss.response_id
  WHERE sr.response_id = p_response_id
  GROUP BY sr.response_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Add sample data for testing (optional)
--

-- Sample survey response
INSERT INTO `survey_response` (
  `survey_number`, 
  `barangay_id`, 
  `interviewer_id`, 
  `location_lat`, 
  `location_lng`, 
  `location_address`,
  `status`
) VALUES (
  'SIGLA-2024-001',
  3,
  8,
  14.5995,
  120.9842,
  'Sample Address, Barangay San Jose',
  'draft'
);

-- Sample survey sections for the above response
INSERT INTO `survey_section` (
  `response_id`,
  `section_name`,
  `section_key`,
  `status`
) VALUES 
(1, 'Survey Initialization', 'initialization', 'completed'),
(1, 'Respondent Selection', 'kish-grid', 'pending'),
(1, 'Financial Administration', 'financial', 'pending'),
(1, 'Disaster Preparedness', 'disaster', 'pending'),
(1, 'Safety & Peace Order', 'safety', 'pending'),
(1, 'Social Protection', 'social', 'pending'),
(1, 'Business Friendliness', 'business', 'pending'),
(1, 'Environmental Management', 'environmental', 'pending'),
(1, 'Summary & Review', 'summary', 'pending');

-- --------------------------------------------------------

--
-- Create additional indexes for better query performance
--

CREATE INDEX `idx_survey_response_created_at` ON `survey_response` (`created_at`);
CREATE INDEX `idx_survey_response_completed_at` ON `survey_response` (`completed_at`);
CREATE INDEX `idx_survey_section_key` ON `survey_section` (`section_key`);
CREATE INDEX `idx_survey_question_key` ON `survey_question` (`question_key`);
CREATE INDEX `idx_survey_validation_status` ON `survey_validation` (`validation_status`);

-- --------------------------------------------------------

--
-- Add comments for documentation
--

-- Document the survey tables
ALTER TABLE `survey_response` COMMENT = 'Main survey response records with location and progress tracking';
ALTER TABLE `survey_section` COMMENT = 'Survey sections with status and JSON data storage';
ALTER TABLE `survey_question` COMMENT = 'Question definitions with dependencies and validation';
ALTER TABLE `survey_answer` COMMENT = 'Individual answers linked to questions and responses';
ALTER TABLE `survey_metadata` COMMENT = 'Flexible metadata storage for survey responses';
ALTER TABLE `survey_attachment` COMMENT = 'File attachments for survey responses';
ALTER TABLE `survey_validation` COMMENT = 'Quality control and validation results';

-- --------------------------------------------------------

--
-- Grant permissions (adjust as needed)
--

-- GRANT SELECT, INSERT, UPDATE, DELETE ON sigla_db.survey_* TO 'your_app_user'@'localhost';
-- GRANT SELECT ON sigla_db.survey_progress_view TO 'your_app_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE sigla_db.* TO 'your_app_user'@'localhost'; 