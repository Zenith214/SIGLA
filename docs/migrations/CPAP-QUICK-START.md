# CPAP Module - Quick Start Guide

## What Was Done

Task 1 of the CPAP Module integration is complete. The database schema and migration files have been created.

## Files Created/Modified

### Modified:
- ✅ `prisma/schema.prisma` - Added CPAP and CPAPItem models, CPAPStatus enum, updated User role default

### Created:
- ✅ `prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/migration.sql`
- ✅ `database/README-CPAP-MODULE-MIGRATION.md` - Comprehensive migration guide
- ✅ `database/cpap-module-rollback.sql` - Rollback script
- ✅ `database/CPAP-MIGRATION-SUMMARY.md` - Detailed summary
- ✅ `scripts/verify-cpap-schema.js` - Verification script

## What's Ready

1. **Prisma Schema**: ✅ Complete
   - CPAP model with all fields
   - CPAPItem model with all fields
   - CPAPStatus enum (Draft, Submitted, Approved, Revision_Requested)
   - User role default changed to "Officer"
   - All indexes and constraints defined

2. **Migration Files**: ✅ Ready to apply
   - Creates cpaps table
   - Creates cpap_items table
   - Creates CPAPStatus enum
   - Updates User role default
   - Migrates existing Viewer users to Officer

3. **Documentation**: ✅ Complete
   - Migration guide with step-by-step instructions
   - Rollback procedure
   - Verification steps
   - Troubleshooting guide

## Next Steps

### Before Applying Migration:

1. **Backup your database**:
   ```bash
   pg_dump -h <host> -U <user> -d <database> > backup_before_cpap.sql
   ```

### To Apply Migration:

```bash
# Apply the migration to database
npx prisma migrate deploy

# Verify it worked
node scripts/verify-cpap-schema.js
```

### After Migration:

The database will have:
- `cpaps` table with proper indexes and constraints
- `cpap_items` table linked to cpaps
- CPAPStatus enum with 4 values
- User role default set to "Officer"
- All Viewer users migrated to Officer role

### If Something Goes Wrong:

```bash
# Rollback the migration
psql -h <host> -U <user> -d <database> -f database/cpap-module-rollback.sql

# Or restore from backup
psql -h <host> -U <user> -d <database> < backup_before_cpap.sql
```

## What's Next in the Spec

After applying this migration, you can proceed to:
- **Task 2**: Role migration from VIEWER to OFFICER (partially done in this migration)
- **Task 3**: Implement CPAP service layer
- **Task 4**: Implement validation service
- And so on...

## Quick Verification

To verify the schema is ready (before applying migration):

```bash
# Check Prisma schema is valid
npx prisma validate

# Check Prisma client has CPAP models
npx prisma generate

# Run verification script (will show tables don't exist yet - that's expected)
node scripts/verify-cpap-schema.js
```

## Database Schema Overview

### cpaps Table
- One CPAP per barangay per cycle (unique constraint)
- Tracks status: Draft → Submitted → Approved (or Revision_Requested)
- Stores admin comments and timestamps

### cpap_items Table
- Multiple items per CPAP
- Each item has priority area, target output, success indicator
- Tracks progress with actual_output, accomplishment_status, remarks

### Relationships
- Barangay → CPAP (one-to-many)
- SurveyCycle → CPAP (one-to-many)
- CPAP → CPAPItem (one-to-many)

## Support

For detailed information, see:
- `database/README-CPAP-MODULE-MIGRATION.md` - Full migration guide
- `database/CPAP-MIGRATION-SUMMARY.md` - Implementation summary
- `.kiro/specs/cpap-module-integration/design.md` - Design document
- `.kiro/specs/cpap-module-integration/requirements.md` - Requirements

## Status

✅ **Task 1: Database schema and migrations - COMPLETE**

All sub-tasks completed:
- ✅ Prisma schema for cpaps and cpap_items tables
- ✅ CPAPStatus enum with all required values
- ✅ Database migration files created
- ✅ Indexes on status, barangay_id, and cycle_id
- ✅ Unique constraint on barangay_id and cycle_id combination
