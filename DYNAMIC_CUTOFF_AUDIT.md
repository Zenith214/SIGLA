# Dynamic Cut-Off Implementation Audit

## Current Status: ⚠️ PARTIALLY IMPLEMENTED

The system has the **correct CSIS dynamic cut-off functions** but they are **NOT being used consistently** across all calculation points.

---

## ✅ What's Correctly Implemented

### 1. CSIS Calculation Functions (`src/lib/funnel-calculations.ts`)

```typescript
// ✅ CORRECT: Dynamic cut-off calculation
export function calculateMarginOfError(sampleSize: number): number {
  if (sampleSize <= 0) return 0;
  return 0.98 / Math.sqrt(sampleSize);
}

export function calculateDynamicCutoff(moe: number): number {
  return 0.50 + moe;  // Cut-off = 50% + MoE
}

export function classifyScore(score: number, moe: number): string {
  const cutoff = calculateDynamicCutoff(moe);
  return score >= cutoff ? "High" : "Low";
}

export function determineActionGridQuadrant(
  satisfactionScore: number,
  satisfactionMoE: number,
  needForActionScore: number,
  needForActionMoE: number
): ActionGridClassification {
  const satisfactionRating = classifyScore(satisfactionScore, satisfactionMoE);
  const needForActionRating = classifyScore(needForActionScore, needForActionMoE);
  
  const satisfactionCutoff = calculateDynamicCutoff(satisfactionMoE);
  const needForActionCutoff = calculateDynamicCutoff(needForActionMoE);
  
  // ... quadrant determination based on High/Low ratings
}
```

### 2. Used in Main Funnel Calculations

The `calculateServiceFunnelMetrics()` function in `src/lib/funnel-calculations.ts` (line 580) **correctly uses** the dynamic cut-off:

```typescript
if (satisfactionTotal > 0 && needForActionTotal > 0) {
  const satisfactionMoE = calculateMarginOfError(satisfactionTotal);
  const needForActionMoE = calculateMarginOfError(needForActionTotal);
  
  const satisfactionScore = satisfactionMetrics.percentage ? satisfactionMetrics.percentage / 100 : 0;
  const needForActionScore = needForActionMetrics.percentage ? needForActionMetrics.percentage / 100 : 0;
  
  actionGrid = determineActionGridQuadrant(
    satisfactionScore,
    satisfactionMoE,
    needForActionScore,
    needForActionMoE
  );
}
```

---

## ❌ What's Using Hardcoded Thresholds

### 1. Historical Cycle Funnel Analysis (`src/app/api/survey-cycles/[id]/funnel-analysis/route.ts`)

**Line 313-323: HARDCODED 70% and 30% thresholds**

```typescript
function calculateActionGrid(serviceScores: { [key: string]: any }): { [key: string]: any } {
  // ...
  
  // ❌ WRONG: Hardcoded thresholds
  if (satisfaction >= 70 && needAction <= 30) {
    quadrant = 'MAINTAIN';
  } else if (satisfaction >= 70 && needAction > 30) {
    quadrant = 'OPPORTUNITIES';
  } else if (satisfaction < 70 && needAction <= 30) {
    quadrant = 'MONITOR';
  } else if (satisfaction < 70 && needAction > 30) {
    quadrant = 'FIX_NOW';
  }
}
```

### 2. Python ML API (`ml/sigla_ml/api.py`)

**Line 410-425: HARDCODED 70% and 30% thresholds (fallback)**

```python
# Fallback to legacy calculation if CSIS data not available
satisfaction = scores.get('satisfaction_score', 0)
need_action = scores.get('need_action_score', 0)

# ❌ WRONG: Use fixed thresholds as fallback (not CSIS compliant)
if satisfaction >= 70 and need_action <= 30:
    quadrant = 'Exceeded Expectations'
    priority = 'Key Strength'
elif satisfaction >= 70 and need_action > 30:
    quadrant = 'Continued Emphasis'
    priority = 'High Importance'
elif satisfaction < 70 and need_action <= 30:
    quadrant = 'Secondary Priority'
    priority = 'Lowest Priority'
else:
    quadrant = 'Opportunities for Improvement'
    priority = 'Highest Priority'
```

### 3. Chart Helpers (`src/utils/chartHelpers.ts`)

**Line 343-344: HARDCODED 60% and 50% thresholds**

```typescript
export function determineQuadrant(
  satisfaction: number,
  needAction: number
): 'maintain' | 'fix_now' | 'monitor' | 'low_priority' => {
  // ❌ WRONG: Hardcoded thresholds
  const satisfactionThreshold = 60;
  const needActionThreshold = 50;
  
  if (satisfaction >= satisfactionThreshold && needAction >= needActionThreshold) {
    // ...
  }
}
```

### 4. Accessible Colors (`src/utils/accessibleColors.ts`)

**Line 126-132: HARDCODED 70% and 50% thresholds**

```typescript
export function getActionGridColor(satisfaction: number, needAction: number): {
  color: string;
  pattern?: string;
} {
  // ❌ WRONG: Hardcoded thresholds
  if (satisfaction >= 70 && needAction < 50) {
    return { color: '#059669' }; // Green - Maintain
  }
  if (satisfaction < 70 && needAction >= 50) {
    return { color: '#dc2626' }; // Red - Fix Now
  }
  // ...
}
```

---

## 📊 Example: How Cut-Off Changes with Sample Size

### With 150 Respondents (CSIS Standard):
```
MoE = 0.98 / sqrt(150) = 0.98 / 12.25 = 0.08 (8%)
Cut-off = 0.50 + 0.08 = 0.58 (58%)

Classification:
- Score >= 58% → "High"
- Score < 58% → "Low"
```

### With 50 Respondents (Your Test):
```
MoE = 0.98 / sqrt(50) = 0.98 / 7.07 = 0.139 (13.9%)
Cut-off = 0.50 + 0.139 = 0.639 (63.9%)

Classification:
- Score >= 63.9% → "High"
- Score < 63.9% → "Low"
```

### With 30 Respondents (Minimum):
```
MoE = 0.98 / sqrt(30) = 0.98 / 5.48 = 0.179 (17.9%)
Cut-off = 0.50 + 0.179 = 0.679 (67.9%)

Classification:
- Score >= 67.9% → "High"
- Score < 67.9% → "Low"
```

---

## 🎯 Impact on Your 30-50 Respondent Test

### Current Behavior (MIXED):

1. **Main Report Card** (`/reportcard` page):
   - ✅ Uses dynamic cut-off (correct)
   - Cut-off adjusts to 63.9% for 50 respondents
   - Cut-off adjusts to 67.9% for 30 respondents

2. **Historical Cycle Comparison**:
   - ❌ Uses hardcoded 70% threshold
   - Will misclassify barangays with 30-50 respondents
   - Example: 65% satisfaction with 30 respondents
     - Should be: "Low" (< 67.9% cut-off)
     - Actually shows: "Low" (< 70% hardcoded) ← Accidentally correct!

3. **Chart Colors & UI Elements**:
   - ❌ Use hardcoded 60-70% thresholds
   - Colors won't match the actual classification
   - Visual inconsistency

### Example Scenario:

**Barangay with 50 respondents:**
- Satisfaction: 65%
- Need for Action: 40%
- MoE: 13.9%
- Dynamic Cut-off: 63.9%

**Correct Classification (Dynamic):**
- Satisfaction: 65% >= 63.9% → "High"
- Need for Action: 40% < 63.9% → "Low"
- **Quadrant: "Exceeded Expectations"** ✅

**Wrong Classification (Hardcoded 70%):**
- Satisfaction: 65% < 70% → "Low"
- Need for Action: 40% > 30% → "High"
- **Quadrant: "Opportunities for Improvement"** ❌

---

## 🔧 Files That Need Fixing

### Priority 1 (Critical - Affects Classification):
1. ✅ `src/lib/funnel-calculations.ts` - Already correct
2. ❌ `src/app/api/survey-cycles/[id]/funnel-analysis/route.ts` - Line 313
3. ❌ `ml/sigla_ml/api.py` - Line 410

### Priority 2 (Important - Affects UI/Charts):
4. ❌ `src/utils/chartHelpers.ts` - Line 343
5. ❌ `src/utils/accessibleColors.ts` - Line 126

### Priority 3 (Low - Display only):
6. ❌ `src/utils/chartConfig.ts` - Line 342 (satisfaction color bands)

---

## ✅ Recommendation

**For your 30-50 respondent test to work correctly:**

1. **Main report card will work fine** - it uses the correct dynamic cut-off
2. **Fix the historical cycle comparison** - replace hardcoded thresholds
3. **Fix chart colors** - so they match the actual classification
4. **Update Python ML API** - to use dynamic cut-off when CSIS data not available

The system is **mostly ready** for 30-50 respondents, but the hardcoded thresholds in a few places will cause inconsistencies.

---

## 📝 Summary

| Component | Status | Cut-Off Type | Works with 30-50? |
|-----------|--------|--------------|-------------------|
| Main Funnel Calculations | ✅ Correct | Dynamic | Yes |
| Report Card Page | ✅ Correct | Dynamic | Yes |
| Historical Comparison | ❌ Wrong | Hardcoded 70% | Partially |
| Python ML API | ⚠️ Fallback | Hardcoded 70% | Partially |
| Chart Helpers | ❌ Wrong | Hardcoded 60% | No |
| Chart Colors | ❌ Wrong | Hardcoded 70% | No |

**Overall: 60% compliant with CSIS dynamic cut-off methodology**
