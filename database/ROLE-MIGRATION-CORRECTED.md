# Role Migration Correction: viewer → officer (lowercase)

## Issue Identified

The initial implementation used capitalized role names ('Viewer' → 'Officer'), but the database actually stores role values in lowercase ('viewer', 'officer', 'admin', 'fs', 'interviewer').

## Correction Applied

All files have been updated to use lowercase role values consistently:

### Database & Schema Files
- ✅ `prisma/schema.prisma` - Default changed to `"officer"` (lowercase)
- ✅ `prisma/migrations/.../migration.sql` - SQL updated to use lowercase values

### Scripts
- ✅ `scripts/migrate-viewer-to-officer.js` - All role checks use lowercase
- ✅ `scripts/verify-cpap-schema.js` - Verification checks use lowercase

### Application Code
- ✅ `middleware.ts` - Default role: `'officer'`
- ✅ `src/lib/auth-middleware.ts` - Default role: `'officer'`

### UI Components
- ✅ `src/app/settings/ui/sections/users-roles.tsx`
  - roleOptions: `["admin", "fs", "interviewer", "officer"]`
  - All default values: `"officer"`
  - Role statistics updated

- ✅ `src/components/dashboard/UserDropdown.tsx`
  - Role checks: `user?.role !== 'officer'`

- ✅ `src/app/survey/page.tsx`
  - Role case: `'officer'` → displays as "LGU Officer"

- ✅ `src/app/reportcard/page.tsx`
  - Role check: `currentUser.role !== 'officer'`

### API Routes
- ✅ `src/app/api/register/route.ts`
  - Default role: `"officer"`

- ✅ `src/app/api/users/[id]/route.ts`
  - Valid roles: `['admin', 'fs', 'interviewer', 'officer']`

- ✅ `src/app/api/me/route.ts`
  - Default role: `(role || 'officer').toLowerCase()`

- ✅ `src/app/api/login/route.ts`
  - Default role: `(user.role || 'officer').toLowerCase()`

### Test Files
- ✅ `src/__tests__/e2e/survey-cycle-integration.test.ts`
  - Mock user role: `'officer'`
  - Variable name: `mockOfficerUser`

- ✅ `src/components/survey-cycle/__tests__/CycleSelectorDropdown.test.tsx`
  - Test role: `'officer'`

### Documentation
- ✅ `database/README-ROLE-MIGRATION.md` - Updated to reflect lowercase usage
- ✅ `database/ROLE-MIGRATION-COMPLETE.md` - Updated to reflect lowercase usage

## Migration SQL (Corrected)

```sql
-- Update default role value
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'officer';

-- Migrate existing users
UPDATE "user" SET "role" = 'officer' WHERE "role" = 'viewer';
```

## Verification

All files have been checked for:
- ✅ No TypeScript diagnostics errors
- ✅ Consistent lowercase usage throughout
- ✅ Prisma Client regenerated successfully
- ✅ All role references updated

## Role Values in System

The system now uses these lowercase role values:
- `admin` - System administrators
- `fs` - Field Supervisors
- `interviewer` - Field Interviewers
- `officer` - LGU Officers (formerly viewer)

## Next Steps

When database is accessible:
```bash
# Apply the migration
npx prisma migrate deploy

# Or run the data migration script
node scripts/migrate-viewer-to-officer.js

# Verify the migration
node scripts/verify-cpap-schema.js
```

## Files Changed (Total: 20)

1. prisma/schema.prisma
2. prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/migration.sql
3. scripts/migrate-viewer-to-officer.js
4. scripts/verify-cpap-schema.js
5. middleware.ts
6. src/lib/auth-middleware.ts
7. src/app/settings/ui/sections/users-roles.tsx
8. src/components/dashboard/UserDropdown.tsx
9. src/app/survey/page.tsx
10. src/app/reportcard/page.tsx
11. src/app/api/register/route.ts
12. src/app/api/users/[id]/route.ts
13. src/app/api/me/route.ts
14. src/app/api/login/route.ts
15. src/__tests__/e2e/survey-cycle-integration.test.ts
16. src/components/survey-cycle/__tests__/CycleSelectorDropdown.test.tsx
17. database/README-ROLE-MIGRATION.md
18. database/ROLE-MIGRATION-COMPLETE.md
19. database/ROLE-MIGRATION-CORRECTED.md (this file)

---

**Correction Date**: November 19, 2024
**Status**: ✅ Complete - All files corrected to use lowercase role values
