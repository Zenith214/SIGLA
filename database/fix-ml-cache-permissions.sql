-- Fix ML Cache Permissions
-- Run this if you're getting "permission denied for table ml_cache" errors

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read ml_cache" ON ml_cache;
DROP POLICY IF EXISTS "Allow authenticated users to insert ml_cache" ON ml_cache;
DROP POLICY IF EXISTS "Allow authenticated users to update ml_cache" ON ml_cache;
DROP POLICY IF EXISTS "Allow authenticated users to delete ml_cache" ON ml_cache;
DROP POLICY IF EXISTS "Allow service_role full access to ml_cache" ON ml_cache;

-- Create new policy for service_role (backend operations)
CREATE POLICY "Allow service_role full access to ml_cache"
  ON ml_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Recreate policies for authenticated users
CREATE POLICY "Allow authenticated users to read ml_cache"
  ON ml_cache
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert ml_cache"
  ON ml_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ml_cache"
  ON ml_cache
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete ml_cache"
  ON ml_cache
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant permissions to service_role
GRANT ALL ON ml_cache TO service_role;
GRANT ALL ON SEQUENCE ml_cache_id_seq TO service_role;

-- Grant permissions to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_cache TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE ml_cache_id_seq TO authenticated;

-- Verify permissions
SELECT 
  schemaname,
  tablename,
  tableowner,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'ml_cache';

-- Show policies
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'ml_cache';
