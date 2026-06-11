# Role Migration: VIEWER to OFFICER

## Overview

This document describes the migration of the VIEWER role to OFFICER role as part of the CPAP (Citizen Priority Action Plan) module integration. The VIEWER role is being renamed to OFFICER to better reflect the governance responsibilities of LGU officials who will be creating and managing action plans.

## Migration Details

### Database Changes

**Migration File**: `prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/migration.sql`

The migration includes:

1. **Default Role Update**: Changes the default value for the `role` column in the `user` table from 'viewer' to 'officer'
   ```sql
   ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'officer';
   ```

2. **Data Migration**: Updates all existing users with 'viewer' role to 'officer' role
   ```sql
   UPDATE "user" SET "role" = 'officer' WHERE "role" = 'viewer';
   ```

### Prisma Schema Changes

**File**: `prisma/schema.prisma`

```prisma
model User {
  // ... other fields
  role  String?  @default("officer") @db.VarChar(32)
  // ... other fields
}
```

### Code Changes

The following files have been updated to use "Officer" instead of "Viewer":

1. **middleware.ts**
   - Updated default role fallback from 'viewer' to 'officer'
   - Line 214: `const userRole = (user.role || 'officer').toLowerCase();`

2. **src/lib/auth-middleware.ts**
   - Updated default role fallback from 'viewer' to 'officer'
   - Line 42: `role: (decoded.role || 'officer').toLowerCase()`

3. **Test Files**
   - `src/__tests__/e2e/survey-cycle-integration.test.ts`: Updated mock user from 'Viewer' to 'Officer'
   - `src/components/survey-cycle/__tests__/CycleSelectorDropdown.test.tsx`: Updated test role from 'viewer' to 'officer'

## Migration Execution

### Prerequisites

- Database must be accessible
- Prisma schema must be up to date
- Backup of database recommended before migration

### Running the Migration

#### Option 1: Apply Migration (Development)

```bash
npx prisma migrate dev
```

This will:
- Apply the migration to the development database
- Update the Prisma client
- Run the data migration automatically

#### Option 2: Deploy Migration (Production)

```bash
npx prisma migrate deploy
```

This will:
- Apply pending migrations to the production database
- Not create new migrations
- Run the data migration automatically

#### Option 3: Manual Data Migration Script

If you need to run the data migration separately:

```bash
node scripts/migrate-viewer-to-officer.js
```

This script will:
- Connect to the database
- Check current role distribution
- Find all users with 'Viewer' role
- Update them to 'Officer' role
- Verify the migration was successful
- Display before/after statistics

### Verification

After running the migration, verify it was successful:

```bash
node scripts/verify-cpap-schema.js
```

This will check:
- Database connection
- Role default value
- User role distribution
- Confirm no 'Viewer' users remain

## Rollback Procedure

If you need to rollback the role migration:

### Option 1: Revert Data Only

```sql
-- Revert users back to viewer role
UPDATE "user" SET "role" = 'viewer' WHERE "role" = 'officer';

-- Revert default value
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'viewer';
```

### Option 2: Full Migration Rollback

```bash
npx prisma migrate resolve --rolled-back 20251119081816_add_cpap_module_and_rename_viewer_to_officer
```

**Note**: This will mark the migration as rolled back but won't automatically revert database changes. You'll need to manually run the SQL commands above.

## Impact Assessment

### Affected Components

1. **User Authentication**: Default role for new users changes from 'Viewer' to 'Officer'
2. **Middleware**: Role checking logic updated to use 'officer' as default
3. **API Routes**: No changes needed - role-based access control remains the same
4. **UI Components**: No changes needed - role display will automatically show 'Officer'
5. **Tests**: Updated to use 'officer' role in test scenarios

### User Impact

- **Existing Users**: All users with 'viewer' role will automatically become 'officer' users
- **New Users**: Will be assigned 'officer' role by default instead of 'viewer'
- **Permissions**: No change in permissions - 'officer' has the same access as 'viewer' had
- **UI**: User interface will display 'officer' instead of 'viewer'

### System Behavior

- **No Breaking Changes**: The migration is backward compatible
- **Seamless Transition**: Users won't notice any functional changes
- **Role Equivalence**: 'officer' role has identical permissions to the former 'viewer' role

## Testing

### Manual Testing Checklist

- [ ] Verify migration applied successfully
- [ ] Check no users have 'viewer' role remaining
- [ ] Confirm new users get 'officer' role by default
- [ ] Test login with existing officer user
- [ ] Verify officer users can access appropriate dashboards
- [ ] Confirm role display shows 'officer' in UI
- [ ] Test middleware role checking works correctly

### Automated Testing

Run the test suite to ensure no regressions:

```bash
npm test
```

Specific tests to verify:
- `src/__tests__/e2e/survey-cycle-integration.test.ts`
- `src/components/survey-cycle/__tests__/CycleSelectorDropdown.test.tsx`

## Documentation Updates

The following documentation has been updated to reflect the role change:

1. **Requirements Document**: `.kiro/specs/cpap-module-integration/requirements.md`
   - Updated all references from VIEWER to OFFICER
   - Updated glossary definitions

2. **Design Document**: `.kiro/specs/cpap-module-integration/design.md`
   - Updated role references throughout
   - Updated architecture diagrams

3. **Tasks Document**: `.kiro/specs/cpap-module-integration/tasks.md`
   - Task 2 covers the role migration implementation

## Support

If you encounter issues with the migration:

1. Check database connectivity
2. Verify Prisma schema is up to date
3. Review migration logs for errors
4. Run verification script to check current state
5. Consult the rollback procedure if needed

## Related Files

- Migration SQL: `prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/migration.sql`
- Data Migration Script: `scripts/migrate-viewer-to-officer.js`
- Verification Script: `scripts/verify-cpap-schema.js`
- Prisma Schema: `prisma/schema.prisma`
- Middleware: `middleware.ts`
- Auth Middleware: `src/lib/auth-middleware.ts`

## Changelog

### 2024-11-19
- Created migration to rename VIEWER to OFFICER
- Updated Prisma schema default role value
- Created data migration script
- Updated middleware and auth files
- Updated test files
- Created documentation
