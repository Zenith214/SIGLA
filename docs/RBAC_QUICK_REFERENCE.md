# Role-Based Access Control - Quick Reference

## Role Overview

| Role | Code | Access Level | Primary Use |
|------|------|--------------|-------------|
| Admin | `admin` | Full system access | System administration |
| Field Supervisor | `fs` | FS dashboard + Interviewer routes | Field operations management |
| Interviewer | `interviewer` | Survey forms + assigned data | Conducting surveys |
| Viewer | `viewer` | Read-only dashboards | Viewing reports |

## Route Access Matrix

| Route | Admin | FS | Interviewer | Viewer |
|-------|-------|----|-----------|----|
| `/settings` | ✅ | ❌ | ❌ | ❌ |
| `/fs-dashboard` | ✅ | ✅ | ❌ | ❌ |
| `/survey/forms` | ✅ | ✅ | ✅ | ❌ |
| `/dashboard` | ✅ | ✅ | ❌ | ✅ |
| `/api/users` | ✅ | ❌ | ❌ | ❌ |
| `/api/spots` | ✅ | ✅ | ❌ | ❌ |
| `/api/fi/assignments` | ✅ | ✅ | ✅ | ❌ |
| `/api/visits` | ✅ | ✅ | ✅ | ❌ |
| `/api/survey-responses` | ✅ | ✅ | ✅ | ❌ |

## Adding Role Checks

### In Middleware
```typescript
// Add to appropriate route array
const NEW_ROLE_ROUTES = [
  '/new-route',
  '/api/new-endpoint',
];

// Add check in middleware
if (NEW_ROLE_ROUTES.some(route => pathname.startsWith(route))) {
  if (userRole !== 'required_role' && userRole !== 'admin') {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
}
```

### In API Routes
```typescript
import { verifyRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Check role
  const hasAccess = await verifyRole(request, ['admin', 'fs']);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  // Your logic here
}
```

### In Client Components
```typescript
'use client';
import { useUser } from '@/hooks/useUser';

export function MyComponent() {
  const { user } = useUser();
  
  if (user?.role !== 'admin' && user?.role !== 'fs') {
    return <div>Access Denied</div>;
  }
  
  return <div>Protected Content</div>;
}
```

## Creating Users with Roles

### Via Admin Panel
1. Navigate to Settings > Users & Roles
2. Click "Add User"
3. Fill in user details
4. Select role from dropdown: admin, fs, interviewer, or viewer
5. Click "Save"

### Via API
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'secure_password',
    role: 'fs', // admin, fs, interviewer, or viewer
    status: 'active'
  })
});
```

## Updating User Roles

### Via Admin Panel
1. Navigate to Settings > Users & Roles
2. Click edit icon next to user
3. Change role in dropdown
4. Click "Save"

### Via API
```typescript
const response = await fetch(`/api/users/${userId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'fs' // admin, fs, interviewer, or viewer
  })
});
```

## Common Patterns

### Checking User Role in Component
```typescript
const isAdmin = user?.role === 'admin';
const isFS = user?.role === 'fs';
const isInterviewer = user?.role === 'interviewer';
const canManageSpots = isAdmin || isFS;
```

### Conditional Rendering
```typescript
{user?.role === 'admin' && (
  <AdminOnlyComponent />
)}

{(user?.role === 'admin' || user?.role === 'fs') && (
  <FSComponent />
)}
```

### Redirecting Based on Role
```typescript
if (user?.role === 'interviewer') {
  router.push('/survey/forms');
} else if (user?.role === 'fs') {
  router.push('/fs-dashboard');
} else {
  router.push('/dashboard');
}
```

## Testing Roles

### Manual Testing
1. Create test users with different roles
2. Log in as each user
3. Verify access to appropriate routes
4. Verify denial of unauthorized routes

### Automated Testing
```bash
node scripts/test-role-based-access-control.js
```

## Troubleshooting

### User Can't Access Route
1. Check user's role in database
2. Verify route is in appropriate array in middleware
3. Check middleware logs for authentication errors
4. Verify JWT token is valid

### Role Not Updating
1. Clear browser cookies
2. Log out and log back in
3. Check API response for errors
4. Verify admin permissions

### 403 Forbidden Error
- User is authenticated but lacks required role
- Check route requirements in middleware
- Verify user has correct role assigned

### 401 Unauthorized Error
- User is not authenticated
- JWT token is missing or invalid
- User needs to log in again

## Best Practices

1. **Always check roles server-side** - Client-side checks are for UX only
2. **Use role arrays** - Allow multiple roles when appropriate
3. **Fail securely** - Deny access by default
4. **Log access attempts** - Track unauthorized access attempts
5. **Keep roles simple** - Don't over-complicate the role structure
6. **Document changes** - Update this guide when adding new roles or routes

## Related Documentation

- [Full Implementation Guide](./ROLE_BASED_ACCESS_CONTROL_IMPLEMENTATION.md)
- [Task 18 Completion Summary](./TASK_18_COMPLETION_SUMMARY.md)
- [Middleware Documentation](../middleware.ts)
- [User Management Component](../src/app/settings/ui/sections/users-roles.tsx)
