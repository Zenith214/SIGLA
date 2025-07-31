-- Survey Forms Database Tables for SIGLA
-- Add these tables to your existing sigla_db database

-- --------------------------------------------------------

--
-- Table structure for table `survey_response`
--

CREATE TABLE `survey_response` (
  `response_id` int(11) NOT NULL AUTO_INCREMENT,
  `survey_number` varchar(50) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `interviewer_id` int(11) NOT NULL,
  `respondent_name` varchar(191) DEFAULT NULL,
  `respondent_age` int(11) DEFAULT NULL,
  `respondent_gender` enum('Male','Female','Other') DEFAULT NULL,
  `location_lat` decimal(10,8) NOT NULL,
  `location_lng` decimal(11,8) NOT NULL,
  `location_address` text DEFAULT NULL,
  `location_accuracy` decimal(8,2) DEFAULT NULL,
  `location_timestamp` datetime(3) DEFAULT NULL,
  `location_barangay` varchar(191) DEFAULT NULL,
  `location_municipality` varchar(191) DEFAULT NULL,
  `location_province` varchar(191) DEFAULT NULL,
  `status` enum('draft','in_progress','completed','submitted') NOT NULL DEFAULT 'draft',
  `progress` int(11) DEFAULT 0,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `submitted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3),
  PRIMARY KEY (`response_id`),
  UNIQUE KEY `survey_number_unique` (`survey_number`),
  KEY `fk_survey_response_barangay_id` (`barangay_id`),
  KEY `fk_survey_response_interviewer_id` (`interviewer_id`),
  CONSTRAINT `fk_survey_response_barangay_id` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_survey_response_interviewer_id` FOREIGN KEY (`interviewer_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_section`
--

CREATE TABLE `survey_section` (
  `section_id` int(11) NOT NULL AUTO_INCREMENT,
  `response_id` int(11) NOT NULL,
  `section_name` varchar(100) NOT NULL,
  `section_key` varchar(50) NOT NULL,
  `status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3),
  PRIMARY KEY (`section_id`),
  KEY `fk_survey_section_response_id` (`response_id`),
  UNIQUE KEY `response_section_unique` (`response_id`, `section_key`),
  CONSTRAINT `fk_survey_section_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_question`
--

CREATE TABLE `survey_question` (
  `question_id` int(11) NOT NULL AUTO_INCREMENT,
  `section_id` int(11) NOT NULL,
  `question_key` varchar(100) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('radio','checkbox','text','textarea','number','rating') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `depends_on` varchar(100) DEFAULT NULL,
  `depends_value` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`question_id`),
  KEY `fk_survey_question_section_id` (`section_id`),
  CONSTRAINT `fk_survey_question_section_id` FOREIGN KEY (`section_id`) REFERENCES `survey_section` (`section_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_answer`
--

CREATE TABLE `survey_answer` (
  `answer_id` int(11) NOT NULL AUTO_INCREMENT,
  `question_id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `answer_value` text DEFAULT NULL,
  `answer_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answer_options`)),
  `answer_text` text DEFAULT NULL,
  `answer_number` decimal(10,2) DEFAULT NULL,
  `answer_rating` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3),
  PRIMARY KEY (`answer_id`),
  UNIQUE KEY `question_response_unique` (`question_id`, `response_id`),
  KEY `fk_survey_answer_response_id` (`response_id`),
  CONSTRAINT `fk_survey_answer_question_id` FOREIGN KEY (`question_id`) REFERENCES `survey_question` (`question_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_survey_answer_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_metadata`
--

CREATE TABLE `survey_metadata` (
  `metadata_id` int(11) NOT NULL AUTO_INCREMENT,
  `response_id` int(11) NOT NULL,
  `key_name` varchar(100) NOT NULL,
  `key_value` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`metadata_id`),
  UNIQUE KEY `response_key_unique` (`response_id`, `key_name`),
  KEY `fk_survey_metadata_response_id` (`response_id`),
  CONSTRAINT `fk_survey_metadata_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_attachment`
--

CREATE TABLE `survey_attachment` (
  `attachment_id` int(11) NOT NULL AUTO_INCREMENT,
  `response_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`attachment_id`),
  KEY `fk_survey_attachment_response_id` (`response_id`),
  CONSTRAINT `fk_survey_attachment_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_validation`
--

CREATE TABLE `survey_validation` (
  `validation_id` int(11) NOT NULL AUTO_INCREMENT,
  `response_id` int(11) NOT NULL,
  `validation_type` enum('location','completeness','consistency','quality') NOT NULL,
  `validation_status` enum('passed','failed','warning') NOT NULL,
  `validation_message` text DEFAULT NULL,
  `validation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`validation_data`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`validation_id`),
  KEY `fk_survey_validation_response_id` (`response_id`),
  CONSTRAINT `fk_survey_validation_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Views for easy data access
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
-- Indexes for better performance
--

CREATE INDEX `idx_survey_response_status` ON `survey_response` (`status`);
CREATE INDEX `idx_survey_response_interviewer` ON `survey_response` (`interviewer_id`);
CREATE INDEX `idx_survey_response_barangay` ON `survey_response` (`barangay_id`);
CREATE INDEX `idx_survey_section_status` ON `survey_section` (`status`);
CREATE INDEX `idx_survey_answer_response` ON `survey_answer` (`response_id`);
CREATE INDEX `idx_survey_validation_type` ON `survey_validation` (`validation_type`);

-- --------------------------------------------------------

--
-- Triggers for automatic updates
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
-- Sample data for testing (optional - run this after tables are created)
--

-- Sample survey response (uncomment and run separately if needed)
/*
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

-- Sample survey section (uncomment and run separately if needed)
INSERT INTO `survey_section` (
  `response_id`,
  `section_name`,
  `section_key`,
  `status`
) VALUES (
  1,
  'Survey Initialization',
  'initialization',
  'completed'
);
*/ 