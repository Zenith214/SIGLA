-- ============================================================================
-- TEST ONBOARDING FLOW WITH firstLogin COLUMN
-- ============================================================================
-- This script helps you test the new onboarding flow that uses firstLogin
-- as the single source of truth for the entire onboarding process

-- 1. Check current firstLogin status for all users
SELECT 
  id,
  email,
  "firstName" || ' ' || "lastName" as full_name,
  "firstLogin",
  "lastLogin",
  "createdAt"
FROM "user"
ORDER BY id;

-- 2. Count users by firstLogin status
SELECT 
  "firstLogin",
  COUNT(*) as user_count
FROM "user"
GROUP BY "firstLogin";

-- 3. Find users who haven't completed onboarding (firstLogin = true)
SELECT 
  id,
  email,
  "firstName" || ' ' || "lastName" as full_name,
  "firstLogin",
  "lastLogin"
FROM "user"
WHERE "firstLogin" = true
ORDER BY id;

-- ============================================================================
-- TESTING COMMANDS
-- ============================================================================

-- Reset a user to test the full onboarding flow
-- This will trigger: password change → tour → firstLogin = false
-- Uncomment and replace the email to use:
-- UPDATE "user" 
-- SET "firstLogin" = true 
-- WHERE email = 'your-test-email@example.com';

-- Mark onboarding as complete for a specific user
-- Uncomment and replace the email to use:
-- UPDATE "user" 
-- SET "firstLogin" = false 
-- WHERE email = 'your-test-email@example.com';

-- ============================================================================
-- VERIFICATION AFTER TESTING
-- ============================================================================

-- Check a specific user's status after completing onboarding
-- Replace 'your-email@example.com' with the actual email
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  "firstLogin",
  "lastLogin"
FROM "user"
WHERE email = 'your-email@example.com';

-- ============================================================================
-- CLEANUP (if needed)
-- ============================================================================

-- If you previously added a tourCompleted column, you can remove it:
-- ALTER TABLE "user" DROP COLUMN IF EXISTS "tourCompleted";
