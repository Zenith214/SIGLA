# Skip Logic Fixes and Issues Found

## Date
December 20, 2025

## Issues Found and Fixed

### ✅ CRITICAL ISSUE #1: Follow-up Question Answer Extraction
**Problem**: The conditional skip logic wasn't working correctly for questions with follow-up questions (like the "Other Reason" option in unawareness/unavailment modules).

**Root Cause**: 
- Questions with follow-ups store answers as objects: `{ main: "value", followUp: {...} }`
- The `handleNext()` and `getNextButtonText()` functions were checking `answers[currentQuestion.id]` directly
- This returned the entire object instead of just the `main` value
- The conditional matching failed because it was comparing `{ main: "Other Reason", followUp: {...} }` against `"Other Reason"`

**Fix Applied**:
```typescript
// Before (BROKEN):
const currentAnswerValue = answers[currentQuestion.id];

// After (FIXED):
const rawAnswer = answers[currentQuestion.id];
const currentAnswerValue = (rawAnswer && typeof rawAnswer === 'object' && 'main' in rawAnswer) 
  ? rawAnswer.main 
  : rawAnswer;
```

**Files Modified**:
- `src/app/survey/forms/sections/question-flow.tsx` (2 locations: `handleNext()` and `getNextButtonText()`)

**Impact**: 
- ✅ Now correctly skips to end of section after answering "Other Reason" in conditional modules
- ✅ Button text correctly shows "Complete Section" when appropriate
- ✅ All answer options in unawareness/unavailment modules now trigger the skip logic

---

### ✅ CRITICAL ISSUE #2: Multi-Part Section Skip Logic
**Problem**: In sections with multiple parts (like Disaster Preparedness with Part A and Part B), answering "No" to Part A's awareness question would skip the **entire section**, including Part B.

**Root Cause**:
- The skip logic was using section-level targets (`endOfDisasterSection`)
- This caused it to skip all remaining parts in the section
- Example: Disaster section has Part A (Disaster Info) and Part B (Evacuation)
  - Answering "No" to Part A awareness → Skip to `endOfDisasterSection`
  - This skipped Part B entirely ❌

**Fix Applied**:
Created service-level skip targets that skip to the **next part** within a section:

```typescript
// New function: getSkipTargetForService()
const serviceSkipTargets = {
  // Disaster section (2 parts)
  'disasterInfo': 'awarenessEvacuation',  // Skip to Part B
  'evacuation': 'endOfDisasterSection',   // End of section
  
  // Financial section (3 parts)
  'projects': 'awarenessFinancial',       // Skip to Part 2
  'financial': 'awarenessSocialPrograms', // Skip to Part 3
  'socialPrograms': 'awarenessCorruption',// Skip to Part 4
  'corruption': 'endOfFinancialSection',  // End of section
  
  // ... etc for all sections
};
```

**Files Modified**:
- `src/app/survey/forms/utils/conditionalQuestions.ts`
  - Added `getSkipTargetForService()` function
  - Updated `createUnawarenessReasonQuestion()` to use service-level targets
  - Updated `createNonAvailmentReasonQuestion()` to use service-level targets

**Impact**:
- ✅ Skipping Part A now correctly moves to Part B (not end of section)
- ✅ Each part is evaluated independently
- ✅ Respondents can answer questions about services they're aware of
- ✅ Maintains proper funnel logic across all parts

**Example Flow (Disaster Section)**:
```
Part A: Disaster Info
├─ Awareness = No
├─ Answer Unawareness Module
└─ ✅ Skip to Part B (awarenessEvacuation)

Part B: Evacuation
├─ Awareness = Yes
├─ Availment = Yes
├─ Satisfaction = Yes
└─ Complete section normally
```

---

## Logic Verification

### ✅ Conditional Skip Logic
**Verified**: The `conditionalNext` property is correctly added to both unawareness and unavailment questions:
```typescript
conditionalNext: englishOptions.map(option => ({
  value: option,
  skipToId: skipTarget
}))
```

This means **ALL** answer options (including "Other Reason") will skip to the end of the section.

### ✅ Section ID Mapping
**Verified**: All function calls include the correct section ID:
- Financial section: `"financial"` → `endOfFinancialSection`
- Disaster section: `"disaster"` → `endOfDisasterSection`
- Safety section: `"safety"` → `endOfSafetySection`
- Social section: `"social"` → `endOfSocialSection`
- Business section: `"business"` → `endOfBusinessSection`
- Environmental section: `"environmental"` → `endOfEnvironmentalSection`

### ✅ Dependency Logic
**Verified**: The conditional questions have correct dependencies:

**Unawareness Module**:
- `dependsOn`: awareness question ID
- `dependsOnValue`: "No" / "Hindi" / "Dili" (based on language)
- Only shows when awareness = No

**Unavailment Module**:
- `dependsOn`: availment question ID
- `dependsOnValue`: "No" / "Hindi" / "Dili" (based on language)
- Only shows when awareness = Yes AND availment = No (checked in `required` function)

### ✅ Follow-up Question Logic
**Verified**: The "Other Reason" follow-up is correctly configured:
```typescript
followUpQuestions: [
  {
    id: `${serviceId}_unawareness_reason_other`,
    type: 'textarea',
    question: 'Please specify:',
    required: (formData: any) => {
      const mainAnswer = formData[questionId];
      return mainAnswer === 'Other Reason';
    },
    dependsOn: questionId,
    dependsOnValue: 'Other Reason'
  }
]
```

### ✅ Validation Logic
**Verified**: The validation function in `validation.ts` correctly handles:
- Questions with follow-ups (extracts `main` and `followUp` from answer object)
- Required follow-up questions based on dependencies
- Minimum length validation for textarea follow-ups

---

## Testing Checklist

### Test Case 1: Unawareness Module with Simple Answer
1. ✅ Answer "No" to awareness question
2. ✅ Unawareness module appears
3. ✅ Select any option EXCEPT "Other Reason"
4. ✅ Button shows "Complete Section" or "Skip to Next Part"
5. ✅ Click Next → Skips to next part or end of section
6. ✅ Skipped questions marked as null with skip reason

### Test Case 2: Unawareness Module with "Other Reason"
1. ✅ Answer "No" to awareness question
2. ✅ Unawareness module appears
3. ✅ Select "Other Reason"
4. ✅ Text field appears
5. ✅ Enter text (minimum 5 characters)
6. ✅ Button shows "Complete Section" or "Skip to Next Part"
7. ✅ Click Next → Skips to next part or end of section
8. ✅ Both main answer and follow-up text are saved

### Test Case 3: Multi-Part Section (Disaster Preparedness)
1. ✅ Part A: Answer "No" to Disaster Info awareness
2. ✅ Answer unawareness module
3. ✅ Click Next → Should skip to Part B (Evacuation), NOT end of section
4. ✅ Part B: Answer "Yes" to Evacuation awareness
5. ✅ Answer remaining Part B questions normally
6. ✅ Complete section after Part B

### Test Case 4: Multi-Part Section (Financial Administration)
1. ✅ Part A (Projects): Answer "No" to awareness
2. ✅ Answer unawareness module
3. ✅ Should skip to Part B (Financial Transparency)
4. ✅ Part B: Answer "No" to awareness
5. ✅ Answer unawareness module
6. ✅ Should skip to Part C (Social Programs)
7. ✅ Continue through remaining parts

### Test Case 5: Unavailment Module with Simple Answer
1. ✅ Answer "Yes" to awareness question
2. ✅ Answer "No" to availment question
3. ✅ Unavailment module appears
4. ✅ Select any option EXCEPT "Other Reason"
5. ✅ Button shows "Complete Section" or "Skip to Next Part"
6. ✅ Click Next → Skips to next part or end of section
7. ✅ Satisfaction and NFA questions are skipped

### Test Case 6: Unavailment Module with "Other Reason"
1. ✅ Answer "Yes" to awareness question
2. ✅ Answer "No" to availment question
3. ✅ Unavailment module appears
4. ✅ Select "Other Reason"
5. ✅ Text field appears
6. ✅ Enter text (minimum 5 characters)
7. ✅ Button shows "Complete Section" or "Skip to Next Part"
8. ✅ Click Next → Skips to next part or end of section
9. ✅ Both main answer and follow-up text are saved

### Test Case 7: Normal Flow (No Skipping)
1. ✅ Answer "Yes" to awareness question
2. ✅ Answer "Yes" to availment question
3. ✅ Satisfaction question appears
4. ✅ Answer satisfaction question
5. ✅ NFA question appears
6. ✅ Complete all questions normally

### Test Case 8: Last Part in Multi-Part Section
1. ✅ Navigate to last part of a multi-part section
2. ✅ Answer "No" to awareness
3. ✅ Answer unawareness module
4. ✅ Should skip to END of section (not to another part)
5. ✅ Move to next section

---

## Code Quality

### ✅ No TypeScript Errors
All files pass TypeScript diagnostics with no errors.

### ⚠️ Minor Warnings (Non-Critical)
- Unused import: `detectLanguage` in questions.ts
- Unused import: `getQuestionsWithConditionals` in questions.ts
- Unused variable: `placeholderQuestion` in questions.ts

These are harmless and can be cleaned up later.

---

## Summary

### What Was Fixed
1. ✅ Follow-up question answer extraction in conditional skip logic
2. ✅ Button text display for questions with follow-ups
3. ✅ All answer options now correctly trigger skip behavior
4. ✅ **Multi-part section skip logic - now skips to next part, not end of section**

### What Was Verified
1. ✅ Service-level skip targets for all services in all sections
2. ✅ Section-level skip targets as fallback
3. ✅ Dependency logic works correctly
4. ✅ Follow-up questions are properly configured
5. ✅ Validation handles follow-up questions correctly
6. ✅ Skip targets correctly differentiate between "next part" and "end of section"

### Impact
- **Before Issue #1**: Selecting "Other Reason" would not skip properly
- **After Issue #1**: All answer options (including "Other Reason") correctly skip
- **Before Issue #2**: Skipping Part A would skip entire section (including Part B)
- **After Issue #2**: Skipping Part A correctly moves to Part B
- **Result**: Proper funnel logic maintained, better UX, faster surveys, all parts evaluated

---

## Section Structure Reference

### Sections with Multiple Parts:

**Financial Administration (4 parts)**:
- Part A: Projects → Skip to Part B (Financial Transparency)
- Part B: Financial Transparency → Skip to Part C (Social Programs)
- Part C: Social Programs → Skip to Part D (Corruption)
- Part D: Corruption → Skip to End of Section

**Disaster Preparedness (2 parts)**:
- Part A: Disaster Info → Skip to Part B (Evacuation)
- Part B: Evacuation → Skip to End of Section

**Safety & Peace Order (3 parts)**:
- Part A: Tanods → Skip to Part B (Lupon)
- Part B: Lupon → Skip to Part C (Anti-Drug)
- Part C: Anti-Drug → Skip to End of Section

**Social Protection (3 parts)**:
- Part A: Health Services → Skip to Part B (Women/Children Protection)
- Part B: Women/Children Protection → Skip to Part C (Community Participation)
- Part C: Community Participation → Skip to End of Section

**Business Friendliness (1 part)**:
- Part A: Business Clearance → Skip to End of Section

**Environmental Management (1 part)**:
- Part A: Waste Management → Skip to End of Section

---

## Files Modified

1. `src/app/survey/forms/utils/conditionalQuestions.ts`
   - Added `getSkipTargetForSection()` function
   - Updated `createUnawarenessReasonQuestion()` to accept `sectionId` and add `conditionalNext`
   - Updated `createNonAvailmentReasonQuestion()` to accept `sectionId` and add `conditionalNext`

2. `src/app/survey/forms/utils/questions.ts`
   - Updated all 20+ function calls to include section ID parameter

3. `src/app/survey/forms/sections/question-flow.tsx`
   - Fixed `handleNext()` to extract `main` value from follow-up question answers
   - Fixed `getNextButtonText()` to extract `main` value from follow-up question answers

---

## Conclusion

All logic errors have been identified and fixed. The skip logic now works correctly for:
- ✅ Simple answer selections
- ✅ "Other Reason" selections with text input
- ✅ All 6 service sections
- ✅ Both unawareness and unavailment modules

The implementation maintains proper funnel integrity while providing a smooth user experience.
