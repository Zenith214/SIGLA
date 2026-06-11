# CPAP Database Permission Fix

## Issue

When accessing the CPAP Management page, you may encounter this error:

```
Error in listCPAPs: {
  code: '42501',
  message: 'permission denied for table cpaps'
}
```

## Root Cause

The database user doesn't have the necessary permissions to access the `cpaps` and `cpap_items` tables. This can happen when:
- Tables are created by a different user
- Permissions weren't granted during migration
- Database was restored from a backup without permissions

## Solution

Run the permission fix script to grant the necessary permissions.

### Option 1: Using Node.js Script (Recommended)

```bash
node scripts/fix-cpap-permissions.js
```

**What it does:**
- Detects the current database user
- Grants SELECT, INSERT, UPDATE, DELETE on `cpaps` table
- Grants SELECT, INSERT, UPDATE, DELETE on `cpap_items` table
- Grants USAGE on `CPAPStatus` enum type
- Grants USAGE, SELECT on sequences
- Verifies permissions were granted

**Expected Output:**
```
🔧 Fixing CPAP table permissions...

📌 Current database user: your_user

✓ Granting permissions on cpaps table...
✓ Granting permissions on cpap_items table...
✓ Granting permissions on CPAPStatus enum...

✅ Permissions granted successfully!

📋 Verifying permissions...

Granted permissions:
  - cpaps: DELETE
  - cpaps: INSERT
  - cpaps: SELECT
  - cpaps: UPDATE
  - cpap_items: DELETE
  - cpap_items: INSERT
  - cpap_items: SELECT
  - cpap_items: UPDATE

✅ CPAP table permissions fixed successfully!
You can now access the CPAP Management page.
```

### Option 2: Using SQL Directly

If the Node.js script doesn't work, run the SQL manually:

```bash
psql -U your_user -d your_database -f database/fix-cpap-permissions.sql
```

Or connect to your database and run:

```sql
-- Replace 'your_user' with your actual database user
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpaps TO your_user;
GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO your_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpap_items TO your_user;
GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO your_user;

GRANT USAGE ON TYPE "CPAPStatus" TO your_user;
```

### Option 3: For Supabase Users

If you're using Supabase, you may need to grant permissions to the `postgres` role:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpaps TO postgres;
GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO postgres;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpap_items TO postgres;
GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO postgres;

GRANT USAGE ON TYPE "CPAPStatus" TO postgres;
```

## Verification

After running the fix, verify permissions are correct:

```sql
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('cpaps', 'cpap_items')
ORDER BY table_name, grantee;
```

You should see entries showing your database user has SELECT, INSERT, UPDATE, and DELETE permissions on both tables.

## Testing

1. Refresh your browser
2. Navigate to CPAP Management (`/admin/cpap`)
3. The page should load without errors
4. You should see either:
   - The professional empty state (if no CPAPs exist)
   - A list of CPAPs (if some exist)

## Prevention

To prevent this issue in the future:

### When Creating New Tables

Always grant permissions after creating tables:

```sql
-- After creating a new table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE your_new_table TO your_user;
GRANT USAGE, SELECT ON SEQUENCE your_new_table_id_seq TO your_user;
```

### In Prisma Migrations

Add permission grants to your migration SQL:

```sql
-- In your migration.sql file
CREATE TABLE your_table (...);

-- Add this at the end
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE your_table TO postgres;
GRANT USAGE, SELECT ON SEQUENCE your_table_id_seq TO postgres;
```

### Using Migration Scripts

Include permission grants in your migration scripts:

```javascript
// In your migration script
await prisma.$executeRaw`CREATE TABLE ...`;
await prisma.$executeRaw`GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE ... TO postgres`;
```

## Troubleshooting

### Error: "must be owner of table"

You need superuser or table owner privileges. Options:
1. Run as database superuser
2. Ask your DBA to grant permissions
3. Use a user with GRANT privileges

### Error: "role does not exist"

The user you're trying to grant to doesn't exist. Check:
```sql
SELECT rolname FROM pg_roles WHERE rolname = 'your_user';
```

### Permissions Still Not Working

1. **Check current user:**
   ```sql
   SELECT current_user;
   ```

2. **Check table owner:**
   ```sql
   SELECT tableowner FROM pg_tables WHERE tablename IN ('cpaps', 'cpap_items');
   ```

3. **Check existing permissions:**
   ```sql
   SELECT * FROM information_schema.table_privileges 
   WHERE table_name IN ('cpaps', 'cpap_items');
   ```

4. **Try granting to PUBLIC (not recommended for production):**
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpaps TO PUBLIC;
   GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpap_items TO PUBLIC;
   ```

## Related Files

- `scripts/fix-cpap-permissions.js` - Node.js script to fix permissions
- `database/fix-cpap-permissions.sql` - SQL script to fix permissions
- `database/cpap-module-rollback.sql` - Includes permission cleanup on rollback

## Additional Resources

- [PostgreSQL GRANT Documentation](https://www.postgresql.org/docs/current/sql-grant.html)
- [Prisma Database Permissions](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access)
- [Supabase Database Roles](https://supabase.com/docs/guides/database/postgres/roles)

---

**Issue:** Permission denied for table cpaps  
**Solution:** Run `node scripts/fix-cpap-permissions.js`  
**Status:** ✅ Fixed
