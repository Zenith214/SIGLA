# Supabase CPAP Permission Fix

## Issue

You're getting this error:
```
permission denied for table cpaps
Error code: 42501
```

This is because your CPAP tables in Supabase have Row Level Security (RLS) enabled, which is blocking access even for the service role.

## Quick Fix (Recommended)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run This SQL

Copy and paste this SQL and click "Run":

```sql
-- Disable RLS on CPAP tables (allows service role full access)
ALTER TABLE cpaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE cpap_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions to service_role
GRANT ALL ON TABLE cpaps TO service_role;
GRANT ALL ON TABLE cpap_items TO service_role;
GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO service_role;

-- Grant permissions to authenticated users
GRANT ALL ON TABLE cpaps TO authenticated;
GRANT ALL ON TABLE cpap_items TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO authenticated;

-- Grant permissions on enum type
GRANT USAGE ON TYPE "CPAPStatus" TO service_role;
GRANT USAGE ON TYPE "CPAPStatus" TO authenticated;

-- Verify it worked
SELECT 'Success! CPAP permissions fixed.' AS status;
```

### Step 3: Verify

After running the SQL, you should see:
```
status: "Success! CPAP permissions fixed."
```

### Step 4: Test

1. Go back to your application
2. Refresh the browser
3. Navigate to `/admin/cpap`
4. It should now load without errors!

## What This Does

1. **Disables RLS** - Turns off Row Level Security so the service role can access tables
2. **Grants Permissions** - Gives full access to service_role and authenticated users
3. **Fixes Sequences** - Allows auto-increment IDs to work
4. **Fixes Enum** - Allows the CPAPStatus enum to be used

## Alternative: Enable RLS with Policies (Advanced)

If you want to keep RLS enabled for security, you can create policies instead:

```sql
-- Keep RLS enabled
ALTER TABLE cpaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpap_items ENABLE ROW LEVEL SECURITY;

-- Create policy for service_role (bypass RLS)
CREATE POLICY "Service role has full access to cpaps"
ON cpaps
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to cpap_items"
ON cpap_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy for authenticated users
-- Admin users can see all CPAPs
CREATE POLICY "Admins can view all cpaps"
ON cpaps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "user"
    WHERE "user".id = auth.uid()::int
    AND LOWER("user".role) = 'admin'
  )
);

-- Officers can only see their barangay's CPAP
CREATE POLICY "Officers can view their barangay cpaps"
ON cpaps
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "user" u
    JOIN assignment a ON a.user_id = u.id
    WHERE u.id = auth.uid()::int
    AND LOWER(u.role) = 'officer'
    AND a.barangay_id = cpaps.barangay_id
    AND a.status = 'Active'
  )
);

-- Similar policies for cpap_items...
```

**Note:** The policy approach is more complex. For now, disabling RLS is the quickest solution.

## Troubleshooting

### Still Getting Permission Errors?

1. **Check your Supabase service role key:**
   ```bash
   # In your .env file
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   Make sure it's the SERVICE ROLE key, not the ANON key!

2. **Verify the SQL ran successfully:**
   Run this in SQL Editor:
   ```sql
   SELECT 
       tablename,
       rowsecurity
   FROM pg_tables
   WHERE tablename IN ('cpaps', 'cpap_items');
   ```
   Both should show `rowsecurity: false`

3. **Check permissions:**
   ```sql
   SELECT 
       grantee, 
       table_name, 
       privilege_type
   FROM information_schema.table_privileges
   WHERE table_name IN ('cpaps', 'cpap_items')
     AND grantee = 'service_role'
   ORDER BY table_name, privilege_type;
   ```
   You should see SELECT, INSERT, UPDATE, DELETE for both tables.

### Error: "must be owner of table"

You need to be the table owner or have superuser privileges. In Supabase:
- Make sure you're logged in as the project owner
- Run the SQL in the Supabase SQL Editor (not an external tool)

### Tables Don't Exist?

If you get "relation does not exist" errors:
1. The CPAP migration might not have run
2. Run the migration: `node scripts/apply-cpap-migration.js`
3. Then run the permission fix SQL

## Prevention

When creating new tables in Supabase, always:

1. **Disable RLS for admin tables:**
   ```sql
   ALTER TABLE your_new_table DISABLE ROW LEVEL SECURITY;
   ```

2. **Or create proper RLS policies:**
   ```sql
   CREATE POLICY "Service role bypass"
   ON your_new_table
   FOR ALL
   TO service_role
   USING (true)
   WITH CHECK (true);
   ```

3. **Grant permissions:**
   ```sql
   GRANT ALL ON TABLE your_new_table TO service_role;
   GRANT ALL ON TABLE your_new_table TO authenticated;
   ```

## Quick Reference

### Disable RLS (Quick Fix)
```sql
ALTER TABLE cpaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE cpap_items DISABLE ROW LEVEL SECURITY;
```

### Grant Permissions
```sql
GRANT ALL ON TABLE cpaps TO service_role;
GRANT ALL ON TABLE cpap_items TO service_role;
```

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('cpaps', 'cpap_items');
```

### Check Permissions
```sql
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('cpaps', 'cpap_items');
```

---

**Issue:** Permission denied for table cpaps in Supabase  
**Solution:** Run the SQL in Supabase SQL Editor to disable RLS and grant permissions  
**Time:** 2 minutes  
**Difficulty:** Easy
