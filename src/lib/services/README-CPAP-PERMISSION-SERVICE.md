# CPAP Permission Service

## Overview

The `CPAPPermissionService` provides authorization checks for all CPAP (Citizen Priority Action Plan) operations. It enforces role-based access control (RBAC) to ensure users can only perform actions appropriate to their role and assigned barangay.

## Key Concepts

### User Roles

- **ADMIN**: Full access to all CPAPs across all barangays. Can review, approve, and request revisions.
- **OFFICER**: Can create, edit, and submit CPAPs only for their assigned barangay. Can update progress on approved CPAPs.
- **FS (Field Supervisor)**: No access to CPAP module.
- **INTERVIEWER**: No access to CPAP module.

### User-Barangay Assignment

Officers are assigned to barangays through the `Assignment` table. The service queries this table to determine which barangay an officer is responsible for. Only active assignments are considered.

### CPAP Status-Based Permissions

Different operations are allowed based on the CPAP's current status:

- **Draft**: OFFICER can edit and submit
- **Submitted**: Only ADMIN can approve or request revision
- **Approved**: OFFICER can update progress; ADMIN can view
- **Revision_Requested**: OFFICER can edit and resubmit

## API Reference

### `getUserBarangay(userId: number): Promise<number | null>`

Retrieves the barangay ID assigned to a user.

**Parameters:**
- `userId`: The user's ID

**Returns:**
- `number`: The barangay ID if user has an active assignment
- `null`: If user has no active assignment

**Example:**
```typescript
const barangayId = await CPAPPermissionService.getUserBarangay(123);
if (barangayId) {
  console.log(`User is assigned to barangay ${barangayId}`);
}
```

### `canAccessCPAP(userId: number, userRole: string, cpapId: number): Promise<boolean>`

Checks if a user can view a specific CPAP.

**Authorization Rules:**
- ADMIN: Can access any CPAP
- OFFICER: Can only access CPAPs for their assigned barangay
- FS/INTERVIEWER: Cannot access any CPAP

**Parameters:**
- `userId`: The user's ID
- `userRole`: The user's role (case-insensitive)
- `cpapId`: The CPAP ID to check

**Returns:**
- `true`: User can access the CPAP
- `false`: User cannot access the CPAP

**Example:**
```typescript
const canAccess = await CPAPPermissionService.canAccessCPAP(123, 'officer', 456);
if (!canAccess) {
  return res.status(403).json({ error: 'Access denied' });
}
```

### `canEditCPAP(userId: number, userRole: string, cpapId: number): Promise<boolean>`

Checks if a user can edit a specific CPAP.

**Authorization Rules:**
- Only OFFICER role can edit
- Can only edit CPAPs for their assigned barangay
- Can only edit when status is Draft or Revision_Requested

**Parameters:**
- `userId`: The user's ID
- `userRole`: The user's role
- `cpapId`: The CPAP ID to check

**Returns:**
- `true`: User can edit the CPAP
- `false`: User cannot edit the CPAP

**Example:**
```typescript
const canEdit = await CPAPPermissionService.canEditCPAP(123, 'officer', 456);
if (!canEdit) {
  return res.status(403).json({ error: 'Cannot edit this CPAP' });
}
```

### `canSubmitCPAP(userId: number, userRole: string, cpapId: number): Promise<boolean>`

Checks if a user can submit a specific CPAP for review.

**Authorization Rules:**
- Only OFFICER role can submit
- Can only submit CPAPs for their assigned barangay
- Can only submit when status is Draft or Revision_Requested

**Parameters:**
- `userId`: The user's ID
- `userRole`: The user's role
- `cpapId`: The CPAP ID to check

**Returns:**
- `true`: User can submit the CPAP
- `false`: User cannot submit the CPAP

**Example:**
```typescript
const canSubmit = await CPAPPermissionService.canSubmitCPAP(123, 'officer', 456);
if (!canSubmit) {
  return res.status(403).json({ error: 'Cannot submit this CPAP' });
}
```

### `canReviewCPAP(userId: number, userRole: string): Promise<boolean>`

Checks if a user can review CPAPs (approve or request revision).

**Authorization Rules:**
- Only ADMIN role can review

**Parameters:**
- `userId`: The user's ID
- `userRole`: The user's role

**Returns:**
- `true`: User can review CPAPs
- `false`: User cannot review CPAPs

**Example:**
```typescript
const canReview = await CPAPPermissionService.canReviewCPAP(123, 'admin');
if (!canReview) {
  return res.status(403).json({ error: 'Admin access required' });
}
```

### `canUpdateProgress(userId: number, userRole: string, cpapId: number): Promise<boolean>`

Checks if a user can update progress on a specific CPAP.

**Authorization Rules:**
- Only OFFICER role can update progress
- Can only update progress for their assigned barangay
- Can only update progress when status is Approved

**Parameters:**
- `userId`: The user's ID
- `userRole`: The user's role
- `cpapId`: The CPAP ID to check

**Returns:**
- `true`: User can update progress
- `false`: User cannot update progress

**Example:**
```typescript
const canUpdate = await CPAPPermissionService.canUpdateProgress(123, 'officer', 456);
if (!canUpdate) {
  return res.status(403).json({ error: 'Cannot update progress on this CPAP' });
}
```

### `canCreateCPAPForBarangay(userId: number, userRole: string, barangayId: number): Promise<boolean>`

Checks if a user can create a CPAP for a specific barangay.

**Authorization Rules:**
- Only OFFICER role can create CPAPs
- Can only create CPAPs for their assigned barangay

**Parameters:**
- `userId`: The user's ID
- `userRole`: The user's role
- `barangayId`: The barangay ID to check

**Returns:**
- `true`: User can create CPAP for the barangay
- `false`: User cannot create CPAP for the barangay

**Example:**
```typescript
const canCreate = await CPAPPermissionService.canCreateCPAPForBarangay(123, 'officer', 789);
if (!canCreate) {
  return res.status(403).json({ error: 'Cannot create CPAP for this barangay' });
}
```

## Usage in API Endpoints

### Example: GET /api/cpap/[id]

```typescript
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const cpapId = parseInt(params.id);
  const { id: userId, role: userRole } = authResult.user;

  // Check if user can access this CPAP
  const canAccess = await CPAPPermissionService.canAccessCPAP(
    userId,
    userRole,
    cpapId
  );

  if (!canAccess) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Proceed with fetching CPAP data
  // ...
}
```

### Example: PUT /api/cpap/[id]

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const cpapId = parseInt(params.id);
  const { id: userId, role: userRole } = authResult.user;

  // Check if user can edit this CPAP
  const canEdit = await CPAPPermissionService.canEditCPAP(
    userId,
    userRole,
    cpapId
  );

  if (!canEdit) {
    return NextResponse.json(
      { error: 'Cannot edit this CPAP' },
      { status: 403 }
    );
  }

  // Proceed with updating CPAP
  // ...
}
```

### Example: POST /api/cpap/[id]/approve

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: userId, role: userRole } = authResult.user;

  // Check if user can review CPAPs
  const canReview = await CPAPPermissionService.canReviewCPAP(userId, userRole);

  if (!canReview) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  // Proceed with approving CPAP
  // ...
}
```

## Permission Matrix

| Operation | ADMIN | OFFICER (Own Barangay) | OFFICER (Other Barangay) | FS | INTERVIEWER |
|-----------|-------|------------------------|--------------------------|-----|-------------|
| View CPAP | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create CPAP | ❌ | ✅ | ❌ | ❌ | ❌ |
| Edit CPAP (Draft) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Edit CPAP (Revision_Requested) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Submit CPAP | ❌ | ✅ | ❌ | ❌ | ❌ |
| Approve CPAP | ✅ | ❌ | ❌ | ❌ | ❌ |
| Request Revision | ✅ | ❌ | ❌ | ❌ | ❌ |
| Update Progress (Approved) | ❌ | ✅ | ❌ | ❌ | ❌ |
| List All CPAPs | ✅ | ❌ | ❌ | ❌ | ❌ |
| List Own CPAPs | ✅ | ✅ | ❌ | ❌ | ❌ |

## Error Handling

All permission methods return `false` if an error occurs during the check. This ensures a fail-safe approach where access is denied by default if something goes wrong.

Errors are logged to the console for debugging purposes:

```typescript
console.error('Error in canAccessCPAP:', error);
```

## Testing

When testing permission logic, ensure you:

1. Test all role combinations (ADMIN, OFFICER, FS, INTERVIEWER)
2. Test with valid and invalid barangay assignments
3. Test all CPAP status transitions
4. Test edge cases (no assignment, multiple assignments, etc.)

Example test:

```typescript
describe('CPAPPermissionService', () => {
  describe('canEditCPAP', () => {
    it('should allow OFFICER to edit Draft CPAP for their barangay', async () => {
      const canEdit = await CPAPPermissionService.canEditCPAP(
        officerUserId,
        'officer',
        draftCpapId
      );
      expect(canEdit).toBe(true);
    });

    it('should deny OFFICER editing Submitted CPAP', async () => {
      const canEdit = await CPAPPermissionService.canEditCPAP(
        officerUserId,
        'officer',
        submittedCpapId
      );
      expect(canEdit).toBe(false);
    });

    it('should deny ADMIN editing any CPAP', async () => {
      const canEdit = await CPAPPermissionService.canEditCPAP(
        adminUserId,
        'admin',
        draftCpapId
      );
      expect(canEdit).toBe(false);
    });
  });
});
```

## Security Considerations

1. **Always normalize role strings**: Use `.toLowerCase()` to handle case variations
2. **Fail-safe defaults**: Return `false` on errors to deny access by default
3. **Check both role and barangay**: For OFFICER operations, verify both role and barangay assignment
4. **Status validation**: Always check CPAP status before allowing operations
5. **Audit logging**: Consider adding audit logs for permission checks in production

## Related Services

- **CPAPService**: Business logic for CPAP operations
- **CPAPValidationService**: Data validation for CPAP submissions
- **NotificationService**: Notifications for CPAP status changes

## Requirements Mapping

This service implements the following requirements:

- **Requirement 10.1**: Authentication check for all CPAP endpoints
- **Requirement 10.2**: OFFICER can only access their assigned barangay's CPAP
- **Requirement 10.3**: FS and INTERVIEWER receive 403 Forbidden
- **Requirement 10.4**: ADMIN can access any CPAP
- **Requirement 10.5**: Access attempt logging (via console.error)
