-- Add tour completion tracking to User table
-- This ensures the tour completion status persists across browsers and sessions

-- Add the column
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "tourCompleted" BOOLEAN DEFAULT false;

-- Update existing users who have firstLogin = false to have tourCompleted = true
-- (Assuming they've already been through the system)
UPDATE "user" 
SET "tourCompleted" = true 
WHERE "firstLogin" = false;

-- Verify the changes
SELECT id, email, "firstName", "lastName", "firstLogin", "tourCompleted" 
FROM "user" 
ORDER BY id;
