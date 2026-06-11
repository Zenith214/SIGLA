# Survey Response API Multi-Visit Workflow Implementation

## Overview

This document summarizes the implementation of Task 4: "Enhance survey response API for multi-visit workflow" from the CSIS workflow upgrade specification.

## Implementation Date

November 15, 2025

## Changes Made

### 1. Enhanced POST /api/survey-responses Endpoint

**File:** `src/app/api/survey-responses/route.ts`

**Key Features:**
- Accepts `questionnaireId` and `spotId` in request body
- Checks if a record exists for the given `questionnaireId` + `cycle_id` combination
- **Update Mode:** If record exists, updates the existing survey response (multi-visit scenario)
- **Create Mode:** If record doesn't exist, creates a new survey response
- Auto-creates a visit record with outcome "Interview_Completed" when `questionnaireId` is provided
- Updates questionnaire status to "Completed" and increments visit_count
- Only updates survey target progress for new records (not updates)

**Request Body Schema:**
```typescript
{
  surveyNumber?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracy?: number;
    timestamp?: string;
    barangay: string;
    municipality: string;
    province: string;
  };
  selectedMember: string;
  interviewerId: number;
  barangayId: number;
  respondentDemographics: {
    age?: number;
    gender?: string;
    educationalAttainment?: string;
    householdIncome?: string;
    purok?: string;
  };
  sections: {
    [sectionKey: string]: {
      data: any;
    };
  };
  questionnaireId?: string;  // NEW: For CSIS workflow
  spotId?: number;           // NEW: For CSIS workflow
}
```

**Response Schema:**
```typescript
{
  success: boolean;
  responseId: number;
  surveyNumber: string;
  cycleId: number;
  cycleName: string;
  questionnaireId: string | null;
  isUpdate: boolean;         // NEW: Indicates if this was an update
  message: string;
}
```

### 2. Created POST /api/sync Endpoint for Bulk Synchronization

**File:** `src/app/api/sync/route.ts`

**Key Features:**
- Accepts an array of survey responses from IndexedDB
- Processes each response individually (create or update)
- Returns success/failure status for each response
- Handles partial sync scenarios gracefully
- Continues processing even if individual responses fail
- Provides detailed results for each synced item

**Request Body Schema:**
```typescript
{
  responses: Array<{
    // Same schema as POST /api/survey-responses
    surveyNumber?: string;
    location: { ... };
    selectedMember: string;
    interviewerId: number;
    barangayId: number;
    respondentDemographics: { ... };
    sections: { ... };
    questionnaireId?: string;
    spotId?: number;
  }>;
}
```

**Response Schema:**
```typescript
{
  success: boolean;          // true if all succeeded, false if any failed
  synced: number;            // Count of successfully synced responses
  failed: number;            // Count of failed responses
  total: number;             // Total number of responses in request
  results: Array<{
    questionnaireId: string;
    surveyNumber?: string;
    responseId?: number;
    status: 'success' | 'error';
    message?: string;
    error?: string;
  }>;
  message: string;
}
```

### 3. Created Comprehensive Integration Test

**File:** `scripts/test-survey-response-multi-visit.js`

**Test Coverage:**
1. **Test 1:** Submit initial survey response with questionnaire_id
2. **Test 2:** Verify visit was auto-created with "Interview_Completed" outcome
3. **Test 3:** Update existing survey response (multi-visit scenario)
4. **Test 4:** Verify questionnaire status is "Completed"
5. **Test 5:** Test bulk sync endpoint with multiple responses
6. **Test 6:** Test partial sync scenario (some succeed, some fail)

**Running the Test:**
```bash
# Set environment variables
$env:TEST_AUTH_TOKEN="your_auth_token_here"

# Run the test
node scripts/test-survey-response-multi-visit.js
```

## Database Changes

No new database migrations were required. The implementation uses existing schema from the CSIS workflow migration:

- `survey_response.questionnaire_id` (VARCHAR(50), nullable, unique)
- `survey_response.spot_id` (INT, nullable)
- `survey_response.visit_count` (INT, default 1)
- `questionnaires` table with status tracking
- `visits` table for visit history

## API Behavior

### Create vs Update Logic

The endpoint determines whether to create or update based on:
1. If `questionnaireId` is provided in the request
2. If a record exists with matching `questionnaire_id` AND `survey_cycle_id`

**Create:** New record is inserted with `visit_count = 1`
**Update:** Existing record is updated, `visit_count` is incremented

### Visit Record Creation

When a survey response is submitted with a `questionnaireId`:
1. A visit record is automatically created in the `visits` table
2. Visit number is auto-incremented based on existing visits
3. Outcome is set to "Interview_Completed"
4. Location coordinates are stored with the visit

### Questionnaire Status Update

When a survey response is completed:
1. Questionnaire status is updated to "Completed"
2. Questionnaire visit_count is incremented
3. This allows the FS dashboard to track completion progress

## Requirements Satisfied

### Requirement 5.4 (Multi-Visit Workflow - Subsequent Visits)
✅ FI can complete interview after callbacks
✅ Record status updated to "Completed" on success
✅ System handles multi-visit scenario correctly

### Requirement 10.2 (Survey Response API - Update)
✅ Endpoint checks if record exists for questionnaire_id + cycle_id
✅ Updates existing record when found
✅ Returns appropriate response indicating update vs create

### Requirement 10.3 (Survey Response API - Create)
✅ Creates new record when questionnaire_id is new
✅ Validates submitting user has permission
✅ Returns appropriate HTTP status codes

### Requirement 7.2 (Data Synchronization - Bulk Upload)
✅ Accepts array of survey responses from IndexedDB
✅ Processes each response (create or update)
✅ Returns success/failure status for each

### Requirement 7.3 (Data Synchronization - Persistence)
✅ Maintains records until successful synchronization
✅ Handles partial sync scenarios

### Requirement 7.4 (Data Synchronization - Error Handling)
✅ Displays error messages on sync failure
✅ Retains records for retry on failure

## Error Handling

### Survey Response Endpoint
- **400 Bad Request:** Missing required fields (location, interviewerId, barangayId)
- **400 Bad Request:** No active survey cycle found
- **500 Internal Server Error:** Database errors or unexpected failures

### Sync Endpoint
- **400 Bad Request:** Invalid request format or empty responses array
- **400 Bad Request:** No active survey cycle found
- **500 Internal Server Error:** Bulk sync processing failure
- **Partial Success:** Individual response failures are captured in results array

## Testing Instructions

### Prerequisites
1. Development server must be running: `npm run dev`
2. Database must have CSIS workflow migration applied
3. Test data must exist:
   - Active survey cycle (cycle_id = 1)
   - Test barangay (barangay_id = 26)
   - Test FI user (id = 2, role = "Interviewer")
4. Valid authentication token must be set in environment

### Running Tests

**Note:** The integration test requires a running development server and proper authentication. For manual testing without the automated script, you can use the following approaches:

#### Option 1: Manual API Testing (Recommended)
Use tools like Postman, Insomnia, or curl to test the endpoints directly:

```bash
# Test survey response creation
curl -X POST http://localhost:3000/api/survey-responses \
  -H "Content-Type: application/json" \
  -H "Cookie: pulse_token=YOUR_AUTH_TOKEN" \
  -d '{
    "questionnaireId": "2026-001-001",
    "spotId": 1,
    "location": {
      "lat": 8.4542,
      "lng": 124.6319,
      "address": "Test Address",
      "barangay": "Katipunan",
      "municipality": "Dipolog City",
      "province": "Zamboanga del Norte"
    },
    "selectedMember": "Test Respondent",
    "interviewerId": 2,
    "barangayId": 6,
    "respondentDemographics": {
      "age": 35,
      "gender": "Male"
    },
    "sections": {
      "financial": {
        "data": { "q1": "Satisfied" }
      }
    }
  }'

# Test bulk sync
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -H "Cookie: pulse_token=YOUR_AUTH_TOKEN" \
  -d '{
    "responses": [
      { /* survey response object */ }
    ]
  }'
```

#### Option 2: Automated Test Script
```bash
# Set auth token
$env:TEST_AUTH_TOKEN="your_token_here"

# Run the test
node scripts/test-survey-response-multi-visit.js
```

**Prerequisites for automated test:**
- Development server running on http://localhost:3000
- Valid authentication token
- Test data configured in the script:
  - TEST_CYCLE_ID = 18 (Active cycle)
  - TEST_BARANGAY_ID = 6 (Katipunan)
  - TEST_FI_ID = 2 (Interviewer User)

### Expected Behavior
The enhanced API will:
1. Accept survey responses with questionnaire_id
2. Check if a record exists for that questionnaire in the current cycle
3. Update existing record (multi-visit) or create new record
4. Auto-create visit record with "Interview_Completed" outcome
5. Update questionnaire status to "Completed"
6. Return appropriate response indicating create vs update

## Integration with Existing Features

### Backward Compatibility
The enhanced endpoint maintains full backward compatibility:
- Existing survey submissions without `questionnaireId` work as before
- Survey target progress tracking continues to function
- All existing validation and data mapping is preserved

### Survey Cycle Integration
- All operations are scoped to the active survey cycle
- Cycle ID is automatically retrieved and used for all queries
- Multi-visit updates are matched by both questionnaire_id AND cycle_id

### Visit Tracking Integration
- Integrates with the visit tracking API implemented in Task 3
- Auto-creates visit records to maintain complete audit trail
- Visit numbers are auto-incremented correctly

## Future Enhancements

Potential improvements for future iterations:
1. Add transaction support for atomic operations
2. Implement optimistic locking to prevent concurrent update conflicts
3. Add webhook notifications for sync completion
4. Implement batch size limits for sync endpoint
5. Add progress callbacks for long-running sync operations

## Related Documentation

- [CSIS Workflow Migration Summary](./CSIS-MIGRATION-SUMMARY.md)
- [Visit Tracking API Implementation](./VISIT_TRACKING_API_IMPLEMENTATION.md)
- [Spot Management API Implementation](./SPOT_MANAGEMENT_API_IMPLEMENTATION.md)
- [Requirements Document](./.kiro/specs/csis-workflow-upgrade/requirements.md)
- [Design Document](./.kiro/specs/csis-workflow-upgrade/design.md)

## Conclusion

Task 4 has been successfully implemented with all subtasks completed:
- ✅ 4.1: Updated POST /api/survey-responses endpoint
- ✅ 4.2: Created POST /api/sync endpoint for bulk sync
- ✅ 4.3: Wrote comprehensive API integration tests

The implementation provides a robust foundation for the multi-visit workflow, enabling Field Interviewers to complete surveys across multiple visits while maintaining data integrity and providing detailed sync capabilities for offline-first functionality.
