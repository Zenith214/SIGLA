# Cache Clear and Fix Instructions

## Issue
The Satisfaction card still shows 61.2% instead of the correct 28.9% even after clearing browser cache and restarting the server.

## Root Causes Identified

### 1. ✅ FIXED: TypeScript Calculation Bug
**File:** `src/lib/funnel-calculations.ts`
- The satisfaction calculation was using average rating instead of count-based formula
- **Status:** Fixed and tested

### 2. ✅ FIXED: Report Card Data Processing
**File:** `src/app/reportcard/page.tsx` (Line 436-450)
- The report card was not properly handling the structured format from the ML API
- Was looking for `scores.satisfaction_score` but ML API returns `scores.satisfaction.percentage`
- **Status:** Fixed to handle both structured and flat formats

### 3. ✅ VERIFIED: Python ML Calculation
**File:** `ml/sigla_ml/feature_engineering.py`
- Python code is already correct: `(satisfied_count / total) * 100`
- **Status:** No changes needed

### 4. ⚠️ PENDING: ML Cache Invalidation
**Issue:** The ML API has a 12-hour cache that may contain old data
- **Status:** Cache cleared via API, but data may need to be recomputed

---

## Steps to Verify the Fix

### Step 1: Clear All Caches ✅ DONE
```powershell
# Clear ML cache (already done)
Invoke-WebRequest -Uri "http://localhost:3000/api/tools/invalidate-ml-cache" -Method DELETE -UseBasicParsing
```

### Step 2: Force Refresh the Data
The ML funnel analysis API supports a `refresh=true` parameter to force recomputation.

**Option A: Use the Force Refresh Button**
1. Open the Report Card page
2. Click the "Force Refresh" button (🔄 icon)
3. Wait for the data to reload

**Option B: Add refresh parameter to URL**
```
http://localhost:3000/reportcard?barangayId=X&cycleId=Y&refresh=true
```

**Option C: Call the API directly**
```powershell
# Replace with your actual barangayId and cycleId
Invoke-WebRequest -Uri "http://localhost:3000/api/ml/funnel-analysis?barangayId=1&cycleId=1&refresh=true" -UseBasicParsing
```

### Step 3: Verify the Fix
1. Open the Report Card page in a fresh browser window
2. Click on "Financial Administration - Detailed Analysis"
3. Check the Satisfaction card:
   - Should show **28.9%** (not 61.2%)
   - Should show "28 out of 97 users were satisfied"

---

## What Changed

### Before (Incorrect)
```typescript
// Old calculation (average rating)
const avgRating = satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length;
const percentage = Math.round((avgRating / 5) * 1000) / 10;
// Example: (3.06 / 5) * 100 = 61.2% ❌
```

### After (Correct)
```typescript
// New calculation (count-based)
const satisfiedCount = satisfactionScores.filter(rating => rating >= 4).length;
const total = respondentRatings.size;
const percentage = Math.round((satisfiedCount / total) * 1000) / 10;
// Example: (28 / 97) * 100 = 28.9% ✅
```

---

## Troubleshooting

### If the old value (61.2%) still appears:

1. **Check if the ML API is being called:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for `/api/ml/funnel-analysis` request
   - Check the response data

2. **Verify the response contains structured format:**
   ```json
   {
     "service_scores": {
       "financial": {
         "satisfaction": {
           "count": 28,
           "total": 97,
           "percentage": 28.9
         }
       }
     }
   }
   ```

3. **Check console logs:**
   - Look for `[ML FUNNEL]` logs showing the data being processed
   - Look for `Processing financial:` logs in the report card

4. **Force recompute from database:**
   ```sql
   -- Delete the specific cache entry
   DELETE FROM ml_cache 
   WHERE endpoint = 'ml-funnel-analysis' 
   AND barangay_id = YOUR_BARANGAY_ID 
   AND cycle_id = YOUR_CYCLE_ID;
   ```

5. **Restart the development server:**
   ```powershell
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

---

## Expected Results

### Satisfaction Card (Corrected)
- **Percentage:** 28.9% (was 61.2%)
- **Text:** "28 out of 97 users were satisfied with the service"
- **Calculation:** (28 / 97) × 100 = 28.9%

### AI Analysis (Should remain correct)
- "69 out of 97 were not satisfied" ✅ (This was always correct)

---

## Files Modified

1. ✅ `src/lib/funnel-calculations.ts` - Fixed satisfaction calculation
2. ✅ `src/lib/__tests__/funnel-calculations.test.ts` - Updated tests
3. ✅ `src/app/reportcard/page.tsx` - Fixed data processing to handle structured format

---

## Next Steps

1. **Test the fix** by following Step 2 and Step 3 above
2. **Verify all service areas** show correct satisfaction percentages
3. **Monitor** the application to ensure the fix persists
4. **Consider** adding a "Last Updated" timestamp to the UI to show when data was last computed

---

## Contact

If the issue persists after following these steps, please provide:
1. Screenshot of the Satisfaction card
2. Browser console logs (F12 → Console)
3. Network request/response for `/api/ml/funnel-analysis`
4. The barangayId and cycleId you're viewing
