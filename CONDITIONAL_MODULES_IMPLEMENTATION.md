# Conditional Modules Implementation - All Sections

## Summary
Successfully implemented unawareness and unavailment conditional modules across **ALL survey sections**.

## What Was Done

### 1. Financial Section (Already Had Modules)
- ✅ Projects - both modules
- ✅ Financial Transparency - both modules  
- ✅ Social Programs - both modules
- ⚠️ Corruption - uses custom skip logic (not standard modules)

### 2. Disaster Section (Fixed & Enhanced)
- ✅ Disaster Information - both modules (language fixed to English)
- ✅ Evacuation - both modules (newly added)

### 3. Social Section (Newly Added)
- ✅ Health Services - both modules
- ✅ Women & Children Protection - both modules
- ✅ Community Participation - both modules

### 4. Safety Section (Newly Added)
- ✅ Tanods (Peacekeepers) - both modules
- ✅ Lupon (Dispute Resolution) - both modules
- ✅ Anti-Drug Programs - both modules

### 5. Business Section (Newly Added)
- ✅ Business Clearance - both modules

### 6. Environmental Section (Newly Added)
- ✅ Waste Management - both modules

## Module Types

### Unawareness Module
Triggered when respondent answers "No" to awareness question.
Asks: "What is the main reason you were not aware of this service?"

Options:
- I get my info from other sources (neighbors, social media), not directly from the barangay
- The barangay doesn't do enough to announce or promote their programs
- It's not a service I was actively looking for, so I might have missed the information
- Even if information is posted, it's hard to find or understand
- Other Reason (with text field)

### Non-Availment Module
Triggered when respondent is aware but didn't use the service.
Asks: "What was the main reason you or your household did not avail of it?"

Options:
- I/We did not need the service during that time
- The process seemed too difficult, complicated, or took too much time
- The location was too far, hard to get to, or the service hours were inconvenient
- I was concerned about the cost, fees, or other expenses involved
- I was not confident in the quality of the service or the staff providing it
- I thought I was not qualified, or I was told I was not eligible
- Other Reason (with text field)

## Service Indicators with Modules

Total: **15 service indicators** now have conditional modules

1. projects
2. financial
3. socialPrograms
4. disasterInfo
5. evacuation
6. healthServices
7. womenChildrenProtection
8. communityParticipation
9. tanods
10. lupon
11. antiDrug
12. businessClearance
13. wasteManagement

## Language Support

All modules properly support:
- **English** - for disaster, social, safety, business, environmental sections
- **Filipino** - for financial section (projects, financial, socialPrograms)

The language parameter is correctly passed to `createUnawarenessReasonQuestion()` and `createNonAvailmentReasonQuestion()` functions.

## Testing Recommendations

1. Test each section to verify modules appear correctly
2. Verify language translations display properly
3. Check that skip logic works (modules only show when conditions are met)
4. Verify "Other Reason" follow-up text fields appear
5. Test data submission includes conditional responses

## Files Modified

- `src/app/survey/forms/utils/questions.ts` - Added conditional modules to all sections
