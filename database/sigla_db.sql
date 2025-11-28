-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 21, 2025 at 08:17 AM
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
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `updated_at` datetime(3) DEFAULT NULL,
  `households` int(11) DEFAULT 0,
  `population` int(11) DEFAULT 0,
  `area` decimal(8,2) DEFAULT NULL,
  `captain` varchar(191) DEFAULT NULL,
  `currentStatus` varchar(32) DEFAULT NULL,
  `history` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `barangay`
--

INSERT INTO `barangay` (`barangay_id`, `barangay_name`, `seal`, `description`, `is_active`, `created_at`, `updated_at`, `households`, `population`, `area`, `captain`, `currentStatus`, `history`) VALUES
(26, 'Katipunan', 'no', 'A progressive barangay known for its community participation and governance excellence.', 1, '2025-08-17 08:52:47.308', NULL, 3120, 12450, 15.20, NULL, 'Completed', NULL),
(27, 'Tanwalang', 'yes', 'A developing barangay with ongoing improvement initiatives.', 1, '2025-08-17 08:52:47.313', NULL, 2180, 8750, 12.80, NULL, 'In Progress', NULL),
(28, 'Solong Vale', 'yes', 'One of the largest barangays with excellent governance and community services.', 1, '2025-08-17 08:52:47.318', NULL, 3800, 15200, 18.50, NULL, 'Completed', NULL),
(29, 'Tala-o', 'no', 'A smaller barangay with potential for growth and development.', 1, '2025-08-17 08:52:47.322', NULL, 1720, 6890, 9.30, NULL, 'Pending', NULL),
(30, 'Balasinon', 'yes', 'A mid-sized barangay working towards improved governance standards.', 1, '2025-08-17 08:52:47.326', NULL, 2335, 9340, 11.70, NULL, 'In Progress', NULL),
(31, 'Haradabutai', 'no', 'A well-managed barangay with strong community engagement.', 1, '2025-08-17 08:52:47.330', NULL, 1912, 7650, 10.40, NULL, 'Completed', NULL),
(32, 'Roxas', 'no', 'Named after a former president, known for its organized governance structure.', 1, '2025-08-17 08:52:47.335', NULL, 2800, 11200, 14.10, NULL, 'Completed', NULL),
(33, 'New Cebu', 'no', 'A large barangay with diverse communities and ongoing development projects.', 1, '2025-08-17 08:52:47.340', NULL, 3450, 13800, 16.90, NULL, 'In Progress', NULL),
(34, 'Palili', 'no', 'A small rural barangay with agricultural focus.', 1, '2025-08-17 08:52:47.344', NULL, 1355, 5420, 7.80, NULL, 'Pending', NULL),
(35, 'Talas', 'yes', 'A barangay with strong local leadership and community programs.', 1, '2025-08-17 08:52:47.347', NULL, 2240, 8960, 12.30, NULL, 'Completed', NULL),
(36, 'Carre', 'yes', 'A developing barangay with focus on infrastructure improvements.', 1, '2025-08-17 08:52:47.351', NULL, 1695, 6780, 9.10, NULL, 'In Progress', NULL),
(37, 'Buguis', 'yes', 'A well-established barangay with excellent public services.', 1, '2025-08-17 08:52:47.355', NULL, 2575, 10300, 13.60, NULL, 'Completed', NULL),
(38, 'McKinley', 'no', 'A barangay named after the American president, focusing on modernization.', 1, '2025-08-17 08:52:47.359', NULL, 1972, 7890, 10.70, NULL, 'Pending', NULL),
(39, 'Kiblagon', 'no', 'A barangay with rich cultural heritage and ongoing development initiatives.', 1, '2025-08-17 08:52:47.363', NULL, 2467, 9870, 12.90, NULL, 'In Progress', NULL),
(40, 'Laperas', 'no', 'A compact barangay with efficient governance and community services.', 1, '2025-08-17 08:52:47.367', NULL, 1635, 6540, 8.90, NULL, 'Completed', NULL),
(41, 'Clib', 'no', 'A barangay working towards improved infrastructure and services.', 1, '2025-08-17 08:52:47.371', NULL, 2030, 8120, 11.20, NULL, 'In Progress', NULL),
(42, 'Osmena', 'no', 'Named after a former president, known for its progressive governance.', 1, '2025-08-17 08:52:47.375', NULL, 2912, 11650, 14.80, NULL, 'Completed', NULL),
(43, 'Luparan', 'yes', 'A barangay with potential for agricultural and tourism development.', 1, '2025-08-17 08:52:47.378', NULL, 1830, 7320, 9.80, NULL, 'Pending', NULL),
(44, 'Poblacion', 'yes', 'The town center and largest barangay, serving as the commercial and administrative hub.', 1, '2025-08-17 08:52:47.382', NULL, 4200, 16800, 20.30, NULL, 'Completed', NULL),
(45, 'Tagolilong', 'no', 'A small barangay with focus on sustainable development.', 1, '2025-08-17 08:52:47.385', NULL, 1472, 5890, 8.10, NULL, 'In Progress', NULL),
(46, 'Lapla', 'no', 'A well-managed barangay with strong community participation.', 1, '2025-08-17 08:52:47.389', NULL, 2362, 9450, 12.60, NULL, 'Completed', NULL),
(47, 'Litos', 'no', 'A barangay with opportunities for growth and development.', 1, '2025-08-17 08:52:47.392', NULL, 1785, 7140, 9.50, NULL, 'Pending', NULL),
(48, 'Parame', 'no', 'A developing barangay with focus on community empowerment.', 1, '2025-08-17 08:52:47.395', NULL, 2167, 8670, 11.40, NULL, 'In Progress', NULL),
(49, 'Labon', 'no', 'A small but well-organized barangay with effective local governance.', 1, '2025-08-17 08:52:47.399', NULL, 1557, 6230, 8.60, NULL, 'Completed', NULL),
(50, 'Waterfall', 'no', 'The smallest barangay, known for its natural beauty and eco-tourism potential.', 1, '2025-08-17 08:52:47.403', NULL, 1222, 4890, 6.90, NULL, 'Pending', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `barangay_history`
--

CREATE TABLE `barangay_history` (
  `history_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `year` varchar(4) NOT NULL,
  `status` varchar(32) NOT NULL,
  `score` varchar(10) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey`
--

CREATE TABLE `survey` (
  `survey_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `status` enum('draft','ongoing','completed','archived') NOT NULL DEFAULT 'draft',
  `analyzed_data` longtext DEFAULT NULL,
  `raw_data` longtext DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL
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
  `answer_options` longtext DEFAULT NULL,
  `answer_text` text DEFAULT NULL,
  `answer_number` decimal(10,2) DEFAULT NULL,
  `answer_rating` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL
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
  `updated_at` datetime(3) DEFAULT NULL
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
-- Table structure for table `survey_question`
--

CREATE TABLE `survey_question` (
  `question_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `question_key` varchar(100) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('radio','checkbox','text','textarea','number','rating') NOT NULL,
  `options` longtext DEFAULT NULL,
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
  `updated_at` datetime(3) DEFAULT NULL
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
  `data` longtext DEFAULT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `validation_data` longtext DEFAULT NULL,
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
  `lastLogin` datetime DEFAULT NULL,
  `role` varchar(32) DEFAULT 'Viewer',
  `status` varchar(16) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `createdAt`, `firstName`, `jobTitle`, `lastName`, `organization`, `phone`, `lastLogin`, `role`, `status`) VALUES
(1, 'admin@sigla.com', '$2b$10$krugSCCTkRFiXiZcykIJtOZWlXmhSAEAoLRtetp6itd6z2pmL9raC', '2025-08-17 08:44:03.445', 'Admin', 'System Administrator', 'User', 'SIGLA System', '+639123456789', '2025-08-21 05:45:31', 'admin', 'Active'),
(2, 'viewer@sigla.com', '$2b$10$tibj85SkmyjATrB/yAnD7.CG61devwPXojnVza/DBYuV6Di7YxNQ2', '2025-08-17 08:44:03.515', 'Test', 'Data Viewer', 'Viewer', 'Test Organization', '+639987654321', NULL, 'viewer', 'Active'),
(3, 'interviewer@sigla.com', '$2b$10$r/yMJh504/fP84f7wnpL1OregEa.f3amWKypu847UbyCq2R05AqV6', '2025-08-17 08:54:34.843', 'Survey', 'Field Interviewer', 'Interviewer', 'SIGLA Survey Team', '+639111222333', '2025-08-17 08:57:20', 'interviewer', 'Active');

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

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('1cd89375-9abf-4724-b643-393d06434eea', '72db6dc801d3874e71f5cc0cabca203796c51ea2fab4ee3285e57786f17ccd6a', '2025-08-17 08:38:37.344', '20250710134657_init', NULL, NULL, '2025-08-17 08:38:37.305', 1),
('35fa7552-c54b-48ab-86c8-47adb96d1f7f', '1e280b6578020628e78da0fbb9f2af26267c3a9b19a1eeafbef4524b9123b135', '2025-08-17 08:38:46.315', '20250817083845_add_area_field_and_barangay_history', NULL, NULL, '2025-08-17 08:38:45.390', 1),
('71d23763-7aa7-472e-94e3-5edf31eb8774', 'a4604cac5b395b4d316336ecc1a9a87587856bf5014e63c6301aa7cb550c229e', '2025-08-17 08:38:37.363', '20250710154327_add_user_fields', NULL, NULL, '2025-08-17 08:38:37.346', 1);

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
-- Indexes for table `barangay_history`
--
ALTER TABLE `barangay_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `fk_history_barangay_id` (`barangay_id`),
  ADD KEY `idx_barangay_history_year` (`year`);

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
  ADD KEY `idx_survey_response_barangay` (`barangay_id`),
  ADD KEY `idx_survey_response_completed_at` (`completed_at`),
  ADD KEY `idx_survey_response_created_at` (`created_at`),
  ADD KEY `idx_survey_response_interviewer` (`interviewer_id`),
  ADD KEY `idx_survey_response_status` (`status`);

--
-- Indexes for table `survey_section`
--
ALTER TABLE `survey_section`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `response_section_unique` (`response_id`,`section_key`),
  ADD KEY `fk_survey_section_response_id` (`response_id`),
  ADD KEY `idx_survey_section_key` (`section_key`),
  ADD KEY `idx_survey_section_status` (`status`);

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
  ADD KEY `idx_survey_validation_status` (`validation_status`),
  ADD KEY `idx_survey_validation_type` (`validation_type`);

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
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `backup`
--
ALTER TABLE `backup`
  MODIFY `backup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `barangay`
--
ALTER TABLE `barangay`
  MODIFY `barangay_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `barangay_history`
--
ALTER TABLE `barangay_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `target_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `survey_validation`
--
ALTER TABLE `survey_validation`
  MODIFY `validation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignment`
--
ALTER TABLE `assignment`
  ADD CONSTRAINT `Assignment_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Assignment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `barangay_history`
--
ALTER TABLE `barangay_history`
  ADD CONSTRAINT `fk_history_barangay_id` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey`
--
ALTER TABLE `survey`
  ADD CONSTRAINT `Survey_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE;

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
