# API Documentation - CSIS Methodology

## Overview

This document describes the API endpoints and data structures for the SIGLA Survey System with CSIS (Citizen Satisfaction Index System) methodology implementation. The CSIS upgrade introduces GPS verification, Kish Grid respondent selection, and 6-section survey workflow.

## Table of Contents

1. [Authentication](#authentication)
2. [Questionnaire Number Generation](#questionnaire-number-generation)
3. [Survey Response Submission](#survey-response-submission)
4. [GPS Verification Endpoints](#gps-verification-endpoints)
5. [Data Structures](#data-structures)
6. [Database Schema](#database-schema)
7. [Error Codes](#error-codes)

---

## Authentication

All API endpoints require authentication using JWT tokens or session-based authentication.

### Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Questionnaire Number Generation

### POST /api/questionnaire-number

Generates a unique questionnaire number for a new survey.

#### Request

```http
POST /api/questionnaire-number
Content-Type: application/json

{
  "barangayId": 1
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| barangayId | number | Yes | ID of the barangay where survey is conducted |

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "surveyNumber": "BB-2024-0042",
  "questionnaireNumber": 42,
  "barangayId": 1,
  "barangayName": "Sample Barangay",
  "timestamp": "2024-11-15T10:30:00Z"
}
```


#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| surveyNumber | string | Full survey number in format "BB-YYYY-NNNN" |
| questionnaireNumber | number | Sequential number (1-150) used for CSIS algorithms |
| barangayId | number | ID of the barangay |
| barangayName | string | Name of the barangay |
| timestamp | string | ISO 8601 timestamp of generation |

#### Response (Error)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "INVALID_BARANGAY",
  "message": "Barangay ID is required",
  "code": 400
}
```

#### Changes from Previous Version

**REMOVED:**
- `type` field (previously returned "odd" or "even")
- `questionnaireType` field

**REASON:** Gender requirements are now calculated dynamically based on questionnaire number parity at the point of respondent selection.

#### Example Usage

```javascript
// Generate questionnaire number
const response = await fetch('/api/questionnaire-number', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    barangayId: 1
  })
});

const data = await response.json();
console.log(data.surveyNumber); // "BB-2024-0042"
console.log(data.questionnaireNumber); // 42
```

---

## Survey Response Submission

### POST /api/survey-responses

Submits a completed survey response with GPS verification data.

#### Request

```http
POST /api/survey-responses
Content-Type: application/json

{
  "surveyNumber": "BB-2024-0042",
  "barangayId": 1,
  "assignedSpotId": 15,
  "location": {
    "lat": 14.5995,
    "lng": 120.9842,
    "address": "123 Main St, Sample Barangay",
    "accuracy": 10,
    "timestamp": "2024-11-15T10:30:00Z"
  },
  "verificationLocation": {
    "lat": 14.6020,
    "lng": 120.9870,
    "accuracy": 8,
    "timestamp": "2024-11-15T10:35:00Z"
  },
  "selectedMember": "John Doe",
  "respondentDemographics": {
    "age": 35,
    "birthdate": "1989-05-15",
    "gender": "Male",
    "educationalAttainment": "College Graduate",
    "householdIncome": "20000-30000",
    "purok": "Purok 1"
  },
  "assignedSections": [
    "financial",
    "disaster",
    "social",
    "safety",
    "business",
    "environmental"
  ],
  "financialAdmin": { /* section responses */ },
  "disasterPrep": { /* section responses */ },
  "socialProtection": { /* section responses */ },
  "safetyPeace": { /* section responses */ },
  "businessFriendly": { /* section responses */ },
  "environmental": { /* section responses */ }
}
```


#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| surveyNumber | string | Yes | Unique survey identifier (BB-YYYY-NNNN) |
| barangayId | number | Yes | ID of the barangay |
| assignedSpotId | number | Yes | ID of the assigned spot location |
| location | object | No | Initial location (optional in CSIS) |
| verificationLocation | object | Yes | GPS captured at household (NEW) |
| selectedMember | string | Yes | Name of selected respondent |
| respondentDemographics | object | Yes | Respondent demographic data |
| assignedSections | array | Yes | Array of 6 section IDs in order |
| [sectionData] | object | Yes | Data for each of the 6 sections |

#### New Field: verificationLocation

**Purpose:** GPS coordinates captured by FI at the household for quality control verification.

**Structure:**
```typescript
{
  lat: number;        // Latitude in decimal degrees
  lng: number;        // Longitude in decimal degrees
  accuracy: number;   // GPS accuracy in meters
  timestamp: string;  // ISO 8601 timestamp of capture
}
```

**Validation:**
- `lat` must be between -90 and 90
- `lng` must be between -180 and 180
- `accuracy` should be < 100 meters (warning if higher)
- `timestamp` must be valid ISO 8601 format

#### Response (Success)

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 12345,
  "surveyNumber": "BB-2024-0042",
  "status": "submitted",
  "gpsVerification": {
    "distanceMeters": 250,
    "withinThreshold": false,
    "flaggedForReview": true,
    "threshold": 200
  },
  "timestamp": "2024-11-15T11:00:00Z"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | number | Database ID of the survey response |
| surveyNumber | string | Survey identifier |
| status | string | Submission status ("submitted", "pending", "approved") |
| gpsVerification | object | GPS verification results (NEW) |
| timestamp | string | Submission timestamp |

#### GPS Verification Object

| Field | Type | Description |
|-------|------|-------------|
| distanceMeters | number | Distance between assigned spot and actual location |
| withinThreshold | boolean | Whether distance is within configured threshold |
| flaggedForReview | boolean | Whether interview is flagged for supervisor review |
| threshold | number | Configured threshold in meters (default: 200) |

#### Response (Error)

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "MISSING_VERIFICATION_LOCATION",
  "message": "GPS verification location is required",
  "code": 400
}
```

#### Server-Side Processing

When a survey is submitted, the server:

1. **Validates Data**
   - Checks all required fields are present
   - Validates GPS coordinates format
   - Verifies all 6 sections are included

2. **Calculates GPS Verification**
   - Retrieves assigned spot coordinates from database
   - Calculates distance using Haversine formula
   - Compares distance to configured threshold
   - Sets `gps_verification_status` flag

3. **Stores Data**
   - Saves survey response to `survey_responses` table
   - Stores `verification_location` as JSONB
   - Records `gps_distance_meters`
   - Sets `gps_verification_status` ("within_threshold" or "flagged")

4. **Returns Response**
   - Includes GPS verification results
   - Indicates if interview is flagged

#### Example Usage

```javascript
// Submit survey with GPS verification
const response = await fetch('/api/survey-responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    surveyNumber: "BB-2024-0042",
    barangayId: 1,
    assignedSpotId: 15,
    verificationLocation: {
      lat: 14.6020,
      lng: 120.9870,
      accuracy: 8,
      timestamp: new Date().toISOString()
    },
    // ... rest of survey data
  })
});

const result = await response.json();

if (result.gpsVerification.flaggedForReview) {
  console.warn('Interview flagged for GPS verification review');
  console.log(`Distance: ${result.gpsVerification.distanceMeters}m`);
}
```

---

## GPS Verification Endpoints

### GET /api/gps-verification/:surveyId

Retrieves GPS verification details for a specific survey.

#### Request

```http
GET /api/gps-verification/12345
Authorization: Bearer <token>
```

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "surveyId": 12345,
  "surveyNumber": "BB-2024-0042",
  "assignedSpot": {
    "id": 15,
    "name": "Spot 15 - Purok 1",
    "lat": 14.5995,
    "lng": 120.9842
  },
  "verificationLocation": {
    "lat": 14.6020,
    "lng": 120.9870,
    "accuracy": 8,
    "timestamp": "2024-11-15T10:35:00Z"
  },
  "verification": {
    "distanceMeters": 250,
    "withinThreshold": false,
    "flaggedForReview": true,
    "threshold": 200,
    "status": "flagged"
  },
  "fieldInterviewer": {
    "id": 5,
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "reviewStatus": "pending",
  "reviewNotes": null,
  "reviewedBy": null,
  "reviewedAt": null
}
```


### GET /api/gps-verification/flagged

Retrieves all flagged interviews for supervisor review.

#### Request

```http
GET /api/gps-verification/flagged?page=1&limit=20
Authorization: Bearer <token>
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 20 | Number of results per page |
| fiId | number | - | Filter by field interviewer ID |
| barangayId | number | - | Filter by barangay ID |
| startDate | string | - | Filter by date range (ISO 8601) |
| endDate | string | - | Filter by date range (ISO 8601) |

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    {
      "surveyId": 12345,
      "surveyNumber": "BB-2024-0042",
      "distanceMeters": 250,
      "status": "flagged",
      "fieldInterviewer": "John Doe",
      "barangay": "Sample Barangay",
      "submittedAt": "2024-11-15T11:00:00Z"
    },
    // ... more flagged interviews
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  },
  "summary": {
    "totalFlagged": 45,
    "pendingReview": 38,
    "approved": 5,
    "rejected": 2
  }
}
```

### PUT /api/gps-verification/:surveyId/review

Updates the review status of a flagged interview.

#### Request

```http
PUT /api/gps-verification/12345/review
Content-Type: application/json
Authorization: Bearer <token>

{
  "action": "approve",
  "notes": "GPS accuracy was poor (45m), explaining the 220m distance. Interview data is complete and consistent."
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| action | string | Yes | "approve", "reject", or "request_explanation" |
| notes | string | Yes | Supervisor's notes explaining the decision |
| explanationRequest | string | No | Questions for FI (if action is "request_explanation") |

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "surveyId": 12345,
  "reviewStatus": "approved",
  "reviewedBy": "Supervisor Name",
  "reviewedAt": "2024-11-15T14:30:00Z",
  "notes": "GPS accuracy was poor (45m), explaining the 220m distance..."
}
```

### GET /api/gps-verification/settings

Retrieves current GPS verification settings.

#### Request

```http
GET /api/gps-verification/settings
Authorization: Bearer <token>
```

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "thresholdMeters": 200,
  "autoFlagEnabled": true,
  "requireGPS": true,
  "minAccuracy": 100,
  "lastUpdated": "2024-11-01T00:00:00Z",
  "updatedBy": "Admin User"
}
```

### PUT /api/gps-verification/settings

Updates GPS verification settings (admin/supervisor only).

#### Request

```http
PUT /api/gps-verification/settings
Content-Type: application/json
Authorization: Bearer <token>

{
  "thresholdMeters": 250,
  "autoFlagEnabled": true,
  "requireGPS": true,
  "minAccuracy": 100
}
```

#### Request Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| thresholdMeters | number | Distance threshold for flagging (50-500) |
| autoFlagEnabled | boolean | Whether to automatically flag interviews |
| requireGPS | boolean | Whether GPS capture is mandatory |
| minAccuracy | number | Minimum acceptable GPS accuracy in meters |

#### Response (Success)

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "thresholdMeters": 250,
  "autoFlagEnabled": true,
  "requireGPS": true,
  "minAccuracy": 100,
  "lastUpdated": "2024-11-15T14:45:00Z",
  "updatedBy": "Supervisor Name"
}
```

---

## Data Structures

### SurveyData Interface

```typescript
interface SurveyData {
  surveyNumber: string;                    // Format: "BB-YYYY-NNNN"
  assignedSections: string[];              // All 6 sections in randomized order
  barangayId?: number;
  
  // Initial location (optional in CSIS)
  location: {
    lat: number;
    lng: number;
    address: string;
    accuracy?: number;
    timestamp?: number;
    barangay?: string;
    municipality?: string;
    province?: string;
  };
  
  // NEW: GPS captured at household for verification
  verificationLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
    timestamp?: number;
  };
  
  selectedMember: string;
  
  respondentDemographics: {
    age: number;
    birthdate: string;
    gender: string;
    educationalAttainment: string;
    householdIncome: string;
    purok: string;
  };
  
  // All 6 service sections (required)
  financialAdmin: Record<string, any>;
  disasterPrep: Record<string, any>;
  safetyPeace: Record<string, any>;
  businessFriendly: Record<string, any>;
  environmental: Record<string, any>;
  socialProtection: Record<string, any>;
}
```

### GPSCoordinates Interface

```typescript
interface GPSCoordinates {
  lat: number;          // Latitude in decimal degrees (-90 to 90)
  lng: number;          // Longitude in decimal degrees (-180 to 180)
  accuracy?: number;    // GPS accuracy in meters
  timestamp?: number;   // Unix timestamp or ISO 8601 string
}
```

### GPSVerificationResult Interface

```typescript
interface GPSVerificationResult {
  distanceMeters: number;           // Distance between locations
  withinThreshold: boolean;         // Whether within configured threshold
  flagForReview: boolean;           // Whether interview should be flagged
  assignedLocation: GPSCoordinates; // Pre-assigned spot location
  actualLocation: GPSCoordinates;   // GPS captured at household
  threshold: number;                // Configured threshold used
  status: 'within_threshold' | 'flagged' | 'pending' | 'approved' | 'rejected';
}
```

### KishGridResult Interface

```typescript
interface KishGridResult {
  selectedMember: HouseholdMember;  // The selected respondent
  selectedIndex: number;            // Array index of selected member (0-based)
  lookupRow: number;                // Kish Grid row (1-12)
  lookupColumn: number;             // Kish Grid column (1-10)
  gridValue: number;                // Value from Kish Grid table (1-12)
}
```

---

## Database Schema

### New Columns in survey_responses Table

```sql
-- GPS verification location (captured at household)
ALTER TABLE survey_responses 
ADD COLUMN verification_location JSONB;

-- GPS verification status
ALTER TABLE survey_responses
ADD COLUMN gps_verification_status VARCHAR(20) DEFAULT 'pending';

-- Distance from assigned spot in meters
ALTER TABLE survey_responses
ADD COLUMN gps_distance_meters INTEGER;

-- Review status and notes
ALTER TABLE survey_responses
ADD COLUMN review_status VARCHAR(20) DEFAULT 'pending';

ALTER TABLE survey_responses
ADD COLUMN review_notes TEXT;

ALTER TABLE survey_responses
ADD COLUMN reviewed_by INTEGER REFERENCES users(id);

ALTER TABLE survey_responses
ADD COLUMN reviewed_at TIMESTAMP;

-- Index for flagged interviews
CREATE INDEX idx_survey_responses_gps_flagged 
ON survey_responses(gps_verification_status) 
WHERE gps_verification_status = 'flagged';

-- Index for pending reviews
CREATE INDEX idx_survey_responses_review_pending
ON survey_responses(review_status)
WHERE review_status = 'pending';
```

### Column Descriptions

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| verification_location | JSONB | Yes | GPS coordinates captured at household |
| gps_verification_status | VARCHAR(20) | No | Status: "within_threshold", "flagged", "no_gps" |
| gps_distance_meters | INTEGER | Yes | Calculated distance from assigned spot |
| review_status | VARCHAR(20) | No | Review status: "pending", "approved", "rejected" |
| review_notes | TEXT | Yes | Supervisor's review notes |
| reviewed_by | INTEGER | Yes | User ID of reviewing supervisor |
| reviewed_at | TIMESTAMP | Yes | Timestamp of review |

### verification_location JSONB Structure

```json
{
  "lat": 14.6020,
  "lng": 120.9870,
  "accuracy": 8,
  "timestamp": "2024-11-15T10:35:00Z"
}
```

### Querying GPS Verification Data

```sql
-- Get all flagged interviews
SELECT 
  id,
  survey_number,
  gps_distance_meters,
  gps_verification_status,
  verification_location->>'accuracy' as gps_accuracy,
  created_at
FROM survey_responses
WHERE gps_verification_status = 'flagged'
ORDER BY created_at DESC;

-- Get interviews by distance range
SELECT 
  id,
  survey_number,
  gps_distance_meters
FROM survey_responses
WHERE gps_distance_meters BETWEEN 200 AND 500
ORDER BY gps_distance_meters DESC;

-- Get pending reviews
SELECT 
  sr.id,
  sr.survey_number,
  sr.gps_distance_meters,
  u.name as field_interviewer
FROM survey_responses sr
JOIN users u ON sr.user_id = u.id
WHERE sr.review_status = 'pending'
  AND sr.gps_verification_status = 'flagged'
ORDER BY sr.created_at ASC;
```

---

## Error Codes

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 500 | Internal Server Error | Server error |

### Application Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| INVALID_BARANGAY | 400 | Barangay ID is invalid or missing |
| MISSING_VERIFICATION_LOCATION | 400 | GPS verification location is required |
| INVALID_GPS_COORDINATES | 400 | GPS coordinates are out of valid range |
| MISSING_SECTIONS | 400 | Not all 6 sections are included |
| INVALID_SECTION_ORDER | 400 | Section order doesn't match questionnaire |
| QUESTIONNAIRE_EXISTS | 409 | Questionnaire number already used |
| SURVEY_NOT_FOUND | 404 | Survey response not found |
| UNAUTHORIZED_REVIEW | 403 | User not authorized to review |
| INVALID_THRESHOLD | 400 | Threshold value out of valid range (50-500) |

### Error Response Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "code": 400,
  "details": {
    "field": "verificationLocation",
    "reason": "GPS coordinates are required"
  }
}
```

### Example Error Responses

#### Missing GPS Verification Location

```json
{
  "error": "MISSING_VERIFICATION_LOCATION",
  "message": "GPS verification location is required for survey submission",
  "code": 400,
  "details": {
    "field": "verificationLocation",
    "required": true
  }
}
```

#### Invalid GPS Coordinates

```json
{
  "error": "INVALID_GPS_COORDINATES",
  "message": "GPS coordinates are out of valid range",
  "code": 400,
  "details": {
    "lat": 95.0,
    "lng": 120.0,
    "validRange": {
      "lat": [-90, 90],
      "lng": [-180, 180]
    }
  }
}
```

#### Missing Sections

```json
{
  "error": "MISSING_SECTIONS",
  "message": "All 6 service sections are required",
  "code": 400,
  "details": {
    "expected": 6,
    "received": 4,
    "missing": ["businessFriendly", "environmental"]
  }
}
```

---

## Migration Guide

### Migrating from Previous API Version

#### Changes to Questionnaire Number Generation

**Before (v1.0):**
```json
{
  "surveyNumber": "BB-2024-0042",
  "questionnaireNumber": 42,
  "type": "even"  // ❌ REMOVED
}
```

**After (v2.0 - CSIS):**
```json
{
  "surveyNumber": "BB-2024-0042",
  "questionnaireNumber": 42
  // type field removed - calculate dynamically
}
```

**Migration Action:**
- Remove any code that stores or uses `type` or `questionnaireType`
- Calculate gender requirements dynamically: `isOdd = questionnaireNumber % 2 !== 0`

#### Changes to Survey Submission

**Before (v1.0):**
```json
{
  "surveyNumber": "BB-2024-0042",
  "location": { /* GPS captured at initialization */ },
  "assignedSections": ["financial", "disaster", "social"]  // 3 sections
}
```

**After (v2.0 - CSIS):**
```json
{
  "surveyNumber": "BB-2024-0042",
  "location": { /* optional */ },
  "verificationLocation": { /* GPS captured at household */ },  // ✅ NEW
  "assignedSections": [  // ✅ Now 6 sections
    "financial", "disaster", "social", 
    "safety", "business", "environmental"
  ]
}
```

**Migration Actions:**
1. Add `verificationLocation` field to survey submission
2. Update to include all 6 service sections
3. Ensure section order matches CSIS randomization

#### Backward Compatibility

The API maintains backward compatibility for:
- Existing survey responses (without GPS verification)
- Optional `location` field (no longer required)
- Legacy section data structures

However, new surveys MUST include:
- `verificationLocation` (GPS at household)
- All 6 service sections
- Correct section order per CSIS randomization

---

## Testing

### Example Test Cases

#### Test GPS Verification Calculation

```javascript
// Test within threshold
const response = await fetch('/api/survey-responses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    surveyNumber: "TEST-2024-0001",
    assignedSpotId: 1,  // Spot at 14.5995, 120.9842
    verificationLocation: {
      lat: 14.6000,  // ~55m away
      lng: 120.9845,
      accuracy: 10
    },
    // ... rest of data
  })
});

const result = await response.json();
expect(result.gpsVerification.withinThreshold).toBe(true);
expect(result.gpsVerification.flaggedForReview).toBe(false);
```

#### Test Flagged Interview

```javascript
// Test beyond threshold
const response = await fetch('/api/survey-responses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    surveyNumber: "TEST-2024-0002",
    assignedSpotId: 1,  // Spot at 14.5995, 120.9842
    verificationLocation: {
      lat: 14.6050,  // ~600m away
      lng: 120.9900,
      accuracy: 15
    },
    // ... rest of data
  })
});

const result = await response.json();
expect(result.gpsVerification.withinThreshold).toBe(false);
expect(result.gpsVerification.flaggedForReview).toBe(true);
expect(result.gpsVerification.distanceMeters).toBeGreaterThan(200);
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| POST /api/questionnaire-number | 10 requests | 1 minute |
| POST /api/survey-responses | 20 requests | 1 minute |
| GET /api/gps-verification/* | 100 requests | 1 minute |
| PUT /api/gps-verification/*/review | 50 requests | 1 minute |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699876543
```

---

## Support

For API support and questions:

- **Technical Documentation:** [Link to full docs]
- **API Issues:** [Support email/portal]
- **Feature Requests:** [GitHub/Issue tracker]
- **Emergency Support:** [Contact info]

---

*Last Updated: [Date]*
*API Version: 2.0 - CSIS Methodology Implementation*
