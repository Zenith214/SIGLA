-- Migration: Add Developer Role Support
-- Description: Adds developer role to the system with full access to all dashboards
-- Date: 2025-11-27

-- Step 1: Update the role enum to include 'developer' if using enum type
-- Note: If your users table uses a text field for role, skip this step
-- ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'developer';

-- Step 2: Create a developer user (optional - for testing)
-- Update the email and password hash as needed
-- Password: 'developer123' (hashed with bcrypt)
INSERT INTO users (
  first_name,
  last_name,
  email,
  password,
  role,
  phone,
  organization,
  job_title,
  created_at,
  updated_at
) VALUES (
  'System',
  'Developer',
  'developer@pulse.local',
  '$2b$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
  'developer',
  '+1234567890',
  'PULSE Development',
  'System Developer',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'developer',
  updated_at = NOW();

-- Step 3: Verify the developer user was created
SELECT id, first_name, last_name, email, role 
FROM users 
WHERE role = 'developer';

-- Notes:
-- 1. The developer role bypasses all middleware role checks
-- 2. Developer users have access to:
--    - All dashboards (dashboard, fs-dashboard, cpap, admin/cpap, survey, etc.)
--    - All API endpoints without permission restrictions
--    - Developer-specific tools (/dev-dashboard, /tools)
-- 3. This role should ONLY be used in development environments
-- 4. For production, ensure developer accounts are disabled or removed

-- Rollback (if needed):
-- UPDATE users SET role = 'admin' WHERE role = 'developer';
-- DELETE FROM users WHERE email = 'developer@pulse.local';
