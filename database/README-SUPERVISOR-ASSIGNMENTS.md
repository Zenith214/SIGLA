# Supervisor Assignments Migration Guide

## Overview
This migration adds the `supervisor_assignments` table to enable admins to assign Field Supervisors (FS role) to specific barangays for each survey cycle.

## Prerequisites
- PostgreSQL database access
- Active database connection
- Backup of current database (recommended)

## Migration Steps

### 1. Backup Your Database (Recommended)
```bash
pg_dump -U your_username -d your_database > backup_before_supervisor_assignments.sql
```

### 2. Apply the Migration

#### Option A: Using psql
```bash
psql -U your_username -d your_database -f database/supervisor-assignments-migration.sql
```

#### Option B: Using Database Client
Copy and execute the contents of `database/supervisor-assignments-migration.sql` in your database client.

#### Option C: Direct SQL
```sql
-- Connect to your database and run:
\i database/supervisor-assignments-migration.sql
```

### 3. Verify Migration
```sql
-- Check if table was created
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'supervisor_assignments';

-- Check table structure
\d supervisor_assignments

-- Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'supervisor_assignments';

-- Verify trigger
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'supervisor_assignments';
```

Expected output:
- Table `supervisor_assignments` exists
- 4 indexes created (supervisor_id, barangay_id, cycle_id, status)
- 1 trigger for updated_at timestamp
- Unique constraint on (supervisor_id, barangay_id, cycle_id)

## Post-Migration Tasks

### 1. Create Test Data (Optional)
```sql
-- Ensure you have a supervisor user (fs role)
INSERT INTO "user" (email, password, "firstName", "lastName", role, status)
VALUES ('supervisor@test.com', 'hashed_password', 'Test', 'Supervisor', 'fs', 'Active')
RETURNING id;

-- Create a test assignment (use actual IDs from your database)
INSERT INTO supervisor_assignments (supervisor_id, barangay_id, cycle_id, status)
VALUES (
  (SELECT id FROM "user" WHERE role = 'fs' LIMIT 1),
  (SELECT barangay_id FROM barangay LIMIT 1),
  (SELECT cycle_id FROM survey_cycle WHERE is_active = true LIMIT 1),
  'Active'
);

-- Verify the assignment
SELECT 
  sa.*,
  u."firstName" || ' ' || u."lastName" as supervisor_name,
  b.barangay_name,
  sc.name as cycle_name
FROM supervisor_assignments sa
JOIN "user" u ON sa.supervisor_id = u.id
JOIN barangay b ON sa.barangay_id = b.barangay_id
JOIN survey_cycle sc ON sa.cycle_id = sc.cycle_id;
```

### 2. Update Application
The application code is already updated with:
- ✅ API routes (`/api/supervisor-assignments`)
- ✅ Admin UI component
- ✅ Sidebar navigation
- ✅ Settings page integration

### 3. Test the Feature
1. Log in as an admin user
2. Navigate to Settings → Supervisor Assignments
3. Click "Assign Supervisor"
4. Select a supervisor and barangays
5. Verify the assignment appears in the list
6. Test removing an assignment

## Rollback Instructions

If you need to rollback this migration:

```bash
# Using psql
psql -U your_username -d your_database -f database/rollback-supervisor-assignments.sql

# Or manually:
DROP TRIGGER IF EXISTS trigger_supervisor_assignments_updated_at ON supervisor_assignments;
DROP FUNCTION IF EXISTS update_supervisor_assignments_updated_at();
DROP TABLE IF EXISTS supervisor_assignments CASCADE;
```

## Troubleshooting

### Issue: Foreign Key Constraint Violation
**Problem**: Cannot create assignment because supervisor_id, barangay_id, or cycle_id doesn't exist.

**Solution**:
```sql
-- Verify the IDs exist
SELECT id FROM "user" WHERE id = YOUR_SUPERVISOR_ID;
SELECT barangay_id FROM barangay WHERE barangay_id = YOUR_BARANGAY_ID;
SELECT cycle_id FROM survey_cycle WHERE cycle_id = YOUR_CYCLE_ID;
```

### Issue: Unique Constraint Violation
**Problem**: Duplicate assignment for same supervisor-barangay-cycle combination.

**Solution**: The API handles this with `ON CONFLICT DO UPDATE`, but if manually inserting:
```sql
-- Update existing assignment instead
UPDATE supervisor_assignments 
SET status = 'Active', updated_at = CURRENT_TIMESTAMP
WHERE supervisor_id = ? AND barangay_id = ? AND cycle_id = ?;
```

### Issue: Permission Denied
**Problem**: User doesn't have permission to create table.

**Solution**: Ensure you're connected as a user with CREATE TABLE privileges:
```sql
-- Grant necessary permissions
GRANT CREATE ON DATABASE your_database TO your_username;
```

### Issue: Table Already Exists
**Problem**: Migration fails because table already exists.

**Solution**:
```sql
-- Check if table exists
SELECT * FROM supervisor_assignments LIMIT 1;

-- If it exists and you want to recreate it:
DROP TABLE supervisor_assignments CASCADE;
-- Then run the migration again
```

## Data Migration (If Needed)

If you have existing supervisor-barangay relationships in another table:

```sql
-- Example: Migrate from old assignments table
INSERT INTO supervisor_assignments (supervisor_id, barangay_id, cycle_id, status)
SELECT 
  user_id as supervisor_id,
  barangay_id,
  survey_cycle_id as cycle_id,
  'Active' as status
FROM assignment
WHERE user_id IN (SELECT id FROM "user" WHERE role = 'fs')
ON CONFLICT (supervisor_id, barangay_id, cycle_id) DO NOTHING;
```

## Performance Considerations

The migration includes indexes on:
- `supervisor_id` - Fast lookup of all assignments for a supervisor
- `barangay_id` - Fast lookup of supervisor for a barangay
- `cycle_id` - Fast filtering by survey cycle
- `status` - Fast filtering by assignment status

For large datasets (>10,000 assignments), consider:
```sql
-- Analyze table after bulk inserts
ANALYZE supervisor_assignments;

-- Monitor query performance
EXPLAIN ANALYZE 
SELECT * FROM supervisor_assignments WHERE supervisor_id = 1;
```

## Security Notes

- Only users with admin role can access the supervisor assignments API
- All foreign keys have CASCADE DELETE to prevent orphaned records
- Unique constraint prevents duplicate assignments
- Updated_at timestamp is automatically maintained

## Support

For issues during migration:
1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Verify database connection: `psql -U your_username -d your_database -c "SELECT version();"`
3. Check table permissions: `\dp supervisor_assignments`
4. Review error messages carefully - they usually indicate the exact issue

---

**Migration File**: `database/supervisor-assignments-migration.sql`  
**Rollback File**: `database/rollback-supervisor-assignments.sql`  
**Documentation**: `docs/SUPERVISOR_ASSIGNMENTS.md`  
**Created**: November 27, 2024
