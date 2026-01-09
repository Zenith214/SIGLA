# Critical Bugs Found in Dynamic Cut-Off Implementation

## 🚨 Bug #1: Wrong Sample Size Used for MoE Calculation

### Location: `src/lib/funnel-calculations.ts` (Line 575-577)

**Problem:**
```typescript
// ❌ WRONG: Using different sample sizes for satisfaction and need for action
const satisfactionTotal = satisfactionMetrics.total;  // = availed respondents only
const needForActionTotal = needForActionMetrics.total;  // = ALL respondents

const satisfactionMoE = calculateMarginOfError(satisfactionTotal);
const needForActionMoE = calculateMarginOfError(needForActionTotal);
```

**Why This is Wrong:**

According to CSIS methodology, **both satisfaction and need for action should use the SAME sample size** (total respondents), not different denominators.

- **Satisfaction:** Currently uses `availedIds.size` (only those who availed)
- **Need for Action:** Currently uses `allRespondentIds.size` (all respondents)

This creates **inconsistent cut-offs** for the same barangay!

**Example:**
```
Barangay with 150 total respondents:
- 100 aware
- 50 availed
- 40 satisfied

Current (WRONG):
- Satisfaction MoE = 0.98 / sqrt(50) = 13.9%
- Need for Action MoE = 0.98 / sqrt(150) = 8.0%
- Different cut-offs: 63.9% vs 58.0%

Correct (CSIS):
- Both should use total sample size (150)
- Both MoE = 0.98 / sqrt(150) = 8.0%
- Same cut-off: 58.0%
```

**Impact:**
- Action Grid quadrants will be **incorrectly classified**
- Satisfaction has artificially higher cut-off (harder to be "High")
- Inconsistent with CSIS methodology

---

## 🚨 Bug #2: MoE Returns 0 for Zero Sample Size

### Location: `src/lib/funnel-calculations.ts` (Line 75-77)

**Problem:**
```typescript
export function calculateMarginOfError(sampleSize: number): number {
  if (sampleSize <= 0) return 0;  // ❌ WRONG
  return 0.98 / Math.sqrt(sampleSize);
}
```

**Why This is Wrong:**

When `sampleSize = 0`, returning `MoE = 0` leads to:
```
Cut-off = 0.50 + 0 = 0.50 (50%)
```

This means **any score >= 50% is classified as "High"**, which is too lenient for zero data!

**Better Approach:**

Return a **very high MoE** (or throw error) to indicate insufficient data:
```typescript
if (sampleSize <= 0) return 0.5;  // 50% MoE = 100% cut-off (nothing is "High")
// OR
if (sampleSize <= 0) throw new Error('Sample size must be positive');
```

**Impact:**
- Services with no data get classified with 50% threshold
- Should be marked as "INSUFFICIENT_DATA" instead

---

## 🚨 Bug #3: Inconsistent Sample Size in Historical Cycle API

### Location: `src/app/api/survey-cycles/[id]/funnel-analysis/route.ts` (Line 311)

**Problem:**
```typescript
const sampleSize = scores.sample_size || 0;

// Later...
if (sampleSize > 0) {
  // Calculate quadrant
}
```

**Why This is a Problem:**

The `scores.sample_size` might not exist or might be the wrong value (e.g., availed count instead of total respondents).

**Need to Verify:**
- Where does `scores.sample_size` come from?
- Is it the total respondents or just availed?
- What if it's missing?

---

## 🚨 Bug #4: Python API Uses Wrong Sample Size

### Location: `ml/sigla_ml/api.py` (Line 415-420)

**Problem:**
```python
sample_size = scores.get('sample_size', 0)
if sample_size > 0:
    moe = 0.98 / (sample_size ** 0.5)
else:
    moe = 0.08  # Default for 150 respondents
```

**Why This is Wrong:**

Same issue as Bug #1 - the `sample_size` in `scores` might be:
- Availed count (wrong)
- Total respondents (correct)
- Missing (defaults to 150, which might be wrong)

**Need to Verify:**
- What does `scores.get('sample_size')` actually return?
- Should use total respondents from survey, not service-specific count

---

## 🚨 Bug #5: Helper Functions Default to 150

### Location: `src/utils/chartHelpers.ts` and `src/utils/accessibleColors.ts`

**Problem:**
```typescript
export const calculateQuadrant = (
  satisfaction: number,
  needAction: number,
  sampleSize: number = 150  // ❌ Assumes 150 if not provided
)
```

**Why This is a Problem:**

If caller doesn't pass `sampleSize`, it defaults to 150, which might be wrong for:
- Barangays with 30-50 respondents (your test case)
- Incomplete surveys
- Historical data with different targets

**Better Approach:**

Either:
1. Make `sampleSize` **required** (no default)
2. Or fetch actual sample size from context/data

**Impact:**
- Charts and colors might use wrong cut-off
- Inconsistent with actual classifications

---

## 📊 Correct CSIS Methodology

According to CSIS documentation:

### Sample Size for MoE:
```
n = Total number of respondents in the survey
NOT the number who availed or answered specific questions
```

### Formula:
```
MoE = 0.98 / sqrt(n)
Cut-off = 0.50 + MoE

Where n = total survey respondents (e.g., 150, 50, 30)
```

### Action Grid Classification:
```
Both satisfaction and need for action use the SAME cut-off
based on the SAME sample size (total respondents)
```

---

## 🔧 Required Fixes

### Fix #1: Use Total Respondents for Both Metrics

**File:** `src/lib/funnel-calculations.ts`

```typescript
// ✅ CORRECT: Use total respondents for both
const totalRespondents = allRespondentIds.size;

if (totalRespondents > 0) {
  const moe = calculateMarginOfError(totalRespondents);  // Same for both
  
  const satisfactionScore = satisfactionMetrics.percentage ? satisfactionMetrics.percentage / 100 : 0;
  const needForActionScore = needForActionMetrics.percentage ? needForActionMetrics.percentage / 100 : 0;
  
  actionGrid = determineActionGridQuadrant(
    satisfactionScore,
    moe,  // Same MoE
    needForActionScore,
    moe   // Same MoE
  );
}
```

### Fix #2: Handle Zero Sample Size Better

**File:** `src/lib/funnel-calculations.ts`

```typescript
export function calculateMarginOfError(sampleSize: number): number {
  if (sampleSize <= 0) {
    // Return very high MoE to indicate insufficient data
    return 0.5;  // 50% MoE = 100% cut-off
  }
  return 0.98 / Math.sqrt(sampleSize);
}
```

### Fix #3: Verify Sample Size Source

**Files:** 
- `src/app/api/survey-cycles/[id]/funnel-analysis/route.ts`
- `ml/sigla_ml/api.py`

Need to ensure `sample_size` is:
1. Total respondents (not availed count)
2. Fetched from correct source
3. Consistent across all calculations

### Fix #4: Make Sample Size Required or Fetch from Context

**Files:**
- `src/utils/chartHelpers.ts`
- `src/utils/accessibleColors.ts`

Option 1: Make required
```typescript
export const calculateQuadrant = (
  satisfaction: number,
  needAction: number,
  sampleSize: number  // Required, no default
)
```

Option 2: Fetch from context
```typescript
// Get actual sample size from survey data
const actualSampleSize = await fetchSampleSize(barangayId, cycleId);
```

---

## 🎯 Testing Checklist

After fixes, verify:

- [ ] Satisfaction and need for action use same MoE
- [ ] MoE calculated from total respondents, not availed count
- [ ] Zero sample size handled gracefully
- [ ] All APIs use consistent sample size
- [ ] Helper functions don't assume 150 respondents
- [ ] Action Grid classifications are consistent

---

## 📝 Summary

| Bug | Severity | Impact | Status |
|-----|----------|--------|--------|
| Wrong sample size for MoE | 🔴 Critical | Incorrect classifications | Needs Fix |
| MoE returns 0 for zero size | 🟡 Medium | Lenient threshold | Needs Fix |
| Inconsistent sample size in API | 🟡 Medium | Potential misclassification | Needs Verification |
| Python API sample size | 🟡 Medium | Potential misclassification | Needs Verification |
| Helper functions default to 150 | 🟠 Low | Inconsistent with actual data | Needs Fix |

**Priority:** Fix Bug #1 immediately - it's the most critical issue affecting all classifications.
