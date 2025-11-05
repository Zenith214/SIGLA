# Trends Debug Tool Added

**Date:** October 27, 2025  
**Issue:** Trends comparison showing unexpected values (e.g., "↓ -80% vs Survey Cycle 2025")  
**Solution:** Added debug tool to investigate trends calculation  
**Status:** ✅ READY TO TEST

---

## What Was Added

### 1. Debug Trends API Endpoint
**File:** `src/app/api/debug/trends/route.ts`

New endpoint: `GET /api/debug/trends?barangayId=X&cycleId=Y`

**Returns:**
- Current cycle information
- Previous cycle information (if exists)
- Response counts for both cycles
- Calculated scores for each service area (current vs previous)
- Trend direction and change percentage
- Any errors or messages

**Example Response:**
```json
{
  "barangayId": 17,
  "currentCycleId": 18,
  "currentCycle": {
    "cycle_id": 18,
    "name": "Survey Cycle 2025",
    "year": 2025,
    "is_active": true
  },
  "previousCycle": {
    "cycle_id": 17,
    "name": "Survey Cycle 2024",
    "year": 2024,
    "is_active": false
  },
  "currentResponseCount": 150,
  "previousResponseCount": 120,
  "serviceComparison": {
    "financial": {
      "currentResponseCount": 150,
      "previousResponseCount": 120,
      "currentScores": {
        "awareness": 75.5,
        "availment": 60.2,
        "satisfaction": 55.8
      },
      "previousScores": {
        "awareness": 70.1,
        "availment": 55.3,
        "satisfaction": 50.2
      },
      "change": 6,
      "direction": "up"
    },
    // ... other service areas
  }
}
```

### 2. Debug Trends Button in Tools Page
**File:** `src/app/tools/page.tsx`

Added "Debug Trends" button in the ML Cache tab:
- Located next to "Get Cache Statistics" and "Clear Barangay Cache"
- Requires barangay selection and active cycle
- Calls the debug API and displays results

### 3. Trends Debug Display
Shows detailed breakdown of:
- **Cycle Information**: Current and previous cycle details
- **Service Area Trends**: For each service (financial, disaster, etc.):
  - Current satisfaction score
  - Previous satisfaction score
  - Number of responses in each cycle
  - Calculated change percentage
  - Trend direction (up/down/stable)

---

## How to Use

### Step 1: Open Tools Page
Navigate to `/tools` in your application

### Step 2: Select Barangay
Choose the barangay you want to debug from the dropdown

### Step 3: Go to ML Cache Tab
Click on the "ML Cache" tab

### Step 4: Click "Debug Trends"
Click the purple "Debug Trends" button

### Step 5: Review Results
The debug information will appear below, showing:
- What cycles are being compared
- How many responses exist in each cycle
- What scores are calculated for each service area
- What the trend change is

---

## What to Look For

### Issue 1: Wrong Previous Cycle
**Symptom:** Previous cycle name is the same as current cycle  
**Example:** Current = "Survey Cycle 2025", Previous = "Survey Cycle 2025"  
**Cause:** Multiple cycles with same name, or cycle_id comparison issue

### Issue 2: No Previous Cycle
**Symptom:** "No previous cycle found" message  
**Cause:** This is the first cycle with data (baseline)  
**Expected:** Trends should show "📊 Baseline Survey" instead of percentages

### Issue 3: Unrealistic Change
**Symptom:** Change is very large (e.g., -80%, +90%)  
**Possible Causes:**
- Previous cycle has very few responses (unreliable data)
- Previous cycle has mock data with different profile
- Calculation error in score computation
- Previous cycle data is corrupted

### Issue 4: Missing Responses
**Symptom:** Previous cycle shows 0 responses  
**Cause:** No data in previous cycle for this barangay  
**Expected:** Should show baseline, not comparison

---

## Common Scenarios

### Scenario 1: First Cycle (Baseline)
```
Current Cycle: Survey Cycle 2025 (150 responses)
Previous Cycle: No previous cycle found
Message: "No previous cycle found - this is baseline"
```
**Expected Behavior:** Report card should show "📊 Baseline Survey" badges

### Scenario 2: Second Cycle (Valid Comparison)
```
Current Cycle: Survey Cycle 2025 (150 responses)
Previous Cycle: Survey Cycle 2024 (120 responses)
Financial: 55.8% → 50.2% = +6% (up)
```
**Expected Behavior:** Report card should show "↑ +6% vs Survey Cycle 2024"

### Scenario 3: Mock Data Mismatch
```
Current Cycle: Survey Cycle 2025 (150 responses, balanced profile)
Previous Cycle: Survey Cycle 2024 (100 responses, high-performer profile)
Financial: 55% → 90% = -35% (down)
```
**Issue:** Comparing different mock data profiles creates unrealistic trends  
**Solution:** Delete previous cycle mock data or regenerate with same profile

### Scenario 4: Insufficient Previous Data
```
Current Cycle: Survey Cycle 2025 (150 responses)
Previous Cycle: Survey Cycle 2024 (2 responses)
Financial: 55% → 100% = -45% (down)
```
**Issue:** Too few responses in previous cycle makes comparison unreliable  
**Solution:** Need minimum 5-10 responses for reliable comparison

---

## Next Steps After Debugging

### If Previous Cycle is Wrong
1. Check `survey_cycle` table for duplicate names
2. Verify `is_active` flags are correct
3. Ensure cycle_id ordering is correct

### If Previous Cycle Has No Data
1. This is expected for first cycle - should show baseline
2. Update report card to handle this case better
3. Consider hiding trends for baseline cycle

### If Previous Cycle Has Bad Data
1. Delete previous cycle mock data: `/tools` → "Delete All Cycle Data"
2. Regenerate with appropriate profile
3. Clear cache and refresh

### If Calculation is Wrong
1. Check `calculateServiceFunnelMetrics` function
2. Verify satisfaction score calculation
3. Check for data type issues (percentage vs decimal)

---

## Files Modified

### New Files
- `src/app/api/debug/trends/route.ts` - Debug API endpoint
- `DEBUG_TRENDS_ISSUE.md` - Detailed analysis document
- `TRENDS_DEBUG_TOOL_ADDED.md` - This file

### Modified Files
- `src/app/tools/page.tsx` - Added debug button and display

---

## Testing

### Test 1: Debug with Valid Data
1. Select a barangay with responses in current cycle
2. Click "Debug Trends"
3. ✅ Should show cycle comparison and calculated trends

### Test 2: Debug with Baseline
1. Select a barangay in first cycle (no previous data)
2. Click "Debug Trends"
3. ✅ Should show "No previous cycle found" message

### Test 3: Debug with Mock Data
1. Generate mock data for current cycle
2. Click "Debug Trends"
3. ✅ Should show comparison if previous cycle exists

---

## Related Issues

### Cache Clearing
The cache clearing functionality was already fixed to clear both:
- Server-side ML cache (database)
- Client-side report card cache (browser memory)

### Trends Validation
The report card already validates trends:
- Rejects changes > ±100%
- Shows "Baseline Survey" for unavailable trends
- But doesn't validate for unrealistic but valid ranges (e.g., -80%)

---

## Recommendations

### Short-term
1. **Use the debug tool** to understand what's happening
2. **Check if this is baseline** (first cycle with data)
3. **Verify previous cycle data** is realistic

### Medium-term
1. **Add minimum response threshold** for trend comparison (e.g., 10 responses)
2. **Add confidence indicators** for trends based on sample size
3. **Improve baseline detection** in report card display

### Long-term
1. **Add trend validation** for unrealistic but valid ranges
2. **Show confidence intervals** for trend changes
3. **Add historical trend charts** showing multiple cycles

---

## Sign-Off

**Tool:** Trends Debug Endpoint and UI  
**Purpose:** Investigate trends calculation issues  
**Status:** ✅ READY TO USE  
**Date:** October 27, 2025

**Next Action:** Use the debug tool to investigate the "-80%" trends issue
