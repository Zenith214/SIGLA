-- ============================================================================
-- CHECK TOUR COMPLETION STATUS
-- ============================================================================
-- This script helps you verify the tour completion tracking in your database

-- 1. Check if tourCompleted column exists
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'user' 
  AND column_name = 'tourCompleted';

-- 2. View all users with their tour completion status
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  role,
  "firstLogin",
  "tourCompleted",
  "lastLogin",
  "createdAt"
FROM "user"
ORDER BY id;

-- 3. Count users by tour completion status
SELECT 
  "tourCompleted",
  COUNT(*) as user_count
FROM "user"
GROUP BY "tourCompleted";

-- 4. Find users who haven't completed the tour
SELECT 
  id,
  email,
  "firstName" || ' ' || "lastName" as full_name,
  "firstLogin",
  "tourCompleted"
FROM "user"
WHERE "tourCompleted" = false
ORDER BY id;

-- 5. Find users who completed tour but still have firstLogin = true (inconsistent state)
SELECT 
  id,
  email,
  "firstName" || ' ' || "lastName" as full_name,
  "firstLogin",
  "tourCompleted"
FROM "user"
WHERE "tourCompleted" = true AND "firstLogin" = true;

-- ============================================================================
-- TESTING COMMANDS
-- ============================================================================

-- Reset tour completion for a specific user (for testing)
-- Uncomment and replace the email to use:
-- UPDATE "user" 
-- SET "tourCompleted" = false 
-- WHERE email = 'your-test-email@example.com';

-- Reset tour completion for all users (for testing)
-- WARNING: This will reset tour completion for ALL users!
-- Uncomment to use:
-- UPDATE "user" SET "tourCompleted" = false;

-- Mark tour as completed for a specific user
-- Uncomment and replace the email to use:
-- UPDATE "user" 
-- SET "tourCompleted" = true 
-- WHERE email = 'your-test-email@example.com';

-- ============================================================================
-- VERIFICATION AFTER FIX
-- ============================================================================

-- After applying the fix, run this to verify a specific user's status:
-- Replace 'your-email@example.com' with the actual email
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  "firstLogin",
  "tourCompleted",
  "lastLogin"
FROM "user"
WHERE email = 'your-email@example.com';
