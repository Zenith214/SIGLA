# Bug Fix: Officers Missing in Main Barangays API

## Issue
After fixing the case-sensitivity issue, officers still weren't showing in the UI even though the `/api/barangays/all` endpoint was returning them correctly.

## Root Cause
The Barangay Management component fetches from **two different endpoints** depending on whether there's an active survey cycle:

1. **With active cycle**: `/api/barangays?include_awards=true&cycle_id=X`
2. **Without active cycle**: `/api/barangays/all`

We only added the officer fetching logic to `/api/barangays/all`, but NOT to `/api/barangays` (the main endpoint used when there's an active cycle).

## Investigation

### Component Fetch Logic
```typescript
const url = hasActiveCycle 
  ? `/api/barangays?include_awards=true&cycle_id=${activeCycle?.cycle_id}`  // ← Uses this when cycle is active
  : "/api/barangays/all"  // ← Only uses this when no active cycle
```

Since there's an active cycle ("Survey Cycle 2025"), the component was fetching from `/api/barangays`, which didn't have the officer data.

## Solution

Added the same officer fetching logic to `/api/barangays/route.ts`:

### 1. Fetch Officers
```typescript
// Fetch officers designated to each barangay
const { data: officers, error: officersError } = await supabaseAdmin
  .from('user')
  .select('barangayDesignation, firstName, lastName, email')
  .eq('role', 'officer')
  .not('barangayDesignation', 'is', null)
  .ilike('status', 'active');  // Case-insensitive status check
```

### 2. Group Officers by Barangay
```typescript
const officersByBarangay = new Map<number, any[]>();
if (officers && !officersError) {
  officers.forEach(officer => {
    const barangayId = officer.barangayDesignation;
    if (!officersByBarangay.has(barangayId)) {
      officersByBarangay.set(barangayId, []);
    }
    officersByBarangay.get(barangayId)!.push({
      firstName: officer.firstName,
      lastName: officer.lastName,
      email: officer.email,
      fullName: `${officer.firstName} ${officer.lastName}`
    });
  });
}
```

### 3. Add Officers to Response
```typescript
const officers = officersByBarangay.get(row.barangay_id) || [];

const baseBarangay: BarangayWithAwards = {
  // ... other fields
  officers: officers  // ← Added this
};
```

### 4. Update TypeScript Interface
```typescript
interface BarangayWithAwards {
  // ... other fields
  officers?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  }>;
  // ... other fields
}
```

## Files Modified
- `src/app/api/barangays/route.ts` - Added officer fetching logic
- `scripts/test-barangays-api-with-awards.js` - Created test script

## Verification

After restarting the dev server:
1. Navigate to Settings > Barangay Management
2. Balasinon should show "Lisan Al-gaib" in the Officers column
3. Other barangays without officers should show "-"

## Key Learnings

1. **Multiple API Endpoints**: Always check if there are multiple endpoints serving similar data
2. **Conditional Logic**: Pay attention to conditional fetching logic in components
3. **Active Cycles**: Features that depend on survey cycles may use different endpoints
4. **Consistency**: When adding features, ensure all relevant endpoints are updated

## Related Fixes
- [Status Case Sensitivity Fix](BUGFIX_STATUS_CASE_SENSITIVITY.md)
- [Barangay Officers Display Feature](docs/BARANGAY_OFFICERS_DISPLAY_FEATURE.md)
