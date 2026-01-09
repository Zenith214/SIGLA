-- Migration: Add firstLogin column to user table
-- Date: 2025-01-07
-- Description: Adds a firstLogin boolean field to track if user needs to change password on first login

-- Add the firstLogin column with default value of true
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "firstLogin" BOOLEAN DEFAULT true;

-- Set existing users to false (they've already logged in)
UPDATE "user" 
SET "firstLogin" = false 
WHERE "firstLogin" IS NULL;

-- Add comment to the column
COMMENT ON COLUMN "user"."firstLogin" IS 'Indicates if user needs to change password on first login';
