# CPAP Validation Service - Quick Reference

## Import

```typescript
import { CPAPValidationService } from '@/lib/services/cpap-validation.service';
```

## Common Patterns

### 1. Validate Before Submit

```typescript
const result = CPAPValidationService.validateForSubmission(cpap);
if (!result.valid) {
  return res.status(400).json({ errors: result.errors });
}
await CPAPService.submitCPAP(cpapId);
```

### 2. Check User Permission

```typescript
const permission = CPAPValidationService.validateUserPermission(
  userRole,
  userBarangayId,
  cpap,
  'edit'
);
if (!permission.valid) {
  return res.status(403).json({ error: permission.errors[0] });
}
```

### 3. Validate Item Before Save

```typescript
const itemResult = CPAPValidationService.validateItem(itemData);
if (!itemResult.valid) {
  showErrors(itemResult.errors);
  return;
}
```

### 4. Check Status Transition

```typescript
if (!CPAPValidationService.validateStatusTransition(currentStatus, newStatus)) {
  throw new Error('Invalid status transition');
}
```

## Validation Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `validateForSubmission(cpap)` | Check if CPAP can be submitted | ValidationResult |
| `validateStatusTransition(current, new)` | Check if status change is valid | boolean |
| `validateItem(item)` | Validate individual item data | ValidationResult |
| `validateUserPermission(role, barangayId, cpap, action)` | Check user permissions | ValidationResult |
| `validateForApproval(cpap)` | Check if CPAP can be approved | ValidationResult |
| `validateForRevisionRequest(cpap, comments)` | Check if revision can be requested | ValidationResult |
| `validateProgressUpdate(cpap, updates)` | Validate progress update data | ValidationResult |
| `validateForEdit(cpap)` | Check if CPAP can be edited | ValidationResult |

## Actions for validateUserPermission

- `'view'` - View CPAP details
- `'edit'` - Edit CPAP items
- `'submit'` - Submit CPAP for review
- `'approve'` - Approve CPAP (Admin only)
- `'request_revision'` - Request revision (Admin only)
- `'update_progress'` - Update progress on approved CPAP

## Status Transitions

```
Draft → Submitted
Submitted → Approved | Revision_Requested
Revision_Requested → Submitted
Approved → (no transitions)
```

## HTTP Status Codes

- `400` - Validation error (use `result.errors`)
- `403` - Permission denied (use `result.errors[0]`)
- `500` - Server error

## ValidationResult Type

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

## Common Validation Errors

### Submission Errors
- "CPAP must have at least one item before submission"
- "Item X: Priority area is required"
- "Item X: Timeline end date must be after start date"
- "Cannot submit CPAP in [status] status"

### Permission Errors
- "You do not have permission to access CPAP functionality"
- "You can only access CPAPs for your assigned barangay"
- "Only Admin users can approve or request revisions"
- "Cannot edit CPAP in [status] status"

### Status Errors
- "Cannot approve CPAP in [status] status"
- "Comments are required when requesting revision"
- "Cannot update progress for CPAP in [status] status"

## Tips

1. Always validate permissions before fetching data
2. Use specific error messages from `result.errors` array
3. Validate items individually before batch operations
4. Check status transitions before updating CPAP status
5. Log validation failures for security monitoring
