# Synthetic Data Generation Tool Update

## Overview

The synthetic data generation tool needs to be updated to match the new spot-based survey system with the `YYYY-BB-SS-QQQ` questionnaire ID format.

## Current System Architecture

### Questionnaire ID Format: `YYYY-BB-SS-QQQ`
- `YYYY`: Year (e.g., 2026)
- `BB`: Barangay ID (e.g., 18)
- `SS`: Spot number (01, 02, 03...)
- `QQQ`: Questionnaire number within spot (001, 002, 003...)

### Example IDs:
- `2026-18-01-001` - Year 2026, Barangay 18, Spot 1, Questionnaire 1 (Male)
- `2026-18-01-002` - Year 2026, Barangay 18, Spot 1, Questionnaire 2 (Female)
- `2026-18-02-001` - Year 2026, Barangay 18, Spot 2, Questionnaire 1 (Male)

## Required Updates

### 1. Spot-Based Generation
Instead of generating responses directly for a barangay, the tool should:
1. Create spots in the barangay
2. Generate questionnaires for each spot (5 per spot by default)
3. Generate survey responses for each questionnaire

### 2. Questionnaire ID Generation
Use the new format parser:
```typescript
import { formatQuestionnaireId } from '@/utils/questionnaireIdParser';

const questionnaireId = formatQuestionnaireId(
  year,        // 2026
  barangayId,  // 18
  spotNumber,  // 1
  questionnaireNumber  // 1
);
// Result: "2026-18-01-001"
```

### 3. Gender Assignment
- Odd questionnaire numbers (001, 003, 005) → Male respondents
- Even questionnaire numbers (002, 004) → Female respondents

### 4. CSIS Service Area Randomization
Use the CSIS randomization map for service area order:
```typescript
import { getSectionOrder } from '@/app/survey/forms/utils/sectionAssignment';

// Get all 6 sections in randomized order
const sections = getSectionOrder(questionnaireNumber);
// Returns: ['financial', 'disaster', 'social', 'safety', 'business', 'environmental']
// Order varies based on questionnaire number
```

### 5. GPS Verification
Generate realistic GPS coordinates near the spot's starting point:
```typescript
const spotLocation = { lat: 7.1234, lng: 125.5678 };
const interviewLocation = {
  lat: spotLocation.lat + (Math.random() - 0.5) * 0.002,  // ~200m variance
  lng: spotLocation.lng + (Math.random() - 0.5) * 0.002,
  accuracy: 10 + Math.random() * 20
};
```

### 6. Visit History
Generate realistic visit patterns:
- 80% complete on first visit
- 15% require callbacks (2-3 visits)
- 5% flagged (NQR, OR, or Household Moved)

## New Tool Structure

```typescript
POST /api/tools/generate-synthetic-data

Request Body:
{
  barangayId: number,
  cycleId: number,
  numberOfSpots: number,        // How many spots to create
  questionnairesPerSpot: number, // Default: 5
  profile: string                // 'balanced', 'high-performer', etc.
}

Response:
{
  success: true,
  spotsCreated: number,
  questionnairesGenerated: number,
  responsesGenerated: number,
  spots: [
    {
      spotId: number,
      spotName: string,
      questionnaires: string[]  // Array of questionnaire IDs
    }
  ]
}
```

## Implementation Steps

1. ✅ Document current system architecture
2. ⏳ Create new synthetic data generation API
3. ⏳ Update tools page UI
4. ⏳ Add spot creation logic
5. ⏳ Add questionnaire generation with new ID format
6. ⏳ Add survey response generation with CSIS randomization
7. ⏳ Add visit history generation
8. ⏳ Add GPS verification data
9. ⏳ Test with different profiles

## Testing Scenarios

### Scenario 1: Single Spot
- Create 1 spot in McKinley (Barangay 18)
- Generate 5 questionnaires
- Generate 5 complete responses
- Verify questionnaire IDs: `2026-18-01-001` through `2026-18-01-005`

### Scenario 2: Multiple Spots
- Create 3 spots in McKinley
- Generate 15 questionnaires total (5 per spot)
- Generate 15 responses
- Verify spot numbering: 01, 02, 03

### Scenario 3: Callback Scenarios
- Generate responses with visit history
- 15% should have 2-3 visits
- Verify visit outcomes logged correctly

### Scenario 4: GPS Verification
- All responses should have GPS coordinates
- Coordinates should be within ~200m of spot location
- Some should be flagged if distance > 200m

## Benefits

✅ **Realistic Test Data** - Matches actual survey workflow  
✅ **CSIS Compliant** - Uses proper randomization  
✅ **Complete Coverage** - All 6 service areas included  
✅ **GPS Verification** - Tests location tracking  
✅ **Visit History** - Tests callback protocol  
✅ **Gender Balance** - Automatic 50/50 split  

## Next Steps

Create the new synthetic data generation tool at:
`src/app/api/tools/generate-synthetic-data/route.ts`

Update the tools page to use the new endpoint.
