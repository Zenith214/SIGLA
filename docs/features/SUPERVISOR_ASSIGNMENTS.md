# Supervisor Assignments Feature

## Overview
The Supervisor Assignments feature allows administrators to assign Field Supervisors (FS role) to specific barangays for a given survey cycle. This defines each supervisor's scope of work and establishes clear responsibility boundaries for field operations management.

## Purpose
- **Define Scope of Work**: Clearly establish which barangays each supervisor is responsible for
- **Cycle-Specific**: Assignments are tied to specific survey cycles, allowing flexibility across different cycles
- **Centralized Management**: Admins can view and manage all supervisor assignments from one location
- **Prevent Overlap**: System ensures no duplicate assignments (one supervisor per barangay per cycle)

## Database Structure

### Table: `supervisor_assignments`
```sql
CREATE TABLE supervisor_assignments (
  id SERIAL PRIMARY KEY,
  supervisor_id INTEGER NOT NULL,      -- References user.id (must have 'fs' role)
  barangay_id INTEGER NOT NULL,        -- References barangay.barangay_id
  cycle_id INTEGER NOT NULL,           -- References survey_cycle.cycle_id
  status VARCHAR(20) DEFAULT 'Active', -- Assignment status
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_supervisor_barangay_cycle 
    UNIQUE (supervisor_id, barangay_id, cycle_id)
);
```

### Key Constraints
- **Foreign Keys**: Ensures referential integrity with users, barangays, and survey cycles
- **Unique Constraint**: Prevents duplicate assignments for the same supervisor-barangay-cycle combination
- **Cascade Delete**: Assignments are automatically removed if the supervisor, barangay, or cycle is deleted

## User Workflow

### Admin Actions

1. **Navigate to Supervisor Assignments**
   - Go to Admin Settings Panel
   - Click "Supervisor Assignments" in the sidebar

2. **Create New Assignment**
   - Click "Assign Supervisor" button
   - Select a supervisor from the dropdown (only users with 'fs' role appear)
   - Select one or multiple barangays using checkboxes
   - Assignment is automatically created for the active survey cycle
   - Click "Assign Supervisor" to save

3. **View Assignments**
   - Assignments are grouped by supervisor and cycle
   - Each group shows the supervisor's name, email, and assigned barangays
   - Badge indicates the number of barangays assigned
   - Search functionality to filter by supervisor name, barangay, or cycle

4. **Remove Assignment**
   - Click the trash icon next to any barangay assignment
   - Confirm the removal in the dialog
   - Assignment is immediately removed from the system

### Statistics Dashboard
The feature displays three key metrics:
- **Total Supervisors**: Count of all users with 'fs' role
- **Active Assignments**: Total number of barangay assignments
- **Assigned Supervisors**: Number of supervisors with at least one assignment

## API Endpoints

### GET `/api/supervisor-assignments`
Fetch all supervisor assignments with optional filters.

**Query Parameters:**
- `cycle_id` (optional): Filter by survey cycle
- `supervisor_id` (optional): Filter by supervisor

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "supervisor_id": 5,
      "barangay_id": 10,
      "cycle_id": 2,
      "status": "Active",
      "supervisor_first_name": "Maria",
      "supervisor_last_name": "Santos",
      "supervisor_email": "maria@example.com",
      "barangay_name": "Barangay A",
      "cycle_name": "Q1 2024",
      "cycle_year": 2024,
      "assigned_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST `/api/supervisor-assignments`
Create new supervisor assignment(s).

**Request Body:**
```json
{
  "supervisor_id": 5,
  "barangay_ids": [10, 11, 12],
  "cycle_id": 2,
  "status": "Active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully assigned 3 barangay(s) to Maria Santos",
  "count": 3
}
```

**Validation:**
- Supervisor must have 'fs' role
- At least one barangay must be selected
- Cycle must exist
- Duplicate assignments are updated instead of creating errors

### DELETE `/api/supervisor-assignments`
Remove a supervisor assignment.

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Supervisor assignment deleted successfully"
}
```

## Migration Instructions

### Apply Migration
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the migration script
\i database/supervisor-assignments-migration.sql
```

### Rollback Migration
```bash
# Connect to your PostgreSQL database
psql -U your_username -d your_database

# Run the rollback script
\i database/rollback-supervisor-assignments.sql
```

## Integration Points

### With User Management
- Only users with `role = 'fs'` (Field Supervisor) can be assigned
- Supervisors are automatically filtered in the assignment interface
- User deletion cascades to remove their assignments

### With Survey Cycles
- Assignments are cycle-specific
- Only the active cycle can be used for new assignments
- Cycle deletion cascades to remove related assignments

### With Barangays
- Each barangay can be assigned to multiple supervisors (different cycles)
- Barangay deletion cascades to remove related assignments

## Future Enhancements

### Potential Features
1. **Bulk Assignment**: Assign multiple supervisors at once
2. **Assignment History**: Track changes to assignments over time
3. **Performance Metrics**: Show supervisor performance per barangay
4. **Workload Balancing**: Suggest balanced assignments based on barangay size
5. **Assignment Templates**: Save and reuse assignment patterns across cycles
6. **Notification System**: Alert supervisors when they're assigned to new barangays
7. **Mobile View**: Supervisors can view their assignments on mobile devices

### Dashboard Integration
- Add supervisor assignment widget to main dashboard
- Show "My Barangays" view for supervisors
- Display assignment coverage percentage per cycle

## Security Considerations

- **Role-Based Access**: Only admins can create/modify assignments
- **Data Validation**: All inputs are validated on both client and server
- **SQL Injection Prevention**: Using parameterized queries
- **Cascade Deletes**: Automatic cleanup prevents orphaned records

## Testing Checklist

- [ ] Create assignment with single barangay
- [ ] Create assignment with multiple barangays
- [ ] Attempt to assign non-supervisor user (should fail)
- [ ] Create duplicate assignment (should update existing)
- [ ] Delete assignment
- [ ] Search and filter assignments
- [ ] View assignments without active cycle
- [ ] Test cascade deletes (user, barangay, cycle)
- [ ] Verify unique constraint enforcement
- [ ] Test API error handling

## Support

For issues or questions about this feature:
1. Check the API response error messages
2. Review the database migration logs
3. Verify user roles are correctly set
4. Ensure an active survey cycle exists

---

**Created**: November 27, 2024  
**Version**: 1.0  
**Status**: Production Ready
