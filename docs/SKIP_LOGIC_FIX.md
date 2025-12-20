# Skip Logic Fix for Unawareness and Unavailment Modules

## Problem
The new unawareness and unavailment modules were added to the questionnaire, but the skip logic wasn't working properly. After answering these conditional modules, the system should skip the remaining questions (availment, satisfaction, and need for action) and move to the next service area or section.

## Solution
Implemented automatic skip-to-end logic for both conditional modules:

### Flow After Fix:

**Scenario 1: Respondent is NOT Aware**
```
1. Awareness Question → Answer: "No"
2. Unawareness Module appears → Answer selected
3. ✅ SKIP to end of section (bypasses availment, satisfaction, NFA)
4. Move to next service area
```

**Scenario 2: Respondent is Aware but Did NOT Avail**
```
1. Awareness Question → Answer: "Yes"
2. Availment Question → Answer: "No"
3. Unavailment Module appears → Answer selected
4. ✅ SKIP to end of section (bypasses satisfaction, NFA)
5. Move to next service area
```

**Scenario 3: Normal Flow (Aware AND Availed)**
```
1. Awareness Question → Answer: "Yes"
2. Availment Question → Answer: "Yes"
3. Satisfaction Question → Answer provided
4. Need for Action Question → Answer provided
5. Move to next service area
```

## Technical Changes

### 1. Updated `conditionalQuestions.ts`
- Added `getSkipTargetForSection()` function to determine the correct end-of-section target
- Modified `createUnawarenessReasonQuestion()` to accept `sectionId` parameter
- Modified `createNonAvailmentReasonQuestion()` to accept `sectionId` parameter
- Added `conditionalNext` property to both question types that maps all answer options to skip to end of section

### 2. Updated `questions.ts`
- Updated all calls to `createUnawarenessReasonQuestion()` to include section ID:
  - Financial section: `"financial"`
  - Disaster section: `"disaster"`
  - Safety section: `"safety"`
  - Social section: `"social"`
  - Business section: `"business"`
  - Environmental section: `"environmental"`
  
- Updated all calls to `createNonAvailmentReasonQuestion()` to include section ID

### 3. Skip Targets by Section
```typescript
{
  'financial': 'endOfFinancialSection',
  'disaster': 'endOfDisasterSection',
  'safety': 'endOfSafetySection',
  'social': 'endOfSocialSection',
  'business': 'endOfBusinessSection',
  'environmental': 'endOfEnvironmentalSection'
}
```

## How It Works

1. When a respondent answers "No" to an awareness question, the unawareness module appears
2. After selecting any option in the unawareness module, the `conditionalNext` property triggers
3. The system skips all remaining questions in that service area
4. All skipped questions are marked as `null` with appropriate `skipReason`
5. The section is marked as complete and moves to the next section

Same logic applies for the unavailment module when awareness = "Yes" but availment = "No"

## Benefits

✅ **Correct Funnel Logic**: Maintains the cascading funnel structure (aware → availed → satisfied)

✅ **Better UX**: Respondents don't see irrelevant questions they can't answer

✅ **Data Integrity**: Skipped questions are properly marked with reasons

✅ **Faster Surveys**: Reduces survey time by skipping unnecessary questions

## Testing

To test the skip logic:

1. Start a survey in any service section
2. Answer "No" to the awareness question
3. Answer the unawareness reason question
4. ✅ Verify it skips to the next section (not to availment/satisfaction)

OR

1. Answer "Yes" to awareness
2. Answer "No" to availment
3. Answer the unavailment reason question
4. ✅ Verify it skips to the next section (not to satisfaction)

## Files Modified

- `src/app/survey/forms/utils/conditionalQuestions.ts`
- `src/app/survey/forms/utils/questions.ts`

## Date
December 20, 2025
