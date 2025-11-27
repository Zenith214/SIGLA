# Progress Count Fix

## Issue
The Financial Administration section (and other sections) showed incorrect progress counts like "15 of 19 questions completed" even when no questions had been answered yet.

## Root Cause
The progress counter was counting ALL questions with skip reasons as "completed", including questions that were automatically marked as skipped when the section loaded, but which the user had never actually encountered.

### Example Scenario:
1. User enters Financial Administration section
2. Code automatically marks questions 5-19 as "skipped" because they depend on earlier questions
3. Progress shows "15 of 19 completed" even though user is on question 1
4. This is misleading - those questions weren't actually "completed", they were just pre-marked as skipped

## Solution
Modified the progress calculation in `QuestionProgressBar.tsx` to only count questions as "completed" if:

1. **Answered questions**: Questions that have actual user responses
2. **Explicitly skipped questions**: Questions that were skipped because the user passed them (i.e., `currentQuestionIndex` is beyond that question)

### Key Change:
```typescript
// OLD: Counted all questions with skip reasons
else if (answer === null && answers[`${q.id}_skipReason`]) {
  return true; // Always counted as completed
}

// NEW: Only count if user has passed this question
else if (answer === null && answers[`${q.id}_skipReason`]) {
  return index < currentQuestionIndex; // Only count if user moved past it
}
```

## Result
Now the progress counter accurately reflects:
- **0 of 19** when starting a section (correct!)
- **1 of 19** after answering the first question
- **5 of 19** after answering question 1 and skipping to question 5 (questions 2-4 are now counted as skipped)

## Visual Indicators
The progress bar also updated to show:
- 🟢 Green: Answered questions
- 🟡 Yellow: Skipped questions (only those the user has passed)
- 🔵 Blue: Current question
- ⚪ Gray: Future questions (not yet reached)

## Files Modified
- `src/app/survey/forms/sections/QuestionProgressBar.tsx`

## Testing
To verify the fix:
1. Start a new section
2. Progress should show "0 of X questions completed"
3. Answer the first question
4. Progress should show "1 of X questions completed"
5. If you answer "No" to an awareness question and skip ahead, the skipped questions should now be counted
