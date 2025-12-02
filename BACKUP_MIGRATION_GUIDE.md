# Backup System Privacy Migration Guide

## Quick Start

Follow these steps to enable the new privacy-protected backup system.

## Step 1: Run Database Migration

Apply the audit log table migration:

```bash
# Using psql
psql $DATABASE_URL -f database/migrations/add_data_export_audit_log.sql

# Or using Supabase CLI
supabase db push
```

Expected output:
```
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
COMMENT
```

## Step 2: Update Prisma Client

Generate the Prisma client with the new DataExportLog model:

```bash
npx prisma generate
```

## Step 3: Restart Your Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Step 4: Verify Installation

### Test 1: Check Database Table

```sql
-- Verify table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'data_export_log';

-- Should return: data_export_log
```

### Test 2: Test Anonymized Export

1. Log in as an admin user
2. Navigate to Settings → Data Backup
3. Click "Export All Survey Data"
4. Open the downloaded CSV file
5. Verify names are anonymized (e.g., "J***8f4e2a1c")

### Test 3: Check Audit Log

```sql
-- View recent exports
SELECT 
  id,
  user_id,
  export_type,
  anonymized,
  record_count,
  exported_at
FROM data_export_log
ORDER BY exported_at DESC
LIMIT 5;
```

You should see an entry for your test export.

## Step 5: Configure User Roles

Ensure users have appropriate roles for data access:

```sql
-- View current user roles
SELECT id, email, role FROM "user";

-- Update a user to super_admin (can export full data)
UPDATE "user" 
SET role = 'super_admin' 
WHERE email = 'admin@example.com';

-- Update a user to admin (can export anonymized data only)
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'manager@example.com';

-- Update a user to viewer (can only export reports)
UPDATE "user" 
SET role = 'viewer' 
WHERE email = 'viewer@example.com';
```

## Troubleshooting

### Issue: Migration Fails

**Error**: `relation "data_export_log" already exists`

**Solution**: Table already exists, skip migration or drop and recreate:

```sql
DROP TABLE IF EXISTS data_export_log CASCADE;
-- Then run migration again
```

### Issue: "Unauthorized" Error

**Error**: Getting 401 when trying to export

**Solution**: 
1. Clear browser cookies
2. Log out and log back in
3. Check session is valid

### Issue: "Forbidden" Error

**Error**: Getting 403 when trying to export

**Solution**: Check user role has permission:

```sql
-- Check your role
SELECT role FROM "user" WHERE email = 'your-email@example.com';

-- Update role if needed
UPDATE "user" SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Issue: Audit Logs Not Created

**Error**: No entries in data_export_log table

**Solution**:
1. Verify table exists: `\dt data_export_log`
2. Check foreign key constraint: User must exist
3. Review server logs for errors

### Issue: Names Not Anonymized

**Error**: Seeing full names in exports

**Solution**: 
1. Check URL includes `anonymized=true` (default)
2. Verify you're not using `anonymized=false`
3. Check server logs for anonymization errors

## Rollback (If Needed)

If you need to rollback the changes:

### 1. Remove Audit Log Table

```sql
DROP TABLE IF EXISTS data_export_log CASCADE;
```

### 2. Revert Code Changes

```bash
git checkout HEAD~1 src/app/api/backups/route.ts
git checkout HEAD~1 src/app/settings/ui/sections/backup.tsx
git checkout HEAD~1 prisma/schema.prisma
```

### 3. Regenerate Prisma Client

```bash
npx prisma generate
```

### 4. Restart Application

```bash
npm run dev
```

## Testing Checklist

Use this checklist to verify everything works:

- [ ] Database migration completed successfully
- [ ] `data_export_log` table exists
- [ ] Prisma client regenerated
- [ ] Application restarted
- [ ] Can log in as admin
- [ ] Can access Settings → Data Backup
- [ ] Privacy notice visible in UI
- [ ] Can export survey data
- [ ] Names are anonymized in export
- [ ] Ages are ranges (e.g., "30-39")
- [ ] Emails are hashed
- [ ] Audit log entry created
- [ ] Can view audit logs in database
- [ ] Viewer role can only export reports
- [ ] Non-admin cannot export sensitive data

## Next Steps

After successful migration:

1. **Review Audit Logs Regularly**
   ```sql
   -- Weekly audit review
   SELECT 
     u.email,
     del.export_type,
     del.anonymized,
     del.record_count,
     del.exported_at
   FROM data_export_log del
   JOIN "user" u ON del.user_id = u.id
   WHERE del.exported_at > NOW() - INTERVAL '7 days'
   ORDER BY del.exported_at DESC;
   ```

2. **Set Up Monitoring**
   - Monitor for unusual export patterns
   - Alert on non-anonymized exports
   - Track export frequency by user

3. **Update Documentation**
   - Inform users about new privacy features
   - Update internal procedures
   - Train staff on new export process

4. **Consider Additional Enhancements**
   - Implement export rate limiting
   - Add email notifications for exports
   - Set up automated backup schedules
   - Configure backup retention policies

## Support

If you encounter issues not covered here:

1. Check `docs/BACKUP_PRIVACY_SECURITY.md` for detailed documentation
2. Review server logs for error messages
3. Check database logs for query errors
4. Contact system administrator

## Summary

✅ **What You've Accomplished:**

- Implemented automatic data anonymization
- Added role-based access control
- Created comprehensive audit logging
- Enhanced security with authentication checks
- Removed misleading progress bar
- Added privacy notices to UI

Your backup system is now **privacy-compliant** and **secure**! 🎉
