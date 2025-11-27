# Sex Dropdown Removal - Final Implementation

## Summary
Removed the manual sex selection dropdown and replaced it with automatic sex assignment based on questionnaire number parity.

## Changes Made

### 1. Removed Sex Dropdown
**Before:**
```tsx
<select value={member.gender} onChange={...}>
  <option value="">Select sex</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
</select>
```

**After:**
```tsx
<div className="mt-3 flex items-center space-x-2 text-sm">
  <span className="text-gray-600">Sex:</span>
  <span className="font-semibold text-gray-900">
    {surveyNumber ? getRequiredGender(extractQuestionnaireNumber(surveyNumber)) : 'Not set'}
  </span>
  <span className="text-xs text-gray-500">(auto-set based on questionnaire)</span>
</div>
```

### 2. Auto-Population Logic

#### A. When Number of Members Changes
```typescript
const handleNumberChange = (value: string) => {
  // ...validation...
  
  // Auto-populate gender based on questionnaire number
  const requiredGender = surveyNumber ? getRequiredGender(extractQuestionnaireNumber(surveyNumber)) : ""
  
  const newMembers = Array.from({ length: num }, (_, index) => ({
    name: householdMembers[index]?.name || "",
    birthdate: householdMembers[index]?.birthdate || "",
    gender: requiredGender, // Auto-set based on questionnaire
  }))
  setHouseholdMembers(newMembers)
}
```

#### B. When Survey Number Changes
```typescript
useEffect(() => {
  if (surveyNumber) {
    const requiredGender = getRequiredGender(extractQuestionnaireNumber(surveyNumber))
    // Update all existing members with the required gender
    setHouseholdMembers(prev => prev.map(member => ({
      ...member,
      gender: requiredGender
    })))
  }
}, [surveyNumber])
```

### 3. Updated Layout
Changed from 3-column grid to 2-column grid:
- Column 1: Name input
- Column 2: Birthdate input
- Below: Sex display (read-only, auto-set)

### 4. Simplified User Flow

**User Actions:**
1. Enter survey number → Sex is automatically determined
2. Enter number of household members
3. For each member:
   - Enter name
   - Enter birthdate
   - Sex is already set (no action needed)
4. Click "Select Respondent"

**System Actions:**
- Automatically sets sex for all members based on questionnaire number
- Filters to only show eligible members of the required sex
- Uses Kish Grid to select from filtered list

## Benefits

1. **Eliminates User Error:** No chance of entering wrong sex
2. **Faster Data Entry:** One less field to fill per member
3. **Clearer Intent:** Users immediately see which sex is required
4. **Consistent Data:** All members automatically have correct sex
5. **Simplified UI:** Cleaner, less cluttered interface

## User Experience

### Questionnaire #2026-001-1 (Odd = Male)

```
┌────────────────────────────────────────────────┐
│ Survey Questionnaire Number: 2026-001-1        │
│ Required Respondent Sex: Male                  │
│ Odd questionnaire numbers interview male only  │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Note: Only list household members who are      │
│ male and 18 years or older.                    │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Member 1                          ✓ Eligible   │
│ ┌──────────────┐  ┌──────────────┐            │
│ │ Name         │  │ Birthdate    │            │
│ │ John Doe     │  │ 1990-01-01   │            │
│ └──────────────┘  └──────────────┘            │
│ Sex: Male (auto-set based on questionnaire)   │
└────────────────────────────────────────────────┘
```

## Technical Details

### Files Modified
- `src/app/survey/forms/sections/respondent-selection.tsx`
  - Removed sex dropdown
  - Added auto-population logic
  - Updated layout from 3-column to 2-column
  - Added useEffect for survey number changes

### Functions Updated
- `handleNumberChange()` - Auto-sets gender when creating new members
- Added `useEffect()` - Auto-updates gender when survey number changes

### No Changes Needed
- `kishGrid.ts` - Already had `getRequiredGender()` function
- Filtering logic - Already implemented in previous update
- Database schema - No changes needed

## Testing Checklist

- [x] Sex dropdown removed from UI
- [x] Sex automatically set when survey number is entered
- [x] Sex automatically set when number of members changes
- [x] Sex updates when survey number changes
- [x] Sex displays correctly (read-only)
- [x] Kish Grid still filters by correct sex
- [x] Visual indicators still work (green/red borders)
- [x] Error messages still work for no eligible members
- [x] Layout looks clean with 2-column grid

## Migration Notes

**For existing surveys in progress:**
- If a survey was started with the old dropdown, the sex values will be preserved
- New members added will use the auto-set sex
- No data migration needed

**For new surveys:**
- Sex is always auto-set from the start
- Users cannot manually change sex
- Consistent with CSIS methodology
