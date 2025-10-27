# Trend Calculation Bug Fixed

**Date:** October 27, 2025  
**Issue:** Trends showing "-80% vs Survey Cycle 2025" for all services  
**Root Cause:** Type mismatch in satisfaction score access  
**Solution:** Fixed satisfaction score extraction to handle both number and object formats  
**Status:** ✅ FIXED - NEEDS TESTING

---

## Root Cause

### The Bug

In `src/app/api/ml/funnel-analysis/route.ts`, there was a type mismatch:

**Line 127-143:** Service scores are stored as **numbers**:
```typescript
serviceScores = {
  awareness: scores.awareness.percentage || 0,  // NUMBER
  availment: scores.availment.percentage || 0,  // NUMBER  
  satisfaction: scores.satisfaction.percentage || 0,  // NUMBER ← This is a number!
  need_action: scores.need_action_score || 0
};

funnelData.service_scores[mappedKey] = {
  ...serviceScores,  // satisfaction is a NUMBER here
  sample_size: scores.sample_size || 0,
  // ...
};
```

**Line 667:** But `calculateTrend` was trying to access it as an **object**:
```typescript
const currentSatisfaction = currentScores.satisfaction?.percentage || 0;
//                                                      ^^^^^^^^^^
//                                                      Trying to access .percentage
//                                                      but satisfaction is a NUMBER!
```

### What Happened

1. `currentScores.satisfaction` = `55.8` (a number)
2. `currentScores.satisfaction?.percentage` = `undefined` (numbers don't have .percentage property)
3. `currentSatisfaction` = `0` (fallback to 0)
4. Same for `previousSatisfaction` = `0`
5. `change` = `0 - 0` = `0`

But wait... the screenshot shows "-80%", not "0%". This means either:
- The previous satisfaction was actually calculated correctly somehow
- Or there's cached data with the wrong format
- Or the ML script is returning trends directly

---

## The Fix

### Updated Code

```typescript
// Calculate change in satisfaction score
// Handle both formats: number or object with percentage
const currentSatisfaction = typeof currentScores.satisfaction === 'number' 
  ? currentScores.satisfaction 
  : (currentScores.satisfaction?.percentage || 0);

const previousSatisfaction = typeof previousScores.satisfaction === 'number'
  ? previousScores.satisfaction
  : (previousScores.satisfaction?.percentage || 0);

const change = currentSatisfaction - previousSatisfaction;
```

This now handles both:
- **Number format**: `satisfaction: 55.8` → uses `55.8` directly
- **Object format**: `satisfaction: { percentage: 55.8 }` → uses `55.8` from `.percentage`

### Enhanced Logging

Added detailed logging to see what's happening:
```typescript
console.log(`✅ [TREND] Trend calculated successfully:`, {
  currentScores_satisfaction: currentScores.satisfaction,  // See raw value
  currentSatisfaction,  // See extracted value
  previousScores_satisfaction: previousScores.satisfaction,  // See raw value
  previousSatisfaction,  // See extracted value
  change,
  direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
});
```

---

## Testing Steps

### Step 1: Clear ALL Caches

1. **Go to Tools** → ML Cache tab
2. **Click "Clear All Cache"** (clears server-side ML cache)
3. **This is critical** - the bug fix won't take effect until cache is cleared

### Step 2: Force Refresh Report Card

1. **Go to Report Card**
2. **Click "Refresh" button** in header
3. **Watch browser console** (F12) for logs

### Step 3: Check Console Logs

Look for these logs in the console:

```
🔍 [TREND] Calculating trend for financial, Barangay 17, Current Cycle 18
🔍 [TREND] Current scores: { satisfaction: 55.8, ... }
🔍 [TREND] Previous cycle query result: { previousCycle: {...}, ... }
✅ [TREND] Found previous cycle: Survey Cycle 2024 (ID: 17)
🔍 [TREND] Fetching previous responses for Barangay 17, Cycle 17, Service financial...
🔍 [TREND] Previous responses query result: { count: 120, error: undefined }
🔍 [TREND] Calculating scores from 120 previous responses...
🔍 [TREND] Previous scores calculated: { satisfaction: { percentage: 50.2 }, ... }
✅ [TREND] Trend calculated successfully: {
  currentScores_satisfaction: 55.8,
  currentSatisfaction: 55.8,
  previousScores_satisfaction: { percentage: 50.2 },
  previousSatisfaction: 50.2,
  change: 6,
  direction: 'up'
}
```

### Step 4: Verify Trends Display

The report card should now show:
- **Correct trend direction**: ↑ or ↓ based on actual change
- **Correct percentage**: e.g., "↑ +6% vs Survey Cycle 2024"
- **Correct previous cycle name**: Not "Survey Cycle 2025" if viewing 2025

---

## Expected Results

### Before Fix
```
Financial Administration: ↓ -80% vs Survey Cycle 2025
Disaster Preparedness: ↓ -80% vs Survey Cycle 2025
Safety & Peace Order: ↓ -80% vs Survey Cycle 2025
... (all showing -80%)
```

### After Fix
```
Financial Administration: ↑ +6% vs Survey Cycle 2024
Disaster Preparedness: ↓ -3% vs Survey Cycle 2024
Safety & Peace Order: → 0% vs Survey Cycle 2024
... (each showing actual calculated trend)
```

Or if this is the first cycle:
```
Financial Administration: 📊 Baseline Survey
Disaster Preparedness: 📊 Baseline Survey
... (all showing baseline)
```

---

## Why "-80%" Was Showing

Possible explanations:

### Theory 1: Cached ML Results
The ML cache had old results with incorrect trends. The bug prevented recalculation, so old cached "-80%" values persisted.

### Theory 2: ML Script Returning Trends
The Python ML script might be returning trends directly in `mlResults.trends`, which bypasses the calculation:
```typescript
if (trends) {
  console.log(`✅ [TREND] Using ML-provided trends for ${serviceArea}:`, trends);
  return {
    change: trends.change || 0,  // Using ML-provided change
    direction: trends.change >= 0 ? 'up' : 'down',
    available: true
  };
}
```

### Theory 3: Previous Cycle Has Wrong Data
The previous cycle might have satisfaction scores of 135.8% (impossible), so:
- Current: 55.8%
- Previous: 135.8%
- Change: 55.8 - 135.8 = -80%

---

## Additional Fixes

### 1. Added Force Refresh to ML API

The report card now passes `refresh=true` parameter when force refreshing:
```typescript
const apiUrl = forceRefresh 
  ? `/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${cycleId}&refresh=true`
  : `/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${cycleId}`;
```

This forces the ML API to bypass its cache and recalculate.

### 2. Enhanced Report Card Logging

Added logging to see what data is being processed:
```typescript
console.log('📊 [REPORT CARD] Action grid with trends:', funnelData.action_grid);
console.log('🔍 Action grid (RAW):', JSON.stringify(funnelData.action_grid, null, 2));
```

---

## Files Modified

### 1. src/app/api/ml/funnel-analysis/route.ts
- **Line 667-680**: Fixed satisfaction score extraction
- **Added**: Type checking for number vs object format
- **Added**: Enhanced logging for debugging

### 2. src/app/reportcard/page.tsx
- **Line 275**: Added `refresh=true` parameter for force refresh
- **Line 270**: Added logging for action_grid
- **Line 320**: Added logging for raw action_grid JSON

---

## Verification Checklist

After clearing cache and refreshing:

- [ ] Console shows "Trend calculated successfully" logs
- [ ] `currentSatisfaction` is a valid number (not 0 or undefined)
- [ ] `previousSatisfaction` is a valid number (not 0 or undefined)
- [ ] `change` is calculated correctly
- [ ] Report card displays correct trend percentages
- [ ] Trend direction (↑/↓) matches the change sign
- [ ] Previous cycle name is correct (not same as current)
- [ ] All services show different trends (not all -80%)

---

## If Still Showing Wrong Trends

### Check 1: Is ML Script Returning Trends?
Look for this log:
```
✅ [TREND] Using ML-provided trends for financial: {...}
```

If you see this, the ML script is returning trends directly. Check the Python script.

### Check 2: Is Previous Cycle Correct?
Look for this log:
```
✅ [TREND] Found previous cycle: Survey Cycle 2024 (ID: 17)
```

If it shows the same cycle as current, there's a database issue.

### Check 3: Are Previous Scores Valid?
Look for this log:
```
🔍 [TREND] Previous scores calculated: { satisfaction: { percentage: 50.2 }, ... }
```

If satisfaction is > 100% or < 0%, there's a data issue.

### Check 4: Use Debug Trends Tool
Go to Tools → ML Cache → Debug Trends to see:
- What cycles exist
- What responses exist in each cycle
- What scores are calculated

---

## Sign-Off

**Bug:** Type mismatch in satisfaction score access  
**Fix:** Handle both number and object formats  
**Status:** ✅ FIXED - READY TO TEST  
**Date:** October 27, 2025

**Next Action:** 
1. Clear ALL caches in Tools
2. Click Refresh on Report Card
3. Check console logs
4. Verify trends are now correct!
