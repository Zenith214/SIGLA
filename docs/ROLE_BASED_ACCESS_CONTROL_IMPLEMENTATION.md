# Role-Based Access Control Implementation

## Overview

This document describes the implementation of role-based access control (RBAC) for the PULSE system, including the addition of the Field Supervisor (FS) role and comprehensive middleware protection.

## Implementation Date

November 16, 2025

## Changes Made

### 1. Middleware Updates (`middleware.ts`)

#### Added FS Role Support
- Added `FS_ROUTES` constant for Field Supervisor-specific routes
- Added `FI_ROUTES` constant for Field Interviewer-specific routes
- Updated route protection logic to support FS role

#### Protected Routes

**Admin-Only Routes:**
- `/settings`
- `/api/users`
- `/api/barangays`
- `/api/survey-cycles`
- `/api/survey-targets`
- `/api/assignments`
- `/api/backups`

**Field Supervisor Routes (FS + Admin):**
- `/fs-dashboard`
- `/api/spots`
- `/api/fs/monitoring`

**Interviewer Routes (Interviewer + FS + Admin):**
- `/survey/forms`
- `/survey/barangay`

**FI-Specific Routes (Interviewer + FS + Admin):**
- `/api/fi/assignments`
- `/api/questionnaires`
- `/api/visits`
- `/api/sync`
- `/api/survey-responses`

#### Access Control Logic

```typescript
// FS routes: FS and Admin can access
if (FS_ROUTES.some(route => pathname.startsWith(route))) {
  if (userRole !== 'fs' && userRole !== 'admin') {
    return 403 Forbidden
  }
}

// FI routes: Interviewer, FS, and Admin can access
if (FI_ROUTES.some(route => pathname.startsWith(route))) {
  if (userRole !== 'interviewer' && userRole !== 'fs' && userRole !== 'admin') {
    return 403 Forbidden
  }
}
```

### 2. User Management Updates

#### Admin Panel (`src/app/settings/ui/sections/users-roles.tsx`)

**Added FS Role Option:**
- Updated `roleOptions` array to include "fs"
- Added FS role to role statistics display
- Added FS role badge styling (purple theme)
- Updated role permissions documentation

**Role Statistics:**
- Admin: Red theme
- Field Supervisor (FS): Purple theme
- Interviewer: Blue theme
- Viewer: Gray theme

**Role Permissions Display:**
```
Admin:
- Manage all settings
- Create/delete users
- Export data
- System backup

Field Supervisor (FS):
- Allocate spots and assignments
- Monitor fieldwork progress
- Manage interviewer assignments
- View performance metrics

Interviewer:
- Conduct interviews
- View assigned barangays
- Submit responses
- Basic reporting

Viewer:
- View reports
- Export reports
- Dashboard access
- No data modification
```

#### API Endpoint Updates

**User Role Update Endpoint (`src/app/api/users/[id]/route.ts`):**
- Updated PATCH endpoint to accept "fs" role
- Updated role validation to include "fs" in allowed roles

```typescript
if (!role || !['admin', 'fs', 'interviewer', 'viewer'].includes(role)) {
  return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
}
```

## Role Hierarchy

```
Admin (Highest)
  ├─ Full system access
  ├─ Can access all routes
  └─ Can manage all users

Field Supervisor (FS)
  ├─ Can access FS dashboard
  ├─ Can manage spots and assignments
  ├─ Can monitor field operations
  ├─ Can access interviewer routes
  └─ Cannot access admin settings

Interviewer
  ├─ Can conduct surveys
  ├─ Can access assigned spots
  ├─ Can submit responses
  └─ Cannot access FS or admin features

Viewer (Lowest)
  ├─ Read-only access
  ├─ Can view dashboards
  └─ Cannot modify data
```

## Testing

### Manual Testing Checklist

- [x] Admin can create users with FS role
- [x] Admin can update existing users to FS role
- [x] FS users can access `/fs-dashboard`
- [x] FS users can access `/api/spots`
- [x] FS users can access `/api/fs/monitoring`
- [x] FS users can access interviewer routes
- [x] FS users cannot access admin routes
- [x] Interviewer users cannot access FS routes
- [x] Viewer users cannot access FS or interviewer routes
- [x] Role badges display correctly in user list
- [x] Role statistics show FS count correctly

### Automated Testing

Run the test script:
```bash
node scripts/test-role-based-access-control.js
```

This script tests:
1. User creation with FS role
2. User role updates to FS
3. Route access for each role
4. Proper denial of unauthorized access

## Security Considerations

### Authentication Flow
1. User logs in with credentials
2. JWT token issued with role information
3. Token stored in httpOnly cookie
4. Middleware validates token on each request
5. Role checked against route requirements
6. Access granted or denied based on role

### Token Validation
- JWT tokens are verified on every protected route
- Invalid or expired tokens result in 401 Unauthorized
- Missing tokens redirect to login page

### Role Validation
- Roles are validated against allowed values
- Invalid roles are rejected with 400 Bad Request
- Role changes require admin privileges

## API Response Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 400 | Bad Request | Invalid role value |

## Migration Notes

### Existing Users
- Existing users retain their current roles
- Admin can update any user to FS role
- No database migration required (role field already exists)

### Backward Compatibility
- All existing routes continue to work
- Existing role checks remain functional
- New FS routes are additive, not breaking

## Future Enhancements

### Potential Improvements
1. **Granular Permissions**: Add permission-based access control within roles
2. **Role Inheritance**: Implement role hierarchy with inherited permissions
3. **Audit Logging**: Log all role changes and access attempts
4. **Session Management**: Add ability to revoke sessions
5. **Multi-Factor Authentication**: Add MFA for admin and FS roles

### Scalability Considerations
- Consider moving role definitions to database
- Implement role caching for performance
- Add role-based rate limiting
- Consider implementing permission groups

## Related Files

### Modified Files
- `middleware.ts` - Route protection and role checks
- `src/app/settings/ui/sections/users-roles.tsx` - User management UI
- `src/app/api/users/[id]/route.ts` - User role update API

### New Files
- `scripts/test-role-based-access-control.js` - Automated testing script
- `docs/ROLE_BASED_ACCESS_CONTROL_IMPLEMENTATION.md` - This documentation

## References

- Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
- Design Document: Section on Backend Role Management
- Tasks: Task 18 - Implement role-based access control

## Support

For issues or questions about role-based access control:
1. Check middleware logs for authentication errors
2. Verify user role in database
3. Test with the automated test script
4. Review this documentation for expected behavior

## Changelog

### November 16, 2025
- Initial implementation of FS role
- Updated middleware with comprehensive route protection
- Added FS role to user management UI
- Created automated test script
- Documented implementation
