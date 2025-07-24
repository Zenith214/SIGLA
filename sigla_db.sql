-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 23, 2025 at 05:19 PM
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
  `updated_at` datetime(3) DEFAULT NULL ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assignment`
--

INSERT INTO `assignment` (`assignment_id`, `barangay_id`, `user_id`, `status`, `progress`, `created_at`, `updated_at`) VALUES
(1, 3, 8, 'Pending', 50, '2025-07-20 17:36:53.085', NULL),
(2, 4, 8, 'Active', 90, '2025-07-20 17:38:17.852', NULL);

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
(3, 'Barangay San Jose', 'yes', 'A progressive barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 245, 1230, 'Deris ED', 'Awardee', '[{\"year\":\"2024\",\"status\":\"Awardee\"},{\"year\":\"2023\",\"status\":\"Awardee\"},{\"year\":\"2022\",\"status\":\"Non-Awardee\"},{\"year\":\"2021\",\"status\":\"Awardee\"}]'),
(4, 'Barangay Santa Maria', 'no', 'A peaceful barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 189, 945, 'Juan Dela Cruz', 'Non-Awardee', '[{\"year\":\"2024\",\"status\":\"Non-Awardee\"},{\"year\":\"2023\",\"status\":\"Non-Awardee\"},{\"year\":\"2022\",\"status\":\"Awardee\"},{\"year\":\"2021\",\"status\":\"Awardee\"}]'),
(5, 'Barangay San Pedro', 'yes', 'A vibrant barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 312, 1560, 'Ana Rodriguez', 'Awardee', '[{\"year\":\"2024\",\"status\":\"Awardee\"},{\"year\":\"2023\",\"status\":\"Awardee\"},{\"year\":\"2022\",\"status\":\"Awardee\"},{\"year\":\"2021\",\"status\":\"Non-Awardee\"}]'),
(6, 'Barangay Nueva Vida', 'no', 'A growing barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 156, 780, 'Pedro Martinez', 'Pending', '[{\"year\":\"2024\",\"status\":\"Pending\"},{\"year\":\"2023\",\"status\":\"Non-Awardee\"},{\"year\":\"2022\",\"status\":\"Non-Awardee\"},{\"year\":\"2021\",\"status\":\"Non-Awardee\"}]'),
(7, 'Barangay Maligaya', 'yes', 'A happy barangay.', 1, '2025-07-20 15:09:10.000', '2025-07-20 15:09:10.000', 203, 1015, 'Lisa Garcia', 'Awardee', '[{\"year\":\"2024\",\"status\":\"Awardee\"},{\"year\":\"2023\",\"status\":\"Awardee\"},{\"year\":\"2022\",\"status\":\"Pending\"},{\"year\":\"2021\",\"status\":\"Non-Awardee\"}]');

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
(1, 'test@test.com', '$2b$10$TrZnU1reblUJtU5QUC.nN.UGk3rBOwIp/xbeWZ3q3qfQ1cTtSAUZa', '2025-07-10 15:44:52.753', 'Test', 'IDK', 'test2', 'MLGO', '09120969545', 'Admin', 'Active', NULL),
(2, 'test2@test.com', '$2b$10$9UFo5VxoMoXSTRXyIoNrcu5gAXSyAyuHFmeSdB9lkp/xuLIUEUEoe', '2025-07-10 15:51:21.205', 'test2', 'madeup', 'test3', 'sumshit', '09178263781', 'Viewer', 'Active', NULL),
(3, 'test3@test.com', '$2b$10$raY9BKPk0kHdEIKz/0GADeqAmPnsZBl0T3q5csUxJIq79InBpxYeW', '2025-07-11 01:40:22.846', 'test3', 'IDK', 'test3', 'sumshit', '09234234234', 'Viewer', 'Active', NULL),
(5, 'kradz120@gmail.com', '$2b$10$HPQHkyDXvrKDWZtI9r09qew2xK.b35c2b5PLgud6uu8h7k0sNR6dm', '2025-07-11 07:38:35.247', 'Jomar', 'dev', 'Abaten', 'UMDC', '09544782680', 'Interviewer', 'Active', NULL),
(6, 'maria@sigla.gov', 'dummyhash', '2025-07-20 16:23:28.000', 'Maria', NULL, 'Santos', NULL, NULL, 'Admin', 'Active', '2024-01-15 00:00:00'),
(7, 'juan@sigla.gov', 'dummyhash', '2025-07-20 16:23:28.000', 'Juan', NULL, 'Dela Cruz', NULL, NULL, 'Interviewer', 'Active', '2024-01-14 00:00:00'),
(8, 'ana@sigla.gov', 'dummyhash', '2025-07-20 16:23:28.000', 'Ana', NULL, 'Rodriguez', NULL, NULL, 'Interviewer', 'Active', '2024-01-13 00:00:00'),
(9, 'pedro@sigla.gov', 'dummyhash', '2025-07-20 16:23:28.000', 'Pedro', NULL, 'Martinez', NULL, NULL, 'Viewer', 'Inactive', '2024-01-10 00:00:00'),
(10, 'carlos@sigla.gov', 'dummyhash', '2025-07-20 16:23:28.000', 'Carlos', NULL, 'Mendoza', NULL, NULL, 'Interviewer', 'Active', '2024-01-15 00:00:00'),
(11, 'test4@test.com', 'test1234', '2025-07-20 08:36:44.434', 'test4', NULL, 'test4', NULL, NULL, 'Viewer', 'Active', '2025-07-20 00:00:00');

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
('18a42e7a-f83d-4abb-bb96-1f168ebc9285', 'ec0c96eb618df5367c6f8793ba2fd50faed3b677027368f2f1579e6ba02ad9ec', '2025-07-10 15:43:27.167', '20250710154327_add_user_fields', NULL, NULL, '2025-07-10 15:43:27.157', 1),
('41733aea-a51f-498b-9c67-631d536aced1', '283f518b58a696b65727998614be0c8cb7680c3405bd7446b52e962930a54f9e', '2025-07-10 15:23:01.170', '20250710134657_init', NULL, NULL, '2025-07-10 15:23:01.140', 1);

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
-- Indexes for table `survey_target`
--
ALTER TABLE `survey_target`
  ADD PRIMARY KEY (`target_id`),
  ADD KEY `fk_target_barangay_id` (`barangay_id`);

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
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `backup`
--
ALTER TABLE `backup`
  MODIFY `backup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `barangay`
--
ALTER TABLE `barangay`
  MODIFY `barangay_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `survey`
--
ALTER TABLE `survey`
  MODIFY `survey_id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `survey_target`
--
ALTER TABLE `survey_target`
  MODIFY `target_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
-- Constraints for table `survey_log`
--
ALTER TABLE `survey_log`
  ADD CONSTRAINT `fk_surveylog_survey_id` FOREIGN KEY (`survey_id`) REFERENCES `survey` (`survey_id`) ON DELETE CASCADE;

--
-- Constraints for table `survey_target`
--
ALTER TABLE `survey_target`
  ADD CONSTRAINT `fk_target_barangay_id` FOREIGN KEY (`barangay_id`) REFERENCES `barangay` (`barangay_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
