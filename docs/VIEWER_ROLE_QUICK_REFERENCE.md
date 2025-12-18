# Viewer Role - Quick Reference Guide

## For Developers

### Using Permissions in React Components

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { isViewer, canWrite, canEditCPAP } = usePermissions();

  return (
    <div>
      {/* Show content to all users */}
      <DataDisplay />
      
      {/* Hide action buttons from viewers */}
      {canWrite && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
      
      {/* Show viewer-specific message */}
      {isViewer && (
        <Alert>You are viewing in read-only mode</Alert>
      )}
    </div>
  );
}
```

### Protecting API Routes

```typescript
import { requireWritePermission, verifyAuth } from '@/lib/auth-middleware';

export async function POST(request: NextRequest) {
  // Check authentication first
  const authResult = verifyAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check write permission (blocks viewers)
  const writeError = requireWritePermission(request);
  if (writeError) {
    return NextResponse.json({ error: writeError.error }, { status: 403 });
  }

  // Continue with write operation
  // ...
}
```

### Manual Permission Checks

```typescript
import { 
  isViewer, 
  canPerformWriteOperations,
  canEditCPAP 
} from '@/lib/permissions';

const user = { role: 'viewer', id: 1 };

if (isViewer(user)) {
  console.log('User is a viewer');
}

if (!canPerformWriteOperations(user)) {
  console.log('User cannot write');
}

if (canEditCPAP(user)) {
  // Allow editing
}
```

## Permission Functions Reference

### User Type Checks
- `isViewer(user)` - Returns true if user is a viewer
- `isAdminOrDeveloper(user)` - Returns true if user is admin or developer
- `hasRole(user, role)` - Check specific role
- `hasAnyRole(user, roles)` - Check if user has any of the roles

### Access Checks
- `canAccessMainDashboard(user)` - All authenticated users
- `canAccessCPAPDashboard(user)` - Admin, Developer, Officer, Viewer
- `canAccessBackupSettings(user)` - All authenticated users
- `canAccessAdminSettings(user)` - Admin, Developer only

### Operation Checks
- `canPerformWriteOperations(user)` - All except Viewer
- `canEditCPAP(user)` - Admin, Developer, Officer
- `canSubmitCPAP(user)` - Admin, Developer, Officer
- `canPerformSurveyOperations(user)` - All except Viewer
- `canManageUsers(user)` - Admin, Developer only
- `canManageBarangays(user)` - Admin, Developer only
- `canManageSurveyCycles(user)` - Admin, Developer only

## Common Patterns

### Conditional Rendering

```typescript
// Hide button for viewers
{!isViewer && <Button>Create New</Button>}

// Show different content for viewers
{isViewer ? (
  <ViewOnlyMessage />
) : (
  <EditForm />
)}

// Disable button for viewers
<Button disabled={isViewer}>Submit</Button>
```

### Passing Props

```typescript
// Pass permission to child component
<ItemList 
  items={items}
  canEdit={canEditCPAP}
  canDelete={canWrite}
/>
```

### API Error Handling

```typescript
try {
  const response = await fetch('/api/cpap', { method: 'POST', ... });
  if (response.status === 403) {
    toast.error('You do not have permission to perform this action');
  }
} catch (error) {
  // Handle error
}
```

## Test User

**Email**: viewer@sigla.com  
**Password**: viewer123

## Role Hierarchy

```
Admin/Developer (Full Access)
    ↓
Officer (Can manage CPAP, perform operations)
    ↓
Viewer (Read-only access to dashboards)
    ↓
FS/Interviewer (Field operations only)
```

## Quick Checklist for New Features

When adding new features, ensure:

- [ ] Import `usePermissions` hook in component
- [ ] Hide/disable action buttons for viewers
- [ ] Add viewer check in API routes (POST/PUT/DELETE)
- [ ] Show appropriate message for viewers
- [ ] Test with viewer account
- [ ] Update documentation if needed

## Common Mistakes to Avoid

❌ **Don't**: Only hide UI elements
```typescript
// Bad - viewer can still call API
{!isViewer && <Button onClick={deleteItem}>Delete</Button>}
```

✅ **Do**: Protect both UI and API
```typescript
// Good - UI hidden AND API protected
{!isViewer && <Button onClick={deleteItem}>Delete</Button>}

// In API route
const writeError = requireWritePermission(request);
if (writeError) return NextResponse.json(...);
```

❌ **Don't**: Hardcode role checks
```typescript
// Bad - not maintainable
if (user.role === 'viewer') { ... }
```

✅ **Do**: Use permission functions
```typescript
// Good - centralized logic
if (isViewer(user)) { ... }
```

## Debugging Tips

1. **Check user role in browser console**
   ```javascript
   // In browser console
   localStorage.getItem('user')
   ```

2. **Check API response**
   ```javascript
   // Look for 403 status and error message
   console.log(response.status, await response.json())
   ```

3. **Verify permission function**
   ```typescript
   console.log('Can write:', canWrite);
   console.log('Is viewer:', isViewer);
   ```

4. **Check JWT token**
   ```javascript
   // In browser console
   document.cookie.split(';').find(c => c.includes('pulse_token'))
   ```

## Need Help?

- Review: `docs/VIEWER_ROLE_IMPLEMENTATION.md`
- Check: `src/lib/permissions.ts` for all functions
- Test: Use viewer@sigla.com account
- Debug: Check browser console and API responses
