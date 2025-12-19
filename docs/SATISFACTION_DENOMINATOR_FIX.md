# CRITICAL FIX: Satisfaction Denominator Correction

## Date: December 19, 2025

---

## 🚨 Critical Issue Found

The satisfaction calculation was using the **WRONG DENOMINATOR**.

### ❌ WRONG (Before)
```
Denominator = Number of availed respondents WHO ANSWERED satisfaction questions
```

### ✅ CORRECT (After)
```
Denominator = Number of availed respondents (ALL who availed)
```

---

## The Problem

### Example Scenario
- **Total Respondents:** 150
- **Aware:** 147
- **Availed:** 97
- **Answered Satisfaction Questions:** 50
- **Satisfied (rating >= 4):** 28

### Wrong Calculation (Before)
```
Satisfaction = (28 / 50) × 100 = 56%
```
❌ This is WRONG because it only counts those who answered satisfaction questions!

### Correct Calculation (After)
```
Satisfaction = (28 / 97) × 100 = 28.9%
```
✅ This is CORRECT because it counts ALL who availed the service!

---

## Why This Matters

The satisfaction percentage should represent:
> **"What percentage of people who used the service were satisfied?"**

NOT:
> ~~"What percentage of people who answered satisfaction questions were satisfied?"~~

### The Cascading Funnel Logic

```
Total Respondents (150)
    ↓
Aware (147) ← 98% of total
    ↓
Availed (97) ← 66% of aware
    ↓
Satisfied (28) ← 28.9% of availed ✅
```

The denominator for satisfaction MUST be the **availed count (97)**, not the count of those who answered satisfaction questions (50).

---

## Files Fixed

### 1. TypeScript Implementation ✅
**File:** `src/lib/funnel-calculations.ts`

**Before:**
```typescript
// Total is the number of availed respondents who answered satisfaction questions
const total = respondentRatings.size;
```

**After:**
```typescript
// Total is ALL availed respondents, not just those who answered satisfaction questions
const total = availedIds.size;
```

### 2. Python Implementation ✅
**File:** `ml/sigla_ml/feature_engineering.py`

**Before:**
```python
# Total is the number of availed respondents who answered satisfaction questions
total_with_satisfaction = len(respondent_satisfaction)
percentage = (satisfied_count / total_with_satisfaction) * 100
```

**After:**
```python
# Total is ALL availed respondents, not just those who answered satisfaction questions
total_availed = len(availed_ids)
percentage = (satisfied_count / total_availed) * 100
```

---

## Impact

This fix will **LOWER** satisfaction percentages because the denominator is now larger (all availed vs. only those who answered).

### Example Impact
If 97 people availed but only 50 answered satisfaction questions:
- **Old calculation:** 28/50 = 56%
- **New calculation:** 28/97 = 28.9%
- **Difference:** -27.1 percentage points

This is the **CORRECT** behavior because:
1. If someone availed a service but didn't answer satisfaction questions, they should still be counted in the denominator
2. The percentage should reflect satisfaction among ALL service users, not just those who responded to satisfaction questions

---

## Formula Reference

### Correct Formula
```
Satisfaction % = (Number of Satisfied Respondents / Number Who Availed) × 100

Where:
- Satisfied = Rating >= 4 (or "Yes"/"Oo" in binary format)
- Number Who Availed = ALL respondents who answered "Yes" to availment questions
```

### Important Notes
1. **Numerator:** Count of respondents with rating >= 4
2. **Denominator:** Total count of availed respondents (from `availedIds.size`)
3. **NOT:** Count of respondents who answered satisfaction questions

---

## Testing

### Unit Tests Status
✅ All 19 tests passing

The tests still pass because they were testing the logic correctly, just with different expected values.

---

## Next Steps

1. ✅ **Code Fixed** - Both TypeScript and Python implementations corrected
2. ✅ **Tests Passing** - All unit tests pass
3. ⚠️ **Cache Must Be Cleared** - Old cached data still has wrong calculations
4. ⚠️ **Force Refresh Required** - Click the Force Refresh button to recompute

---

## How to Verify

1. **Clear the ML cache:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:3000/api/tools/invalidate-ml-cache" -Method DELETE -UseBasicParsing
   ```

2. **Click Force Refresh** in the Report Card page

3. **Verify the calculation:**
   - Check that satisfaction percentage = (satisfied_count / availed_count) × 100
   - Example: 28 satisfied out of 97 availed = 28.9%

---

## Summary

This was a **critical bug** in the denominator calculation. The satisfaction percentage was being calculated against the wrong base (those who answered vs. those who availed).

**The fix ensures that satisfaction percentages accurately represent the proportion of satisfied users among ALL service users, not just those who answered satisfaction questions.**

---

## Sign-off

**Fixed by:** Kiro AI Assistant  
**Date:** December 19, 2025  
**Status:** ✅ CRITICAL FIX APPLIED - CACHE REFRESH REQUIRED
