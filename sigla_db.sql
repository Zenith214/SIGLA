-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 16, 2025 at 04:59 PM
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
  `phone` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `createdAt`, `firstName`, `jobTitle`, `lastName`, `organization`, `phone`) VALUES
(1, 'test@test.com', '$2b$10$TrZnU1reblUJtU5QUC.nN.UGk3rBOwIp/xbeWZ3q3qfQ1cTtSAUZa', '2025-07-10 15:44:52.753', 'test', 'IDK', 'test2', 'MLGO', '09120969545'),
(2, 'test2@test.com', '$2b$10$9UFo5VxoMoXSTRXyIoNrcu5gAXSyAyuHFmeSdB9lkp/xuLIUEUEoe', '2025-07-10 15:51:21.205', 'test2', 'madeup', 'test3', 'sumshit', '09178263781'),
(3, 'test3@test.com', '$2b$10$raY9BKPk0kHdEIKz/0GADeqAmPnsZBl0T3q5csUxJIq79InBpxYeW', '2025-07-11 01:40:22.846', 'test3', 'IDK', 'test3', 'sumshit', '09234234234'),
(4, 'test4@test.com', '$2b$10$ig.qxsr9q1GSnq0KpCKxqOyaYBxT5.8l1vkg9y3a8XAlfSMYRkSMS', '2025-07-11 06:48:45.706', 'test4', 'test', 'test4', 'test', '09544782680'),
(5, 'kradz120@gmail.com', '$2b$10$HPQHkyDXvrKDWZtI9r09qew2xK.b35c2b5PLgud6uu8h7k0sNR6dm', '2025-07-11 07:38:35.247', 'Jomar', 'dev', 'Abaten', 'UMDC', '09544782680');

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
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
