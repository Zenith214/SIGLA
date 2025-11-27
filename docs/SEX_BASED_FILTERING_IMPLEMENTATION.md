# Sex-Based Respondent Filtering Implementation

## Overview
Implemented automatic sex-based filtering for respondent selection based on questionnaire number parity, following CSIS methodology.

## Rule
- **Odd questionnaire numbers** (1, 3, 5, 7, ...) → Interview **MALE** respondents only
- **Even questionnaire numbers** (2, 4, 6, 8, ...) → Interview **FEMALE** respondents only

## Changes Made

### 1. Kish Grid Utility (`kishGrid.ts`)
Already had the `getRequiredGender()` function:
```typescript
export function getRequiredGender(questionnaireNumber: number): 'Male' | 'Female' {
  const isOdd = questionnaireNumber % 2 !== 0;
  return isOdd ? 'Male' : 'Female';
}
```

### 2. Respondent Selection Component (`respondent-selection.tsx`)

#### A. Import the function
```typescript
import { getRequiredGender } from "../utils/kishGrid"
```

#### B. Visual Indicator
Added a display showing which sex is required for the current questionnaire:
```typescript
<div className="mt-2 pt-2 border-t border-blue-200">
  <p className="text-sm text-gray-700">
    <span className="font-medium">Required Respondent Sex:</span>{" "}
    <span className="font-semibold text-blue-900">
      {getRequiredGender(extractQuestionnaireNumber(surveyNumber))}
    </span>
  </p>
  <p className="text-xs text-gray-600 mt-1">
    {extractQuestionnaireNumber(surveyNumber) % 2 !== 0 
      ? "Odd questionnaire numbers interview male respondents only" 
      : "Even questionnaire numbers interview female respondents only"}
  </p>
</div>
```

#### C. Automatic Filtering
Updated the `selectRespondent()` function to filter by required sex:
```typescript
// Determine required sex based on questionnaire number
const requiredSex = getRequiredGender(questionnaireNumber)

// Filter eligible members (age 18+ AND matching required sex)
const eligibleMembersList = householdMembers.filter((member) => {
  const age = calculateAge(member.birthdate)
  return age >= 18 && 
         member.name.trim() !== "" && 
         member.gender.trim() !== "" && 
         member.birthdate.trim() !== "" &&
         member.gender === requiredSex // Filter by required sex
})

// Check if there are any eligible members of the required sex
if (eligibleMembersList.length === 0) {
  alert(`No eligible ${requiredSex.toLowerCase()} household members found...`)
  return
}
```

#### D. Visual Feedback on Member Cards
Added color-coded indicators showing which members are eligible:
- **Green border + "✓ Eligible"** badge: Member matches required sex and is 18+
- **Red border + "Wrong sex"** badge: Member is wrong sex for this questionnaire
- **Gray border**: Incomplete information or under 18

```typescript
const isEligible = age >= 18 && member.gender === requiredSex && member.name.trim() !== ""
const isWrongSex = member.gender && requiredSex && member.gender !== requiredSex

<div className={`bg-white border rounded-lg p-4 transition-all ${
  isEligible 
    ? 'border-green-300 bg-green-50' 
    : isWrongSex 
    ? 'border-red-300 bg-red-50' 
    : 'border-gray-200'
}`}>
```

#### E. Instructional Note
Added a note above the household member list:
```typescript
<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
  <p className="text-sm text-gray-700">
    <strong>Note:</strong> Only list household members who are{" "}
    <strong>{getRequiredGender(...).toLowerCase()}</strong> and{" "}
    <strong>18 years or older</strong>. The Kish Grid will automatically select from eligible members.
  </p>
</div>
```

## User Experience Flow

### Example: Questionnaire #2026-001-1 (Odd = Male)

1. **Survey Number Display:**
   ```
   Survey Questionnaire Number: 2026-001-1
   Required Respondent Sex: Male
   Odd questionnaire numbers interview male respondents only
   ```

2. **Instructional Note:**
   ```
   Note: Only list household members who are male and 18 years or older.
   ```

3. **Member Input:**
   - User enters household members with their sex
   - Cards show visual feedback:
     - Male, 25 years → Green border, "✓ Eligible"
     - Female, 30 years → Red border, "Wrong sex for this questionnaire"
     - Male, 16 years → Gray border (under 18)

4. **Respondent Selection:**
   - Clicking "Select Respondent" automatically filters to only male members 18+
   - If no eligible males: Shows error message
   - If eligible males exist: Kish Grid selects from filtered list

### Example: Questionnaire #2026-001-2 (Even = Female)

Same flow, but filters for female respondents only.

## Benefits

1. **Automatic Compliance:** Ensures CSIS methodology is followed without manual intervention
2. **Clear Communication:** Users immediately see which sex is required
3. **Visual Feedback:** Color-coded cards help users understand eligibility
4. **Error Prevention:** Prevents selection of wrong-sex respondents
5. **User Guidance:** Instructional notes help enumerators understand the requirement

## Testing Checklist

- [ ] Odd questionnaire number (e.g., 2026-001-1) shows "Male" as required
- [ ] Even questionnaire number (e.g., 2026-001-2) shows "Female" as required
- [ ] Male members show green border for odd questionnaires
- [ ] Female members show red border for odd questionnaires
- [ ] Female members show green border for even questionnaires
- [ ] Male members show red border for even questionnaires
- [ ] Kish Grid only selects from correct-sex members
- [ ] Error message appears when no eligible members of required sex exist
- [ ] Selected respondent's sex matches the questionnaire requirement

## Database Impact

No database changes required. The sex filtering happens at the UI level before Kish Grid selection. The selected respondent's sex is still stored in the database as before.
