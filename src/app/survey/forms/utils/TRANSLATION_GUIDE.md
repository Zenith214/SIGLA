# Survey Translation Guide

## Overview

This guide explains how to add Bisaya translations to the survey forms. The system now supports three languages:
- **Bisaya** (default)
- **Filipino**
- **English**

## Files Modified

1. **src/contexts/LanguageContext.tsx** - Language state management
2. **src/app/survey/forms/components/LanguageSelector.tsx** - Tab selector UI
3. **src/app/survey/forms/utils/translations.ts** - Translation data
4. **src/app/survey/forms/sections/question-flow.tsx** - Updated to use translations

## How to Add Translations

### Step 1: Open the Translation File

Edit: `src/app/survey/forms/utils/translations.ts`

### Step 2: Fill in Missing Translations

The file is structured by section. Each question has three language versions:

```typescript
questionId: {
  bisaya: "Bisaya text here",
  filipino: "Filipino text here",
  english: "English text here"
}
```

### Step 3: Reference the Word Document

Open `SURVEY-QUESTIONS-2-ELECTRIC-BOOGALOO.docx` and copy the Bisaya translations for each question.

### Current Status

✅ **Completed Sections:**
- Financial Administration (Part A, B, C, D - all questions translated)
- Overall Evaluation (both questions translated)

⚠️ **Needs Translation:**
- Disaster Preparedness (all questions)
- Safety & Peace Order (all questions)
- Social Protection (all questions)
- Business Friendliness (all questions)
- Environmental Management (all questions)

### Example: Adding Disaster Section Translations

```typescript
disaster: {
  awarenessDisasterInfo: {
    bisaya: "[Copy Bisaya text from Word doc]",
    filipino: "Are you aware that the barangay has plans...",
    english: "Are you aware that the barangay has plans..."
  },
  availmentDisasterInfo: {
    bisaya: "[Copy Bisaya text from Word doc]",
    filipino: "Have you personally received...",
    english: "Have you personally received..."
  },
  // ... continue for all questions
}
```

## Question ID Mapping

### Financial Section
- `awarenessProjects` - Q1: Awareness of barangay projects
- `benefitedProjects` - Q2: Personal benefit from projects
- `satisfactionProjects` - Q3: Satisfaction with projects
- `nfaBinaryProjects` - Q4: Need for action
- `suggestionsProjects` - Q5: Suggestions for improvement
- `awarenessFinancial` - Q5: Awareness of budget posting
- `usedFinancialInfo` - Q6: Attended assembly
- `satisfactionFinancial` - Q7: Satisfaction with transparency
- `nfaBinaryFinancial` - Q8: Need for action
- `suggestionsFinancial` - Q9: Suggestions
- `awarenessSocialPrograms` - Q9: Awareness of social programs
- `participatedSocialPrograms` - Q10: Participation
- `satisfactionSocialPrograms` - Q11: Satisfaction
- `nfaBinarySocialPrograms` - Q12: Need for action
- `suggestionsSocialPrograms` - Q13: Suggestions
- `awarenessCorruption` - Q13: Awareness of anti-corruption
- `experiencedCorruption` - Q14: Experience with corruption
- `detailsCorruption` - Q15: Details
- `reportedCorruption` - Q16: Reported incident
- `reasonsNotReporting` - Q17: Reasons for not reporting
- `satisfactionReportResponse` - Q18: Satisfaction with response
- `nfaBinaryCorruption` - Q19: Need for action
- `suggestionsCorruption` - Q20: Suggestions

### Disaster Section
- `awarenessDisasterInfo` - Q1: Awareness of disaster info
- `availmentDisasterInfo` - Q2: Received disaster info
- `satisfactionDisasterInfo` - Q3: Satisfaction
- `nfaBinaryDisasterInfo` - Q4: Need for action
- `suggestionsDisasterInfo` - Q5: Suggestions
- `awarenessEvacuation` - Q5: Awareness of evacuation center
- `locationEvacuation` - Q6: Know location
- `satisfactionEvacuation` - Q7: Satisfaction
- `nfaBinaryEvacuation` - Q8: Need for action
- `suggestionsEvacuation` - Q9: Suggestions

### Safety Section
- `awarenessTanods` - Q1: Awareness of Tanods
- `experienceTanods` - Q2: Experience with Tanods
- `satisfactionTanods` - Q3: Satisfaction
- `nfaBinaryTanods` - Q4: Need for action
- `suggestionsTanods` - Q5: Suggestions
- `awarenessLupon` - Q5: Awareness of Lupon
- `experienceLupon` - Q6: Experience with Lupon
- `satisfactionLupon` - Q7: Satisfaction
- `nfaBinaryLupon` - Q8: Need for action
- `suggestionsLupon` - Q9: Suggestions
- `awarenessAntiDrug` - Q9: Awareness of anti-drug programs
- `experienceAntiDrug` - Q10: Experience
- `satisfactionAntiDrug` - Q11: Satisfaction
- `nfaBinaryAntiDrug` - Q12: Need for action
- `suggestionsAntiDrug` - Q13: Suggestions

### Social Section
- `awarenessHealthServices` - Q1: Awareness of health services
- `availmentHealthServices` - Q2: Used health services
- `satisfactionHealthServices` - Q3: Satisfaction
- `nfaBinaryHealthServices` - Q4: Need for action
- `suggestionsHealthServices` - Q5: Suggestions
- `awarenessWomenChildrenProtection` - Q5: Awareness of VAW desk
- `availmentWomenChildrenProtection` - Q6: Know how to access
- `satisfactionWomenChildrenProtection` - Q7: Satisfaction
- `nfaBinaryWomenChildrenProtection` - Q8: Need for action
- `suggestionsWomenChildrenProtection` - Q9: Suggestions
- `awarenessCommunityParticipation` - Q9: Awareness of community programs
- `availmentCommunityParticipation` - Q10: Participated
- `satisfactionCommunityParticipation` - Q11: Satisfaction
- `nfaBinaryCommunityParticipation` - Q12: Need for action
- `suggestionsCommunityParticipation` - Q13: Suggestions

### Business Section
- `awarenessBusinessClearance` - Q1: Awareness of clearance
- `availmentBusinessClearance` - Q2: Applied for clearance
- `satisfactionBusinessClearance` - Q3: Satisfaction
- `nfaBinaryBusinessClearance` - Q4: Need for action
- `suggestionsBusinessClearance` - Q5: Suggestions

### Environmental Section
- `awarenessWasteManagement` - Q1: Awareness of waste management
- `availmentWasteManagement` - Q2: Follow segregation rules
- `satisfactionWasteManagement` - Q3: Satisfaction
- `nfaBinaryWasteManagement` - Q4: Need for action
- `suggestionsWasteManagement` - Q5: Suggestions

### Overall Section
- `overallSatisfaction` - M1: Overall satisfaction
- `overallNeedForAction` - M2: Overall need for action

## Common Option Translations

The system automatically translates common options:

| English | Filipino | Bisaya |
|---------|----------|--------|
| Yes | Oo | Oo |
| No | Hindi | Dili |
| 5 - Very Satisfied | 5 - Lubos na Nasiyahan | 5 - Hilabihan ka Tagbaw |
| 4 - Satisfied | 4 - Nasiyahan | 4 - Tagbaw |
| 3 - Neutral | 3 - Neutral | 3 - Neutral |
| 2 - Dissatisfied | 2 - Hindi Nasiyahan | 2 - Dili Tagbaw |
| 1 - Very Dissatisfied | 1 - Lubos na Hindi Nasiyahan | 1 - Hilabihan ka Dili Tagbaw |

## Testing

After adding translations:

1. Run the development server: `npm run dev`
2. Navigate to the survey forms
3. Click through each language tab (Bisaya, Filipino, English)
4. Verify all questions display correctly in each language
5. Test that answers are saved regardless of language selection

## Notes

- The language preference is saved in localStorage
- Bisaya is the default language
- Changing language does not affect saved answers
- All answers are stored with the same question IDs regardless of language
- The system falls back to the question ID if a translation is missing

## Need Help?

If you encounter issues:
1. Check the browser console for warnings about missing translations
2. Verify the question ID matches between `questions.ts` and `translations.ts`
3. Ensure the translation text is properly escaped (use backticks for multi-line text)
