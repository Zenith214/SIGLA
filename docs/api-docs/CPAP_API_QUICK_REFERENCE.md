# CPAP API Quick Reference

## Base URL
All endpoints are prefixed with `/api/cpap`

## Authentication
All endpoints require authentication via JWT token in cookies (`pulse_token`)

## Endpoints Summary

| Method | Endpoint | Purpose | Role Access |
|--------|----------|---------|-------------|
| GET | `/api/cpap` | List CPAPs | ADMIN, OFFICER |
| POST | `/api/cpap` | Create CPAP | OFFICER |
| GET | `/api/cpap/ai-suggestions` | Generate AI suggestions | ADMIN, OFFICER |
| GET | `/api/cpap/:id` | Get CPAP details | ADMIN, OFFICER |
| PUT | `/api/cpap/:id` | Update CPAP items | OFFICER |
| POST | `/api/cpap/:id/submit` | Submit for review | OFFICER |
| POST | `/api/cpap/:id/approve` | Approve CPAP | ADMIN |
| POST | `/api/cpap/:id/request-revision` | Request revisions | ADMIN |
| PUT | `/api/cpap/:id/progress` | Update progress | OFFICER |

## Quick Examples

### List CPAPs (OFFICER)
```bash
GET /api/cpap
# Returns only CPAPs for officer's assigned barangay
```

### List CPAPs (ADMIN with filters)
```bash
GET /api/cpap?status=Submitted&cycle_id=1
# Returns all submitted CPAPs for cycle 1
```

### Create CPAP
```bash
POST /api/cpap
Content-Type: application/json

{
  "barangay_id": 1,
  "cycle_id": 1
}
```

### Get AI Suggestions
```bash
GET /api/cpap/ai-suggestions?barangay_id=1&cycle_id=1
# Returns AI-generated action recommendations
```

### Get CPAP Details
```bash
GET /api/cpap/123
# Returns full CPAP with all items
```

### Update CPAP Items
```bash
PUT /api/cpap/123
Content-Type: application/json

{
  "items": [
    {
      "priority_area": "Financial Administration",
      "target_output": "Improve tax collection efficiency",
      "success_indicator": "20% increase in collection rate",
      "responsible_person": "Treasurer",
      "timeline_start": "2025-01-01",
      "timeline_end": "2025-06-30"
    }
  ],
  "deleted_item_ids": [5, 6]
}
```

### Submit CPAP
```bash
POST /api/cpap/123/submit
# No body required
```

### Approve CPAP
```bash
POST /api/cpap/123/approve
Content-Type: application/json

{
  "comments": "Well-structured action plan. Approved."
}
```

### Request Revision
```bash
POST /api/cpap/123/request-revision
Content-Type: application/json

{
  "comments": "Please add more specific success indicators for items 2 and 3."
}
```

### Update Progress
```bash
PUT /api/cpap/123/progress
Content-Type: application/json

{
  "items": [
    {
      "id": 10,
      "actual_output": "Implemented new tax collection system",
      "accomplishment_status": "Completed",
      "remarks": "Exceeded target by 5%"
    }
  ]
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "cpap": { /* CPAP object */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "details": ["Validation error 1", "Validation error 2"]
}
```

## HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Invalid state transition
- `500 Internal Server Error` - Server error

## Role-Based Access

### ADMIN
- Can list all CPAPs
- Can view any CPAP
- Can approve CPAPs
- Can request revisions
- Cannot create or edit CPAPs
- Cannot update progress

### OFFICER
- Can list only their barangay's CPAPs
- Can view only their barangay's CPAPs
- Can create CPAPs for their barangay
- Can edit CPAPs in Draft or Revision_Requested status
- Can submit CPAPs for review
- Can update progress on Approved CPAPs
- Cannot approve or request revisions

### FS / INTERVIEWER
- No access to any CPAP endpoints (403 Forbidden)

## Status Workflow

```
Draft → Submitted → Approved
         ↓
    Revision_Requested → Submitted
```

### Valid Transitions
- Draft → Submitted (via submit)
- Submitted → Approved (via approve)
- Submitted → Revision_Requested (via request-revision)
- Revision_Requested → Submitted (via submit)

## Validation Rules

### CPAP Submission
- Must have at least one item
- All items must have required fields:
  - priority_area
  - target_output
  - success_indicator
  - responsible_person
  - timeline_start
  - timeline_end

### CPAP Item
- priority_area: max 255 characters
- responsible_person: max 255 characters
- timeline_end must be after timeline_start

### Progress Update
- CPAP must be in Approved status
- At least one item must be updated
- Each update must include at least one of:
  - actual_output
  - accomplishment_status
  - remarks

## Testing with cURL

### List CPAPs
```bash
curl -X GET http://localhost:3000/api/cpap \
  -H "Cookie: pulse_token=YOUR_JWT_TOKEN"
```

### Create CPAP
```bash
curl -X POST http://localhost:3000/api/cpap \
  -H "Cookie: pulse_token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"barangay_id":1,"cycle_id":1}'
```

### Submit CPAP
```bash
curl -X POST http://localhost:3000/api/cpap/123/submit \
  -H "Cookie: pulse_token=YOUR_JWT_TOKEN"
```

## Common Error Scenarios

### 401 Unauthorized
- Missing or invalid JWT token
- Token expired

### 403 Forbidden
- FS/INTERVIEWER trying to access CPAP endpoints
- OFFICER trying to access another barangay's CPAP
- OFFICER trying to approve/request revision
- ADMIN trying to create/edit CPAP

### 400 Bad Request
- Missing required fields
- Invalid data types
- Validation errors
- Timeline end before start

### 409 Conflict
- Invalid status transition
- Trying to edit CPAP in Submitted/Approved status
- Trying to submit CPAP without items

## Integration with Services

All endpoints use these service layers:
- **CPAPService**: Business logic and CRUD operations
- **CPAPValidationService**: Input validation and business rules
- **CPAPPermissionService**: Authorization checks
- **CPAPNotificationService**: Notification triggers

## Next Steps

After implementing API endpoints:
1. Update middleware for route protection (Task 8)
2. Implement UI components (Tasks 9-10)
3. Write tests (Tasks 14-16)
4. Deploy and test

---

*Quick Reference Guide*
*Last Updated: November 19, 2025*
