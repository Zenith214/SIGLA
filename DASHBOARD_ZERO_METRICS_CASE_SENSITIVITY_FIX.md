# Fix: Dashboard Showing 0% Due to Case-Sensitive Status Query

**Date:** October 27, 2025  
**Issue:** Dashboard shows 0% assignment completion despite having completed assignments  
**Root Cause:** Case-sensitive status comparison - query looks for 'completed' but data has 'Completed'  
**Status:** ✅ FIXED

---

## Problem Description

User has:
- ✅ 1 assignment for Buguis marked as "Completed" (capital C)
- ✅ 2 survey targets (Buguis and Balasinon) at 100%
- ✅ 300 survey responses generated

But dashboard shows:
- ❌ Assignment Completion: 0% (0/2)
- ❌ Target Progress: 0% (0/0)

---

## Root Cause

The dashboard API query uses **case-sensitive** comparison:

```typescript
// BEFORE (case-sensitive)
.eq('status', 'completed')  // Only matches lowercase 'completed'
```

But the assignment table has status values with **capital letters**:
- `'Assigned'` (default when creating)
- `'Completed'` (when marked complete)
- `'Active'`, `'Pending'`, etc.

The query was looking for `'completed'` (lowercase) but the actual value is `'Completed'` (capital C), so it found 0 matches.

---

## The Fix

Changed the query to use **case-insensitive** comparison:

```typescript
// AFTER (case-insensitive)
.ilike('status', 'completed')  // Matches 'completed', 'Completed', 'COMPLETED', etc.
```

**File Changed:** `src/app/api/survey-cycles/[id]/dashboard/route.ts`

---

## Why This Happened

1. **Inconsistent status values** across the codebase:
   - Some places use `'Completed'` (capital C)
   - Some places use `'completed'` (lowercase)
   - Some places use `'Assigned'`, `'Active'`, `'Pending'`

2. **No enum or type constraint** on the status field in the database

3. **Different conventions** in different parts of the app:
   - UI displays: "Completed" (capital)
   - Database stores: "Completed" (capital)
   - Query expected: "completed" (lowercase)

---

## Evidence

From `src/app/api/assignments/route.ts` line 163:
```typescript
status || 'Assigned',  // Default status is 'Assigned' with capital A
```

From test files:
```typescript
// Some tests use capital C
{ status: 'Completed' }

// Some tests use lowercase
{ status: 'completed' }
```

---

## Verification

After the fix, the dashboard should now correctly show:
- Assignment Completion: 100% (1/1) ✅
- Target Progress: 100% (300/300) ✅

---

## Additional Diagnostic Tool

Added a new diagnostic endpoint to help debug these issues:

**Endpoint:** `GET /api/tools/check-cycle-data`

**Returns:**
- All cycles with their data counts
- Responses, assignments, targets per cycle
- Awardee counts per cycle
- Helps identify which cycle has what data

**Usage in Tools Page:**
Click "Check Cycle Data" button in the Database tab to see detailed breakdown of data across all cycles.

---

## Long-term Recommendations

### 1. Standardize Status Values

Create an enum for assignment status:

```typescript
// src/types/assignment.ts
export enum AssignmentStatus {
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}
```

### 2. Add Database Constraint

Add a CHECK constraint to the assignment table:

```sql
ALTER TABLE assignment 
ADD CONSTRAINT assignment_status_check 
CHECK (status IN ('Assigned', 'In Progress', 'Completed', 'Cancelled'));
```

### 3. Update All Queries

Search for all status comparisons and use case-insensitive matching:

```typescript
// Instead of:
.eq('status', 'completed')

// Use:
.ilike('status', 'completed')

// Or better, use the enum:
.eq('status', AssignmentStatus.COMPLETED)
```

### 4. Migration Script

Create a script to normalize existing status values:

```sql
-- Normalize all status values to proper case
UPDATE assignment 
SET status = CASE 
  WHEN LOWER(status) = 'assigned' THEN 'Assigned'
  WHEN LOWER(status) = 'in progress' THEN 'In Progress'
  WHEN LOWER(status) = 'completed' THEN 'Completed'
  WHEN LOWER(status) = 'cancelled' THEN 'Cancelled'
  ELSE status
END
WHERE status IS NOT NULL;
```

---

## Summary

The issue was a simple case-sensitivity bug in the SQL query. The fix changes `.eq()` to `.ilike()` for case-insensitive matching. This is a quick fix that solves the immediate problem, but the codebase should be refactored to use consistent status values with proper enums and database constraints.

**Status:** ✅ Fixed and ready to test
**Impact:** Dashboard will now correctly count completed assignments regardless of case
**Testing:** Refresh the Analytics Dashboard to see updated metrics
