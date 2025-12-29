# Prisma Schema Update Required

## Issue
The `SurveyResponseGender` enum in the Prisma schema was missing the `LGBTQI` value that exists in the database.

## Fix Applied

### 1. Updated Prisma Schema
**File:** `prisma/schema.prisma`

**Before:**
```prisma
enum SurveyResponseGender {
  Male
  Female
  Other
}
```

**After:**
```prisma
enum SurveyResponseGender {
  Male
  Female
  Other
  LGBTQI
}
```

### 2. Updated API Query
**File:** `src/app/api/governance-integrity/route.ts`

Changed from `include` to `select` to avoid fetching the `respondent_gender` field, which prevents the enum validation error until Prisma client is regenerated.

**Before:**
```typescript
include: {
  sections: {
    where: {
      section_key: 'financial'
    }
  }
}
```

**After:**
```typescript
select: {
  response_id: true,
  sections: {
    where: {
      section_key: 'financial'
    },
    select: {
      section_id: true,
      section_key: true,
      data: true
    }
  }
}
```

## Action Required

### To Complete the Fix:

1. **Stop the development server:**
   ```bash
   # Press Ctrl+C in the terminal running npm run dev
   ```

2. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

### Why This is Needed:
- The Prisma client needs to be regenerated to include the new `LGBTQI` enum value
- The current workaround (using `select` instead of `include`) avoids the issue but doesn't fully resolve it
- Once regenerated, the API can use `include` again if needed

## Impact

### Current Status:
- ✅ API works correctly with the `select` workaround
- ✅ No data is lost or affected
- ✅ Governance Integrity Snapshot functions properly
- ⚠️ Prisma client is out of sync with schema

### After Regeneration:
- ✅ Prisma client will be in sync with schema
- ✅ All gender values will be properly typed
- ✅ No more enum validation errors
- ✅ Can use `include` or `select` as needed

## Testing After Regeneration

1. Test the Governance Integrity Snapshot:
   - Navigate to a report card as an admin
   - Expand the Governance Integrity Snapshot section
   - Verify data loads without errors

2. Check for any other queries that might be affected:
   ```bash
   # Search for other uses of SurveyResponse with gender field
   grep -r "respondent_gender" src/
   ```

## Notes

- This issue occurred because the database had `LGBTQI` values but the Prisma schema didn't include it
- The schema has been updated to match the database
- The API workaround ensures functionality while the Prisma client is locked by the dev server
- No migration is needed since the database already has the correct values

## Related Files

- `prisma/schema.prisma` - Schema updated
- `src/app/api/governance-integrity/route.ts` - Query updated with workaround
- `TASK_5_COMPLETE.md` - Main implementation documentation

---

**Date:** December 29, 2025  
**Status:** Schema updated, Prisma client regeneration pending  
**Priority:** Medium (workaround in place, but should be completed for consistency)
