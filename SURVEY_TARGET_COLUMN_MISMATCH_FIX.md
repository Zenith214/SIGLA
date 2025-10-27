# Fix: Survey Target Column Name Mismatch

**Date:** October 27, 2025  
**Issue:** Dashboard shows 0/0 for target progress despite settings showing 150/150  
**Root Cause:** Column name mismatch between database schema and API expectations  
**Status:** ⚠️ NEEDS DATABASE SCHEMA FIX

---

## Problem Description

**Settings Page Shows:**
- Balasinon: 150/150 (100%)
- Buguis: 150/150 (100%)

**Dashboard Shows:**
- Target Progress: 0% (0/0)

**Diagnostic Output:**
```
Target 49: Balasinon in Cycle 17 - 0/undefined (0%)
Target 48: Buguis in Cycle 17 - 0/undefined (0%)
```

---

## Root Cause

The `survey_target` table has inconsistent column names:

**Current Schema (likely):**
- `target` - the target count
- `achieved` - the achieved count

**Dashboard API Expects:**
- `target_count` - the target count  
- `achieved_count` - the achieved count

**Result:** Dashboard reads `target_count` which is NULL/undefined, calculates 0/0.

---

## Evidence

1. **Settings API** (`/api/survey-targets`) works fine - it reads `target` and `achieved`
2. **Dashboard API** (`/api/survey-cycles/[id]/dashboard`) fails - it reads `target_count` and `achieved_count`
3. **Diagnostic shows** `0/undefined` - meaning the column doesn't exist

---

## Solution Options

### Option 1: Rename Database Columns (Recommended)

Rename the columns to match what the dashboard expects:

```sql
ALTER TABLE survey_target 
RENAME COLUMN target TO target_count;

ALTER TABLE survey_target 
RENAME COLUMN achieved TO achieved_count;
```

Then update the settings API to use the new column names.

### Option 2: Fix Dashboard API to Use Correct Column Names

Update the dashboard API to read `target` and `achieved` instead:

```typescript
// In src/app/api/survey-cycles/[id]/dashboard/route.ts
const totalTargets = targets?.reduce((sum, target) => sum + (target.target || 0), 0) || 0;
const totalAchieved = targets?.reduce((sum, target) => sum + (target.achieved || 0), 0) || 0;
```

### Option 3: Add Column Aliases in Query

Modify the survey targets query to alias the columns:

```typescript
const { data: targets } = await supabaseAdmin
  .from('survey_target')
  .select(`
    *,
    target as target_count,
    achieved as achieved_count,
    barangay:barangay_id (barangay_id, barangay_name)
  `)
  .eq('survey_cycle_id', cycleId);
```

---

## Recommended Fix (Option 2 - Quick Fix)

Since Option 1 requires database migration and updating multiple files, let's use Option 2 as a quick fix:

**File:** `src/app/api/survey-cycles/[id]/dashboard/route.ts`

**Change:**
```typescript
// OLD
const totalTargets = targets?.reduce((sum, target) => sum + target.target_count, 0) || 0;
const totalAchieved = targets?.reduce((sum, target) => sum + (target.achieved_count || 0), 0) || 0;

// NEW
const totalTargets = targets?.reduce((sum, target) => sum + (target.target || target.target_count || 0), 0) || 0;
const totalAchieved = targets?.reduce((sum, target) => sum + (target.achieved || target.achieved_count || 0), 0) || 0;
```

This handles both column naming conventions.

---

## Verification

After applying the fix:

1. Refresh the dashboard
2. Check "Target Progress" metric
3. Should show: **100% (300/300)** for Cycle 17
4. Should show: **100% (300/300)** for Cycle 18

---

## Long-term Recommendation

Standardize on one column naming convention across the entire codebase:
- Either use `target` and `achieved` everywhere
- Or use `target_count` and `achieved_count` everywhere

Create a database migration script and update all API endpoints to use consistent names.
