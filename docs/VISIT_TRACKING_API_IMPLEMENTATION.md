# Visit Tracking API Implementation

## Overview

This document describes the implementation of Task 3: Visit Tracking API endpoints for the CSIS workflow upgrade. These endpoints enable Field Interviewers to log visit attempts, track callback history, and retrieve their assigned work.

## Implemented Endpoints

### 1. POST /api/visits

**Purpose**: Log a visit attempt to a questionnaire (household interview)

**Endpoint**: `/api/visits`

**Method**: POST

**Request Body**:
```json
{
  "questionnaireId": "2024-001-003",
  "outcome": "Callback_Needed",
  "notes": "No one home, will return tomorrow",
  "location": {
    "lat": 8.1234,
    "lng": 123.4567
  }
}
```

**Required Fields**:
- `questionnaireId` (string): The questionnaire ID
- `outcome` (string): One of: `Callback_Needed`, `Interview_Started`, `Interview_Completed`, `Refused`, `Household_Moved`

**Optional Fields**:
- `notes` (string): Field diary notes
- `location` (object): GPS coordinates with `lat` and `lng`

**Response** (201 Created):
```json
{
  "visitId": 123,
  "visitNumber": 1,
  "questionnaireStatus": "In_Progress",
  "message": "Visit logged successfully"
}
```

**Behavior**:
- Increments `visit_count` on the questionnaire
- Updates questionnaire status based on outcome:
  - `Interview_Completed` → Status: `Completed`
  - `Interview_Started` → Status: `In_Progress`
  - `Callback_Needed`, `Refused`, `Household_Moved` → Status: `In_Progress`
  - After 3 failed attempts → Status: `Flagged_For_Substitution`
- Creates a visit record with timestamp and details

**Error Responses**:
- 400: Missing required fields or invalid outcome
- 404: Questionnaire not found
- 500: Server error

---

### 2. GET /api/questionnaires/:questionnaireId

**Purpose**: Retrieve questionnaire details with complete visit history

**Endpoint**: `/api/questionnaires/{questionnaireId}`

**Method**: GET

**URL Parameters**:
- `questionnaireId` (string): The questionnaire ID (e.g., "2024-001-003")

**Response** (200 OK):
```json
{
  "questionnaireId": "2024-001-003",
  "spotId": 1,
  "cycleId": 1,
  "sequenceNumber": 3,
  "status": "In_Progress",
  "visitCount": 2,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-16T14:30:00Z",
  "spot": {
    "spotId": 1,
    "spotName": "Spot #1",
    "barangayId": 26,
    "barangayName": "Katipunan",
    "startingPoint": { "lat": 8.1234, "lng": 123.4567 },
    "randomStart": 123
  },
  "visits": [
    {
      "visitId": 1,
      "visitNumber": 1,
      "timestamp": "2024-01-15T10:30:00Z",
      "outcome": "Callback_Needed",
      "notes": "No one home",
      "location": { "lat": 8.1234, "lng": 123.4567 },
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "visitId": 2,
      "visitNumber": 2,
      "timestamp": "2024-01-16T14:00:00Z",
      "outcome": "Interview_Started",
      "notes": "Respondent available",
      "location": null,
      "createdAt": "2024-01-16T14:00:00Z"
    }
  ],
  "surveyData": null
}
```

**Behavior**:
- Returns questionnaire details with spot and barangay information
- Includes all visit records ordered by timestamp (oldest first)
- Includes survey response data if interview is completed
- Returns null for `surveyData` if interview not yet completed

**Error Responses**:
- 400: Missing questionnaire ID
- 404: Questionnaire not found
- 500: Server error

---

### 3. GET /api/fi/assignments

**Purpose**: Get all spots assigned to the logged-in Field Interviewer

**Endpoint**: `/api/fi/assignments`

**Method**: GET

**Authentication**: Required (JWT token in `pulse_token` cookie)

**Query Parameters**:
- `cycleId` (optional, number): Filter by specific cycle. If not provided, uses active cycle.

**Response** (200 OK):
```json
{
  "cycleId": 1,
  "assignments": [
    {
      "spotId": 1,
      "spotName": "Spot #1",
      "barangayId": 26,
      "barangayName": "Katipunan",
      "startingPoint": { "lat": 8.1234, "lng": 123.4567 },
      "randomStart": 123,
      "status": "In_Progress",
      "completedCount": 3,
      "totalCount": 5,
      "inProgressCount": 2,
      "flaggedCount": 0,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-16T14:30:00Z",
      "interviews": [
        {
          "questionnaireId": "2024-001-001",
          "sequenceNumber": 1,
          "status": "Completed",
          "visitCount": 1
        },
        {
          "questionnaireId": "2024-001-002",
          "sequenceNumber": 2,
          "status": "In_Progress",
          "visitCount": 2
        },
        {
          "questionnaireId": "2024-001-003",
          "sequenceNumber": 3,
          "status": "Completed",
          "visitCount": 1
        },
        {
          "questionnaireId": "2024-001-004",
          "sequenceNumber": 4,
          "status": "Completed",
          "visitCount": 1
        },
        {
          "questionnaireId": "2024-001-005",
          "sequenceNumber": 5,
          "status": "Pending",
          "visitCount": 0
        }
      ]
    }
  ]
}
```

**Behavior**:
- Authenticates user via JWT token
- Returns only spots assigned to the logged-in FI
- Filters by active cycle if no cycleId specified
- Calculates progress metrics for each spot
- Orders interviews by sequence number (1-5)
- Returns empty array if no active cycle or no assignments

**Error Responses**:
- 401: Not authenticated or invalid token
- 500: Server error

---

## Database Schema

The endpoints interact with the following tables:

### `visits` Table
```sql
CREATE TABLE visits (
  visit_id SERIAL PRIMARY KEY,
  questionnaire_id VARCHAR(50) NOT NULL,
  visit_number INTEGER NOT NULL,
  visit_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  outcome VARCHAR(50) NOT NULL,
  notes TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(questionnaire_id) ON DELETE CASCADE
);
```

### `questionnaires` Table
```sql
CREATE TABLE questionnaires (
  questionnaire_id VARCHAR(50) PRIMARY KEY,
  spot_id INTEGER NOT NULL,
  cycle_id INTEGER NOT NULL,
  sequence_number INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  visit_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (spot_id) REFERENCES spots(spot_id) ON DELETE CASCADE,
  FOREIGN KEY (cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE
);
```

### `spots` Table
```sql
CREATE TABLE spots (
  spot_id SERIAL PRIMARY KEY,
  cycle_id INTEGER NOT NULL,
  barangay_id INTEGER NOT NULL,
  spot_name VARCHAR(100) NOT NULL,
  starting_point JSON NOT NULL,
  random_start INTEGER NOT NULL,
  assigned_fi_id INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP,
  FOREIGN KEY (cycle_id) REFERENCES survey_cycle(cycle_id) ON DELETE CASCADE,
  FOREIGN KEY (barangay_id) REFERENCES barangay(barangay_id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_fi_id) REFERENCES user(id) ON DELETE SET NULL
);
```

---

## Status Flow

### Questionnaire Status Transitions

```
Pending
  ↓ (First visit logged)
In_Progress
  ↓ (Interview completed)
Completed

OR

In_Progress
  ↓ (3 failed attempts)
Flagged_For_Substitution
```

### Visit Outcomes

- **Callback_Needed**: Need to return, respondent not available
- **Interview_Started**: Interview has begun
- **Interview_Completed**: Interview successfully finished
- **Refused**: Respondent refused to participate
- **Household_Moved**: Household no longer at location

---

## Testing

### Test Script

Run the test script to verify all endpoints:

```bash
node scripts/test-visit-tracking-api.js
```

### Manual Testing

#### 1. Test POST /api/visits

```bash
curl -X POST http://localhost:3000/api/visits \
  -H "Content-Type: application/json" \
  -d '{
    "questionnaireId": "2024-001-001",
    "outcome": "Callback_Needed",
    "notes": "No one home",
    "location": {
      "lat": 8.1234,
      "lng": 123.4567
    }
  }'
```

#### 2. Test GET /api/questionnaires/:questionnaireId

```bash
curl http://localhost:3000/api/questionnaires/2024-001-001
```

#### 3. Test GET /api/fi/assignments

```bash
# Requires authentication cookie
curl http://localhost:3000/api/fi/assignments \
  -H "Cookie: pulse_token=YOUR_JWT_TOKEN"
```

---

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- ✅ **Requirement 4.3**: FI can log visit status with outcome and notes
- ✅ **Requirement 4.4**: System updates visits array when callback is logged
- ✅ **Requirement 4.5**: FI can enter notes in Digital Fieldwork Diary
- ✅ **Requirement 5.2**: System increments visit count on each callback
- ✅ **Requirement 5.3**: System displays notes from all previous visits
- ✅ **Requirement 5.6**: System flags record for substitution after 3 failed attempts
- ✅ **Requirement 2.4**: FI can see only their assigned spots
- ✅ **Requirement 2.5**: System displays spot name and completion status
- ✅ **Requirement 2.6**: System displays completion status with formats like "In Progress (3/5)"

---

## Integration Notes

### Frontend Integration

The FI dashboard should:
1. Call `/api/fi/assignments` to display assigned spots
2. Show each spot with progress (e.g., "3/5 Completed")
3. Allow FI to tap an interview slot to view details
4. Call `/api/questionnaires/:id` to show visit history
5. Provide a "Log Visit" button that calls `/api/visits`

### Offline Support (Future)

These endpoints will be integrated with IndexedDB for offline functionality:
- Visit logs will be queued locally when offline
- Synced to server when connection is restored
- Questionnaire details cached for offline viewing

---

## Error Handling

All endpoints include comprehensive error handling:

1. **Validation Errors** (400): Missing or invalid input
2. **Authentication Errors** (401): Missing or invalid JWT token
3. **Not Found Errors** (404): Resource doesn't exist
4. **Server Errors** (500): Database or unexpected errors

All errors return JSON with an `error` field:
```json
{
  "error": "Error message here"
}
```

---

## Files Created

1. `src/app/api/visits/route.ts` - POST endpoint for logging visits
2. `src/app/api/questionnaires/[questionnaireId]/route.ts` - GET endpoint for questionnaire details
3. `src/app/api/fi/assignments/route.ts` - GET endpoint for FI assignments
4. `scripts/test-visit-tracking-api.js` - Test script for all endpoints
5. `docs/VISIT_TRACKING_API_IMPLEMENTATION.md` - This documentation

---

## Next Steps

1. **Test with live database**: Start the development server and run tests
2. **Implement frontend components**: Create UI for FI dashboard
3. **Add offline support**: Integrate with IndexedDB and Service Worker
4. **Implement Task 4**: Enhance survey response API for multi-visit workflow

---

## Notes

- All endpoints use Supabase Admin client for database access
- JWT authentication is handled via `pulse_token` cookie
- Visit timestamps are automatically set to current time
- Questionnaire status updates are automatic based on visit outcomes
- The system maintains a complete audit trail of all visit attempts
