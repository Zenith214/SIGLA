# Mock Data Generator - Purok/Sitio Support

## Summary
Updated the mock data generator to include realistic purok/sitio values when generating test survey responses.

## Changes Made

### 1. Updated `generateDemographics()` Function
**File:** `src/app/api/tools/generate-mock-survey-data/route.ts`

Added purok/sitio generation logic:
- 70% of generated responses will have a purok/sitio value
- 30% will have an empty purok field (realistic scenario)
- Two types of purok/sitio names:
  - **Numbered Puroks:** "Purok 1", "Purok 2", etc. (1-8)
  - **Named Sitios:** "Sitio Riverside", "Sitio Hillside", etc.

**Sample Purok/Sitio Values:**
- Purok 1, Purok 2, Purok 3, Purok 4, Purok 5, Purok 6, Purok 7, Purok 8
- Sitio Riverside, Sitio Hillside, Sitio Sunshine, Sitio Greenfield
- Sitio Harmony, Sitio Unity, Sitio Progress, Sitio Victory
- Sitio Peace, Sitio Hope, Sitio San Roque, Sitio San Jose
- Sitio San Miguel, Sitio Santa Cruz, Sitio Santo Niño

### 2. Updated Database Insert Query
**File:** `src/app/api/tools/generate-mock-survey-data/route.ts`

Modified the `submitSurveyResponse()` function to:
- Include `respondent_purok` in the INSERT query
- Pass the purok value from demographics (or null if empty)
- Properly handle the additional parameter in the query

## Database Schema
The `survey_response` table already has the `respondent_purok` field:
```sql
respondent_purok VARCHAR(191) DEFAULT NULL
```

## Testing
To test the new purok/sitio generation:

1. Go to the Tools page (`/tools`)
2. Select a barangay with available survey targets
3. Generate mock data (any profile)
4. Check the generated responses in the database or analytics

You should see:
- ~70% of responses with purok/sitio values
- ~30% of responses with empty purok field
- Mix of numbered puroks and named sitios

## Benefits
- **More Realistic Data:** Mock data now includes geographic subdivision information
- **Demographics Analytics:** Purok/sitio data can be used for more detailed demographic analysis
- **Testing Coverage:** Ensures the system properly handles both filled and empty purok fields
- **Data Quality:** Helps test filtering and grouping by purok/sitio in analytics

## Related Files
- `src/app/api/tools/generate-mock-survey-data/route.ts` - Mock data generator
- `src/app/api/survey-responses/route.ts` - Real survey response handler (already supports purok)
- `src/app/survey/forms/sections/respondent-demographics.tsx` - Demographics form with purok field
- `src/components/analytics/DemographicsAnalytics.tsx` - Demographics analytics display

## Notes
- The purok field is optional in the actual survey form
- Mock data generator mirrors this behavior with 30% empty values
- Purok/sitio names are culturally appropriate for Philippine barangays
- The distribution (70/30) can be adjusted if needed for specific testing scenarios
