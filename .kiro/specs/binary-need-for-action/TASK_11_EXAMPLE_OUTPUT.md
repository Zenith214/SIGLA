# Task 11: Example Generated Data

## Example 1: High Need for Action (needActionScore = 0.8)

### Financial Section (Tagalog)
```json
{
  "awarenessProjects": "Oo",
  "benefitedProjects": "Oo",
  "satisfactionProjects": "4",
  "need_for_action_binary_projects": "Oo",
  "need_for_action_suggestion_projects": "We need better road quality and more frequent maintenance.",
  
  "awarenessFinancial": "Oo",
  "usedFinancialInfo": "Oo",
  "satisfactionFinancial": "4",
  "need_for_action_binary_financial": "Oo",
  "need_for_action_suggestion_financial": "Make the budget documents easier to understand for regular residents.",
  
  "awarenessSocialPrograms": "Oo",
  "participatedSocialPrograms": "Oo",
  "satisfactionSocialPrograms": "4",
  "need_for_action_binary_socialPrograms": "Oo",
  "need_for_action_suggestion_socialPrograms": "More financial assistance for senior citizens is needed."
}
```

### Disaster Section (English)
```json
{
  "awarenessDisasterInfo": "Yes",
  "availmentDisasterInfo": "Yes",
  "satisfactionDisasterInfo": "4",
  "need_for_action_binary_disasterInfo": "Yes",
  "need_for_action_suggestion_disasterInfo": "More frequent disaster preparedness drills are needed.",
  
  "awarenessEvacuation": "Yes",
  "locationEvacuation": "Yes",
  "satisfactionEvacuation": "4",
  "need_for_action_binary_evacuation": "Yes",
  "need_for_action_suggestion_evacuation": "The evacuation center needs better facilities and supplies."
}
```

## Example 2: Low Need for Action (needActionScore = 0.2)

### Safety Section (English)
```json
{
  "awarenessTanods": "Yes",
  "experienceTanods": "Yes",
  "satisfactionTanods": "4",
  "need_for_action_binary_tanods": "No",
  "need_for_action_suggestion_tanods": null,
  
  "awarenessLupon": "Yes",
  "experienceLupon": "Yes",
  "satisfactionLupon": "4",
  "need_for_action_binary_lupon": "No",
  "need_for_action_suggestion_lupon": "Service is generally good.",
  
  "awarenessAntiDrug": "Yes",
  "experienceAntiDrug": "Yes",
  "satisfactionAntiDrug": "4",
  "need_for_action_binary_antiDrug": "No",
  "need_for_action_suggestion_antiDrug": null
}
```

### Social Section (English)
```json
{
  "awarenessHealthServices": "Yes",
  "availmentHealthServices": "Yes",
  "satisfactionHealthServices": "4",
  "need_for_action_binary_healthServices": "No",
  "need_for_action_suggestion_healthServices": null,
  
  "awarenessWomenChildrenProtection": "Yes",
  "availmentWomenChildrenProtection": "Yes",
  "satisfactionWomenChildrenProtection": "4",
  "need_for_action_binary_womenChildrenProtection": "No",
  "need_for_action_suggestion_womenChildrenProtection": "Keep up the current level of service.",
  
  "awarenessCommunityParticipation": "Yes",
  "availmentCommunityParticipation": "Yes",
  "satisfactionCommunityParticipation": "4",
  "need_for_action_binary_communityParticipation": "No",
  "need_for_action_suggestion_communityParticipation": null
}
```

## Key Observations

### For "Yes"/"Oo" Responses (needActionScore > 0.5)
- ✅ Binary field is always "Yes" or "Oo"
- ✅ Suggestion field is ALWAYS populated with actionable improvement text
- ✅ Suggestions are specific and actionable

### For "No"/"Hindi" Responses (needActionScore ≤ 0.5)
- ✅ Binary field is always "No" or "Hindi"
- ✅ Suggestion field is null approximately 85-90% of the time
- ✅ When populated (10-15% of time), suggestions are neutral/positive
- ✅ Examples: "Service is generally good.", "Keep up the current level of service.", "No major issues to report."

## Statistical Distribution (1000 responses with needActionScore = 0.2)

```
Binary "No" responses: 1000 (100%)
Suggestions populated: ~125 (12.5%)
Suggestions null: ~875 (87.5%)
```

This matches the requirement of 10-15% suggestion rate for "No" responses.

## Field Naming Convention

All fields follow the pattern:
- Binary: `need_for_action_binary_{indicator}`
- Suggestion: `need_for_action_suggestion_{indicator}`

Where `{indicator}` is one of:
- projects, financial, socialPrograms, corruption
- disasterInfo, evacuation
- tanods, lupon, antiDrug
- healthServices, womenChildrenProtection, communityParticipation
- businessClearance
- wasteManagement
