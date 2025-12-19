# Satisfaction Question Migration: Likert Scale to Binary Yes/No

## Overview
This document describes the migration of satisfaction questions from a 5-point Likert scale to binary Yes/No format across the entire SIGLA system.

## Changes Made

### 1. Survey Questions (Frontend)
**File:** `src/app/survey/forms/utils/questions.ts`

**Changed:** All satisfaction questions across all service areas
- Financial Administration (3 satisfaction questions)
- Disaster Preparedness (2 satisfaction questions)
- Safety & Peace Order (3 satisfaction questions)
- Social Protection (3 satisfaction questions)
- Business Friendliness (1 satisfaction question)
- Environmental Management (1 satisfaction question)

**Old Format:**
```typescript
{
  id: "satisfactionProjects",
  type: "radio",
  question: "Gaano ka nasisiyahan...? / How satisfied are you...?",
  options: ["5", "4", "3", "2", "1"],
  required: true
}
```

**New Format:**
```typescript
{
  id: "satisfactionProjects",
  type: "radio",
  question: "Nasisiyahan ka ba...? / Are you satisfied...?",
  options: ["Oo / Yes", "Hindi / No"],
  required: true
}
```

### 2. Backend Data Processing (TypeScript)
**File:** `src/app/api/survey-cycles/[id]/funnel-analysis/route.ts`

**Updated:** Satisfaction calculation logic in `calculateSectionScores()`

**Old Calculation:**
```typescript
// Sum ratings (1-5) and divide by 5 to get percentage
const satisfactionScore = totalSatisfactionQuestions > 0
  ? Math.round(((satisfactionSum / totalSatisfactionQuestions) / 5) * 100)
  : 0;
```

**New Calculation:**
```typescript
// Count "Yes" responses and calculate percentage directly
const satisfactionScore = totalSatisfactionQuestions > 0
  ? Math.round((satisfactionSum / totalSatisfactionQuestions) * 100)
  : 0;
```

**Backward Compatibility:**
- Detects binary responses: "Yes", "Oo", "yes", "oo"
- Falls back to Likert scale: 4-5 = satisfied, 1-3 = not satisfied

### 3. Funnel Calculations Library (TypeScript)
**File:** `src/lib/funnel-calculations.ts`

**Updated:** `parseRating()` function

**New Logic:**
```typescript
export function parseRating(answer: any): number | null {
  const stringValue = String(answer).toLowerCase();
  
  // Binary Yes/No (new format)
  if (stringValue.includes('yes') || stringValue.includes('oo')) {
    return 5; // Treat as fully satisfied
  }
  if (stringValue.includes('no') || stringValue.includes('hindi')) {
    return 1; // Treat as not satisfied
  }
  
  // Legacy Likert scale (1-5)
  const numValue = typeof answer === 'string' ? parseInt(answer) : answer;
  if (typeof numValue === 'number' && numValue >= 1 && numValue <= 5) {
    return numValue;
  }
  
  return null;
}
```

### 4. Machine Learning Analysis (Python)
**File:** `ml/sigla_ml/feature_engineering.py`

**Updated:** Two satisfaction calculation methods

#### Method 1: `_calculate_satisfaction_from_availed()`
**Old Formula:**
```python
# Average rating (1-5) converted to percentage
avg_rating = sum(satisfaction_ratings) / len(satisfaction_ratings)
percentage = (avg_rating / 5) * 100
satisfied_count = sum(1 for r in satisfaction_ratings if r >= 4)
```

**New Formula:**
```python
# Direct percentage from binary responses
satisfied_count = sum(1 for is_satisfied in respondent_satisfaction.values() if is_satisfied)
percentage = (satisfied_count / total_with_satisfaction) * 100
```

**Backward Compatibility:**
- Detects "yes", "oo" → satisfied = True
- Detects "no", "hindi" → satisfied = False
- Legacy Likert: 4-5 → satisfied = True, 1-3 → satisfied = False

#### Method 2: `_calculate_satisfaction_score()`
**Old Formula:**
```python
# Average rating per question
avg_rating = question_sum / question_count
percentage = (avg_rating / 5) * 100
```

**New Formula:**
```python
# Direct percentage from binary responses
percentage = (satisfied_count / total_count) * 100
```

## Calculation Formula

### New Binary Format
```
Satisfaction Score = (Number of "Yes" responses / Total responses) × 100
```

### Example
- Total respondents who availed: 100
- Respondents who answered "Yes" (satisfied): 65
- Respondents who answered "No" (not satisfied): 35
- **Satisfaction Score = (65 / 100) × 100 = 65%**

### Legacy Likert Scale (Backward Compatibility)
```
Satisfaction Score = (Number of ratings ≥ 4 / Total responses) × 100
```

## Database Schema
**No changes required!**

The `survey_section.data` field is already JSONB/JSON, which can store text values. The system automatically handles both formats:
- New data: `{"satisfactionProjects": "Oo / Yes"}`
- Old data: `{"satisfactionProjects": "5"}`

## Migration Strategy

### Phase 1: Code Deployment ✅
- Deploy updated code with backward compatibility
- System handles both old and new data formats

### Phase 2: Data Collection
- New surveys use binary Yes/No questions
- Old survey data remains valid and is processed correctly

### Phase 3: Reporting
- Reports show satisfaction as percentage (0-100%)
- Both old and new data contribute to the same metrics
- No data loss or conversion needed

## Testing Checklist

- [x] Survey form displays Yes/No options
- [x] Survey responses save correctly
- [x] Backend calculates satisfaction from Yes/No responses
- [x] Backend handles legacy Likert scale data
- [x] ML analysis processes binary responses
- [x] ML analysis handles legacy data
- [x] Report card displays satisfaction scores
- [x] Funnel analysis shows correct metrics

## Benefits of Binary Format

1. **Simpler for Respondents**
   - Easier to understand and answer
   - Reduces cognitive load
   - Faster survey completion

2. **Clearer Interpretation**
   - Unambiguous: satisfied or not satisfied
   - No confusion about middle values (3 = neutral?)
   - Direct actionable insights

3. **Consistent with Other Questions**
   - Matches awareness (Yes/No)
   - Matches availment (Yes/No)
   - Matches need for action (Yes/No)

4. **Better Funnel Visualization**
   - All stages use same binary logic
   - Easier to track drop-offs
   - Clearer bottleneck identification

## Rollback Plan

If needed, rollback is simple:
1. Revert code changes in questions.ts
2. Revert calculation logic in backend files
3. No database changes needed
4. Old data remains intact

## Notes

- The overall satisfaction question in the "overall" section remains Likert scale (1-5) as it's a summary question
- All service-specific satisfaction questions are now binary
- The corruption section's satisfaction question (Q18) remains Likert scale as it's conditional and specific
