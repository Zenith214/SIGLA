-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 01, 2025 at 12:30 PM
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
-- Table structure for table `action_grid_classification`
--

CREATE TABLE `action_grid_classification` (
  `classification_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `service_area` varchar(50) NOT NULL,
  `quadrant` enum('MAINTAIN','OPPORTUNITIES','MONITOR','FIX_NOW') NOT NULL,
  `awareness_score` decimal(5,4) DEFAULT NULL,
  `availment_score` decimal(5,4) DEFAULT NULL,
  `satisfaction_score` decimal(5,4) DEFAULT NULL,
  `need_action_score` decimal(5,4) DEFAULT NULL,
  `bottleneck_stage` varchar(50) DEFAULT NULL,
  `recommendations` longtext DEFAULT NULL,
  `confidence_level` decimal(5,4) DEFAULT NULL,
  `data_completeness` decimal(5,4) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `adaptive_threshold`
--

CREATE TABLE `adaptive_threshold` (
  `id` int(11) NOT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `service_area` varchar(100) NOT NULL,
  `threshold_type` enum('satisfaction_high','satisfaction_low','awareness_high','awareness_low','availment_high','availment_low','need_action_high','need_action_low','action_grid_quadrant_x','action_grid_quadrant_y') NOT NULL,
  `threshold_value` decimal(5,2) NOT NULL,
  `calculation_method` enum('rule_based','percentile','statistical_analysis','ml_derived') NOT NULL,
  `sample_size` int(11) NOT NULL,
  `confidence_level` decimal(3,2) NOT NULL,
  `percentile_rank` int(11) DEFAULT NULL,
  `statistical_data` longtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_insight`
--

CREATE TABLE `ai_insight` (
  `insight_id` int(11) NOT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `insight_type` enum('comprehensive','comparative','trend_analysis','bottleneck_analysis','recommendation') NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` longtext NOT NULL,
  `key_findings` longtext DEFAULT NULL,
  `recommendations` longtext DEFAULT NULL,
  `confidence_score` decimal(5,4) DEFAULT NULL,
  `data_sources` longtext DEFAULT NULL,
  `generated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expires_at` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `captain` varchar(191) DEFAULT NULL,
  `currentStatus` varchar(32) DEFAULT NULL,
  `history` longtext DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `area_sqkm` decimal(10,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `barangay_intelligence_tier`
--

CREATE TABLE `barangay_intelligence_tier` (
  `barangay_id` int(11) NOT NULL,
  `current_tier` int(11) NOT NULL DEFAULT 0,
  `response_count` int(11) NOT NULL DEFAULT 0,
  `data_quality_score` decimal(5,4) DEFAULT NULL,
  `last_tier_evaluation` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `tier_upgrade_history` longtext DEFAULT NULL,
  `capabilities` longtext DEFAULT NULL,
  `next_upgrade_threshold` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `funnel_score`
--

CREATE TABLE `funnel_score` (
  `score_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `service_area` varchar(50) NOT NULL,
  `awareness_score` decimal(5,4) NOT NULL,
  `availment_score` decimal(5,4) NOT NULL,
  `satisfaction_score` decimal(5,4) NOT NULL,
  `need_action_score` decimal(5,4) NOT NULL,
  `sample_size` int(11) NOT NULL,
  `confidence_level` decimal(5,4) NOT NULL,
  `calculation_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ml_model`
--

CREATE TABLE `ml_model` (
  `model_id` int(11) NOT NULL,
  `model_name` varchar(100) NOT NULL,
  `model_type` enum('random_forest','linear_regression','classification','clustering') NOT NULL,
  `model_version` varchar(20) NOT NULL,
  `model_file_path` varchar(500) DEFAULT NULL,
  `model_parameters` longtext DEFAULT NULL,
  `training_data` longtext DEFAULT NULL,
  `performance_metrics` longtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ml_model`
--

INSERT INTO `ml_model` (`model_id`, `model_name`, `model_type`, `model_version`, `model_file_path`, `model_parameters`, `training_data`, `performance_metrics`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'local_fallback_v1.0', 'random_forest', '1.0', NULL, NULL, NULL, NULL, 1, '2025-08-20 01:23:35.284', NULL),
(2, 'local_fallback_v1.0', 'random_forest', '1.0', NULL, NULL, NULL, NULL, 1, '2025-08-20 01:23:35.306', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ml_prediction`
--

CREATE TABLE `ml_prediction` (
  `prediction_id` int(11) NOT NULL,
  `model_id` int(11) NOT NULL,
  `barangay_id` int(11) NOT NULL,
  `prediction_type` enum('satisfaction_score','action_grid_classification','funnel_performance','trend_prediction') NOT NULL,
  `predicted_value` decimal(10,4) NOT NULL,
  `confidence_score` decimal(5,4) DEFAULT NULL,
  `input_features` longtext DEFAULT NULL,
  `prediction_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
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
-- Table structure for table `threshold_history`
--

CREATE TABLE `threshold_history` (
  `history_id` int(11) NOT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `service_area` varchar(100) NOT NULL,
  `threshold_type` enum('satisfaction_high','satisfaction_low','awareness_high','awareness_low','availment_high','availment_low','need_action_high','need_action_low','action_grid_quadrant_x','action_grid_quadrant_y') NOT NULL,
  `old_value` decimal(5,2) DEFAULT NULL,
  `new_value` decimal(5,2) NOT NULL,
  `change_reason` varchar(200) DEFAULT NULL,
  `sample_size_before` int(11) DEFAULT NULL,
  `sample_size_after` int(11) NOT NULL,
  `confidence_before` decimal(3,2) DEFAULT NULL,
  `confidence_after` decimal(3,2) NOT NULL,
  `rollback_available` tinyint(1) NOT NULL DEFAULT 1,
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
(1, 'admin@sigla.com', '$2b$10$fgv5t6FmsTMeUD/r8YDQ5ep6kBzCc/DMFsnvqAxMGiUCDX/4EKg4y', '2025-08-20 01:17:25.321', 'System', 'System Administrator', 'Administrator', 'SIGLA System', '+63-123-456-7890', 'Admin', 'Active', NULL),
(2, 'interviewer@sigla.com', '$2b$10$LOE1L/owgJ7mSyolmcUjxODhAbQEl/8BFRQu44YrOCtF1uB5m6urO', '2025-08-20 01:17:25.341', 'Survey', 'Field Interviewer', 'Interviewer', 'SIGLA Survey Team', '+63-123-456-7891', 'Interviewer', 'Active', NULL),
(3, 'viewer@sigla.com', '$2b$10$C9hkxoTwf640ZjP1aJwVXOzdm9PGYFRwv0GK3DmUm1sb8SJYCLRrS', '2025-08-20 01:17:25.346', 'Data', 'Data Analyst', 'Viewer', 'SIGLA Analytics Team', '+63-123-456-7892', 'Viewer', 'Active', NULL),
(4, 'test.admin@sigla.com', '$2b$10$8/VIsoSAIjWKPdiyz3zkKe4hPqt3tZvFn9nTpOD49rMEO9iw5Fzsm', '2025-08-20 01:17:25.435', 'Test', 'Test Administrator', 'Admin', 'SIGLA Test', '+63-123-456-7893', 'Admin', 'Active', '2025-08-20 01:23:25'),
(5, 'test.interviewer@sigla.com', '$2b$10$XnVDtraUMR6auvOrzxexOOexI/zA9/hEPqBZAuObZ0ZumZVeGf6I2', '2025-08-20 01:17:25.521', 'Test', 'Test Interviewer', 'Interviewer', 'SIGLA Test', '+63-123-456-7894', 'Interviewer', 'Active', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `action_grid_classification`
--
ALTER TABLE `action_grid_classification`
  ADD PRIMARY KEY (`classification_id`),
  ADD UNIQUE KEY `barangay_service_unique` (`barangay_id`,`service_area`),
  ADD KEY `idx_action_grid_barangay` (`barangay_id`),
  ADD KEY `idx_action_grid_quadrant` (`quadrant`),
  ADD KEY `idx_action_grid_service` (`service_area`);

--
-- Indexes for table `adaptive_threshold`
--
ALTER TABLE `adaptive_threshold`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `barangay_service_threshold_unique` (`barangay_id`,`service_area`,`threshold_type`),
  ADD KEY `idx_adaptive_threshold_barangay` (`barangay_id`),
  ADD KEY `idx_adaptive_threshold_service` (`service_area`),
  ADD KEY `idx_adaptive_threshold_type` (`threshold_type`),
  ADD KEY `idx_adaptive_threshold_active` (`is_active`);

--
-- Indexes for table `ai_insight`
--
ALTER TABLE `ai_insight`
  ADD PRIMARY KEY (`insight_id`),
  ADD KEY `idx_ai_insight_barangay` (`barangay_id`),
  ADD KEY `idx_ai_insight_type` (`insight_type`),
  ADD KEY `idx_ai_insight_generated` (`generated_at`);

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
-- Indexes for table `barangay_intelligence_tier`
--
ALTER TABLE `barangay_intelligence_tier`
  ADD PRIMARY KEY (`barangay_id`),
  ADD KEY `idx_intelligence_tier_current` (`current_tier`),
  ADD KEY `idx_intelligence_tier_response_count` (`response_count`),
  ADD KEY `idx_intelligence_tier_evaluation` (`last_tier_evaluation`);

--
-- Indexes for table `funnel_score`
--
ALTER TABLE `funnel_score`
  ADD PRIMARY KEY (`score_id`),
  ADD UNIQUE KEY `barangay_service_date_unique` (`barangay_id`,`service_area`,`calculation_date`),
  ADD KEY `idx_funnel_score_barangay` (`barangay_id`),
  ADD KEY `idx_funnel_score_service` (`service_area`);

--
-- Indexes for table `ml_model`
--
ALTER TABLE `ml_model`
  ADD PRIMARY KEY (`model_id`);

--
-- Indexes for table `ml_prediction`
--
ALTER TABLE `ml_prediction`
  ADD PRIMARY KEY (`prediction_id`),
  ADD KEY `idx_ml_prediction_barangay` (`barangay_id`),
  ADD KEY `idx_ml_prediction_model` (`model_id`),
  ADD KEY `idx_ml_prediction_type` (`prediction_type`);

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
-- Indexes for table `threshold_history`
--
ALTER TABLE `threshold_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `idx_threshold_history_barangay` (`barangay_id`),
  ADD KEY `idx_threshold_history_service` (`service_area`),
  ADD KEY `idx_threshold_history_type` (`threshold_type`),
  ADD KEY `idx_threshold_history_created` (`created_at`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `action_grid_classification`
--
ALTER TABLE `action_grid_classification`
  MODIFY `classification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `adaptive_threshold`
--
ALTER TABLE `adaptive_threshold`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_insight`
--
ALTER TABLE `ai_insight`
  MODIFY `insight_id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `barangay_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `funnel_score`
--
ALTER TABLE `funnel_score`
  MODIFY `score_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ml_model`
--
ALTER TABLE `ml_model`
  MODIFY `model_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ml_prediction`
--
ALTER TABLE `ml_prediction`
  MODIFY `prediction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- AUTO_INCREMENT for table `threshold_history`
--
ALTER TABLE `threshold_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `adaptive_threshold`
--
ALTER TABLE `adaptive_threshold`
  ADD CONSTRAINT `adaptive_threshold_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangay_intelligence_tier` (`barangay_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `assignment`
--
ALTER TABLE `assignment`
  ADD CONSTRAINT `Assignment_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Assignment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `barangay_intelligence_tier`
--
ALTER TABLE `barangay_intelligence_tier`
  ADD CONSTRAINT `barangay_intelligence_tier_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `funnel_score`
--
ALTER TABLE `funnel_score`
  ADD CONSTRAINT `funnel_score_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ml_prediction`
--
ALTER TABLE `ml_prediction`
  ADD CONSTRAINT `ml_prediction_barangay_id_fkey` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ml_prediction_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `ml_model` (`model_id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
