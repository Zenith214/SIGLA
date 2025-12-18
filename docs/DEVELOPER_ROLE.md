# Developer Role System

## Overview

The Developer role is a special system role that provides full access to all dashboards, API endpoints, and tools in the PULSE system. This role bypasses all middleware role checks and is designed for development, testing, and system administration purposes.

## Features

### Full Dashboard Access

Developer users can access all dashboards regardless of their intended role restrictions:

- **Main Dashboard** (`/dashboard`) - Overview and analytics
- **Field Supervisor Dashboard** (`/fs-dashboard`) - Field operations monitoring
- **CPAP Module** (`/cpap`) - Community Participation Action Plan
- **Admin CPAP** (`/admin/cpap`) - CPAP review and approval
- **Survey Forms** (`/survey/forms`) - Field interviewer interface
- **Analytics** (`/analytics`) - Advanced reporting
- **Settings** (`/settings`) - System configuration
- **Developer Dashboard** (`/dev-dashboard`) - Central hub for developers
- **Developer Tools** (`/tools`) - Seeding and testing utilities

### API Access

Developer role has unrestricted access to all API endpoints:

- `/api/users` - User management
- `/api/barangays` - Barangay data
- `/api/survey-cycles` - Survey cycle management
- `/api/assignments` - Assignment CRUD operations
- `/api/spots` - Spot management
- `/api/cpap` - CPAP operations
- `/api/analytics` - Analytics data
- `/api/questionnaires` - Survey questionnaires
- `/api/tools` - Development tools
- And all other API routes

### Developer Dashboard

The Developer Dashboard (`/dev-dashboard`) provides:

1. **Quick Access Panel** - Links to all dashboards with descriptions
2. **API Reference** - List of available API endpoints
3. **System Information** - Access level and system stats
4. **Developer Notes** - Important information and warnings

## Implementation

### Middleware

The developer role is checked first in the middleware before any other role checks:

```typescript
// Developer role has access to everything - bypass all checks
if (userRole === 'developer') {
  console.log('🔓 MIDDLEWARE - Developer role detected, granting full access');
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id.toString());
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-email', user.email);
  return response;
}
```

### Protected Route Component

The `ProtectedRoute` component supports role-based access with developer bypass:

```typescript
<ProtectedRoute allowedRoles={["developer"]}>
  {/* Developer-only content */}
</ProtectedRoute>
```

Developer role automatically bypasses the `allowedRoles` check.

## Setup

### 1. Database Migration

Run the SQL migration to add developer role support:

```bash
# Execute the migration script
psql -U your_user -d your_database -f database/add-developer-role.sql
```

Or manually create a developer user:

```sql
INSERT INTO users (
  first_name, last_name, email, password, role,
  phone, organization, job_title, created_at, updated_at
) VALUES (
  'System', 'Developer', 'developer@pulse.local',
  '$2b$10$YourHashedPasswordHere', 'developer',
  '+1234567890', 'PULSE Development', 'System Developer',
  NOW(), NOW()
);
```

### 2. Generate Password Hash

Use bcrypt to generate a password hash:

```javascript
const bcrypt = require('bcrypt');
const password = 'your_secure_password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

### 3. Update User Role

To grant developer access to an existing user:

```sql
UPDATE users 
SET role = 'developer', updated_at = NOW()
WHERE email = 'user@example.com';
```

## Usage

### Accessing the Developer Dashboard

1. Log in with a developer account
2. Navigate to `/dev-dashboard`
3. Use the dashboard to access all system areas

### Testing Different Roles

As a developer, you can:

1. Access any dashboard to test role-specific features
2. Test API endpoints without permission restrictions
3. Use the Tools dashboard for seeding and testing
4. Verify role-based UI elements across all dashboards

### Development Workflow

```bash
# 1. Start development server
npm run dev

# 2. Log in as developer
# Email: developer@pulse.local
# Password: [your password]

# 3. Access developer dashboard
# http://localhost:3000/dev-dashboard

# 4. Navigate to any dashboard or tool
```

## Security Considerations

### ⚠️ Important Warnings

1. **Development Only** - The developer role should ONLY be used in development environments
2. **Production Risk** - Never deploy developer accounts to production
3. **Access Control** - Developer role bypasses ALL security checks
4. **Audit Trail** - Developer actions should be logged and monitored

### Production Deployment

Before deploying to production:

```sql
-- Disable all developer accounts
UPDATE users SET role = 'admin', updated_at = NOW()
WHERE role = 'developer';

-- Or delete developer accounts entirely
DELETE FROM users WHERE role = 'developer';

-- Verify no developer accounts exist
SELECT * FROM users WHERE role = 'developer';
```

### Environment-Based Access

Consider adding environment checks:

```typescript
// In middleware or protected routes
if (userRole === 'developer' && process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { error: 'Developer role not allowed in production' },
    { status: 403 }
  );
}
```

## Role Comparison

| Feature | Admin | Officer | FS | Interviewer | Developer |
|---------|-------|---------|----|-----------  |-----------|
| Main Dashboard | ✅ | ✅ | ✅ | ❌ | ✅ |
| FS Dashboard | ✅ | ❌ | ✅ | ❌ | ✅ |
| CPAP Module | ✅ | ✅ | ❌ | ❌ | ✅ |
| Admin CPAP | ✅ | ❌ | ❌ | ❌ | ✅ |
| Survey Forms | ✅ | ❌ | ✅ | ✅ | ✅ |
| Settings | ✅ | ❌ | ❌ | ❌ | ✅ |
| Dev Dashboard | ❌ | ❌ | ❌ | ❌ | ✅ |
| Dev Tools | ❌ | ❌ | ❌ | ❌ | ✅ |
| All APIs | ✅ | Partial | Partial | Partial | ✅ |

## Troubleshooting

### Developer Dashboard Not Accessible

1. Verify user role in database:
```sql
SELECT id, email, role FROM users WHERE email = 'your@email.com';
```

2. Check middleware logs for role detection
3. Clear browser cache and cookies
4. Verify JWT token contains correct role

### Role Not Bypassing Checks

1. Check middleware order - developer check should be first
2. Verify role comparison is case-insensitive: `userRole.toLowerCase()`
3. Check for typos in role name ('developer' not 'dev')

### API Access Denied

1. Verify JWT token is valid
2. Check middleware logs for role detection
3. Ensure API route is in PROTECTED_ROUTES list
4. Verify developer role check happens before other role checks

## Future Enhancements

Potential improvements to the developer role system:

1. **Audit Logging** - Track all developer actions
2. **Time-Limited Access** - Temporary developer permissions
3. **Feature Flags** - Enable/disable developer features
4. **Environment Detection** - Auto-disable in production
5. **Developer Tools** - Enhanced debugging and testing tools
6. **Role Switching** - Test as different roles without re-login

## Related Documentation

- [Middleware Configuration](../middleware.ts)
- [Protected Route Component](../src/components/auth/ProtectedRoute.tsx)
- [Developer Dashboard](../src/app/dev-dashboard/page.tsx)
- [Developer Tools](../src/app/tools/page.tsx)
- [Seeding System](./SEEDING_SYSTEM_SUMMARY.md)

## Support

For issues or questions about the developer role system:

1. Check middleware logs for role detection
2. Verify database role assignment
3. Review this documentation
4. Check related component implementations
