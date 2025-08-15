-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 15, 2025 at 08:38 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sigla_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `create_survey_response` (IN `p_survey_number` VARCHAR(50), IN `p_barangay_id` INT, IN `p_interviewer_id` INT, IN `p_location_lat` DECIMAL(10,8), IN `p_location_lng` DECIMAL(11,8), IN `p_location_address` TEXT)   BEGIN
  DECLARE new_response_id INT;
  
  
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
  
  
  INSERT INTO survey_section (response_id, section_name, section_key, status)
  VALUES 
    (new_response_id, 'Survey Initialization', 'initialization', 'pending'),
    (new_response_id, 'Respondent Selection', 'kish-grid', 'pending'),
    (new_response_id, 'Financial Administration', 'financial', 'pending'),
    (new_response_id, 'Disaster Preparedness', 'disaster', 'pending'),
    (new_response_id, 'Safety & Peace Order', 'safety', 'pending'),
    (new_response_id, 'Social Protection', 'social', 'pending'),
    (new_response_id, 'Business Friendliness', 'business', 'pending'),
    (new_response_id, 'Environmental Management', 'environmental', 'pending'),
    (new_response_id, 'Summary & Review', 'summary', 'pending');
  
  SELECT new_response_id as response_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `get_survey_progress` (IN `p_response_id` INT)   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `update_survey_section` (IN `p_response_id` INT, IN `p_section_key` VARCHAR(50), IN `p_status` ENUM('pending','in_progress','completed'), IN `p_data` JSON)   BEGIN
  UPDATE survey_section 
  SET 
    status = p_status,
    data = p_data,
    started_at = CASE WHEN p_status = 'in_progress' AND started_at IS NULL THEN NOW() ELSE started_at END,
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE completed_at END,
    updated_at = NOW()
  WHERE response_id = p_response_id AND section_key = p_section_key;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `assignment`
--

CREATE TABLE `assignment` (
  `assignment_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('Active','Pending','Completed') NOT NULL DEFAULT 'Pending',
  `progress` int(11) DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignment`
--

INSERT INTO `assignment` (`assignment_id`, `barangay_id`, `user_id`, `status`, `progress`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 'Active', 75, '2025-07-20 17:36:53.085', NULL),
(2, 2, 3, 'Pending', 25, '2025-07-20 17:38:17.852', NULL),
(3, 3, 4, 'Completed', 100, '2025-07-20 17:38:17.852', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `backup`
--

CREATE TABLE `backup` (
  `backup_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `size` varchar(20) DEFAULT NULL,
  `status` enum('Success','Failed') NOT NULL DEFAULT 'Success'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `barangay`
--

CREATE TABLE `barangay` (
  `barangay_id` int(11) NOT NULL,
  `barangay_name` varchar(191) NOT NULL,
  `seal` enum('yes','no') NOT NULL DEFAULT 'no',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3),
  `households` int(11) DEFAULT 0,
  `population` int(11) DEFAULT 0,
  `captain` varchar(191) DEFAULT NULL,
  `currentStatus` varchar(32) DEFAULT NULL,
  `history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`history`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `barangay`
--

INSERT INTO `barangay` (`barangay_id`, `barangay_name`, `seal`, `description`, `is_active`, `created_at`, `updated_at`, `households`, `population`, `captain`, `currentStatus`, `history`) VALUES
(1, 'Barangay San Jose', 'yes', 'A progressive barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 245, 1230, 'Deris ED', 'Awardee', '[{\"year\":\"2024\",\"status\":\"Awardee\"},{\"year\":\"2023\",\"status\":\"Awardee\"},{\"year\":\"2022\",\"status\":\"Non-Awardee\"},{\"year\":\"2021\",\"status\":\"Awardee\"}]'),
(2, 'Barangay Santa Maria', 'no', 'A peaceful barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 189, 945, 'Juan Dela Cruz', 'Non-Awardee', '[{\"year\":\"2024\",\"status\":\"Non-Awardee\"},{\"year\":\"2023\",\"status\":\"Non-Awardee\"},{\"year\":\"2022\",\"status\":\"Awardee\"},{\"year\":\"2021\",\"status\":\"Awardee\"}]'),
(3, 'Barangay San Pedro', 'yes', 'A vibrant barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 312, 1560, 'Ana Rodriguez', 'Awardee', '[{\"year\":\"2024\",\"status\":\"Awardee\"},{\"year\":\"2023\",\"status\":\"Awardee\"},{\"year\":\"2022\",\"status\":\"Awardee\"},{\"year\":\"2021\",\"status\":\"Non-Awardee\"}]'),
(4, 'Barangay Nueva Vida', 'no', 'A growing barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 156, 780, 'Pedro Martinez', 'Pending', '[{\"year\":\"2024\",\"status\":\"Pending\"},{\"year\":\"2023\",\"status\":\"Non-Awardee\"},{\"year\":\"2022\",\"status\":\"Non-Awardee\"},{\"year\":\"2021\",\"status\":\"Non-Awardee\"}]'),
(5, 'Barangay Maligaya', 'yes', 'A happy barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 203, 1015, 'Lisa Garcia', 'Awardee', '[{\"year\":\"2024\",\"status\":\"Awardee\"},{\"year\":\"2023\",\"status\":\"Awardee\"},{\"year\":\"2022\",\"status\":\"Pending\"},{\"year\":\"2021\",\"status\":\"Non-Awardee\"}]');

-- --------------------------------------------------------

--
-- Stand-in structure for view `barangay_survey_status_view`
-- (See below for the actual view)
--
CREATE TABLE `barangay_survey_status_view` (
`barangay_id` int(11)
,`barangay_name` varchar(191)
,`total_surveys` bigint(21)
,`completed_surveys` bigint(21)
,`average_progress` decimal(14,4)
,`last_survey_date` datetime(3)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `interviewer_performance_view`
-- (See below for the actual view)
--
CREATE TABLE `interviewer_performance_view` (
`id` int(11)
,`interviewer_name` varchar(383)
,`total_surveys` bigint(21)
,`completed_surveys` bigint(21)
,`average_progress` decimal(14,4)
,`last_survey_date` datetime(3)
);

-- --------------------------------------------------------

--
-- Table structure for table `survey`
--

CREATE TABLE `survey` (
  `survey_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `status` enum('draft','ongoing','completed','archived') NOT NULL DEFAULT 'draft',
  `analyzed_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`analyzed_data`)),
  `raw_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_data`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_answer`
--

CREATE TABLE `survey_answer` (
  `answer_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `answer_value` text DEFAULT NULL,
  `answer_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answer_options`)),
  `answer_text` text DEFAULT NULL,
  `answer_number` decimal(10,2) DEFAULT NULL,
  `answer_rating` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_attachment`
--

CREATE TABLE `survey_attachment` (
  `attachment_id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_cycle`
--

CREATE TABLE `survey_cycle` (
  `cycle_id` int(11) NOT NULL,
  `year` varchar(10) NOT NULL,
  `status` enum('Active','Completed','Archived') NOT NULL DEFAULT 'Active',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `responses` int(11) DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_log`
--

CREATE TABLE `survey_log` (
  `log_id` int(11) NOT NULL,
  `survey_id` int(11) NOT NULL,
  `action` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_metadata`
--

CREATE TABLE `survey_metadata` (
  `metadata_id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `key_name` varchar(100) NOT NULL,
  `key_value` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `survey_progress_view`
-- (See below for the actual view)
--
CREATE TABLE `survey_progress_view` (
`response_id` int(11)
,`survey_number` varchar(50)
,`barangay_name` varchar(191)
,`interviewer_name` varchar(383)
,`status` enum('draft','in_progress','completed','submitted')
,`progress` int(11)
,`started_at` datetime(3)
,`completed_at` datetime(3)
,`total_sections` bigint(21)
,`completed_sections` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `survey_question`
--

CREATE TABLE `survey_question` (
  `question_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `question_key` varchar(100) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('radio','checkbox','text','textarea','number','rating') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `depends_on` varchar(100) DEFAULT NULL,
  `depends_value` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_response`
--

CREATE TABLE `survey_response` (
  `response_id` int(11) NOT NULL,
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
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_section`
--

CREATE TABLE `survey_section` (
  `section_id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `section_name` varchar(100) NOT NULL,
  `section_key` varchar(50) NOT NULL,
  `status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `survey_section`
--
DELIMITER $$
CREATE TRIGGER `update_survey_progress` AFTER UPDATE ON `survey_section` FOR EACH ROW BEGIN
  DECLARE total_sections INT;
  DECLARE completed_sections INT;
  
  
  SELECT COUNT(*) INTO total_sections 
  FROM survey_section 
  WHERE response_id = NEW.response_id;
  
  
  SELECT COUNT(*) INTO completed_sections 
  FROM survey_section 
  WHERE response_id = NEW.response_id AND status = 'completed';
  
  
  UPDATE survey_response 
  SET progress = ROUND((completed_sections / total_sections) * 100)
  WHERE response_id = NEW.response_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `survey_statistics_view`
-- (See below for the actual view)
--
CREATE TABLE `survey_statistics_view` (
`total_surveys` bigint(21)
,`completed_surveys` bigint(21)
,`in_progress_surveys` bigint(21)
,`draft_surveys` bigint(21)
,`average_progress` decimal(14,4)
,`active_interviewers` bigint(21)
,`barangays_surveyed` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `survey_target`
--

CREATE TABLE `survey_target` (
  `target_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `achieved` int(11) DEFAULT 0,
  `percentage` int(11) DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `survey_target`
--

INSERT INTO `survey_target` (`target_id`, `barangay_id`, `target`, `achieved`, `percentage`, `created_at`, `updated_at`) VALUES
(1, 1, 250, 0, 0, '2025-07-23 15:24:21.910', NULL),
(2, 2, 200, 0, 0, '2025-07-23 15:24:21.910', NULL),
(3, 3, 300, 0, 0, '2025-07-23 15:24:21.910', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `survey_validation`
--

CREATE TABLE `survey_validation` (
  `validation_id` int(11) NOT NULL,
  `response_id` int(11) NOT NULL,
  `validation_type` enum('location','completeness','consistency','quality') NOT NULL,
  `validation_status` enum('passed','failed','warning') NOT NULL,
  `validation_message` text DEFAULT NULL,
  `validation_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`validation_data`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `firstName` varchar(191) NOT NULL,
  `jobTitle` varchar(191) DEFAULT NULL,
  `lastName` varchar(191) NOT NULL,
  `organization` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `role` varchar(32) DEFAULT 'Viewer',
  `status` varchar(16) DEFAULT 'Active',
  `lastLogin` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `createdAt`, `firstName`, `jobTitle`, `lastName`, `organization`, `phone`, `role`, `status`, `lastLogin`) VALUES
(1, 'admin@sigla.gov', '$2b$10$mBXEP.I5G7rDra1HKxjuC.fKAg5e4s8yh9jbAZub6u2JpOJqMwuxK', '2025-07-10 15:44:52.753', 'Admin', 'System Administrator', 'User', 'SIGLA', '09120969545', 'admin', 'Active', '2025-08-15 06:30:24'),
(2, 'maria@sigla.gov', '$2b$10$XQNmbxNen4EHXBEyTOBEZOuXvjW/WVFbPCLZuLMqj7ouVHEXWipM.', '2025-07-20 16:23:28.000', 'Maria', 'Interviewer', 'Santos', 'SIGLA', '09123456789', 'Interviewer', 'Active', '2024-01-15 00:00:00'),
(3, 'juan@sigla.gov', '$2b$10$qnQFkeDiZS136.ZZKYaf1Ov5De0q7tLOuX3uvpdehKc27dYn9NwgC', '2025-07-20 16:23:28.000', 'Juan', 'Interviewer', 'Dela Cruz', 'SIGLA', '09187654321', 'Interviewer', 'Active', '2024-01-14 00:00:00'),
(4, 'ana@sigla.gov', '$2b$10$503TiLr/TdI.QuRvhCY9qeCFgLnaR/3gXwLXn8JAVXIO6Z2A9vRx6', '2025-07-20 16:23:28.000', 'Ana', 'Interviewer', 'Rodriguez', 'SIGLA', '09111222333', 'Interviewer', 'Active', '2024-01-13 00:00:00'),
(5, 'carlos@sigla.gov', '$2b$10$e6BRHyubiHuczQRu70HWAurfgOmiv2OwTQEKl.hZW4gvYpxTU/epi', '2025-07-20 16:23:28.000', 'Carlos', 'Interviewer', 'Mendoza', 'SIGLA', '09144555666', 'Interviewer', 'Active', '2024-01-15 00:00:00'),
(6, 'interviewer@test.com', '$2b$10$iiNxXzSD3EzI8uYfRAQUv.dcfn.f7dGoVTwyLU02rhKl25EZh7ChO', '2025-08-15 04:45:11.375', 'interviewer', NULL, 'test', NULL, NULL, 'interviewer', 'Active', '2025-08-15 06:29:15'),
(7, 'viewer1@gmail.com', '$2b$10$lIL9HT0mo4ipbRoHth2C/.0d/29/eQ7E27xmM3iyElKJ.XX6FcdDW', '2025-08-15 06:31:07.392', 'viewer', NULL, 'test', NULL, NULL, 'viewer', 'Active', '2025-08-15 06:32:31');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure for view `barangay_survey_status_view`
--
DROP TABLE IF EXISTS `barangay_survey_status_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `barangay_survey_status_view`  AS SELECT `b`.`barangay_id` AS `barangay_id`, `b`.`barangay_name` AS `barangay_name`, count(`sr`.`response_id`) AS `total_surveys`, count(case when `sr`.`status` = 'completed' then 1 end) AS `completed_surveys`, avg(`sr`.`progress`) AS `average_progress`, max(`sr`.`created_at`) AS `last_survey_date` FROM (`barangay` `b` left join `survey_response` `sr` on(`b`.`barangay_id` = `sr`.`barangay_id`)) GROUP BY `b`.`barangay_id` ;

-- --------------------------------------------------------

--
-- Structure for view `interviewer_performance_view`
--
DROP TABLE IF EXISTS `interviewer_performance_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `interviewer_performance_view`  AS SELECT `u`.`id` AS `id`, concat(`u`.`firstName`,' ',`u`.`lastName`) AS `interviewer_name`, count(`sr`.`response_id`) AS `total_surveys`, count(case when `sr`.`status` = 'completed' then 1 end) AS `completed_surveys`, avg(`sr`.`progress`) AS `average_progress`, max(`sr`.`created_at`) AS `last_survey_date` FROM (`user` `u` left join `survey_response` `sr` on(`u`.`id` = `sr`.`interviewer_id`)) WHERE `u`.`role` = 'Interviewer' GROUP BY `u`.`id` ;

-- --------------------------------------------------------

--
-- Structure for view `survey_progress_view`
--
DROP TABLE IF EXISTS `survey_progress_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `survey_progress_view`  AS SELECT `sr`.`response_id` AS `response_id`, `sr`.`survey_number` AS `survey_number`, `b`.`barangay_name` AS `barangay_name`, concat(`u`.`firstName`,' ',`u`.`lastName`) AS `interviewer_name`, `sr`.`status` AS `status`, `sr`.`progress` AS `progress`, `sr`.`started_at` AS `started_at`, `sr`.`completed_at` AS `completed_at`, count(`ss`.`section_id`) AS `total_sections`, count(case when `ss`.`status` = 'completed' then 1 end) AS `completed_sections` FROM (((`survey_response` `sr` left join `barangay` `b` on(`sr`.`barangay_id` = `b`.`barangay_id`)) left join `user` `u` on(`sr`.`interviewer_id` = `u`.`id`)) left join `survey_section` `ss` on(`sr`.`response_id` = `ss`.`response_id`)) GROUP BY `sr`.`response_id` ;

-- --------------------------------------------------------

--
-- Structure for view `survey_statistics_view`
--
DROP TABLE IF EXISTS `survey_statistics_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `survey_statistics_view`  AS SELECT count(0) AS `total_surveys`, count(case when `survey_response`.`status` = 'completed' then 1 end) AS `completed_surveys`, count(case when `survey_response`.`status` = 'in_progress' then 1 end) AS `in_progress_surveys`, count(case when `survey_response`.`status` = 'draft' then 1 end) AS `draft_surveys`, avg(`survey_response`.`progress`) AS `average_progress`, count(distinct `survey_response`.`interviewer_id`) AS `active_interviewers`, count(distinct `survey_response`.`barangay_id`) AS `barangays_surveyed` FROM `survey_response` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `assignment`
--
ALTER TABLE `assignment`
  ADD PRIMARY KEY (`assignment_id`),
  ADD KEY `fk_assignment_barangay_id` (`barangay_id`),
  ADD KEY `fk_assignment_user_id` (`user_id`);

--
-- Indexes for table `backup`
--
ALTER TABLE `backup`
  ADD PRIMARY KEY (`backup_id`);

--
-- Indexes for table `barangay`
--
ALTER TABLE `barangay`
  ADD PRIMARY KEY (`barangay_id`),
  ADD UNIQUE KEY `barangay_name_unique` (`barangay_name`);

--
-- Indexes for table `survey`
--
ALTER TABLE `survey`
  ADD PRIMARY KEY (`survey_id`),
  ADD KEY `fk_survey_barangay_id` (`barangay_id`);

--
-- Indexes for table `survey_answer`
--
ALTER TABLE `survey_answer`
  ADD PRIMARY KEY (`answer_id`),
  ADD UNIQUE KEY `question_response_unique` (`question_id`,`response_id`),
  ADD KEY `fk_survey_answer_response_id` (`response_id`),
  ADD KEY `idx_survey_answer_response` (`response_id`);

--
-- Indexes for table `survey_attachment`
--
ALTER TABLE `survey_attachment`
  ADD PRIMARY KEY (`attachment_id`),
  ADD KEY `fk_survey_attachment_response_id` (`response_id`);

--
-- Indexes for table `survey_cycle`
--
ALTER TABLE `survey_cycle`
  ADD PRIMARY KEY (`cycle_id`);

--
-- Indexes for table `survey_log`
--
ALTER TABLE `survey_log`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `fk_surveylog_survey_id` (`survey_id`);

--
-- Indexes for table `survey_metadata`
--
ALTER TABLE `survey_metadata`
  ADD PRIMARY KEY (`metadata_id`),
  ADD UNIQUE KEY `response_key_unique` (`response_id`,`key_name`),
  ADD KEY `fk_survey_metadata_response_id` (`response_id`);

--
-- Indexes for table `survey_question`
--
ALTER TABLE `survey_question`
  ADD PRIMARY KEY (`question_id`),
  ADD KEY `fk_survey_question_section_id` (`section_id`),
  ADD KEY `idx_survey_question_key` (`question_key`);

--
-- Indexes for table `survey_response`
--
ALTER TABLE `survey_response`
  ADD PRIMARY KEY (`response_id`),
  ADD UNIQUE KEY `survey_number_unique` (`survey_number`),
  ADD KEY `fk_survey_response_barangay_id` (`barangay_id`),
  ADD KEY `fk_survey_response_interviewer_id` (`interviewer_id`),
  ADD KEY `idx_survey_response_status` (`status`),
  ADD KEY `idx_survey_response_interviewer` (`interviewer_id`),
  ADD KEY `idx_survey_response_barangay` (`barangay_id`),
  ADD KEY `idx_survey_response_created_at` (`created_at`),
  ADD KEY `idx_survey_response_completed_at` (`completed_at`);

--
-- Indexes for table `survey_section`
--
ALTER TABLE `survey_section`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `response_section_unique` (`response_id`,`section_key`),
  ADD KEY `fk_survey_section_response_id` (`response_id`),
  ADD KEY `idx_survey_section_status` (`status`),
  ADD KEY `idx_survey_section_key` (`section_key`);

--
-- Indexes for table `survey_target`
--
ALTER TABLE `survey_target`
  ADD PRIMARY KEY (`target_id`),
  ADD KEY `fk_target_barangay_id` (`barangay_id`);

--
-- Indexes for table `survey_validation`
--
ALTER TABLE `survey_validation`
  ADD PRIMARY KEY (`validation_id`),
  ADD KEY `fk_survey_validation_response_id` (`response_id`),
  ADD KEY `idx_survey_validation_type` (`validation_type`),
  ADD KEY `idx_survey_validation_status` (`validation_status`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `assignment`
--
ALTER TABLE `assignment`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `backup`
--
ALTER TABLE `backup`
  MODIFY `backup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `barangay`
--
ALTER TABLE `barangay`
  MODIFY `barangay_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `survey`
--
ALTER TABLE `survey`
  MODIFY `survey_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_answer`
--
ALTER TABLE `survey_answer`
  MODIFY `answer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_attachment`
--
ALTER TABLE `survey_attachment`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_cycle`
--
ALTER TABLE `survey_cycle`
  MODIFY `cycle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_log`
--
ALTER TABLE `survey_log`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_metadata`
--
ALTER TABLE `survey_metadata`
  MODIFY `metadata_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_question`
--
ALTER TABLE `survey_question`
  MODIFY `question_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_response`
--
ALTER TABLE `survey_response`
  MODIFY `response_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_section`
--
ALTER TABLE `survey_section`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_target`
--
ALTER TABLE `survey_target`
  MODIFY `target_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `survey_validation`
--
ALTER TABLE `survey_validation`
  MODIFY `validation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignment`
--
ALTER TABLE `assignment`
  ADD CONSTRAINT `fk_assignment_barangay_id` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_assignment_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `survey`
--
ALTER TABLE `survey`
  ADD CONSTRAINT `fk_survey_barangay_id` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_answer`
--
ALTER TABLE `survey_answer`
  ADD CONSTRAINT `fk_survey_answer_question_id` FOREIGN KEY (`question_id`) REFERENCES `survey_question` (`question_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_survey_answer_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_attachment`
--
ALTER TABLE `survey_attachment`
  ADD CONSTRAINT `fk_survey_attachment_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_log`
--
ALTER TABLE `survey_log`
  ADD CONSTRAINT `fk_surveylog_survey_id` FOREIGN KEY (`survey_id`) REFERENCES `survey` (`survey_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_metadata`
--
ALTER TABLE `survey_metadata`
  ADD CONSTRAINT `fk_survey_metadata_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_question`
--
ALTER TABLE `survey_question`
  ADD CONSTRAINT `fk_survey_question_section_id` FOREIGN KEY (`section_id`) REFERENCES `survey_section` (`section_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_response`
--
ALTER TABLE `survey_response`
  ADD CONSTRAINT `fk_survey_response_barangay_id` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_survey_response_interviewer_id` FOREIGN KEY (`interviewer_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_section`
--
ALTER TABLE `survey_section`
  ADD CONSTRAINT `fk_survey_section_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_target`
--
ALTER TABLE `survey_target`
  ADD CONSTRAINT `fk_target_barangay_id` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_validation`
--
ALTER TABLE `survey_validation`
  ADD CONSTRAINT `fk_survey_validation_response_id` FOREIGN KEY (`response_id`) REFERENCES `survey_response` (`response_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
