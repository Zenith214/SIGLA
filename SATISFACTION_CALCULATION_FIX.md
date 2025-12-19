# Satisfaction Calculation Fix

## Status: ✅ COMPLETED

## Issue
The satisfaction score calculations were incorrect:
- **Service Areas**: Was dividing by total satisfaction questions instead of number who availed
- **Overall Section**: Was dividing by number of responses instead of total sample size (target)

## Correct Formulas

### Service Area Satisfaction:
```
Satisfaction % = (Number Satisfied / Number Who Availed) × 100
```

**Example**:
- 100 people aware
- 60 people availed (used the service)
- Of those 60: 45 satisfied, 15 not satisfied
- **Satisfaction = (45 / 60) × 100 = 75%**

### Service Area Need for Action:
```
Need for Action % = (Number Who Need Action / Number Who Availed) × 100
```

**Example**:
- 60 people availed
- 18 said "needs action"
- **Need for Action = (18 / 60) × 100 = 30%**

### Overall Satisfaction (M1):
```
Overall Satisfaction % = (Number Satisfied / Total Sample Size) × 100
```

**Example**:
- Target sample size: 150
- 105 answered "Yes" (satisfied)
- **Overall Satisfaction = (105 / 150) × 100 = 70%**

### Overall Need for Action (M2):
```
Overall Need for Action % = (Number Who Need Action / Total Sample Size) × 100
```

**Example**:
- Target sample size: 150
- 45 answered "Yes" (needs action)
- **Overall Need for Action = (45 / 150) × 100 = 30%**

## Changes Made

### 1. Service Area Satisfaction Calculation
**File**: `src/app/api/funnel-analysis/route.ts`

**Before**:
```typescript
const satisfactionScore = totalSatisfactionQuestions > 0
  ? Math.round(((satisfactionSum / totalSatisfactionQuestions) / 5) * 100)
  : 0;
```

**After**:
```typescript
// Use availmentCount as denominator (those who availed the service)
const satisfactionScore = availmentCount > 0
  ? Math.round((satisfactionSum / availmentCount) * 100)
  : 0;
```

### 2. Service Area Need for Action Calculation
**Before**:
```typescript
const needActionScore = totalNeedActionQuestions > 0
  ? Math.round((needActionCount / totalNeedActionQuestions) * 100)
  : 0;
```

**After**:
```typescript
// Use availmentCount as denominator
const needActionScore = availmentCount > 0
  ? Math.round((needActionCount / availmentCount) * 100)
  : 0;
```

### 3. Binary Satisfaction Counting
**Before**: Summed ratings (1-5 scale)
**After**: Counts satisfied respondents (binary)

```typescript
// Binary format
if (stringValue.includes('yes') || stringValue.includes('oo')) {
  satisfactionSum++; // Count as 1 satisfied respondent
} else if (stringValue.includes('no') || stringValue.includes('hindi')) {
  // Don't increment (not satisfied)
}

// Legacy format (1-5 scale)
if (numValue >= 4) {
  satisfactionSum++; // 4-5 = satisfied
}
// 1-3 = not satisfied (don't increment)
```

### 4. Overall Section Calculation
**Before**: Used response count as denominator
**After**: Uses target sample size from `survey_target` table

```typescript
// Get target sample size from database
const targetQuery = `
  SELECT target FROM survey_target 
  WHERE barangay_id = $1 AND survey_cycle_id = $2
`;
const targetResult = await client.query(targetQuery, [barangayId, cycleId]);
const targetSampleSize = parseInt(targetResult.rows[0].target); // e.g., 150

// Calculate percentages
const satisfactionScore = targetSampleSize > 0
  ? Math.round((satisfactionSum / targetSampleSize) * 100)
  : 0;

const needActionScore = targetSampleSize > 0
  ? Math.round((needActionYesCount / targetSampleSize) * 100)
  : 0;
```

## Impact

### Before Fix:
- **Service Areas**: Satisfaction was artificially inflated because it divided by total questions (which could be less than availed count)
- **Overall**: Satisfaction was based on actual responses, not the target sample size

### After Fix:
- **Service Areas**: Satisfaction correctly represents the percentage of those who used the service and were satisfied
- **Overall**: Satisfaction correctly represents the percentage of the total sample (including non-respondents)

## Example Comparison

### Service Area (Financial):
**Scenario**: 100 aware, 60 availed, 45 satisfied

**Before Fix**:
- If there were 50 satisfaction questions total
- Satisfaction = (45 / 50) × 100 = **90%** ❌ WRONG

**After Fix**:
- Satisfaction = (45 / 60) × 100 = **75%** ✅ CORRECT

### Overall Section:
**Scenario**: Target 150, 105 satisfied, 120 total responses

**Before Fix**:
- Satisfaction = (105 / 120) × 100 = **87.5%** ❌ WRONG

**After Fix**:
- Satisfaction = (105 / 150) × 100 = **70%** ✅ CORRECT

## Files Updated

### Calculation Routes (✅ Complete):
1. `src/app/api/funnel-analysis/route.ts` - Main funnel analysis with corrected formulas
2. `src/app/api/ml/funnel-analysis/route.ts` - ML-enhanced funnel analysis (uses shared utility)
3. `src/lib/funnel-calculations.ts` - Shared calculation utility with correct logic
4. `src/app/api/analytics/dashboard-summary/route.ts` - Dashboard summary calculations
5. `src/app/api/analytics/service-area-deep-dive/route.ts` - Service area deep dive
6. `src/app/api/analytics/demographics/route.ts` - Demographics analytics

### Mock Data Generator (✅ Complete):
7. `src/app/api/tools/generate-mock-survey-data/route.ts` - Updated to generate binary Yes/No satisfaction responses instead of 1-5 scale

## Testing

To verify the fix:
1. ✅ Service area satisfaction uses `availmentCount` as denominator
2. ✅ Overall satisfaction uses `targetSampleSize` from `survey_target` table
3. ✅ Binary responses are counted correctly (Yes=1, No=0)
4. ✅ Legacy 1-5 scale is converted to binary (4-5=satisfied, 1-3=not satisfied)
5. ✅ Mock data generator creates binary satisfaction responses matching new questionnaire format
