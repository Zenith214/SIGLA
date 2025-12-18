# NFA Field Transformation for Survey Submission

## Overview

This document describes the implementation of NFA (Need for Action) field transformation during survey form submission. The transformation ensures that field names follow a standardized convention and that data is validated before being sent to the API.

**Requirements Addressed:** 2.2, 2.3, 2.4, 3.1, 3.2

## Field Naming Convention

### Internal Format (Form)
During form data collection, fields use camelCase naming:
- Binary questions: `nfaBinary{Indicator}` (e.g., `nfaBinaryProjects`)
- Suggestion fields: `suggestions{Indicator}` (e.g., `suggestionsProjects`)

### Database Format (API)
When submitting to the API, fields are transformed to snake_case with full prefix:
- Binary questions: `need_for_action_binary_{indicator}` (e.g., `need_for_action_binary_projects`)
- Suggestion fields: `need_for_action_suggestion_{indicator}` (e.g., `need_for_action_suggestion_projects`)

## Service Indicators

The system supports 13 service indicators across 6 service areas:

### Financial Administration (4 indicators)
- `projects` - Construction projects
- `financial` - Financial transparency
- `social_programs` - Social programs
- `corruption` - Corruption perception

### Disaster Preparedness (2 indicators)
- `disaster_info` - Disaster information
- `evacuation` - Evacuation resources

### Safety & Peace Order (3 indicators)
- `tanods` - Barangay tanods
- `lupon` - Lupon/dispute resolution
- `anti_drug` - Anti-drug programs

### Social Protection (3 indicators)
- `health_services` - Health services
- `women_children_protection` - Women & children protection
- `community_participation` - Community participation

### Business Friendliness (1 indicator)
- `business_clearance` - Business clearance

### Environmental Management (1 indicator)
- `waste_management` - Waste management

## Language Support

The system handles both English and Tagalog binary values:

### English
- "Yes" - Service needs improvement
- "No" - Service does not need improvement

### Tagalog
- "Oo" - Service needs improvement
- "Hindi" - Service does not need improvement

### Mixed Format
- "Oo (Yes)" - Tagalog with English translation
- "Hindi (No)" - Tagalog with English translation

All values are normalized to English ("Yes"/"No") during transformation for consistent database storage.

## Validation Rules

### Binary Question Validation
1. Binary value must be one of: "Yes", "No", "Oo", "Hindi", "Oo (Yes)", "Hindi (No)"
2. Binary question is always required (validated at form level)

### Suggestion Field Validation
1. When binary answer is "Yes" or "Oo":
   - Suggestion field is REQUIRED
   - Suggestion must not be empty or whitespace-only
2. When binary answer is "No" or "Hindi":
   - Suggestion field is OPTIONAL
   - Empty suggestions are allowed

## Implementation

### Core Functions

#### `transformNFAFields(sectionData)`
Transforms field names from internal format to database format.

```typescript
const formData = {
  nfaBinaryProjects: 'Oo',
  suggestionsProjects: 'Need more projects'
};

const transformed = transformNFAFields(formData);
// Result:
// {
//   need_for_action_binary_projects: 'Yes',
//   need_for_action_suggestion_projects: 'Need more projects'
// }
```

#### `normalizeBinaryValue(value)`
Normalizes binary values to English format.

```typescript
normalizeBinaryValue('Oo') // Returns: 'Yes'
normalizeBinaryValue('Hindi') // Returns: 'No'
normalizeBinaryValue('Yes') // Returns: 'Yes'
```

#### `validateNFAFields(sectionData)`
Validates NFA fields in a section.

```typescript
const validation = validateNFAFields({
  nfaBinaryProjects: 'Yes',
  suggestionsProjects: '' // Invalid: Yes requires suggestion
});

// Result:
// {
//   isValid: false,
//   errors: ['Suggestion required for suggestionsProjects when binary answer is "Yes"']
// }
```

#### `validateAllSections(sections)`
Validates NFA fields across all sections.

```typescript
const validation = validateAllSections({
  financial: { data: { nfaBinaryProjects: 'Yes', suggestionsProjects: 'Test' } },
  disaster: { data: { nfaBinaryDisasterInfo: 'No', suggestionsDisasterInfo: '' } }
});

// Result:
// {
//   isValid: true,
//   errors: []
// }
```

### Submission Flow

1. **Form Data Collection**: User completes survey, data stored in `surveyData` state
2. **Section Preparation**: Each section's data is extracted from `surveyData[sectionDataKey]`
3. **Field Transformation**: `transformNFAFields()` converts field names to database format
4. **Validation**: `validateAllSections()` checks all NFA fields
5. **API Submission**: If validation passes, transformed data is sent to `/api/survey-responses`

### Code Location

- **Transformation utilities**: `src/app/survey/forms/utils/nfaFieldTransform.ts`
- **Submission logic**: `src/app/survey/forms/page.tsx` (in `onSubmit` handler)
- **Unit tests**: `src/app/survey/forms/utils/__tests__/nfaFieldTransform.test.ts`
- **Integration tests**: `src/app/survey/forms/utils/__tests__/submission-integration.test.ts`

## Example: Complete Submission

```typescript
// Original form data
const surveyData = {
  financialAdmin: {
    awarenessProjects: 'Oo',
    satisfactionProjects: '4',
    nfaBinaryProjects: 'Oo',
    suggestionsProjects: 'Kailangan ng mas maraming proyekto'
  }
};

// During submission
const sections = {
  financial: {
    data: transformNFAFields(surveyData.financialAdmin)
  }
};

// Validate
const validation = validateAllSections(sections);
if (!validation.isValid) {
  // Show error to user
  return;
}

// Submit to API
const response = await fetch('/api/survey-responses', {
  method: 'POST',
  body: JSON.stringify({
    surveyNumber: '...',
    sections: sections,
    // ... other fields
  })
});

// Transformed data sent to API:
// {
//   financial: {
//     data: {
//       awarenessProjects: 'Oo',
//       satisfactionProjects: '4',
//       need_for_action_binary_projects: 'Yes',
//       need_for_action_suggestion_projects: 'Kailangan ng mas maraming proyekto'
//     }
//   }
// }
```

## Error Handling

### Validation Errors
If validation fails, the submission is blocked and an error modal is shown to the user with details about which fields failed validation.

### Invalid Binary Values
If a binary field contains an invalid value (not Yes/No/Oo/Hindi), validation will fail with a specific error message.

### Missing Suggestions
If a binary answer is "Yes" but the suggestion is empty or whitespace-only, validation will fail with a message indicating which field needs a suggestion.

## Testing

### Unit Tests
Run unit tests for transformation and validation:
```bash
npm test -- src/app/survey/forms/utils/__tests__/nfaFieldTransform.test.ts
```

### Integration Tests
Run integration tests for complete submission flow:
```bash
npm test -- src/app/survey/forms/utils/__tests__/submission-integration.test.ts
```

## Future Considerations

1. **Database Migration**: When this feature is deployed, existing data may need to be migrated to use the new field naming convention
2. **Analytics Updates**: Analytics queries will need to be updated to use the new field names
3. **Mock Data Generator**: The mock data generator should be updated to use the new field names
4. **Backward Compatibility**: Consider supporting both old and new field names during a transition period
