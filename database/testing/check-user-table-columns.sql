-- ============================================================================
-- CHECK USER TABLE COLUMNS
-- ============================================================================
-- This script shows all columns in the user table to identify existing
-- tour/first-time login tracking fields

-- Get all columns in the user table with their properties
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'user'
ORDER BY ordinal_position;

-- Alternative query with more details
SELECT 
  a.attname AS column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
  a.attnotnull AS not_null,
  pg_get_expr(d.adbin, d.adrelid) AS default_value
FROM pg_catalog.pg_attribute a
LEFT JOIN pg_catalog.pg_attrdef d ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
WHERE a.attrelid = '"user"'::regclass
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY a.attnum;
