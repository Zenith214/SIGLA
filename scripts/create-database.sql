-- Create the SIGLA database
CREATE DATABASE IF NOT EXISTS sigla_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE sigla_db;

-- Show that database was created
SELECT 'Database sigla_db created successfully!' as message;