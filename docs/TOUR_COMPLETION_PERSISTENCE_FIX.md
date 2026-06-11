# Tour Completion Persistence Fix

## Problem

The onboarding tour completion status was only stored in `localStorage`, which meant:
- ❌ Tour would show again if user cleared browser data
- ❌ Tour would show again in incognito/private mode
- ❌ Tour would show again when using a different browser
- ❌ No way to track tour completion across devices

## Solution

Added database persistence for tour completion status:

### 1. Database Changes

**New Field:** `tourCompleted` (Boolean, default: false)

```sql
-- Migration file: database/add-tour-completed-field.sql
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "tourCompleted" BOOLEAN DEFAULT false;

-- Update existing users who have firstLogin = false
UPDATE "user" 
SET "tourCompleted" = true 
WHERE "firstLogin" = false;
```

### 2. Schema Update

**File:** `prisma/schema.prisma`

```prisma
model User {
  // ... other fields
  firstLogin    Boolean @default(true)
  tourCompleted Boolean @default(false)  // NEW FIELD
}
```

### 3. API Changes

**New Endpoint:** `/api/user/complete-tour`
- Saves tour completion to database
- Called when user completes or exits the tour

**Updated Endpoint:** `/api/me`
- Now returns `tourCompleted` field
- Used to check tour status on page load

### 4. Frontend Changes

**File:** `src/components/auth/FirstTimeLoginWrapper.tsx`

**Before:**
```typescript
// Only checked localStorage
const tourCompleted = localStorage.getItem('onboardingTourCompleted');
if (!tourCompleted) {
  setStartTour(true);
}
```

**After:**
```typescript
// Checks BOTH database and localStorage
const localTourCompleted = localStorage.getItem('onboardingTourCompleted');
const dbTourCompleted = (user as any).tourCompleted;

if (!dbTourCompleted && !localTourCompleted) {
  setStartTour(true);
}
```

**Tour Completion Handler:**
```typescript
const handleTourComplete = async () => {
  // Save to localStorage (immediate)
  localStorage.setItem('onboardingTourCompleted', 'true');
  
  // Save to database (persistent)
  await fetch('/api/user/complete-tour', {
    method: 'POST',
  });
  
  // Refresh user data
  await refreshUser();
};
```

### 5. Type Updates

**File:** `src/lib/auth.ts`

```typescript
export interface User {
  // ... other fields
  firstLogin?: boolean;
  tourCompleted?: boolean;  // NEW FIELD
}
```

## How It Works Now

### First-Time User Flow
```
1. User logs in (firstLogin = true, tourCompleted = false)
   ↓
2. Password change modal appears
   ↓
3. User changes password (firstLogin → false)
   ↓
4. Tour starts automatically
   ↓
5. User completes tour
   ↓
6. System saves:
   - localStorage: 'onboardingTourCompleted' = 'true'
   - Database: tourCompleted = true
   ↓
7. Tour won't show again (even in different browsers)
```

### Returning User Flow
```
1. User logs in
   ↓
2. System checks:
   - Database: tourCompleted = true ✓
   - localStorage: may or may not exist
   ↓
3. Tour is skipped (database takes precedence)
```

## Testing

### Test Tour Persistence

1. **Complete the tour:**
   ```sql
   -- Check database
   SELECT id, email, "tourCompleted" FROM "user" WHERE email = 'test@example.com';
   -- Should show: tourCompleted = true
   ```

2. **Clear localStorage and refresh:**
   ```javascript
   localStorage.removeItem('onboardingTourCompleted');
   location.reload();
   ```
   - Tour should NOT appear (database remembers)

3. **Test in different browser:**
   - Login with same account
   - Tour should NOT appear (database remembers)

### Reset Tour for Testing

**Option 1: Database Reset**
```sql
UPDATE "user" 
SET "tourCompleted" = false 
WHERE email = 'test@example.com';
```

**Option 2: Full Reset**
```sql
UPDATE "user" 
SET "tourCompleted" = false, "firstLogin" = true 
WHERE email = 'test@example.com';
```

Then clear localStorage:
```javascript
localStorage.removeItem('onboardingTourCompleted');
```

## Migration Steps

### For Production Deployment

1. **Run the migration:**
   ```bash
   psql $DATABASE_URL -f database/add-tour-completed-field.sql
   ```

2. **Update Prisma schema:**
   ```bash
   npx prisma generate
   ```

3. **Deploy the code changes**

4. **Verify:**
   ```sql
   -- Check that column exists
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'user' AND column_name = 'tourCompleted';
   ```

## Benefits

✅ **Persistent:** Tour completion survives browser data clearing  
✅ **Cross-browser:** Works across Chrome, Firefox, Safari, etc.  
✅ **Cross-device:** User won't see tour again on mobile if completed on desktop  
✅ **Reliable:** Database is source of truth  
✅ **Backward compatible:** Existing users marked as completed  
✅ **Fast:** localStorage provides immediate feedback, database ensures persistence  

## Files Modified

- `database/add-tour-completed-field.sql` (NEW)
- `src/app/api/user/complete-tour/route.ts` (NEW)
- `src/app/api/me/route.ts` (MODIFIED)
- `src/components/auth/FirstTimeLoginWrapper.tsx` (MODIFIED)
- `src/lib/auth.ts` (MODIFIED)
- `prisma/schema.prisma` (MODIFIED)
- `docs/TOUR_COMPLETION_PERSISTENCE_FIX.md` (NEW - this file)

## Rollback

If needed, to rollback:

```sql
-- Remove the column
ALTER TABLE "user" DROP COLUMN IF EXISTS "tourCompleted";
```

Then revert the code changes.
