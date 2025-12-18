# CPAP Module Database Migration Guide

## Overview

This migration adds the Citizen Priority Action Plan (CPAP) module to the PULSE system. It creates two new tables (`cpaps` and `cpap_items`) and renames the "Viewer" role to "Officer" throughout the system.

## Migration Details

### Schema Changes

1. **New Enum**: `CPAPStatus`
   - Values: `Draft`, `Submitted`, `Approved`, `Revision_Requested`

2. **New Table**: `cpaps`
   - Primary key: `id` (auto-increment)
   - Foreign keys: `barangay_id`, `cycle_id`
   - Unique constraint: `(barangay_id, cycle_id)` - one CPAP per barangay per cycle
   - Indexes: `status`, `barangay_id`, `cycle_id`
   - Timestamps: `created_at`, `updated_at`, `submitted_at`, `approved_at`
   - Fields: `admin_comments` (text)

3. **New Table**: `cpap_items`
   - Primary key: `id` (auto-increment)
   - Foreign key: `cpap_id` (references `cpaps.id`)
   - Index: `cpap_id`
   - Required fields: `priority_area`, `target_output`, `success_indicator`, `responsible_person`, `timeline_start`, `timeline_end`
   - Optional fields: `actual_output`, `accomplishment_status`, `remarks`
   - Timestamps: `created_at`, `updated_at`

4. **User Table Update**:
   - Default role changed from `'Viewer'` to `'Officer'`
   - Existing `Viewer` users migrated to `Officer` role

### Relationships

- `cpaps.barangay_id` → `barangay.barangay_id` (CASCADE on delete)
- `cpaps.cycle_id` → `survey_cycle.cycle_id` (CASCADE on delete)
- `cpap_items.cpap_id` → `cpaps.id` (CASCADE on delete)

## Running the Migration

### Development Environment

```bash
# Generate Prisma client with new schema
npx prisma generate

# Apply migration to development database
npx prisma migrate deploy
```

### Production Environment

**IMPORTANT**: Test in staging first!

```bash
# 1. Backup the database
pg_dump -h <host> -U <user> -d <database> > backup_before_cpap_migration.sql

# 2. Apply migration
npx prisma migrate deploy

# 3. Verify migration
psql -h <host> -U <user> -d <database> -c "\d cpaps"
psql -h <host> -U <user> -d <database> -c "\d cpap_items"
psql -h <host> -U <user> -d <database> -c "SELECT COUNT(*) FROM user WHERE role = 'Officer';"
```

## Verification Steps

After running the migration, verify:

1. **Tables Created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('cpaps', 'cpap_items');
   ```

2. **Enum Created**:
   ```sql
   SELECT enumlabel FROM pg_enum 
   WHERE enumtypid = 'CPAPStatus'::regtype;
   ```

3. **Indexes Created**:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename IN ('cpaps', 'cpap_items');
   ```

4. **Foreign Keys Created**:
   ```sql
   SELECT conname FROM pg_constraint 
   WHERE conrelid IN ('cpaps'::regclass, 'cpap_items'::regclass);
   ```

5. **Role Migration**:
   ```sql
   SELECT role, COUNT(*) FROM "user" GROUP BY role;
   ```

## Rollback Procedure

If you need to rollback this migration:

```bash
# Run the rollback script
psql -h <host> -U <user> -d <database> -f database/cpap-module-rollback.sql

# Restore from backup if needed
psql -h <host> -U <user> -d <database> < backup_before_cpap_migration.sql
```

**WARNING**: Rollback will delete all CPAP data. Ensure you have a backup before proceeding.

## Post-Migration Tasks

1. **Update Application Code**:
   - Regenerate Prisma client: `npx prisma generate`
   - Restart application servers

2. **Update Middleware**:
   - Ensure role checks use "Officer" instead of "Viewer"
   - Add CPAP route protection

3. **Test CPAP Functionality**:
   - OFFICER users can access `/cpap` route
   - ADMIN users can access `/admin/cpap` route
   - FS and INTERVIEWER users cannot access CPAP routes

4. **Monitor Logs**:
   - Check for any role-related errors
   - Verify CPAP API endpoints are accessible

## Data Integrity Checks

Run these queries after migration to ensure data integrity:

```sql
-- Check for orphaned CPAP items (should return 0)
SELECT COUNT(*) FROM cpap_items 
WHERE cpap_id NOT IN (SELECT id FROM cpaps);

-- Check for CPAPs with invalid barangay references (should return 0)
SELECT COUNT(*) FROM cpaps 
WHERE barangay_id NOT IN (SELECT barangay_id FROM barangay);

-- Check for CPAPs with invalid cycle references (should return 0)
SELECT COUNT(*) FROM cpaps 
WHERE cycle_id NOT IN (SELECT cycle_id FROM survey_cycle);

-- Verify unique constraint (should return 0 duplicates)
SELECT barangay_id, cycle_id, COUNT(*) 
FROM cpaps 
GROUP BY barangay_id, cycle_id 
HAVING COUNT(*) > 1;
```

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution**: The tables may already exist. Check if they were created manually:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('cpaps', 'cpap_items');
```

If they exist, you may need to drop them first or skip the migration.

### Issue: Role migration affects wrong users

**Solution**: The migration updates ALL users with role='Viewer' to role='Officer'. If you need to preserve some Viewer users, modify the migration SQL to be more selective:
```sql
-- Example: Only migrate specific users
UPDATE "user" SET "role" = 'Officer' 
WHERE "role" = 'Viewer' 
AND email LIKE '%@lgu.gov.ph';
```

### Issue: Foreign key constraint violation

**Solution**: Ensure all referenced barangays and survey cycles exist before creating CPAPs:
```sql
-- Check for missing references
SELECT DISTINCT barangay_id FROM cpaps 
WHERE barangay_id NOT IN (SELECT barangay_id FROM barangay);

SELECT DISTINCT cycle_id FROM cpaps 
WHERE cycle_id NOT IN (SELECT cycle_id FROM survey_cycle);
```

## Migration Metadata

- **Migration Name**: `20251119081816_add_cpap_module_and_rename_viewer_to_officer`
- **Created**: November 19, 2025
- **Prisma Version**: 6.12.0
- **Database**: PostgreSQL
- **Estimated Duration**: < 1 second (on empty tables)
- **Downtime Required**: No (additive changes only)

## Requirements Addressed

This migration implements the following requirements:

- **Requirement 13.1**: Create cpaps table with all required fields
- **Requirement 13.2**: Create cpap_items table with all required fields
- **Requirement 13.3**: Enforce one-to-many relationship between cpaps and cpap_items
- **Requirement 13.4**: Create indexes on barangay_id, cycle_id, and status fields
- **Requirement 13.5**: Implement database constraints for valid status values
- **Requirement 12.1-12.5**: Foreign key references to Survey_Cycle and Barangay with referential integrity
- **Requirement 9.1-9.4**: Rename VIEWER role to OFFICER with data migration

## Support

For issues or questions about this migration, contact the development team or refer to:
- Design Document: `.kiro/specs/cpap-module-integration/design.md`
- Requirements Document: `.kiro/specs/cpap-module-integration/requirements.md`
