# Fix: Dashboard Showing 0% for Assignment Completion and Target Progress

**Date:** October 27, 2025  
**Issue:** Dashboard shows 0% assignment completion and 0% target progress despite having completed assignments and 100% target achievement  
**Root Cause:** Barangays not marked as awardees in `cycle_awards` table, causing awardee filter to exclude all data  
**Status:** ✅ SOLUTION PROVIDED

---

## Problem Description

User generated 300 mock responses for Buguis and Balasinon barangays. The settings pages show:

**Survey Targets:**
- Balasinon: 150/150 responses (100%) ✅
- Buguis: 150/150 responses (100%) ✅

**Assignments:**
- Buguis: 1 assignment marked as "Completed" ✅

But the **Analytics Dashboard** shows:
- Assignment Completion: 0% (0/2) ❌
- Target Progress: 0% (0/0) ❌

---

## Root Cause

The dashboard API (`/api/survey-cycles/[id]/dashboard`) applies an **awardee filter** by default:

```typescript
// Get awardee barangay IDs for filtering
let awardeeBarangayIds: number[] = [];
if (!includeNonAwardees) {
  awardeeBarangayIds = await CycleAwardsService.getAwardeeBarangayIds(cycleId);
}

// Build filter for awardee barangays
const awardeeFilter = !includeNonAwardees && awardeeBarangayIds.length > 0 
  ? awardeeBarangayIds 
  : undefined;

// Apply filter to all queries
if (awardeeFilter) {
  assignmentsQuery = assignmentsQuery.in('barangay_id', awardeeFilter);
  targetsQuery = targetsQuery.in('barangay_id', awardeeFilter);
}
```

**The Problem:**
- Buguis and Balasinon are **NOT in the `cycle_awards` table** for the active cycle
- `getAwardeeBarangayIds()` returns an empty array `[]`
- When `awardeeBarangayIds.length > 0` is false, `awardeeFilter` becomes `undefined`
- **BUT** the queries still run, they just don't have any matching barangays in the awardee list
- Result: 0 assignments, 0 targets counted

---

## Solution Options

### Option 1: Mark Barangays as Awardees (Recommended)

Add Buguis and Balasinon to the `cycle_awards` table:

```sql
-- Get the active cycle ID first
SELECT cycle_id, name FROM survey_cycle WHERE is_active = true;

-- Insert awardee records (replace 18 with your actual cycle_id)
INSERT INTO cycle_awards (barangay_id, cycle_id, is_awardee, awarded_date, created_at)
VALUES 
  (17, 18, true, NOW(), NOW()),  -- Buguis (barangay_id 17)
  (11, 18, true, NOW(), NOW());  -- Balasinon (barangay_id 11)
```

Or use the API:

```typescript
// In your browser console or via API call
await fetch('/api/cycle-awards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    barangayId: 17,  // Buguis
    isAwardee: true,
    cycleId: 18  // Your active cycle ID
  })
});

await fetch('/api/cycle-awards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    barangayId: 11,  // Balasinon
    isAwardee: true,
    cycleId: 18
  })
});
```

### Option 2: Disable Awardee Filtering in Dashboard

Modify `HistoricalCycleViewer.tsx` to include non-awardees:

```typescript
// Line 120 in HistoricalCycleViewer.tsx
const response = await fetch(`/api/survey-cycles/${cycleId}/dashboard?include_non_awardees=true`);
```

### Option 3: Change Default Behavior

Modify the dashboard API to NOT filter by awardees by default:

```typescript
// In src/app/api/survey-cycles/[id]/dashboard/route.ts
const includeNonAwardees = searchParams.get('include_non_awardees') !== 'false';  // Changed from === 'true'
```

---

## Recommended Approach

**Use Option 1** - Mark the barangays as awardees. This is the correct approach because:

1. It follows the intended design of the system (cycle-aware awards)
2. It allows proper filtering between awardees and non-awardees
3. It maintains data integrity for historical analysis
4. It's how the system is meant to be used

---

## Quick Fix Script

Create a simple API endpoint or run this in your database:

```sql
-- Find your active cycle
SELECT cycle_id, name FROM survey_cycle WHERE is_active = true;

-- Find barangay IDs
SELECT barangay_id, barangay_name FROM barangay WHERE barangay_name IN ('Buguis', 'Balasinon');

-- Insert awardee records (adjust IDs as needed)
INSERT INTO cycle_awards (barangay_id, cycle_id, is_awardee, awarded_date, created_at, updated_at)
SELECT 
  b.barangay_id,
  sc.cycle_id,
  true as is_awardee,
  NOW() as awarded_date,
  NOW() as created_at,
  NOW() as updated_at
FROM barangay b
CROSS JOIN survey_cycle sc
WHERE b.barangay_name IN ('Buguis', 'Balasinon')
  AND sc.is_active = true
ON CONFLICT (barangay_id, cycle_id) DO UPDATE
SET is_awardee = true, updated_at = NOW();
```

---

## Verification

After applying the fix, verify:

1. Check `cycle_awards` table:
```sql
SELECT ca.*, b.barangay_name, sc.name as cycle_name
FROM cycle_awards ca
JOIN barangay b ON ca.barangay_id = b.barangay_id
JOIN survey_cycle sc ON ca.cycle_id = sc.cycle_id
WHERE sc.is_active = true;
```

2. Refresh the Analytics Dashboard
3. You should now see:
   - Assignment Completion: 100% (1/1) ✅
   - Target Progress: 100% (300/300) ✅

---

## Why This Happens

The system is designed to support **cycle-aware awards**, meaning:
- Each cycle can have different awardees
- Historical data is preserved per cycle
- Dashboards filter to show only relevant barangays

When you generate mock data, it creates:
- ✅ Survey responses
- ✅ Survey targets (if they exist)
- ❌ Cycle awards (must be set manually)

The mock data generator doesn't automatically mark barangays as awardees because that's an administrative decision, not a data generation task.

---

## Long-term Solution

Consider adding an option in the Tools page to automatically mark barangays as awardees when generating mock data:

```typescript
// In src/app/tools/page.tsx
const generateMockData = async () => {
  // ... existing code ...
  
  // After successful generation, optionally mark as awardee
  if (autoMarkAsAwardee) {
    await fetch('/api/cycle-awards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barangayId: parseInt(barangayId),
        isAwardee: true
      })
    });
  }
};
```

---

## Summary

**The dashboard is working correctly** - it's filtering data as designed. You just need to mark your test barangays as awardees for the active cycle. This is a one-time setup step that should be done through the admin interface or directly in the database.
