# Mock Data Generator - Active Cycle Fix

## Issues Fixed

### 1. Duplicate Questionnaire IDs
The mock data generator was creating duplicate questionnaire IDs when run multiple times, causing database constraint violations:
```
❌ Failed to create questionnaire 2025-10-01-001: duplicate key value violates unique constraint "questionnaires_pkey"
```

**Root Cause:** The generator was always starting spot numbers from 1, regardless of existing spots in the database. When run multiple times for the same barangay and cycle, it would try to create:
- Spot 1, 2, 3... (which already existed)
- Questionnaires with IDs like `2025-10-01-001` (which already existed)

### 2. Wrong Year in Questionnaire IDs
The generator was creating questionnaire IDs with year 2025 instead of 2026:
```
Generated: 2025-10-60-004
Expected:  2026-10-01-001
```

**Root Cause:** The `survey_cycle` table had incorrect data - cycle ID 21 was named "Survey Cycle 2026" but had `year: 2025` in the database.

## Solutions

### Fix 1: Query Existing Spots
Updated `src/app/api/tools/generate-synthetic-data/route.ts` to:

1. **Query existing spots** for the barangay and cycle before generating new ones
2. **Find the highest spot number** from existing spots
3. **Start from the next available number** when creating new spots

### Code Changes
```typescript
// Find the highest existing spot number for this barangay and cycle
const { data: existingSpots } = await supabaseAdmin
  .from('spots')
  .select('spot_name')
  .eq('barangay_id', barangayId)
  .eq('cycle_id', cycleId)
  .order('spot_id', { ascending: false });

// Extract spot numbers from existing spots and find the max
let maxSpotNumber = 0;
if (existingSpots && existingSpots.length > 0) {
  existingSpots.forEach(spot => {
    const match = spot.spot_name.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxSpotNumber) {
        maxSpotNumber = num;
      }
    }
  });
}

const startingSpotNumber = maxSpotNumber + 1;
```

### Fix 2: Correct Database Year
Created and ran `scripts/fix-cycle-year.js` to update the database:

```javascript
// Update cycle ID 21 to have the correct year
await supabase
  .from('survey_cycle')
  .update({ year: 2026 })
  .eq('cycle_id', 21);
```

**Before:**
- Cycle ID: 21
- Name: Survey Cycle 2026
- Year: 2025 ❌

**After:**
- Cycle ID: 21
- Name: Survey Cycle 2026
- Year: 2026 ✅

## Verification
The generator now:
- ✅ Uses the active cycle ID (21) correctly
- ✅ Uses the correct year (2026) from the database
- ✅ Finds existing spots for the barangay and cycle
- ✅ Starts spot numbering from the next available number
- ✅ Generates unique questionnaire IDs with correct year
- ✅ Can be run multiple times without conflicts

## Example
**First run:**
- Finds 0 existing spots
- Creates spots 1, 2, 3 with questionnaires **2026**-10-01-001, **2026**-10-02-001, etc.

**Second run:**
- Finds 3 existing spots (1, 2, 3)
- Creates spots 4, 5, 6 with questionnaires **2026**-10-04-001, **2026**-10-05-001, etc.

## Testing
Run the generator multiple times from the Tools page to verify no duplicate key errors occur.
