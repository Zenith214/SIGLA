-- Fix Supabase CPAP Table Permissions and RLS Policies
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS temporarily to check if that's the issue
-- (You can re-enable it after creating proper policies)
ALTER TABLE cpaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE cpap_items DISABLE ROW LEVEL SECURITY;

-- 2. Grant full permissions to authenticated users
GRANT ALL ON TABLE cpaps TO authenticated;
GRANT ALL ON TABLE cpap_items TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO authenticated;

-- 3. Grant full permissions to service_role (for admin operations)
GRANT ALL ON TABLE cpaps TO service_role;
GRANT ALL ON TABLE cpap_items TO service_role;
GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO service_role;

-- 4. Grant permissions to anon role (for public access if needed)
GRANT SELECT ON TABLE cpaps TO anon;
GRANT SELECT ON TABLE cpap_items TO anon;

-- 5. Grant permissions on the enum type
GRANT USAGE ON TYPE "CPAPStatus" TO authenticated;
GRANT USAGE ON TYPE "CPAPStatus" TO service_role;
GRANT USAGE ON TYPE "CPAPStatus" TO anon;

-- 6. Verify permissions
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('cpaps', 'cpap_items')
  AND grantee IN ('authenticated', 'service_role', 'anon', 'postgres')
ORDER BY table_name, grantee, privilege_type;

-- 7. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('cpaps', 'cpap_items');

SELECT 'CPAP Supabase permissions fixed successfully!' AS status;
