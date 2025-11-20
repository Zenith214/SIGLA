# CPAP Module Migration - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the CPAP (Citizen Priority Action Plan) module migration to production. The migration adds two new tables (`cpaps` and `cpap_items`), creates the `CPAPStatus` enum, and renames the "Viewer" role to "Officer".

## Pre-Deployment Checklist

- [ ] All code changes have been tested in development
- [ ] All CPAP API endpoints are working correctly
- [ ] UI components have been tested by QA team
- [ ] Database backup strategy is in place
- [ ] Rollback procedure has been reviewed
- [ ] Maintenance window has been scheduled
- [ ] Stakeholders have been notified

## Migration Impact Assessment

### Database Changes
- **New Tables**: 2 (cpaps, cpap_items)
- **New Enum**: 1 (CPAPStatus)
- **Modified Tables**: 1 (user - default role value)
- **Data Migration**: Updates existing 'viewer' roles to 'officer'
- **Estimated Duration**: < 5 seconds (on databases with < 10,000 users)
- **Downtime Required**: No (additive changes only)

### Application Impact
- **Affected Users**: OFFICER (formerly VIEWER) and ADMIN users
- **New Features**: CPAP creation, submission, review, and monitoring
- **Breaking Changes**: None (backward compatible)
- **API Changes**: New endpoints added, no existing endpoints modified

## Step-by-Step Deployment

### Phase 1: Pre-Deployment Preparation

#### 1.1 Create Database Backup

```bash
# PostgreSQL backup
pg_dump -h <host> -U <user> -d <database> -F c -b -v -f "backup_before_cpap_migration_$(date +%Y%m%d_%H%M%S).dump"

# Verify backup
pg_restore --list backup_before_cpap_migration_*.dump | head -20
```

#### 1.2 Verify Current Database State

```bash
# Check current schema version
npx prisma migrate status

# Verify user roles
psql -h <host> -U <user> -d <database> -c "SELECT role, COUNT(*) FROM \"user\" GROUP BY role;"

# Check for existing CPAP tables (should return 0)
psql -h <host> -U <user> -d <database> -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('cpaps', 'cpap_items');"
```

#### 1.3 Review Migration SQL

```bash
# Review the migration file
cat prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/migration.sql
```

### Phase 2: Deploy Application Code

#### 2.1 Deploy Backend Code

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Generate Prisma client (with new models)
npx prisma generate

# Build application
npm run build
```

#### 2.2 Deploy Frontend Code

```bash
# Build frontend assets
npm run build

# Deploy to hosting platform (e.g., Vercel, AWS)
# Follow your organization's deployment process
```

### Phase 3: Execute Database Migration

#### 3.1 Apply Migration

**Option A: Using Prisma Migrate (Recommended)**

```bash
# Apply migration
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

**Option B: Manual SQL Execution (If Prisma fails)**

```bash
# Execute migration SQL directly
psql -h <host> -U <user> -d <database> -f prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/migration.sql

# Mark migration as applied
npx prisma migrate resolve --applied 20251119081816_add_cpap_module_and_rename_viewer_to_officer
```

#### 3.2 Verify Migration Success

```bash
# Run verification script
node scripts/check-cpap-tables.js
```

Expected output:
```
✅ Tables created: cpap_items, cpaps
✅ CPAPStatus enum values: Approved, Draft, Revision_Requested, Submitted
✅ User role default: 'officer'::text
✅ User role distribution:
   - Admin: X
   - officer: Y
   - fs: Z
   - interviewer: W
```

### Phase 4: Post-Migration Verification

#### 4.1 Database Integrity Checks

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

-- Verify indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('cpaps', 'cpap_items')
ORDER BY indexname;

-- Verify foreign keys exist
SELECT conname FROM pg_constraint 
WHERE conrelid IN ('cpaps'::regclass, 'cpap_items'::regclass)
ORDER BY conname;
```

#### 4.2 Application Health Checks

```bash
# Test CPAP API endpoints
curl -X GET https://your-domain.com/api/cpap \
  -H "Authorization: Bearer <token>"

# Test OFFICER access
curl -X GET https://your-domain.com/cpap \
  -H "Cookie: session=<session>"

# Test ADMIN access
curl -X GET https://your-domain.com/admin/cpap \
  -H "Cookie: session=<session>"
```

#### 4.3 User Acceptance Testing

- [ ] OFFICER user can access CPAP creation page
- [ ] OFFICER user can create and save CPAP items
- [ ] OFFICER user can submit CPAP for review
- [ ] ADMIN user can access CPAP management dashboard
- [ ] ADMIN user can review and approve CPAPs
- [ ] ADMIN user can request revisions
- [ ] FS and INTERVIEWER users cannot access CPAP pages
- [ ] Navigation menus display correctly for each role

### Phase 5: Monitoring

#### 5.1 Monitor Application Logs

```bash
# Check for errors related to CPAP module
tail -f /var/log/application.log | grep -i cpap

# Monitor database queries
tail -f /var/log/postgresql/postgresql.log | grep -i cpap
```

#### 5.2 Monitor Performance

```sql
-- Check query performance on CPAP tables
SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
WHERE tablename IN ('cpaps', 'cpap_items');

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN ('cpaps', 'cpap_items');
```

## Rollback Procedure

If issues are encountered, follow this rollback procedure:

### Step 1: Stop Application

```bash
# Stop application servers
systemctl stop your-application
```

### Step 2: Execute Rollback SQL

```bash
# Run rollback script
psql -h <host> -U <user> -d <database> -f database/cpap-module-rollback.sql

# Verify rollback
node scripts/check-cpap-tables.js
```

Expected output after rollback:
```
Tables found: []
CPAPStatus enum values: []
User role default: 'Viewer'::text
```

### Step 3: Restore Previous Application Version

```bash
# Checkout previous version
git checkout <previous-commit>

# Rebuild application
npm install
npx prisma generate
npm run build

# Restart application
systemctl start your-application
```

### Step 4: Verify Rollback Success

```bash
# Test application health
curl https://your-domain.com/health

# Verify database state
psql -h <host> -U <user> -d <database> -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('cpaps', 'cpap_items');"
```

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Cause**: Tables may have been created manually or migration was partially applied.

**Solution**:
```bash
# Check if tables exist
psql -h <host> -U <user> -d <database> -c "\d cpaps"

# If tables exist and are correct, mark migration as applied
npx prisma migrate resolve --applied 20251119081816_add_cpap_module_and_rename_viewer_to_officer
```

### Issue: Foreign key constraint violation

**Cause**: Referenced barangays or survey cycles don't exist.

**Solution**:
```sql
-- Check for missing references
SELECT DISTINCT barangay_id FROM cpaps 
WHERE barangay_id NOT IN (SELECT barangay_id FROM barangay);

SELECT DISTINCT cycle_id FROM cpaps 
WHERE cycle_id NOT IN (SELECT cycle_id FROM survey_cycle);

-- Delete invalid CPAPs
DELETE FROM cpaps WHERE barangay_id NOT IN (SELECT barangay_id FROM barangay);
DELETE FROM cpaps WHERE cycle_id NOT IN (SELECT cycle_id FROM survey_cycle);
```

### Issue: Role migration affects wrong users

**Cause**: The migration updates ALL users with role='Viewer' to role='Officer'.

**Solution**:
```sql
-- Manually revert specific users if needed
UPDATE "user" SET "role" = 'Viewer' 
WHERE email IN ('user1@example.com', 'user2@example.com');
```

### Issue: Prisma client not updated

**Cause**: Prisma client wasn't regenerated after migration.

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Restart application
systemctl restart your-application
```

## Post-Deployment Tasks

### 1. Update Documentation

- [ ] Update API documentation with new CPAP endpoints
- [ ] Update user guides for OFFICER and ADMIN roles
- [ ] Update system architecture diagrams
- [ ] Update database schema documentation

### 2. User Training

- [ ] Conduct training session for OFFICER users
- [ ] Conduct training session for ADMIN users
- [ ] Distribute user guides and quick reference cards
- [ ] Set up support channels for questions

### 3. Monitoring Setup

- [ ] Set up alerts for CPAP-related errors
- [ ] Configure performance monitoring for CPAP queries
- [ ] Set up usage analytics for CPAP module
- [ ] Configure backup verification for CPAP tables

## Success Criteria

The migration is considered successful when:

- ✅ All database tables and indexes are created
- ✅ All foreign key constraints are in place
- ✅ User role default is updated to 'officer'
- ✅ Existing 'viewer' users are migrated to 'officer'
- ✅ OFFICER users can access CPAP creation interface
- ✅ ADMIN users can access CPAP management dashboard
- ✅ FS and INTERVIEWER users cannot access CPAP pages
- ✅ All CPAP API endpoints return expected responses
- ✅ No errors in application logs
- ✅ Database integrity checks pass
- ✅ Performance metrics are within acceptable range

## Support Contacts

- **Database Team**: database-team@example.com
- **Development Team**: dev-team@example.com
- **DevOps Team**: devops-team@example.com
- **On-Call Engineer**: +1-XXX-XXX-XXXX

## References

- Migration SQL: `prisma/migrations/20251119081816_add_cpap_module_and_rename_viewer_to_officer/migration.sql`
- Rollback SQL: `database/cpap-module-rollback.sql`
- Design Document: `.kiro/specs/cpap-module-integration/design.md`
- Requirements Document: `.kiro/specs/cpap-module-integration/requirements.md`
- API Documentation: `docs/CPAP_API_QUICK_REFERENCE.md`

---

**Document Version**: 1.0  
**Last Updated**: November 19, 2025  
**Migration ID**: 20251119081816_add_cpap_module_and_rename_viewer_to_officer
