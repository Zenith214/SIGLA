-- Fix CPAP Table Permissions
-- This script grants necessary permissions on CPAP tables to the application user

-- Grant permissions on cpaps table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpaps TO postgres;
GRANT USAGE, SELECT ON SEQUENCE cpaps_id_seq TO postgres;

-- Grant permissions on cpap_items table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE cpap_items TO postgres;
GRANT USAGE, SELECT ON SEQUENCE cpap_items_id_seq TO postgres;

-- Grant permissions on CPAPStatus enum type
GRANT USAGE ON TYPE "CPAPStatus" TO postgres;

-- Verify permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('cpaps', 'cpap_items')
ORDER BY table_name, grantee;

-- Output success message
SELECT 'CPAP table permissions granted successfully' AS status;
