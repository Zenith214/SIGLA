# First-Time Login Feature Migration Guide

## Overview
This migration adds the first-time login feature that prompts users to change their password on first login, followed by a welcome help modal.

## Database Migration

### Option 1: Using psql command line
```bash
psql -h your-host -U your-user -d your-database -f database/migrations/add_first_login_column.sql
```

### Option 2: Using pgAdmin or any SQL editor
1. Open your PostgreSQL database in pgAdmin or your preferred SQL editor
2. Copy the contents of `add_first_login_column.sql`
3. Execute the SQL script

### Option 3: Direct SQL (copy and paste this)
```sql
-- Add the firstLogin column with default value of true
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "firstLogin" BOOLEAN DEFAULT true;

-- Set existing users to false (they've already logged in)
UPDATE "user" 
SET "firstLogin" = false 
WHERE "firstLogin" IS NULL;

-- Add comment to the column
COMMENT ON COLUMN "user"."firstLogin" IS 'Indicates if user needs to change password on first login';
```

## Testing the Feature

### Test with a new user:
1. Create a new user (the `firstLogin` field will be `true` by default)
2. Login with that user
3. You should see the password change modal
4. After changing password, you'll see the welcome help modal

### Test with existing users:
Existing users will have `firstLogin` set to `false`, so they won't see the modals.

### Force a user to change password:
```sql
UPDATE "user" 
SET "firstLogin" = true 
WHERE email = 'user@example.com';
```

## What Was Implemented

### 1. Database Changes
- Added `firstLogin` boolean column to `user` table
- Default value is `true` for new users
- Existing users set to `false`

### 2. New Components
- `FirstTimePasswordChangeModal.tsx` - Modal for password change with validation
- `WelcomeHelpModal.tsx` - Welcome guide modal with system overview
- `FirstTimeLoginWrapper.tsx` - Wrapper component that manages the modal flow

### 3. API Updates
- `/api/user/change-password` - Now accepts `isFirstLogin` flag and updates the database
- `/api/me` - Returns `firstLogin` field with user data

### 4. Auth Updates
- `User` interface now includes `firstLogin?: boolean`
- `getCurrentUser()` returns the `firstLogin` status

### 5. Layout Integration
- `FirstTimeLoginWrapper` added to root layout
- Automatically shows modals based on user's `firstLogin` status

## Flow Diagram

```
User Login
    ↓
Check firstLogin flag
    ↓
If firstLogin = true:
    ↓
Show Password Change Modal
    ↓
User changes password
    ↓
Update firstLogin = false in DB
    ↓
Show Welcome Help Modal
    ↓
User clicks "Get Started"
    ↓
Normal dashboard access

If firstLogin = false:
    ↓
Check localStorage for welcomeHelpDontShowAgain
    ↓
If not set, show Welcome Help Modal
    ↓
Normal dashboard access
```

## Troubleshooting

### Modal not showing?
1. Check browser console for errors
2. Verify the database column was added: `SELECT "firstLogin" FROM "user" LIMIT 1;`
3. Check if user's `firstLogin` is `true`: `SELECT email, "firstLogin" FROM "user" WHERE email = 'your@email.com';`

### Password change not working?
1. Check browser console for API errors
2. Verify password meets requirements (8+ chars, uppercase, lowercase, number, special char)
3. Check that current password is correct

### Welcome modal keeps showing?
1. Check browser localStorage: `localStorage.getItem('welcomeHelpDontShowAgain')`
2. Clear it if needed: `localStorage.removeItem('welcomeHelpDontShowAgain')`

## Rollback (if needed)

```sql
-- Remove the firstLogin column
ALTER TABLE "user" DROP COLUMN IF EXISTS "firstLogin";
```
