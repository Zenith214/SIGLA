# CPAP Module API Documentation

## Overview

This document provides comprehensive API documentation for the Citizen Priority Action Plan (CPAP) module endpoints. All endpoints require authentication and implement role-based access control.

## Table of Contents

1. [Authentication](#authentication)
2. [Authorization](#authorization)
3. [Endpoints](#endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Authentication

### Required Headers

All API requests must include:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting a Token

Authenticate via the login endpoint:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 123,
    "email": "user@example.com",
    "role": "Officer",
    "barangay_id": 5
  }
}
```

### Token Expiration

- Tokens expire after 24 hours
- Refresh tokens before expiration
- Handle 401 responses by re-authenticating

---

## Authorization

### Role-Based Access

| Role | Access Level |
|------|--------------|
| **ADMIN** | Full access to all CPAPs across all barangays |
| **OFFICER** | Access only to their assigned barangay's CPAP |
| **FS** | No access (403 Forbidden) |
| **INTERVIEWER** | No access (403 Forbidden) |

### Permission Matrix

| Endpoint | ADMIN | OFFICER | FS/INTERVIEWER |
|----------|-------|---------|----------------|
| GET /api/cpap | ✅ All | ✅ Own barangay | ❌ |
| GET /api/cpap/[id] | ✅ | ✅ Own barangay | ❌ |
| GET /api/cpap/ai-suggestions | ❌ | ✅ Own barangay | ❌ |
| POST /api/cpap | ❌ | ✅ Own barangay | ❌ |
| PUT /api/cpap/[id] | ❌ | ✅ Own barangay | ❌ |
| POST /api/cpap/[id]/submit | ❌ | ✅ Own barangay | ❌ |
| POST /api/cpap/[id]/approve | ✅ | ❌ | ❌ |
| POST /api/cpap/[id]/request-revision | ✅ | ❌ | ❌ |
| PUT /api/cpap/[id]/progress | ❌ | ✅ Own barangay | ❌ |

---

## Endpoints

### 1. List CPAPs

Get a list of CPAPs filtered by role and query parameters.

```http
GET /api/cpap
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: Draft, Submitted, Approved, Revision_Requested |
| cycle_id | number | No | Filter by survey cycle ID |
| barangay_id | number | No | Filter by barangay ID (ADMIN only) |

**Authorization:**
- ADMIN: Returns all CPAPs (can filter by barangay)
- OFFICER: Returns only their barangay's CPAPs
- FS/INTERVIEWER: 403 Forbidden

**Response:**

```json
{
  "success": true,
  "cpaps": [
    {
      "id": 1,
      "barangay_id": 5,
      "barangay_name": "Barangay San Jose",
      "cycle_id": 2,
      "cycle_name": "2025 Q1",
      "status": "Submitted",
      "created_at": "2025-01-15T08:00:00Z",
      "submitted_at": "2025-01-20T10:30:00Z",
      "approved_at": null,
      "item_count": 7
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized (not authenticated)
- 403: Forbidden (FS/INTERVIEWER role)
- 500: Server error

---

### 2. Get CPAP Details

Get a specific CPAP with all action items.

```http
GET /api/cpap/[id]
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | CPAP ID |

**Authorization:**
- ADMIN: Can access any CPAP
- OFFICER: Can only access their barangay's CPAP
- FS/INTERVIEWER: 403 Forbidden

**Response:**

```json
{
  "success": true,
  "cpap": {
    "id": 1,
    "barangay_id": 5,
    "barangay_name": "Barangay San Jose",
    "cycle_id": 2,
    "cycle_name": "2025 Q1",
    "status": "Submitted",
    "created_at": "2025-01-15T08:00:00Z",
    "updated_at": "2025-01-20T10:30:00Z",
    "submitted_at": "2025-01-20T10:30:00Z",
    "approved_at": null,
    "admin_comments": null,
    "items": [
      {
        "id": 1,
        "cpap_id": 1,
        "priority_area": "Health Services",
        "target_output": "Establish weekly mobile health clinic",
        "success_indicator": "Serve 50 residents per week",
        "responsible_person": "Dr. Maria Santos",
        "timeline_start": "2025-02-01",
        "timeline_end": "2025-04-30",
        "actual_output": null,
        "accomplishment_status": null,
        "remarks": null,
        "created_at": "2025-01-15T08:30:00Z",
        "updated_at": "2025-01-15T08:30:00Z"
      }
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 403: Forbidden (not authorized for this CPAP)
- 404: CPAP not found
- 500: Server error

---

### 3. Get AI Suggestions

Generate AI-powered action recommendations based on survey data.

```http
GET /api/cpap/ai-suggestions
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| barangay_id | number | Yes | Barangay ID |
| cycle_id | number | Yes | Survey cycle ID |

**Authorization:**
- OFFICER only (for their assigned barangay)
- ADMIN: Not allowed (403)
- FS/INTERVIEWER: Not allowed (403)

**Response:**

```json
{
  "success": true,
  "suggestions": {
    "shortTerm": [
      {
        "priority_area": "Health Services",
        "target_output": "Conduct health awareness campaign",
        "success_indicator": "Reach 80% awareness in next survey",
        "timeline_months": "0-3 months",
        "source": "Health Services (Awareness: 45%)"
      }
    ],
    "mediumTerm": [
      {
        "priority_area": "Water Supply",
        "target_output": "Install 3 new water refilling stations",
        "success_indicator": "Increase availment by 50%",
        "timeline_months": "6-12 months",
        "source": "Water Supply (Availment: 30%)"
      }
    ],
    "longTerm": [
      {
        "priority_area": "Infrastructure",
        "target_output": "Construct barangay health center",
        "success_indicator": "Achieve 75% satisfaction rating",
        "timeline_months": "1+ year",
        "source": "Health Services (Satisfaction: 40%)"
      }
    ]
  },
  "metadata": {
    "generated_at": "2025-01-15T10:00:00Z",
    "based_on_responses": 150,
    "service_areas_analyzed": ["Health", "Water", "Social Services"]
  }
}
```

**Status Codes:**
- 200: Success
- 400: Missing required parameters
- 401: Unauthorized
- 403: Forbidden (wrong role or barangay)
- 404: No survey data available
- 500: Server error

---

### 4. Create CPAP

Create a new CPAP for a barangay and cycle.

```http
POST /api/cpap
Content-Type: application/json
```

**Request Body:**

```json
{
  "barangay_id": 5,
  "cycle_id": 2
}
```

**Authorization:**
- OFFICER only (for their assigned barangay)
- ADMIN: Not allowed (403)

**Response:**

```json
{
  "success": true,
  "cpap": {
    "id": 1,
    "barangay_id": 5,
    "cycle_id": 2,
    "status": "Draft",
    "created_at": "2025-01-15T08:00:00Z",
    "updated_at": "2025-01-15T08:00:00Z",
    "items": []
  }
}
```

**Status Codes:**
- 201: Created
- 200: Already exists (returns existing CPAP)
- 400: Invalid request body
- 401: Unauthorized
- 403: Forbidden (wrong barangay)
- 500: Server error

---

### 5. Update CPAP Items

Update action items in a CPAP (Draft or Revision_Requested status only).

```http
PUT /api/cpap/[id]
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | CPAP ID |

**Request Body:**

```json
{
  "items": [
    {
      "id": 1,
      "priority_area": "Health Services",
      "target_output": "Establish weekly mobile health clinic",
      "success_indicator": "Serve 50 residents per week",
      "responsible_person": "Dr. Maria Santos",
      "timeline_start": "2025-02-01",
      "timeline_end": "2025-04-30"
    },
    {
      "priority_area": "Water Supply",
      "target_output": "Install water refilling station",
      "success_indicator": "Serve 100 households",
      "responsible_person": "Engr. Juan Cruz",
      "timeline_start": "2025-03-01",
      "timeline_end": "2025-08-31"
    }
  ],
  "deleted_item_ids": [3, 5]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | array | Yes | Array of items to create/update |
| items[].id | number | No | Item ID (omit for new items) |
| items[].priority_area | string | Yes | Service area or issue category |
| items[].target_output | string | Yes | Specific goal or deliverable |
| items[].success_indicator | string | Yes | Measurable outcome metric |
| items[].responsible_person | string | Yes | Lead implementer name |
| items[].timeline_start | string | Yes | Start date (ISO 8601) |
| items[].timeline_end | string | Yes | End date (ISO 8601) |
| deleted_item_ids | array | No | IDs of items to delete |

**Authorization:**
- OFFICER only (for their barangay, Draft or Revision_Requested status)

**Response:**

```json
{
  "success": true,
  "cpap": {
    "id": 1,
    "barangay_id": 5,
    "cycle_id": 2,
    "status": "Draft",
    "items": [
      {
        "id": 1,
        "priority_area": "Health Services",
        "target_output": "Establish weekly mobile health clinic",
        "success_indicator": "Serve 50 residents per week",
        "responsible_person": "Dr. Maria Santos",
        "timeline_start": "2025-02-01",
        "timeline_end": "2025-04-30",
        "actual_output": null,
        "accomplishment_status": null,
        "remarks": null
      },
      {
        "id": 6,
        "priority_area": "Water Supply",
        "target_output": "Install water refilling station",
        "success_indicator": "Serve 100 households",
        "responsible_person": "Engr. Juan Cruz",
        "timeline_start": "2025-03-01",
        "timeline_end": "2025-08-31",
        "actual_output": null,
        "accomplishment_status": null,
        "remarks": null
      }
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (wrong barangay or status)
- 404: CPAP not found
- 409: Conflict (invalid status for editing)
- 500: Server error

---

### 6. Submit CPAP

Submit a CPAP for DILG review.

```http
POST /api/cpap/[id]/submit
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | CPAP ID |

**Request Body:**

```json
{}
```

**Authorization:**
- OFFICER only (for their barangay, Draft or Revision_Requested status)

**Validation:**
- CPAP must have at least one item
- All items must have required fields completed
- Timeline dates must be valid (start before end)

**Response:**

```json
{
  "success": true,
  "message": "CPAP submitted successfully for review"
}
```

**Status Codes:**
- 200: Success
- 400: Validation error (see error details)
- 401: Unauthorized
- 403: Forbidden (wrong barangay or status)
- 404: CPAP not found
- 409: Conflict (invalid status for submission)
- 500: Server error

**Error Response Example:**

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "CPAP cannot be submitted",
  "details": {
    "errors": [
      "At least one action item is required",
      "Item 2 is missing responsible person",
      "Item 3 timeline end must be after start"
    ]
  }
}
```

---

### 7. Approve CPAP

Approve a submitted CPAP (ADMIN only).

```http
POST /api/cpap/[id]/approve
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | CPAP ID |

**Request Body:**

```json
{
  "comments": "Excellent action plan. Well-defined outputs and realistic timelines."
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| comments | string | No | Optional approval comments |

**Authorization:**
- ADMIN only
- CPAP must be in Submitted status

**Response:**

```json
{
  "success": true,
  "message": "CPAP approved successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 403: Forbidden (not ADMIN)
- 404: CPAP not found
- 409: Conflict (invalid status for approval)
- 500: Server error

---

### 8. Request Revision

Request revisions to a submitted CPAP (ADMIN only).

```http
POST /api/cpap/[id]/request-revision
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | CPAP ID |

**Request Body:**

```json
{
  "comments": "Please address the following:\n1. Item 2 needs a specific responsible person\n2. Item 4 timeline is too short for infrastructure work\n3. Add success indicators with specific metrics"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| comments | string | Yes | Revision instructions (required) |

**Authorization:**
- ADMIN only
- CPAP must be in Submitted status

**Response:**

```json
{
  "success": true,
  "message": "Revision requested successfully"
}
```

**Status Codes:**
- 200: Success
- 400: Missing comments
- 401: Unauthorized
- 403: Forbidden (not ADMIN)
- 404: CPAP not found
- 409: Conflict (invalid status)
- 500: Server error

---

### 9. Update Progress

Update progress on approved CPAP items (OFFICER only).

```http
PUT /api/cpap/[id]/progress
Content-Type: application/json
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | CPAP ID |

**Request Body:**

```json
{
  "items": [
    {
      "id": 1,
      "actual_output": "Mobile health clinic established, serving 60 residents per week",
      "accomplishment_status": "Completed",
      "remarks": "Exceeded target by 20%. Planning to extend to bi-weekly schedule."
    },
    {
      "id": 2,
      "actual_output": "2 of 3 water stations installed",
      "accomplishment_status": "In Progress",
      "remarks": "Third station delayed due to permit processing. Expected completion next month."
    }
  ]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | array | Yes | Array of progress updates |
| items[].id | number | Yes | Item ID to update |
| items[].actual_output | string | No | What was accomplished |
| items[].accomplishment_status | string | No | Current status |
| items[].remarks | string | No | Additional notes |

**Authorization:**
- OFFICER only (for their barangay, Approved status)

**Response:**

```json
{
  "success": true,
  "cpap": {
    "id": 1,
    "status": "Approved",
    "items": [
      {
        "id": 1,
        "priority_area": "Health Services",
        "target_output": "Establish weekly mobile health clinic",
        "success_indicator": "Serve 50 residents per week",
        "responsible_person": "Dr. Maria Santos",
        "timeline_start": "2025-02-01",
        "timeline_end": "2025-04-30",
        "actual_output": "Mobile health clinic established, serving 60 residents per week",
        "accomplishment_status": "Completed",
        "remarks": "Exceeded target by 20%. Planning to extend to bi-weekly schedule.",
        "updated_at": "2025-04-15T14:30:00Z"
      }
    ]
  }
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 403: Forbidden (wrong barangay or status)
- 404: CPAP or item not found
- 409: Conflict (invalid status for progress update)
- 500: Server error

---

## Data Models

### CPAP

```typescript
interface CPAP {
  id: number;
  barangay_id: number;
  barangay_name?: string;
  cycle_id: number;
  cycle_name?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Revision_Requested';
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  admin_comments: string | null;
  items: CPAPItem[];
}
```

### CPAPItem

```typescript
interface CPAPItem {
  id: number;
  cpap_id: number;
  priority_area: string;
  target_output: string;
  success_indicator: string;
  responsible_person: string;
  timeline_start: string; // ISO 8601 date
  timeline_end: string;   // ISO 8601 date
  actual_output: string | null;
  accomplishment_status: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}
```

### CPAPStatus

```typescript
type CPAPStatus = 
  | 'Draft'                // Editable by OFFICER
  | 'Submitted'            // Under ADMIN review
  | 'Approved'             // Approved, progress tracking enabled
  | 'Revision_Requested';  // Needs changes, editable by OFFICER
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {
    // Additional error details
  }
}
```

### Common Error Codes

| Status | Error Type | Description |
|--------|------------|-------------|
| 400 | Validation Error | Invalid request data |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Invalid state transition |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

### Error Examples

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You do not have permission to access this CPAP"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid CPAP data",
  "details": {
    "errors": [
      "priority_area is required",
      "timeline_end must be after timeline_start"
    ]
  }
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": "Conflict",
  "message": "Cannot edit CPAP in Submitted status"
}
```

---

## Rate Limiting

### Limits

- **Standard endpoints**: 100 requests per minute per user
- **AI Suggestions**: 10 requests per minute per user
- **Bulk operations**: 20 requests per minute per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "details": {
    "retry_after": 60
  }
}
```

---

## Examples

### Example 1: Complete CPAP Creation Workflow (OFFICER)

```javascript
// 1. Create CPAP
const createResponse = await fetch('/api/cpap', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    barangay_id: 5,
    cycle_id: 2
  })
});
const { cpap } = await createResponse.json();

// 2. Get AI Suggestions (optional)
const suggestionsResponse = await fetch(
  `/api/cpap/ai-suggestions?barangay_id=5&cycle_id=2`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);
const { suggestions } = await suggestionsResponse.json();

// 3. Add items
const updateResponse = await fetch(`/api/cpap/${cpap.id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      {
        priority_area: 'Health Services',
        target_output: 'Establish weekly mobile health clinic',
        success_indicator: 'Serve 50 residents per week',
        responsible_person: 'Dr. Maria Santos',
        timeline_start: '2025-02-01',
        timeline_end: '2025-04-30'
      }
    ]
  })
});

// 4. Submit for review
const submitResponse = await fetch(`/api/cpap/${cpap.id}/submit`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});
```

### Example 2: Review Workflow (ADMIN)

```javascript
// 1. Get all submitted CPAPs
const listResponse = await fetch('/api/cpap?status=Submitted', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
const { cpaps } = await listResponse.json();

// 2. Get CPAP details
const detailResponse = await fetch(`/api/cpap/${cpaps[0].id}`, {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
const { cpap } = await detailResponse.json();

// 3. Approve or request revision
// Option A: Approve
const approveResponse = await fetch(`/api/cpap/${cpap.id}/approve`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    comments: 'Excellent plan. Approved for implementation.'
  })
});

// Option B: Request revision
const revisionResponse = await fetch(`/api/cpap/${cpap.id}/request-revision`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    comments: 'Please add specific metrics to success indicators.'
  })
});
```

### Example 3: Progress Tracking (OFFICER)

```javascript
// Update progress on approved CPAP
const progressResponse = await fetch(`/api/cpap/${cpapId}/progress`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      {
        id: 1,
        actual_output: 'Mobile clinic serving 60 residents weekly',
        accomplishment_status: 'Completed',
        remarks: 'Exceeded target. Expanding to bi-weekly.'
      },
      {
        id: 2,
        actual_output: '2 of 3 stations installed',
        accomplishment_status: 'In Progress',
        remarks: 'Third station delayed due to permits.'
      }
    ]
  })
});
```

---

## Changelog

### Version 1.0 (November 2025)
- Initial release
- All core CPAP endpoints
- AI Suggestions feature
- Role-based access control
- Progress tracking

---

**API Version:** 1.0  
**Last Updated:** November 2025  
**Base URL:** `https://pulse.gov.ph/api`  
**Support:** api-support@pulse.gov.ph
