# Suggestion Questions Dependency Fix

## Issue
When skipping questions in a section (e.g., answering "No" to awareness questions), the suggestion/feedback questions at the end of each part were still showing as "answered" (green) in the progress bar, even though they should have been skipped (yellow).

### Example from Safety Section:
- User answers "No" to Q1 (awareness of Tanods)
- System skips to Q5 (Part B: Lupon)
- Questions 2, 3 should be yellow (skipped)
- **Bug:** Question 4 (suggestions) was showing as green (answered) instead of yellow (skipped)

## Root Cause
The "suggestion" questions at the end of each part had no `dependsOn` property, which meant they were always considered "enabled" by the system. This caused them to be treated as standalone questions rather than part of the conditional flow.

### Problematic Pattern:
```typescript
{
  id: "suggestionsTanods",
  type: "textarea",
  question: "What are your suggestions...",
  required: false,
  // ❌ NO dependsOn - always enabled!
}
```

## Solution
Added proper `dependsOn` dependencies to ALL suggestion questions across all sections, so they only appear if the user has actually experienced/used the service.

### Fixed Pattern:
```typescript
{
  id: "suggestionsTanods",
  type: "textarea",
  question: "What are your suggestions...",
  required: false,
  dependsOn: "experienceTanods",  // ✅ Now depends on previous question
  dependsOnValue: "Yes",
}
```

## Questions Fixed

### Disaster Preparedness Section:
- `suggestionsDisasterInfo` - Now depends on `availmentDisasterInfo` = "Yes"
- `suggestionsEvacuation` - Now depends on `locationEvacuation` = "Yes"

### Safety & Peace Order Section:
- `suggestionsTanods` - Now depends on `experienceTanods` = "Yes"
- `suggestionsLupon` - Now depends on `experienceLupon` = "Yes"
- `suggestionsAntiDrug` - Now depends on `experienceAntiDrug` = "Yes"

### Social Protection Section:
- `suggestionsHealthServices` - Now depends on `availmentHealthServices` = "Yes"
- `suggestionsWomenChildrenProtection` - Now depends on `availmentWomenChildrenProtection` = "Yes"
- `suggestionsCommunityParticipation` - Now depends on `availmentCommunityParticipation` = "Yes"

### Business Friendliness Section:
- `suggestionsBusinessClearance` - Now depends on `availmentBusinessClearance` = "Yes"

### Environmental Management Section:
- `suggestionsWasteManagement` - Now depends on `availmentWasteManagement` = "Yes"

## Result
Now when users skip questions:
- Progress bar correctly shows skipped questions as yellow
- Suggestion questions are properly disabled when their parent questions are skipped
- Progress count accurately reflects only answered questions and explicitly skipped questions

## Files Modified
- `src/app/survey/forms/utils/questions.ts` - Added dependencies to 10 suggestion questions

## Testing
To verify the fix:
1. Start any section
2. Answer "No" to the first awareness question
3. System should skip to the next part
4. All skipped questions (including suggestions) should show as yellow in the progress bar
5. Progress count should only increase when you actually answer or pass questions
