# NFA Binary Question Error Handling Guide

## Overview

This guide documents the error handling implementation for the binary Need for Action (NFA) feature in the PULSE survey system. The implementation ensures robust validation and user-friendly error messages for both binary questions and conditional suggestion fields.

## Task 12 Implementation

Task 12 adds comprehensive error handling for the survey form, covering:

1. **Missing binary answer** (Requirement 1.3)
2. **"Yes" with empty suggestion** (Requirement 1.4)
3. **Form state inconsistencies** (Requirement 6.5)
4. **User-friendly error message display**

## Error Handling Components

### 1. Binary Question Validation

Binary questions (e.g., "Do you believe this service needs improvement?") are always required.

**Error Scenarios:**

| Scenario | Error Message | Error Type |
|----------|--------------|------------|
| No answer provided | "Please indicate whether this service needs improvement" | `required` |
| Empty string | "Please indicate whether this service needs improvement" | `required` |
| Whitespace only | "Please indicate whether this service needs improvement" | `required` |
| Invalid value (not Yes/No/Oo/Hindi) | "Please select a valid option" | `format` |

**Valid Answers:**
- English: "Yes", "No"
- Tagalog: "Oo", "Hindi"
- Mixed: "Oo (Yes)", "Hindi (No)"

**Code Example:**

```typescript
// Binary question validation
if (question.id.startsWith('nfaBinary')) {
  if (!answer || answer.trim() === '') {
    return {
      questionId: question.id,
      message: 'Please indicate whether this service needs improvement',
      type: 'required'
    };
  }
  
  const trimmedAnswer = answer.trim();
  const isBinaryYes = trimmedAnswer === 'Yes' || trimmedAnswer === 'Oo' || trimmedAnswer === 'Oo (Yes)';
  const isBinaryNo = trimmedAnswer === 'No' || trimmedAnswer === 'Hindi' || trimmedAnswer === 'Hindi (No)';
  
  if (!isBinaryYes && !isBinaryNo) {
    return {
      questionId: question.id,
      message: 'Please select a valid option',
      type: 'format'
    };
  }
  
  return null;
}
```

### 2. Suggestion Field Conditional Validation

Suggestion fields are conditionally required based on the binary answer:
- **When binary is "Yes"**: Suggestion is required and must be non-empty
- **When binary is "No"**: Suggestion is optional

**Error Scenarios:**

| Binary Answer | Suggestion Value | Result | Error Message |
|--------------|------------------|--------|---------------|
| "Yes" or "Oo" | Empty string | Error | "Please provide specific comments or suggestions for improvement" |
| "Yes" or "Oo" | Whitespace only | Error | "Please provide specific comments or suggestions for improvement" |
| "Yes" or "Oo" | Valid text | Pass | - |
| "No" or "Hindi" | Empty string | Pass | - |
| "No" or "Hindi" | Valid text | Pass | - |
| Not answered | Any value | Pass | - (graceful handling) |

**Code Example:**

```typescript
// Suggestion field validation
if (question.id.startsWith('suggestions') && question.dependsOn?.startsWith('nfaBinary')) {
  const binaryFieldId = question.dependsOn;
  const binaryAnswer = allAnswers?.[binaryFieldId];
  
  // Handle form state inconsistency gracefully
  if (!binaryAnswer) {
    return null; // Don't show error if binary not answered yet
  }
  
  // Use NFA validation logic
  const validationResult = validateSuggestionField(binaryAnswer, answer);
  if (!validationResult.valid) {
    return {
      questionId: question.id,
      message: validationResult.error || 'Invalid suggestion',
      type: 'required'
    };
  }
  
  return null;
}
```

### 3. Form State Inconsistency Handling

The system gracefully handles situations where the form state is inconsistent:

**Scenarios:**

1. **Binary question not answered yet**
   - Suggestion field validation is skipped
   - No error is shown for the suggestion field
   - User can fill in the suggestion field without triggering errors

2. **Binary answer changes from "Yes" to "No"**
   - Suggestion field becomes optional
   - Existing text is preserved (Requirement 6.3)
   - Validation error is cleared if present

3. **Binary answer changes from "No" to "Yes"**
   - Suggestion field becomes required
   - Validation is triggered immediately
   - Error is shown if suggestion is empty

**Implementation:**

```typescript
// Graceful handling of missing binary answer
if (!binaryAnswer) {
  return null; // Don't validate suggestion if binary not answered
}

// Dynamic validation updates via React useEffect
useEffect(() => {
  if (question.id.startsWith('suggestions') && question.dependsOn?.startsWith('nfaBinary')) {
    const binaryFieldId = question.dependsOn;
    const binaryAnswer = allAnswers?.[binaryFieldId];
    
    if (binaryAnswer !== undefined) {
      const error = validateAnswer(question, currentAnswer, allAnswers);
      setValidationError(error);
      
      // Clear error if binary changed to "No"
      const isNo = binaryAnswer === 'No' || binaryAnswer === 'Hindi';
      if (isNo && error?.type === 'required') {
        setValidationError(null);
      }
    }
  }
}, [allAnswers, question, currentAnswer]);
```

### 4. User-Friendly Error Messages

All error messages are designed to be clear, actionable, and avoid technical jargon:

**Design Principles:**

1. **Use natural language**: Avoid terms like "field", "required", "invalid"
2. **Be specific**: Tell users exactly what they need to do
3. **Be positive**: Use "Please" instead of "Error" or "Invalid"
4. **Provide context**: Explain why the input is needed

**Examples:**

❌ **Bad**: "Field is required"
✅ **Good**: "Please indicate whether this service needs improvement"

❌ **Bad**: "Invalid input"
✅ **Good**: "Please select a valid option"

❌ **Bad**: "Required field cannot be empty"
✅ **Good**: "Please provide specific comments or suggestions for improvement"

### 5. Visual Error Display

Errors are displayed with visual indicators:

```tsx
const renderValidationError = () => {
  if (!validationError || !isEnabled) return null;
  
  return (
    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {validationError.message}
      </p>
    </div>
  );
};
```

**Visual Features:**
- Red background (`bg-red-50`)
- Red border (`border-red-200`)
- Warning icon
- Red text (`text-red-600`)
- Input field border turns red when error is present

## Service Indicators Coverage

The error handling applies to all 13 service indicators across 6 service areas:

### Financial Administration (4 indicators)
- Projects (`nfaBinaryProjects`, `suggestionsProjects`)
- Financial Transparency (`nfaBinaryFinancial`, `suggestionsFinancial`)
- Social Programs (`nfaBinarySocialPrograms`, `suggestionsSocialPrograms`)
- Corruption Perception (`nfaBinaryCorruption`, `suggestionsCorruption`)

### Disaster Preparedness (2 indicators)
- Disaster Information (`nfaBinaryDisasterInfo`, `suggestionsDisasterInfo`)
- Evacuation Resources (`nfaBinaryEvacuation`, `suggestionsEvacuation`)

### Safety & Peace Order (3 indicators)
- Barangay Tanods (`nfaBinaryTanods`, `suggestionsTanods`)
- Lupon/Dispute Resolution (`nfaBinaryLupon`, `suggestionsLupon`)
- Anti-Drug Programs (`nfaBinaryAntiDrug`, `suggestionsAntiDrug`)

### Social Protection (3 indicators)
- Health Services (`nfaBinaryHealthServices`, `suggestionsHealthServices`)
- Women & Children Protection (`nfaBinaryWomenChildrenProtection`, `suggestionsWomenChildrenProtection`)
- Community Participation (`nfaBinaryCommunityParticipation`, `suggestionsCommunityParticipation`)

### Business Friendliness (1 indicator)
- Business Clearance (`nfaBinaryBusinessClearance`, `suggestionsBusinessClearance`)

### Environmental Management (1 indicator)
- Waste Management (`nfaBinaryWasteManagement`, `suggestionsWasteManagement`)

## Testing

Comprehensive test coverage is provided in `nfa-error-handling.test.ts`:

### Test Categories

1. **Binary Question Error Handling** (8 tests)
   - Missing answer
   - Empty string
   - Whitespace only
   - Invalid value
   - Valid answers (Yes, No, Oo, Hindi)

2. **Suggestion Field - Yes Case** (5 tests)
   - Empty suggestion with "Yes"
   - Whitespace-only suggestion with "Yes"
   - Valid suggestion with "Yes"

3. **Suggestion Field - No Case** (4 tests)
   - Empty suggestion with "No" (should pass)
   - Valid suggestion with "No" (should pass)

4. **Form State Inconsistency** (4 tests)
   - Binary not answered yet
   - Binary undefined
   - Binary null
   - Dynamic validation after binary answer

5. **User-Friendly Messages** (3 tests)
   - Clear error messages
   - No technical jargon
   - Actionable guidance

6. **Multiple Service Indicators** (2 tests)
   - Independent error handling
   - Independent validation

7. **Edge Cases** (3 tests)
   - Extra spaces in binary answer
   - Newlines and tabs in suggestion
   - Case sensitivity

**Running Tests:**

```bash
npm test -- src/app/survey/forms/utils/__tests__/nfa-error-handling.test.ts
```

**Expected Result:** All 29 tests should pass

## Integration with Existing Code

The error handling integrates seamlessly with existing validation:

### Files Modified

1. **`src/lib/validation/nfa-validation.ts`**
   - Enhanced `validateBinaryAnswer()` with better error messages
   - Enhanced `validateSuggestionField()` with graceful state handling
   - Added requirement references in comments

2. **`src/app/survey/forms/utils/validation.ts`**
   - Added special handling for NFA binary questions
   - Enhanced suggestion field validation with state inconsistency handling
   - Added comprehensive comments for Task 12

3. **`src/app/survey/forms/sections/QuestionRenderer.tsx`**
   - Already implements dynamic validation updates (Task 5)
   - Already displays validation errors with visual indicators
   - No changes needed - error handling works automatically

### Files Created

1. **`src/app/survey/forms/utils/__tests__/nfa-error-handling.test.ts`**
   - Comprehensive test suite for error handling
   - 29 tests covering all scenarios

2. **`src/app/survey/forms/utils/ERROR_HANDLING_GUIDE.md`**
   - This documentation file

## Requirements Validation

### Requirement 1.3: Binary question is always required ✅
- Validation prevents submission without binary answer
- Clear error message: "Please indicate whether this service needs improvement"
- Tested in 8 test cases

### Requirement 1.4: "Yes" requires suggestion ✅
- Validation enforces non-empty suggestion when binary is "Yes"
- Whitespace-only suggestions are rejected
- Clear error message: "Please provide specific comments or suggestions for improvement"
- Tested in 5 test cases

### Requirement 1.5: "No" allows empty suggestion ✅
- Validation passes when binary is "No" and suggestion is empty
- Suggestion can optionally be filled
- Tested in 4 test cases

### Requirement 6.5: Handle form state inconsistencies gracefully ✅
- No error shown for suggestion field if binary not answered yet
- Validation updates dynamically when binary answer changes
- Text is preserved when validation rules change
- Tested in 4 test cases

## Best Practices

### For Developers

1. **Always use the validation functions**
   - Don't implement custom validation for NFA fields
   - Use `validateAnswer()` from `validation.ts`
   - Use `validateSuggestionField()` from `nfa-validation.ts`

2. **Pass allAnswers to validateAnswer()**
   - Required for conditional validation
   - Enables graceful state handling
   - Example: `validateAnswer(question, answer, allAnswers)`

3. **Test error scenarios**
   - Add tests for new service indicators
   - Test both English and Tagalog
   - Test edge cases

### For QA Testers

1. **Test binary question validation**
   - Try submitting without selecting an option
   - Verify error message appears
   - Verify error clears when option selected

2. **Test conditional suggestion validation**
   - Select "Yes" and try to proceed without suggestion
   - Verify error message appears
   - Select "No" and verify no error for empty suggestion

3. **Test dynamic validation**
   - Fill in suggestion, then change binary from "Yes" to "No"
   - Verify text is preserved
   - Verify error clears

4. **Test all service indicators**
   - Repeat tests for all 13 indicators
   - Test in both English and Tagalog sections

## Troubleshooting

### Error not showing for binary question

**Possible causes:**
- Question ID doesn't start with `nfaBinary`
- Question is not marked as required
- Validation is not being triggered

**Solution:**
- Verify question ID follows naming convention
- Check `required: true` in question definition
- Ensure `validateAnswer()` is called on blur/submit

### Error not showing for suggestion field

**Possible causes:**
- Question ID doesn't start with `suggestions`
- `dependsOn` field is not set correctly
- `allAnswers` is not passed to `validateAnswer()`

**Solution:**
- Verify question ID follows naming convention
- Check `dependsOn` points to correct binary field
- Pass `allAnswers` parameter to validation function

### Error persists after fixing input

**Possible causes:**
- Validation state not updating
- React component not re-rendering

**Solution:**
- Check `useEffect` dependencies in QuestionRenderer
- Verify `onAnswerChange` is called correctly
- Check that `allAnswers` is updated in parent state

### Text is lost when changing binary answer

**Possible causes:**
- Parent component is clearing suggestion field
- Form reset logic is too aggressive

**Solution:**
- Verify parent state management preserves suggestion text
- Check that only validation status changes, not the value
- Review form reset logic

## Future Enhancements

Potential improvements for future iterations:

1. **Inline validation**
   - Show validation as user types (debounced)
   - Real-time character count for suggestions

2. **Accessibility improvements**
   - ARIA labels for error messages
   - Screen reader announcements
   - Keyboard navigation enhancements

3. **Localization**
   - Translate error messages to Tagalog
   - Support for additional languages

4. **Analytics**
   - Track validation errors
   - Identify common user mistakes
   - Improve error messages based on data

## Related Documentation

- [NFA Binary Field Migration Guide](./README_NFA_SUBMISSION.md)
- [NFA Validation Library](../../../lib/validation/README.md)
- [Survey Form Validation](./validation.ts)
- [Design Document](.kiro/specs/binary-need-for-action/design.md)
- [Requirements Document](.kiro/specs/binary-need-for-action/requirements.md)

## Support

For questions or issues related to error handling:

1. Check this guide first
2. Review test cases in `nfa-error-handling.test.ts`
3. Check validation logic in `validation.ts` and `nfa-validation.ts`
4. Consult the design document for requirements clarification

---

**Last Updated:** Task 12 Implementation
**Version:** 1.0
**Status:** Complete ✅
