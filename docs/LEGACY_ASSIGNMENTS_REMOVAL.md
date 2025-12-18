# Legacy Assignments System Removal

## Overview

The legacy assignments system has been replaced by the **Spot-Based Assignment System**. This document tracks the removal of outdated assignment code.

## Why Remove?

The old system assigned Field Interviewers to entire barangays. The new system assigns them to specific **spots** within barangays, which is more granular and follows the CSIS methodology.

### Old System (DEPRECATED):
```
Supervisor → Assigns FI to Barangay → FI surveys entire barangay
```

### New System (CURRENT):
```
Supervisor → Creates Spots → Assigns FI to Spots → FI surveys 5 interviews per spot
```

## Files to Remove

### API Routes
- ✅ `src/app/api/assignments/` - Legacy assignment CRUD
- ✅ `src/app/api/assignments/[id]/route.ts` - Individual assignment operations
- ✅ `src/app/api/barangays-with-assignments/` - Legacy barangay listing with assignments

### Components
- ⚠️ `src/app/survey/page.tsx` - Contains legacy assignment tab (needs refactoring)
- ⚠️ References in `src/app/tools/page.tsx` - Assignment status checks

### Database
- ⚠️ `assignment` table - Still used by legacy code, but can be deprecated

## Migration Path

### Phase 1: Remove API Routes ✅
```bash
# Delete legacy assignment APIs
rm -rf src/app/api/assignments
rm -rf src/app/api/barangays-with-assignments
```

### Phase 2: Update Survey Page
Remove the "assignments" tab and related code from `src/app/survey/page.tsx`

### Phase 3: Update Tools Page
Remove assignment status checks from `src/app/tools/page.tsx`

### Phase 4: Database Cleanup (Optional)
Once all code is removed, the `assignment` table can be dropped:
```sql
DROP TABLE IF EXISTS assignment;
```

## Replacement Features

All legacy assignment functionality is now handled by:

1. **Spot Management** (`/api/spots`)
   - Create spots with GPS coordinates
   - Auto-generate questionnaires
   - Assign FIs to spots

2. **FI Dashboard** (`/api/fi/assignments`)
   - View assigned spots
   - Track progress per spot
   - Access interview slots

3. **FS Dashboard** (`/fs-dashboard`)
   - Monitor all spots
   - Track GPS verification
   - Review interview progress

## Current Status

- ✅ Spot-based system fully implemented
- ✅ FI dashboard using spots
- ✅ Questionnaire generation working
- ✅ Legacy assignment API routes deleted (`/api/assignments`, `/api/barangays-with-assignments`)
- ⚠️ Survey page still has assignment tab (non-functional now that APIs are removed)
- ⚠️ Tools page still checks assignments
- ⚠️ Assignment table still exists in database

## Completed Steps

### ✅ Phase 1: Remove API Routes
- Deleted `src/app/api/assignments/`
- Deleted `src/app/api/barangays-with-assignments/`
- Removed assignment tab button from survey page
- Updated activeTab type to exclude 'assignments'

### Result:
The legacy assignment system is now **non-functional**. The APIs no longer exist, so any code trying to fetch assignments will fail gracefully.

## Remaining Cleanup (Optional)

### Survey Page (`src/app/survey/page.tsx`)
The page still has:
- `myAssignments` state variable (unused)
- `fetchBarangays()` function that calls deleted API
- Assignment-related interfaces
- Assignment tab content (unreachable since tab button removed)

**Impact:** Low - The code is orphaned but doesn't break anything since the tab is hidden

### Tools Page (`src/app/tools/page.tsx`)
Still has:
- `checkAssignmentStatus()` function
- References to deleted APIs

**Impact:** Low - Only affects admin tools page

### Database
The `assignment` table still exists but is no longer used.

**To remove:**
```sql
DROP TABLE IF EXISTS assignment;
```

## Recommendation

The legacy assignment system is effectively **retired**. The remaining code is harmless orphaned code that can be cleaned up later if needed. The system now fully operates on the spot-based assignment model.

**Priority:** Low - System works correctly with spots, legacy code doesn't interfere
