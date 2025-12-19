# Minimum Sample Size Fix for Analytics Dashboard

## Date: December 19, 2025

---

## Problem

**Balasinon** was showing **100.0% satisfaction** with only **1 response**, appearing in both the Top 5 and Bottom 5 leaderboards. This is statistically invalid and misleading.

### Why This is a Problem

1. **Statistical Invalidity:** A single response cannot represent the satisfaction of an entire barangay
2. **Misleading Rankings:** Barangays with 1-2 responses can appear at the top of the leaderboard
3. **Unfair Comparisons:** Comparing a barangay with 1 response to one with 150 responses is not meaningful
4. **Data Quality:** Small sample sizes have high margin of error and low confidence

---

## Solution

Added a **minimum sample size threshold** of **30 responses** before including a barangay in the analytics dashboard.

### Why 30 Responses?

- **Statistical Rule of Thumb:** 30 is the minimum sample size for the Central Limit Theorem to apply
- **Confidence Level:** Provides reasonable confidence in the calculated percentages
- **Margin of Error:** At n=30, MoE ≈ 18% (acceptable for preliminary analysis)
- **Practical Balance:** Not too high (excludes too many barangays) or too low (includes unreliable data)

---

## Implementation

**File:** `src/app/api/analytics/dashboard-summary/route.ts`

### Changes Made

1. **Added minimum sample size constant:**
   ```typescript
   const MIN_SAMPLE_SIZE = 30
   ```

2. **Added response count check:**
   ```typescript
   const countQuery = `
     SELECT COUNT(*) as count
     FROM survey_response
     WHERE barangay_id = $1 
       AND survey_cycle_id = $2 
       AND status IN ('completed', 'submitted')
   `
   const countResult = await client.query(countQuery, [barangay.barangay_id, activeCycleId])
   const responseCount = parseInt(countResult.rows[0]?.count || 0)
   ```

3. **Filter out barangays with insufficient data:**
   ```typescript
   if (responseCount < MIN_SAMPLE_SIZE) {
     console.log(`Skipping ${barangay.barangay_name} - insufficient sample size (${responseCount} < ${MIN_SAMPLE_SIZE})`)
     continue
   }
   ```

4. **Include response count in results:**
   ```typescript
   barangayScores.push({
     barangayId: barangay.barangay_id,
     barangayName: barangay.barangay_name,
     satisfaction,
     needForAction,
     responseCount  // ✅ Added
   })
   ```

---

## Impact

### Before Fix
- **Balasinon:** 100.0% satisfaction (1 response) ❌
- **Appears in:** Both Top 5 and Bottom 5
- **Problem:** Statistically invalid, misleading

### After Fix
- **Balasinon:** Excluded from analytics (1 < 30 responses) ✅
- **Only includes:** Barangays with ≥ 30 responses
- **Result:** Statistically valid, fair comparisons

---

## Examples

### Scenario 1: Insufficient Sample Size
```
Barangay: Balasinon
Responses: 1
Satisfied: 1
Calculation: (1/1) × 100 = 100%
Status: ❌ EXCLUDED (1 < 30)
```

### Scenario 2: Sufficient Sample Size
```
Barangay: Poblacion
Responses: 150
Satisfied: 97
Calculation: (97/150) × 100 = 64.7%
Status: ✅ INCLUDED (150 ≥ 30)
```

---

## Statistical Justification

### Margin of Error by Sample Size

| Sample Size | Margin of Error (95% CI) | Confidence |
|-------------|-------------------------|------------|
| 1           | ±98%                    | Very Low   |
| 5           | ±44%                    | Very Low   |
| 10          | ±31%                    | Low        |
| 30          | ±18%                    | Acceptable |
| 50          | ±14%                    | Good       |
| 100         | ±10%                    | Very Good  |
| 150         | ±8%                     | Excellent  |

**Formula:** MoE = 0.98 / √n (at 95% confidence level)

### Why 30 is the Threshold

1. **Central Limit Theorem:** Sample means approximate normal distribution at n ≥ 30
2. **Reasonable MoE:** ±18% is acceptable for preliminary analysis
3. **Practical:** Balances statistical validity with data availability
4. **Standard Practice:** Widely used in survey research

---

## Logging

The system now logs when barangays are excluded:

```
[Dashboard Summary] Skipping Balasinon - insufficient sample size (1 < 30)
```

This helps administrators understand why certain barangays don't appear in the analytics.

---

## Future Considerations

### Option 1: Display with Warning
Instead of excluding, show barangays with small samples but add a warning:
```
Balasinon: 100.0% ⚠️ (Based on only 1 response - not statistically significant)
```

### Option 2: Separate Category
Create a "Preliminary Results" section for barangays with 10-29 responses:
- **Full Analytics:** ≥ 30 responses
- **Preliminary:** 10-29 responses (with disclaimer)
- **Insufficient Data:** < 10 responses (excluded)

### Option 3: Configurable Threshold
Make the minimum sample size configurable per cycle:
- **Baseline Survey:** 30 responses (strict)
- **Follow-up Survey:** 20 responses (relaxed)
- **Rapid Assessment:** 10 responses (very relaxed)

---

## Recommendations

1. **Target 150 responses per barangay** for optimal statistical validity (MoE ≈ 8%)
2. **Minimum 30 responses** before including in analytics
3. **Display response count** in the UI so users understand data quality
4. **Add confidence indicators** (e.g., stars or badges) based on sample size

---

## Verification

### To Test the Fix

1. **Check Balasinon:**
   - Should NOT appear in Top 5 or Bottom 5
   - Should NOT be included in Overall Satisfaction calculation

2. **Check Console Logs:**
   - Should see: "Skipping Balasinon - insufficient sample size (1 < 30)"

3. **Check Included Barangays:**
   - All should have ≥ 30 responses
   - Satisfaction scores should be statistically meaningful

---

## Summary

**Problem:** Barangays with 1-2 responses were included in analytics, causing misleading results.

**Solution:** Added minimum sample size threshold of 30 responses.

**Result:** Only statistically valid data is included in the analytics dashboard.

---

## Sign-off

**Fixed by:** Kiro AI Assistant  
**Date:** December 19, 2025  
**Status:** ✅ MINIMUM SAMPLE SIZE FILTER APPLIED
