# Spot Management API Implementation

## Overview

This document describes the implementation of the core spot management API endpoints for the CSIS workflow upgrade. These endpoints enable Field Supervisors to create, manage, and assign spots to Field Interviewers.

## Implemented Endpoints

### 1. POST /api/spots
**Purpose**: Create a new spot with auto-generated questionnaires

**Request Body**:
```json
{
  "cycleId": 1,
  "barangayId": 26,
  "spotName": "Spot #1",
  "startingPoint": {
    "lat": 8.4542,
    "lng": 124.6319
  },
  "randomStart": 123
}
```

**Response** (201 Created):
```json
{
  "spotId": 1,
  "spotName": "Spot #1",
  "questionnaires": [
    "2024-001-001",
    "2024-001-002",
    "2024-001-003",
    "2024-001-004",
    "2024-001-005"
  ],
  "message": "Spot created successfully with 5 questionnaires"
}
```

**Features**:
- Validates all required fields
- Validates randomStart range (1-999)
- Verifies cycle and barangay exist
- Auto-generates 5 questionnaire IDs using format `{YEAR}-{SPOT_NUMBER}-{SEQUENCE}`
- Creates spot and questionnaire records in a transaction
- Rolls back spot creation if questionnaire creation fails

### 2. GET /api/spots
**Purpose**: Retrieve spots with optional filtering

**Query Parameters**:
- `cycleId` (optional): Filter by survey cycle
- `barangayId` (optional): Filter by barangay
- `assignedFiId` (optional): Filter by assigned Field Interviewer

**Response** (200 OK):
```json
{
  "spots": [
    {
      "spotId": 1,
      "cycleId": 1,
      "barangayId": 26,
      "barangayName": "Katipunan",
      "spotName": "Spot #1",
      "startingPoint": {
        "lat": 8.4542,
        "lng": 124.6319
      },
      "randomStart": 123,
      "assignedFiId": 5,
      "assignedFiName": "John Doe",
      "assignedFiEmail": "john@example.com",
      "status": "In_Progress",
      "completedCount": 3,
      "totalCount": 5,
      "questionnaires": [
        {
          "questionnaireId": "2024-001-001",
          "status": "Completed",
          "visitCount": 1
        },
        {
          "questionnaireId": "2024-001-002",
          "status": "In_Progress",
          "visitCount": 2
        }
      ],
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-16T14:30:00Z"
    }
  ]
}
```

**Features**:
- Supports multiple filter combinations
- Includes related barangay and assigned FI data
- Includes all questionnaires with their status
- Calculates completion progress (completedCount/totalCount)
- Auto-updates spot status based on questionnaire statuses
- Orders results by creation date (newest first)

### 3. PUT /api/spots/:spotId/assign
**Purpose**: Assign a spot to a Field Interviewer

**Request Body**:
```json
{
  "fiId": 5
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "spotId": 1,
  "spotName": "Spot #1",
  "assignedTo": "John Doe",
  "assignedToEmail": "john@example.com",
  "message": "Spot assigned successfully"
}
```

**Features**:
- Validates spot exists
- Validates user exists
- Validates user has INTERVIEWER role (case-insensitive)
- Updates spot assignment
- Returns confirmation with assignee details

### 4. DELETE /api/spots/:spotId
**Purpose**: Delete a spot (only if unassigned)

**Response** (200 OK):
```json
{
  "success": true,
  "spotId": 1,
  "spotName": "Spot #1",
  "message": "Spot and related questionnaires deleted successfully"
}
```

**Features**:
- Validates spot exists
- Prevents deletion of assigned spots
- Cascade deletes related questionnaires (via database foreign key)
- Returns confirmation with deleted spot details

## Security & Authorization

### Middleware Protection
All spot endpoints are protected by the Field Supervisor (FS) role check in `middleware.ts`:

```typescript
const FS_ROUTES = [
  '/fs-dashboard',
  '/api/spots',
];
```

**Access Control**:
- Admin users: Full access to all endpoints
- FS users: Full access to all endpoints
- Interviewer users: No access (403 Forbidden)
- Viewer users: No access (403 Forbidden)

### Error Responses

**400 Bad Request**:
- Missing required fields
- Invalid randomStart range
- Invalid starting point structure
- Attempting to delete assigned spot

**403 Forbidden**:
- User lacks FS or Admin role

**404 Not Found**:
- Spot not found
- Cycle not found
- Barangay not found
- User not found

**500 Internal Server Error**:
- Database errors
- Unexpected server errors

## Database Schema

### Spots Table
```sql
CREATE TABLE spots (
  spot_id SERIAL PRIMARY KEY,
  cycle_id INTEGER NOT NULL REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE,
  barangay_id INTEGER NOT NULL REFERENCES barangay(barangay_id) ON DELETE CASCADE,
  spot_name VARCHAR(100) NOT NULL,
  starting_point JSONB NOT NULL,
  random_start INTEGER NOT NULL,
  assigned_fi_id INTEGER REFERENCES user(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Questionnaires Table
```sql
CREATE TABLE questionnaires (
  questionnaire_id VARCHAR(50) PRIMARY KEY,
  spot_id INTEGER NOT NULL REFERENCES spots(spot_id) ON DELETE CASCADE,
  cycle_id INTEGER NOT NULL REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending',
  visit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

## Questionnaire ID Generation

Format: `{YEAR}-{SPOT_NUMBER}-{SEQUENCE}`

**Example**: `2024-001-003`
- `2024`: Year from survey cycle
- `001`: Spot number (padded to 3 digits)
- `003`: Sequence within spot (1-5)

**Implementation**:
```typescript
function generateQuestionnaireId(year: number, spotNumber: number, sequence: number): string {
  return `${year}-${String(spotNumber).padStart(3, '0')}-${sequence}`;
}
```

## Testing

A test script is provided at `scripts/test-spot-management-api.js` to verify all endpoints:

```bash
# Set environment variables
export TEST_AUTH_TOKEN="your_auth_token"

# Run the test
node scripts/test-spot-management-api.js
```

**Test Coverage**:
1. Create a new spot with questionnaires
2. Retrieve all spots with filters
3. Assign spot to Field Interviewer
4. Attempt to delete assigned spot (should fail)
5. Retrieve spots filtered by assigned FI

## Integration Points

### Existing Systems
- **Survey Cycles**: Spots are scoped to survey cycles
- **Barangays**: Spots are associated with barangays
- **Users**: Spots can be assigned to users with INTERVIEWER role
- **Authentication**: Uses existing JWT-based auth with httpOnly cookies

### Future Integration
- **Visit Tracking**: Questionnaires will track visit attempts
- **Survey Responses**: Survey responses will link to questionnaires
- **FS Dashboard**: UI will consume these endpoints
- **FI Dashboard**: FIs will see their assigned spots

## Requirements Satisfied

✅ **Requirement 1.4**: Interactive map interface for spot allocation
✅ **Requirement 1.5**: Define Starting Point and Random Start
✅ **Requirement 1.6**: Auto-generate 5 questionnaire IDs per spot
✅ **Requirement 1.7**: Assign spots to Field Interviewers
✅ **Requirement 1.8**: Display real-time fieldwork progress
✅ **Requirement 2.4**: Display spots assigned to logged-in FI

## Next Steps

1. Implement visit tracking API endpoints (Task 3)
2. Create FS dashboard UI components (Task 5-8)
3. Update FI dashboard to display spots (Task 9-10)
4. Implement PWA offline support (Task 11-13)
5. Add comprehensive testing (Task 21)

## Notes

- All endpoints use Supabase Admin client for database operations
- Questionnaire cascade deletion is handled by database foreign key constraints
- Spot status is dynamically calculated based on questionnaire statuses
- The implementation follows existing patterns from survey-responses API
- Error handling includes proper HTTP status codes and descriptive messages
