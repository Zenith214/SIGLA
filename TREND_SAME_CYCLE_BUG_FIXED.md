# Trend Same Cycle Comparison Bug Fixed

**Date:** October 27, 2025  
**Issue:** Trends comparing current cycle against itself ("vs Survey Cycle 2025")  
**Root Cause:** Previous cycle query finding another cycle with same year/name  
**Solution:** Exclude cycles with same year when finding previous cycle  
**Status:** ✅ FIXED - NEEDS TESTING

---

## The Real Problem

From the console logs, we can see:

```javascript
📈 [TREND UI] Extracted trend for financial: {
  change: -20,
  direction: "down",
  available: true,
  previousScore: 80,
  currentScore: 60,
  previousCycle: "Survey Cycle 2025",  // ← WRONG! Same as current!
  previousCycleYear: 2025              // ← Same year!
}
```

The trend calculation is comparing:
- **Current**: Survey Cycle 2025 (cycle_id: 18) - satisfaction: 60%
- **Previous**: Survey Cycle 2025 (cycle_id: 17) - satisfaction: 80%

This means there are **two cycles with the same name and year** in the database!

---

## Why This Happened

### Scenario 1: Multiple Cycles in Same Year
The database has multiple survey cycles for 2025:
- Cycle 17: "Survey Cycle 2025" (older, has mock data with 80% satisfaction)
- Cycle 18: "Survey Cycle 2025" (current, has new data with 60% satisfaction)

### Scenario 2: Test Data
During testing, multiple cycles were created with the same year, causing confusion in trend comparison.

### Scenario 3: Cycle Naming Convention
The cycle naming doesn't distinguish between different surveys in the same year (e.g., "Q1 2025", "Q2 2025").

---

## The Fix

### Updated Query Logic

**Before:**
```typescript
const { data: previousCycle } = await supabaseAdmin
  .from('survey_cycle')
  .select('cycle_id, name, year, is_active')
  .eq('is_active', false)
  .lt('cycle_id', currentCycleId)  // Just find cycle with lower ID
  .order('cycle_id', { ascending: false })
  .limit(1)
  .single();
```

**After:**
```typescript
// Get current cycle info first
const { data: currentCycleInfo } = await supabaseAdmin
  .from('survey_cycle')
  .select('cycle_id, name, year, is_active')
  .eq('cycle_id', currentCycleId)
  .single();

// Get previous cycle (different year)
const { data: previousCycle } = await supabaseAdmin
  .from('survey_cycle')
  .select('cycle_id, name, year, is_active')
  .lt('cycle_id', currentCycleId)
  .neq('year', currentCycleInfo?.year || 9999)  // ← Exclude same year!
  .order('cycle_id', { ascending: false })
  .limit(1)
  .single();
```

### What Changed

1. **Fetch current cycle info** to know what year we're in
2. **Exclude same year** when searching for previous cycle
3. **Only compare across different years** (e.g., 2025 vs 2024)

---

## Expected Behavior After Fix

### If Previous Year Exists (e.g., 2024)
```javascript
📈 [TREND UI] Extracted trend for financial: {
  change: -5,
  direction: "down",
  available: true,
  previousScore: 65,
  currentScore: 60,
  previousCycle: "Survey Cycle 2024",  // ← Correct! Different year
  previousCycleYear: 2024              // ← Different year
}
```

Display: **"↓ -5% vs Survey Cycle 2024"**

### If No Previous Year Exists (Baseline)
```javascript
📈 [TREND UI] No previous cycle found - returning baseline
```

Display: **"📊 Baseline Survey"**

---

## Testing Steps

### Step 1: Clear Server Cache
1. Go to **Tools** → ML Cache tab
2. Click **"Clear All Cache"**
3. This clears the cached trends with the bug

### Step 2: Refresh Report Card
1. Go to **Report Card**
2. Click **"Refresh"** button
3. Watch console logs

### Step 3: Check Console Logs

Look for these new logs:

```
🔍 [TREND] Current cycle info: { cycle_id: 18, name: "Survey Cycle 2025", year: 2025, ... }
🔍 [TREND] Previous cycle query result: { 
  previousCycle: { cycle_id: 16, name: "Survey Cycle 2024", year: 2024 }, 
  cycleError: undefined 
}
```

Or if no previous year:

```
🔍 [TREND] Current cycle info: { cycle_id: 18, name: "Survey Cycle 2025", year: 2025, ... }
🔍 [TREND] Previous cycle query result: { 
  previousCycle: null, 
  cycleError: "No rows found" 
}
⚠️ [TREND] No previous cycle found - returning baseline
```

### Step 4: Verify Display

The report card should now show:

**Option A: If previous year exists**
- ✅ Trend badge shows different year: "vs Survey Cycle 2024"
- ✅ Realistic trend percentages (not all -80%)
- ✅ Different trends for each service

**Option B: If no previous year (baseline)**
- ✅ Shows "📊 Baseline Survey" badge
- ✅ No trend percentages displayed

---

## Database Investigation

To understand what cycles exist, you can check:

### Query 1: All Cycles
```sql
SELECT cycle_id, name, year, is_active, start_date, end_date
FROM survey_cycle
ORDER BY cycle_id DESC;
```

### Query 2: Cycles for 2025
```sql
SELECT cycle_id, name, year, is_active
FROM survey_cycle
WHERE year = 2025
ORDER BY cycle_id DESC;
```

### Expected Results

**Scenario A: Multiple cycles in 2025 (Problem)**
```
cycle_id | name              | year | is_active
---------|-------------------|------|----------
18       | Survey Cycle 2025 | 2025 | true
17       | Survey Cycle 2025 | 2025 | false  ← This was being used as "previous"!
16       | Survey Cycle 2024 | 2024 | false
```

**Scenario B: One cycle per year (Correct)**
```
cycle_id | name              | year | is_active
---------|-------------------|------|----------
18       | Survey Cycle 2025 | 2025 | true
17       | Survey Cycle 2024 | 2024 | false  ← This should be "previous"
16       | Survey Cycle 2023 | 2023 | false
```

---

## Recommendations

### Short-term: Use the Fix
The fix will skip cycles in the same year, ensuring trends compare across different years.

### Medium-term: Clean Up Database
If there are multiple cycles for 2025:
1. **Identify which cycle is correct** (probably cycle_id 18)
2. **Delete or archive old cycle** (cycle_id 17 if it's a duplicate)
3. **Or rename cycles** to distinguish them (e.g., "Survey Cycle 2025 Q1", "Survey Cycle 2025 Q2")

### Long-term: Improve Cycle Naming
Use more specific cycle names:
- "Survey Cycle 2025 Q1"
- "Survey Cycle 2025 Q2"
- "Annual Survey 2025"
- "Mid-Year Survey 2025"

This makes it clear which cycle is which and prevents confusion.

---

## Alternative: Compare Within Same Year

If you **want** to compare cycles within the same year (e.g., Q1 vs Q2), you can modify the fix:

```typescript
// Option 1: Compare within same year (remove year filter)
const { data: previousCycle } = await supabaseAdmin
  .from('survey_cycle')
  .select('cycle_id, name, year, is_active')
  .lt('cycle_id', currentCycleId)
  // .neq('year', currentCycleInfo?.year)  ← Remove this line
  .order('cycle_id', { ascending: false })
  .limit(1)
  .single();

// Option 2: Add cycle number/quarter to distinguish
// Then update display to show: "vs Q1 2025" instead of "vs Survey Cycle 2025"
```

But this requires:
1. **Clear cycle naming** (Q1, Q2, etc.)
2. **Meaningful comparisons** (Q2 vs Q1 makes sense)
3. **Updated display logic** to show quarter/period

---

## Files Modified

### src/app/api/ml/funnel-analysis/route.ts
- **Line 590-605**: Added current cycle info fetch
- **Line 606-612**: Added year exclusion to previous cycle query
- **Added**: Logging for current cycle info

---

## Verification Checklist

After clearing cache and refreshing:

- [ ] Console shows "Current cycle info" log
- [ ] Console shows "Previous cycle query result" log
- [ ] Previous cycle has **different year** than current
- [ ] OR shows "No previous cycle found" if baseline
- [ ] Report card displays correct previous cycle name
- [ ] Trend percentages are realistic (not all -80%)
- [ ] Each service shows different trend values

---

## Sign-Off

**Bug:** Trends comparing current cycle against itself  
**Root Cause:** Multiple cycles with same year in database  
**Fix:** Exclude same year when finding previous cycle  
**Status:** ✅ FIXED - READY TO TEST  
**Date:** October 27, 2025

**Next Action:**
1. Clear ALL caches in Tools
2. Click Refresh on Report Card  
3. Check console for "Current cycle info" and "Previous cycle query result"
4. Verify trends now show different year or baseline!
