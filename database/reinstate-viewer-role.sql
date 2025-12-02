-- Reinstate Viewer Role Migration
-- This script adds back the viewer role with read-only permissions

-- Step 1: Update the user table to allow 'viewer' role again
-- No schema change needed - role column already accepts any varchar(32)

-- Step 2: Add a sample viewer user (optional - for testing)
-- Password is 'viewer123' hashed with bcrypt
INSERT INTO `user` (`email`, `password`, `firstName`, `lastName`, `role`, `status`, `jobTitle`, `organization`, `phone`, `createdAt`)
VALUES 
  ('viewer@sigla.com', '$2b$10$tibj85SkmyjATrB/yAnD7.CG61devwPXojnVza/DBYuV6Di7YxNQ2', 'Test', 'Viewer', 'viewer', 'Active', 'Data Viewer', 'SIGLA System', '+639123456789', NOW())
ON DUPLICATE KEY UPDATE 
  `role` = 'viewer',
  `status` = 'Active';

-- Step 3: Document viewer role permissions
-- VIEWER ROLE PERMISSIONS:
-- ✓ Can access Main Dashboard (Map Tab and Analytics Tab)
-- ✓ Can access CPAP Management Dashboard (read-only)
-- ✓ Can access Backup Settings
-- ✗ Cannot perform CRUD operations
-- ✗ Cannot answer CPAP questions
-- ✗ Cannot submit surveys
-- ✗ Cannot create/edit/delete any data
-- ✗ Cannot access admin settings (except backup)

-- Verification Query
-- Run this to check viewer users:
-- SELECT id, email, firstName, lastName, role, status FROM user WHERE role = 'viewer';
