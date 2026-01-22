# Corruption Questions Filtering Fix

## Issue
Corruption-related questions were still visible to non-admin users in the Detailed Analytics view, despite filtering logic being added. Additionally, some corruption question labels were showing raw field names instead of proper human-readable labels.

## Root Causes

### 1. Incomplete Question Label Mapping
The `questionLabels.ts` file was missing several corruption-related field mappings:
- `financial_experiencedCorruption`
- `financial_detailsCorruption`
- `financial_reasonsNotReporting`

### 2. Insufficient Filtering Logic
The filtering logic only checked the field key name for "corruption" or "korapsyon", but didn't check:
- The human-readable label (which might contain these words even if the key doesn't)
- Both the key AND the label together

### 3. Case Sensitivity
The filtering was case-sensitive, which could miss variations in capitalization.

## Solutions Implemented

### 1. Added Missing Question Labels
Updated `src/utils/questionLabels.ts` to include all corruption-related fields:

```typescript
'financial_awarenessCorruption': {
  label: 'Awareness: Anti-Corruption Measures',
  section: 'Financial Administration',
  type: 'awareness'
},
'financial_experiencedCorruption': {
  label: 'Experience: Witnessed Corruption',
  section: 'Financial Administration',
  type: 'other'
},
'financial_detailsCorruption': {
  label: 'Details: Corruption Experience',
  section: 'Financial Administration',
  type: 'other'
},
'financial_reportedCorruption': {
  label: 'Availment: Reported Corruption',
  section: 'Financial Administration',
  type: 'availment'
},
'financial_reasonsNotReporting': {
  label: 'Reasons: Why Not Reported',
  section: 'Financial Administration',
  type: 'other'
},
'financial_satisfactionCorruption': {
  label: 'Satisfaction: Anti-Corruption Response',
  section: 'Financial Administration',
  type: 'satisfaction'
},
'financial_nfaBinaryCorruption': {
  label: 'Need for Action: Anti-Corruption',
  section: 'Financial Administration',
  type: 'nfa'
},
'financial_suggestionsCorruption': {
  label: 'Suggestions: Anti-Corruption',
  section: 'Financial Administration',
  type: 'suggestion'
}
```

### 2. Enhanced Filtering Logic
Updated filtering in both `DetailedResponsesView.tsx` and `SurveyAnalyticsDashboard.tsx`:

**Before:**
```typescript
if (!isAdmin && (
  key.toLowerCase().includes('corruption') ||
  key.toLowerCase().includes('korapsyon')
)) {
  return // Skip this question
}
```

**After:**
```typescript
const fullKey = `${section.key}_${key}`
const label = getQuestionLabel(fullKey)
const isCorruptionQuestion = 
  key.toLowerCase().includes('corruption') ||
  key.toLowerCase().includes('korapsyon') ||
  label.toLowerCase().includes('corruption') ||
  label.toLowerCase().includes('korapsyon')

if (!isAdmin && isCorruptionQuestion) {
  return // Skip this question
}
```

### 3. Added Debug Logging
Added console logging to help verify the filtering is working:

```typescript
console.log('DetailedResponsesView - User role:', user?.role, 'isAdmin:', isAdmin)
```

## Files Modified

1. **src/utils/questionLabels.ts**
   - Added missing corruption-related question labels
   - Ensures all corruption questions display proper human-readable text

2. **src/components/analytics/DetailedResponsesView.tsx**
   - Enhanced filtering logic to check both key and label
   - Added debug logging
   - Applied to both expanded view and detail modal

3. **src/components/analytics/SurveyAnalyticsDashboard.tsx**
   - Enhanced filtering logic in aggregated view
   - Checks both key and label for corruption-related content

## Testing Checklist

### As Admin User
- [ ] Login as admin or developer role
- [ ] Navigate to Analytics → Detailed Analytics
- [ ] Expand a response that has corruption questions
- [ ] Verify corruption questions ARE visible
- [ ] Check that labels show proper text (not raw field names)

### As Non-Admin User (Interviewer, Field Supervisor, Viewer)
- [ ] Login as non-admin role
- [ ] Navigate to Analytics → Detailed Analytics
- [ ] Expand a response that has corruption questions
- [ ] Verify corruption questions ARE NOT visible
- [ ] Check that other questions display normally

### In Aggregated View
- [ ] As admin: Navigate to Analytics → Aggregated view
- [ ] Verify corruption questions appear in the Financial Administration section
- [ ] As non-admin: Verify corruption questions do NOT appear

## Expected Behavior

### Admin/Developer Roles
- Can see ALL questions including corruption-related ones
- All questions display with proper human-readable labels
- No filtering applied

### Non-Admin Roles (Interviewer, Field Supervisor, Viewer)
- Cannot see any corruption-related questions
- Questions containing "corruption" or "korapsyon" in either the key or label are hidden
- All other questions display normally with proper labels

## Verification

To verify the fix is working:

1. Open browser console (F12)
2. Navigate to Detailed Analytics
3. Check console for: `DetailedResponsesView - User role: [role] isAdmin: [true/false]`
4. Verify `isAdmin` matches your user role
5. Expand a response and check if corruption questions appear based on your role

## Related Files

- `src/components/auth/AuthProvider.tsx` - Provides user role information
- `src/types/survey.ts` - Defines corruption question types
- `src/app/survey/forms/utils/questions.ts` - Defines corruption questions in survey form
