# CPAP Validation Service

## Overview

The `CPAPValidationService` provides comprehensive validation methods for CPAP (Citizen Priority Action Plan) data integrity and business rules. This service ensures that all CPAP operations comply with requirements and maintain data consistency.

## Location

`src/lib/services/cpap-validation.service.ts`

## Key Features

- **Submission Validation**: Ensures CPAPs meet all requirements before submission
- **Status Transition Validation**: Enforces valid state machine transitions
- **Item Validation**: Validates individual CPAP item data integrity
- **Permission Validation**: Checks role-based permissions for CPAP actions
- **Business Rule Enforcement**: Validates timeline logic, required fields, and data constraints

## Methods

### validateForSubmission(cpap: CPAP): ValidationResult

Validates that a CPAP can be submitted for review.

**Checks:**
- CPAP has at least one item
- All items have required fields completed
- CPAP is in Draft or Revision_Requested status

**Returns:** `ValidationResult` with validation status and error messages

**Example:**
```typescript
const result = CPAPValidationService.validateForSubmission(cpap);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### validateStatusTransition(currentStatus: CPAPStatus, newStatus: CPAPStatus): boolean

Validates that a status transition is allowed according to the state machine.

**Valid Transitions:**
- Draft → Submitted
- Submitted → Approved or Revision_Requested
- Revision_Requested → Submitted
- Approved → (no transitions - terminal state)

**Returns:** `boolean` - true if transition is valid

**Example:**
```typescript
const isValid = CPAPValidationService.validateStatusTransition('Draft', 'Submitted');
if (!isValid) {
  throw new Error('Invalid status transition');
}
```

### validateItem(item: CPAPItemInput): ValidationResult

Validates individual CPAP item data integrity.

**Checks:**
- All required fields are present and non-empty
- Field length constraints (priority_area, responsible_person ≤ 255 chars)
- Timeline dates are valid
- Timeline end date is after start date

**Returns:** `ValidationResult` with validation status and error messages

**Example:**
```typescript
const result = CPAPValidationService.validateItem(itemData);
if (!result.valid) {
  showErrors(result.errors);
}
```

### validateUserPermission(userRole, userBarangayId, cpap, action): ValidationResult

Validates that a user has permission to perform an action on a CPAP.

**Parameters:**
- `userRole`: User's role (Admin, Officer, FS, Interviewer)
- `userBarangayId`: User's assigned barangay ID (for Officer role)
- `cpap`: The CPAP being accessed
- `action`: The action being performed (view, edit, submit, approve, request_revision, update_progress)

**Permission Rules:**
- **Admin**: Can perform all actions on all CPAPs
- **Officer**: Can only access their assigned barangay's CPAP
  - Can view, edit (Draft/Revision_Requested), submit, and update_progress (Approved)
  - Cannot approve or request_revision
- **FS/Interviewer**: No CPAP access

**Returns:** `ValidationResult` with validation status and error messages

**Example:**
```typescript
const result = CPAPValidationService.validateUserPermission(
  'Officer',
  123,
  cpap,
  'edit'
);
if (!result.valid) {
  return res.status(403).json({ error: result.errors[0] });
}
```

### validateForApproval(cpap: CPAP): ValidationResult

Validates that a CPAP can be approved.

**Checks:**
- CPAP is in Submitted status

**Returns:** `ValidationResult` with validation status and error messages

### validateForRevisionRequest(cpap: CPAP, comments: string): ValidationResult

Validates that a revision can be requested for a CPAP.

**Checks:**
- CPAP is in Submitted status
- Comments are provided and non-empty

**Returns:** `ValidationResult` with validation status and error messages

### validateProgressUpdate(cpap: CPAP, updates: any[]): ValidationResult

Validates progress update data.

**Checks:**
- CPAP is in Approved status
- At least one item is being updated
- Each update has an item ID
- Each update has at least one progress field (actual_output, accomplishment_status, or remarks)

**Returns:** `ValidationResult` with validation status and error messages

### validateForEdit(cpap: CPAP): ValidationResult

Validates that a CPAP can be edited.

**Checks:**
- CPAP is in Draft or Revision_Requested status

**Returns:** `ValidationResult` with validation status and error messages

## Usage in API Endpoints

### Example: Submit CPAP Endpoint

```typescript
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';
import { CPAPService } from '@/lib/services/cpap.service';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const cpapId = parseInt(params.id);
    
    // Get CPAP
    const cpap = await CPAPService.getCPAPById(cpapId);
    
    // Validate user permission
    const permissionResult = CPAPValidationService.validateUserPermission(
      userRole,
      userBarangayId,
      cpap,
      'submit'
    );
    
    if (!permissionResult.valid) {
      return Response.json(
        { success: false, error: permissionResult.errors[0] },
        { status: 403 }
      );
    }
    
    // Validate for submission
    const validationResult = CPAPValidationService.validateForSubmission(cpap);
    
    if (!validationResult.valid) {
      return Response.json(
        { success: false, errors: validationResult.errors },
        { status: 400 }
      );
    }
    
    // Submit CPAP
    await CPAPService.submitCPAP(cpapId);
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to submit CPAP' },
      { status: 500 }
    );
  }
}
```

## Validation Result Type

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

## Status Transition State Machine

```
Draft
  ↓
Submitted
  ↓ ↘
Approved  Revision_Requested
            ↓
          Submitted
```

## Requirements Coverage

This service implements the following requirements:

- **Requirement 3.2**: Validates all required CPAP_Item fields are completed before submission
- **Requirement 3.3**: Displays specific validation errors if submission fails
- **Requirement 10.1**: Returns HTTP 401 for unauthenticated users
- **Requirement 10.2**: Returns HTTP 403 for OFFICER_User accessing other barangays
- **Requirement 10.3**: Returns HTTP 403 for FS_User or INTERVIEWER_User accessing CPAP endpoints

## Best Practices

1. **Always validate before state changes**: Call validation methods before performing any CPAP operations
2. **Return specific error messages**: Use the errors array to provide actionable feedback to users
3. **Check permissions early**: Validate user permissions before fetching or modifying data
4. **Use appropriate HTTP status codes**: 400 for validation errors, 403 for permission errors
5. **Log validation failures**: Track validation failures for security monitoring

## Testing

The validation service should be tested with:
- Valid and invalid CPAP data
- All status transition combinations
- All user role and permission scenarios
- Edge cases (empty strings, null values, invalid dates)
- Boundary conditions (field length limits)

## Related Services

- **CPAPService**: Uses validation service for business logic operations
- **CPAPPermissionService**: Complements validation with detailed permission checks
- **NotificationService**: Triggered after successful validation and state changes
