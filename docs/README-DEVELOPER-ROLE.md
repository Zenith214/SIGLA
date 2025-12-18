# Developer Role - Quick Start Guide

## Overview

The Developer role provides full system access to all dashboards and API endpoints in PULSE. This role bypasses all middleware security checks and is designed for development and testing purposes only.

## ⚠️ Security Warning

**NEVER use the developer role in production environments!**

The developer role:
- Bypasses ALL security checks
- Has unrestricted access to ALL data
- Can access ALL API endpoints
- Should ONLY exist in development

## Quick Setup

### 1. Create a Developer User

Run the interactive script:

```bash
npm run create-dev-user
```

Or use default values:
- Email: `dev@pulse.local`
- Password: `developer123`
- Name: System Developer

### 2. Log In

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/login`
3. Log in with your developer credentials
4. Access the developer dashboard: `http://localhost:3000/dev-dashboard`

## What You Get

### Full Dashboard Access

✅ Main Dashboard (`/dashboard`)
✅ Field Supervisor Dashboard (`/fs-dashboard`)
✅ CPAP Module (`/cpap`)
✅ Admin CPAP (`/admin/cpap`)
✅ Survey Forms (`/survey/forms`)
✅ Analytics (`/analytics`)
✅ Settings (`/settings`)
✅ Developer Tools (`/tools`) - Central hub with dashboard access

### Unrestricted API Access

All API endpoints are accessible without permission checks:
- `/api/users` - User management
- `/api/barangays` - Barangay operations
- `/api/survey-cycles` - Survey cycles
- `/api/assignments` - Assignments
- `/api/spots` - Spot management
- `/api/cpap` - CPAP operations
- `/api/tools` - Development tools
- And all other endpoints

## Developer Dashboard

The Developer Dashboard (`/dev-dashboard`) provides:

1. **Quick Access Panel** - Cards for all dashboards
2. **API Reference** - List of available endpoints
3. **System Info** - Access level and statistics
4. **Developer Notes** - Important warnings and tips

## Manual Database Setup

If you prefer to create the user manually:

```sql
-- Create developer user
INSERT INTO "user" (
  "firstName", "lastName", email, password, role,
  phone, organization, "jobTitle", "createdAt", "updatedAt"
) VALUES (
  'System', 'Developer', 'dev@pulse.local',
  '$2a$10$YourBcryptHashHere', 'developer',
  '+1234567890', 'PULSE Development', 'System Developer',
  NOW(), NOW()
);
```

Generate password hash:
```javascript
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('your_password', 10));
```

## Testing Different Roles

As a developer, you can test all role-specific features:

1. Access any dashboard to test UI/UX
2. Test API endpoints without restrictions
3. Verify role-based access controls
4. Use seeding tools to create test data

## Production Deployment

**Before deploying to production:**

```sql
-- Disable all developer accounts
UPDATE "user" SET role = 'admin' WHERE role = 'developer';

-- Or delete them
DELETE FROM "user" WHERE role = 'developer';

-- Verify
SELECT * FROM "user" WHERE role = 'developer';
-- Should return 0 rows
```

## Troubleshooting

### Can't Access Developer Dashboard

1. Verify role in database:
```sql
SELECT id, email, role FROM "user" WHERE email = 'your@email.com';
```

2. Check middleware logs for role detection
3. Clear browser cookies and cache
4. Verify JWT token contains correct role

### API Access Denied

1. Check JWT token is valid
2. Verify middleware logs show developer role
3. Ensure API route is in PROTECTED_ROUTES
4. Check developer role check happens first in middleware

## Files Reference

- **Developer Dashboard**: `src/app/dev-dashboard/page.tsx`
- **Middleware**: `middleware.ts`
- **Protected Route**: `src/components/auth/ProtectedRoute.tsx`
- **Creation Script**: `scripts/create-developer-user.ts`
- **SQL Migration**: `database/add-developer-role.sql`
- **Full Documentation**: `docs/DEVELOPER_ROLE.md`

## NPM Scripts

```bash
# Create developer user (interactive)
npm run create-dev-user

# Start development server
npm run dev

# Run database migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## Support

For detailed documentation, see:
- `docs/DEVELOPER_ROLE.md` - Complete documentation
- `docs/DEVELOPER_ROLE_SUMMARY.md` - Implementation summary

---

**Remember**: Developer role = Full system access. Use responsibly and only in development! 🔐
