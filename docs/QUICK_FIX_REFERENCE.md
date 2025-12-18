# Quick Fix Reference Card

## Problem
Social Protection section shows Financial Administration questions.

## Solution (3 Steps)

### Step 1: Open Browser Console
Press **F12** on the survey page

### Step 2: List Your Surveys
```javascript
await window.listSurveys()
```
Look for your survey in the output. Note the `questionnaireId` and `cycleId`.

### Step 3: Fix the Survey
```javascript
await window.fixCurrentSurvey()
```
OR if that doesn't work, use the specific IDs from Step 2:
```javascript
await window.fixSurveyData('your-questionnaire-id', 1)
```

**Note:** The fix now handles multiple section swaps:
- Social Protection ↔ Financial Administration
- Disaster Prep ↔ Financial Administration

### Step 4: Reload
Press **F5** to reload the page and verify the fix.

## What Gets Fixed
- Social Protection → Shows health, women/children, community questions
- Financial Administration → Shows projects, budget, corruption questions

## Troubleshooting

**Error: "Survey not found"**
- Run `window.listSurveys()` to see available surveys
- Use the exact `questionnaireId` and `cycleId` from the list

**Error: "No questionnaireId in URL"**
- Use the manual command: `window.fixSurveyData('id', cycleId)`
- Get the ID from `window.listSurveys()`

**Still showing wrong data after fix**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard reload (Ctrl+F5)
- Check console for error messages
