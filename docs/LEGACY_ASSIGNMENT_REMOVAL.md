# Legacy Assignment Field Removal

## Overview
Removed the legacy "Assigned Barangay" field and automatic assignment creation logic from the user management interface. This field was creating confusion and incorrectly creating Assignment records for officers.

## What Was Removed

### Frontend Changes (users-roles.tsx)

1. **Removed Fields from State**
   - Removed `barangay_id` from `addForm` initial state
   - Removed `barangay_id` from form reset logic
   - Removed `barangay_id` from `editForm` initialization

2. **Removed UI Elements**
   - Removed "Assigned Barangay (Legacy)" dropdown from Add User dialog
   - Removed "Assigned Barangay (Legacy)" dropdown from Edit User dialog
   - Removed associated helper text about CPAP submission access

3. **Removed Logic**
   - Removed automatic assignment creation when adding officers
   - Removed automatic assignment creation when editing officers
   - Removed assignment API fetch in `handleEditClick`
   - Removed assignment creation error handling and toast notifications

### Code Removed
- Assignment creation POST requests to `/api/assignments`
- Assignment fetching GET requests to `/api/users/${user.id}/assignment`
- All `barangay_id` field references in forms
- Legacy dropdown UI components

## Why This Was Removed

1. **Incorrect Use Case**: The Assignment table is designed for interviewer-to-barangay assignments managed by Field Supervisors, not for officer designations.

2. **Redundancy**: The new `barangayDesignation` field on the User table serves the purpose of designating officers to barangays without creating unnecessary Assignment records.

3. **Confusion**: Having two different barangay selection fields (Designation and Legacy Assignment) was confusing for users.

4. **Data Integrity**: Creating Assignment records for officers was polluting the Assignment table with incorrect data.

## Current State

### Officer Barangay Management
- Officers now use **only** the `barangayDesignation` field
- This is a direct column on the User table
- No Assignment records are created for officers
- The field is nullable and optional

### Assignment Table Usage
- Assignments are **only** for interviewers
- Managed through the FS Dashboard
- Created and managed by Field Supervisors
- Properly tracks interviewer-to-barangay assignments for survey cycles

## Migration Notes

**No database migration needed** - The Assignment table structure remains unchanged. Any existing Assignment records for officers can remain in the database without causing issues, but new ones will not be created through the user management interface.

If you need to clean up existing officer assignments from the database, you can run:

```sql
-- Optional cleanup query (run with caution)
DELETE FROM assignment 
WHERE user_id IN (
  SELECT id FROM "user" WHERE role = 'officer'
);
```

## Related Files Modified
- `src/app/settings/ui/sections/users-roles.tsx` - Removed legacy field and logic
- `docs/BARANGAY_DESIGNATION_FEATURE.md` - Updated documentation
