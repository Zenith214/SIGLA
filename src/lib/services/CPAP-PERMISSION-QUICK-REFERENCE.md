# CPAP Permission Service - Quick Reference

## Import

```typescript
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
```

## Common Patterns

### 1. Check Access Before Fetching CPAP

```typescript
const canAccess = await CPAPPermissionService.canAccessCPAP(userId, userRole, cpapId);
if (!canAccess) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

### 2. Check Edit Permission Before Update

```typescript
const canEdit = await CPAPPermissionService.canEditCPAP(userId, userRole, cpapId);
if (!canEdit) {
  return NextResponse.json({ error: 'Cannot edit this CPAP' }, { status: 403 });
}
```

### 3. Check Submit Permission

```typescript
const canSubmit = await CPAPPermissionService.canSubmitCPAP(userId, userRole, cpapId);
if (!canSubmit) {
  return NextResponse.json({ error: 'Cannot submit this CPAP' }, { status: 403 });
}
```

### 4. Check Admin Review Permission

```typescript
const canReview = await CPAPPermissionService.canReviewCPAP(userId, userRole);
if (!canReview) {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}
```

### 5. Check Progress Update Permission

```typescript
const canUpdate = await CPAPPermissionService.canUpdateProgress(userId, userRole, cpapId);
if (!canUpdate) {
  return NextResponse.json({ error: 'Cannot update progress' }, { status: 403 });
}
```

### 6. Get User's Assigned Barangay

```typescript
const barangayId = await CPAPPermissionService.getUserBarangay(userId);
if (!barangayId) {
  return NextResponse.json({ error: 'No barangay assigned' }, { status: 400 });
}
```

### 7. Check Create Permission for Barangay

```typescript
const canCreate = await CPAPPermissionService.canCreateCPAPForBarangay(userId, userRole, barangayId);
if (!canCreate) {
  return NextResponse.json({ error: 'Cannot create CPAP for this barangay' }, { status: 403 });
}
```

## Role-Based Quick Checks

### ADMIN Operations

```typescript
// Admins can review any CPAP
if (userRole.toLowerCase() === 'admin') {
  // Approve or request revision
}
```

### OFFICER Operations

```typescript
// Officers need barangay check
const userBarangayId = await CPAPPermissionService.getUserBarangay(userId);
if (cpap.barangay_id !== userBarangayId) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

### FS/INTERVIEWER Blocking

```typescript
// Block FS and INTERVIEWER from all CPAP operations
const role = userRole.toLowerCase();
if (role === 'fs' || role === 'interviewer') {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

## Status-Based Checks

### Draft Status

```typescript
// Can edit and submit
if (cpap.status === 'Draft') {
  const canEdit = await CPAPPermissionService.canEditCPAP(userId, userRole, cpapId);
  const canSubmit = await CPAPPermissionService.canSubmitCPAP(userId, userRole, cpapId);
}
```

### Submitted Status

```typescript
// Only admin can approve or request revision
if (cpap.status === 'Submitted') {
  const canReview = await CPAPPermissionService.canReviewCPAP(userId, userRole);
}
```

### Approved Status

```typescript
// Officer can update progress
if (cpap.status === 'Approved') {
  const canUpdate = await CPAPPermissionService.canUpdateProgress(userId, userRole, cpapId);
}
```

### Revision_Requested Status

```typescript
// Officer can edit and resubmit
if (cpap.status === 'Revision_Requested') {
  const canEdit = await CPAPPermissionService.canEditCPAP(userId, userRole, cpapId);
  const canSubmit = await CPAPPermissionService.canSubmitCPAP(userId, userRole, cpapId);
}
```

## Complete API Endpoint Example

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { CPAPPermissionService } from '@/lib/services/cpap-permission.service';
import { CPAPService } from '@/lib/services/cpap.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Verify authentication
  const authResult = verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cpapId = parseInt(params.id);
  const { id: userId, role: userRole } = authResult.user;

  // 2. Check permission
  const canAccess = await CPAPPermissionService.canAccessCPAP(userId, userRole, cpapId);
  if (!canAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // 3. Fetch data
  try {
    const cpap = await CPAPService.getCPAPById(cpapId);
    return NextResponse.json({ success: true, cpap });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CPAP' }, { status: 500 });
  }
}
```

## Permission Matrix

| Method | ADMIN | OFFICER (Own) | OFFICER (Other) | FS/INTERVIEWER |
|--------|-------|---------------|-----------------|----------------|
| `canAccessCPAP` | ✅ | ✅ | ❌ | ❌ |
| `canEditCPAP` | ❌ | ✅ (Draft/Revision) | ❌ | ❌ |
| `canSubmitCPAP` | ❌ | ✅ (Draft/Revision) | ❌ | ❌ |
| `canReviewCPAP` | ✅ | ❌ | ❌ | ❌ |
| `canUpdateProgress` | ❌ | ✅ (Approved) | ❌ | ❌ |
| `canCreateCPAPForBarangay` | ❌ | ✅ (Own) | ❌ | ❌ |

## Common Errors

### 401 Unauthorized
```typescript
// No valid authentication token
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

### 403 Forbidden
```typescript
// User doesn't have permission
return NextResponse.json({ error: 'Access denied' }, { status: 403 });
```

### 404 Not Found
```typescript
// CPAP doesn't exist
return NextResponse.json({ error: 'CPAP not found' }, { status: 404 });
```

## Tips

1. **Always check authentication first** before permission checks
2. **Use consistent error messages** for security (don't reveal why access was denied)
3. **Log permission denials** for security auditing
4. **Cache user barangay** if making multiple permission checks in one request
5. **Test with all role combinations** to ensure proper access control
