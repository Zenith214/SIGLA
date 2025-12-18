# 📍 Spot Management System

## Overview

The Spot Management system allows administrators to edit, reassign, and manage survey spots to handle human errors and operational changes.

## 🎯 Features

### 1. Edit Spot Details
- **Rename spots** - Fix typos or update naming conventions
- **Update GPS coordinates** - Correct location errors
- **Change status** - Mark spots as Pending, In Progress, or Completed

### 2. Reassign Field Interviewers
- **Assign spots** to active field interviewers
- **Unassign spots** when interviewers are unavailable
- **Reassign spots** to different interviewers

### 3. Delete Spots
- **Remove incorrect spots** created by mistake
- **Delete empty spots** (no completed questionnaires)
- **Cascade deletion** - Removes associated questionnaires

## 📍 Location

Navigate to: **Field Supervisor Dashboard → Spot Management Tab**

## 🚀 How to Use

### View All Spots
1. Open Field Supervisor Dashboard
2. Click "Spot Management" tab
3. See all spots for the active cycle
4. Click "Refresh" to reload data

### Edit a Spot

1. **Click the Edit button** (pencil icon) on any spot
2. **Modify fields**:
   - Spot Name
   - Assigned Field Interviewer
   - GPS Coordinates (Latitude/Longitude)
   - Status
3. **Click "Save Changes"**
4. Spot is updated immediately

### Reassign a Spot

1. Click Edit on the spot
2. Select a different interviewer from dropdown
3. Or select "Unassigned" to remove assignment
4. Save changes

### Delete a Spot

1. **Click the Delete button** (trash icon)
2. **Confirm deletion** in the dialog
3. Spot and all questionnaires are removed

**Note**: Cannot delete spots with completed questionnaires that have survey responses.

## 🔧 API Endpoints

### PATCH /api/spots
Update an existing spot

**Body**:
```json
{
  "spotId": 123,
  "spotName": "New Name",
  "assignedFiId": 456,
  "startingPoint": { "lat": 7.123456, "lng": 125.123456 },
  "status": "In_Progress"
}
```

**Response**:
```json
{
  "message": "Spot updated successfully",
  "spot": { ... },
  "changes": { ... }
}
```

### DELETE /api/spots
Delete a spot and its questionnaires

**Query Parameters**:
- `spotId`: ID of spot to delete
- `confirm`: Must be "DELETE"

**Response**:
```json
{
  "message": "Spot deleted successfully",
  "deletedSpot": { ... },
  "deletedQuestionnaires": 5
}
```

## 🎨 UI Components

### Spot Card
Each spot displays:
- **Spot Name** with status badge
- **Barangay** name
- **Assigned Interviewer** (or "Unassigned")
- **GPS Location** coordinates
- **Progress** (completed/total questionnaires)
- **Edit** and **Delete** buttons

### Edit Dialog
Modal with form fields:
- Spot Name (text input)
- Assigned FI (dropdown with active interviewers)
- Latitude (number input)
- Longitude (number input)
- Status (dropdown: Pending, In Progress, Completed)

### Delete Dialog
Confirmation modal with:
- Warning message
- Spot details
- Cannot delete if responses exist
- Confirm/Cancel buttons

## ⚠️ Validation Rules

### Edit Spot
- ✅ Spot name must be non-empty
- ✅ Assigned FI must be active interviewer
- ✅ Latitude must be between -90 and 90
- ✅ Longitude must be between -180 and 180
- ✅ Status must be valid (Pending, In_Progress, Completed)

### Delete Spot
- ❌ Cannot delete if questionnaires have survey responses
- ✅ Can delete spots with no responses
- ✅ Deletes all associated questionnaires
- ✅ Requires "DELETE" confirmation

## 🔄 Common Use Cases

### 1. Fix Assignment Error
**Problem**: Spot assigned to wrong interviewer

**Solution**:
1. Click Edit on the spot
2. Select correct interviewer
3. Save changes

### 2. Correct GPS Coordinates
**Problem**: Wrong location entered during spot creation

**Solution**:
1. Click Edit on the spot
2. Update Latitude and Longitude
3. Save changes

### 3. Remove Duplicate Spot
**Problem**: Accidentally created duplicate spot

**Solution**:
1. Click Delete on the duplicate spot
2. Confirm deletion
3. Spot and questionnaires removed

### 4. Unassign Unavailable Interviewer
**Problem**: Interviewer is sick/unavailable

**Solution**:
1. Click Edit on their assigned spots
2. Select "Unassigned"
3. Save changes
4. Later, reassign to available interviewer

### 5. Update Spot Status
**Problem**: Spot status doesn't reflect actual progress

**Solution**:
1. Click Edit on the spot
2. Change status to correct value
3. Save changes

## 📊 Status Badges

- **Pending** (Gray) - Not started
- **In Progress** (Blue) - Some questionnaires completed
- **Completed** (Green) - All questionnaires completed

## 🛡️ Safety Features

### Prevents Data Loss
- Cannot delete spots with survey responses
- Confirmation required for deletion
- Shows number of questionnaires to be deleted

### Validates Changes
- Checks interviewer exists and is active
- Validates GPS coordinate ranges
- Ensures spot name is not empty

### Audit Trail
- Updates `updated_at` timestamp
- Logs all changes
- Maintains data integrity

## 💡 Best Practices

### Before Deleting
1. Check if spot has responses
2. Consider unassigning instead of deleting
3. Verify it's truly a duplicate/error

### When Reassigning
1. Notify the interviewer
2. Check their current workload
3. Update assignment records

### GPS Coordinates
1. Use 6 decimal places for accuracy
2. Verify coordinates on map
3. Philippines typical range:
   - Latitude: 4.5°N to 21°N
   - Longitude: 116°E to 127°E

## 🚨 Error Messages

### "Cannot delete spot: X survey response(s) exist"
- Spot has completed questionnaires with data
- Delete responses first, or keep the spot

### "Field Interviewer not found"
- Selected interviewer doesn't exist
- Refresh and try again

### "Interviewer must be active"
- Selected interviewer is inactive
- Choose a different interviewer

### "Latitude must be between -90 and 90"
- Invalid GPS coordinate
- Check and correct the value

## 🎯 Quick Reference

| Action | Button | Location | Requirement |
|--------|--------|----------|-------------|
| Edit Spot | Pencil icon | Spot card | None |
| Delete Spot | Trash icon | Spot card | No responses |
| Reassign | Edit dialog | Dropdown | Active FI |
| Unassign | Edit dialog | Select "Unassigned" | None |
| Update GPS | Edit dialog | Lat/Lng fields | Valid coords |
| Change Status | Edit dialog | Status dropdown | Valid status |

## 📚 Related Documentation

- `docs/COMPLETE_SURVEY_WORKFLOW.md` - Survey workflow
- `docs/GPS_VERIFICATION_STATUS.md` - GPS verification
- `docs/QUESTIONNAIRE_ID_FORMAT_UPDATE.md` - ID format

## 🎉 Benefits

✅ **Fix Human Errors** - Correct mistakes quickly
✅ **Flexible Assignment** - Reassign as needed
✅ **Data Integrity** - Prevents accidental data loss
✅ **Easy to Use** - Intuitive UI
✅ **Real-time Updates** - Changes apply immediately
✅ **Audit Trail** - Track all modifications

---

**Need Help?** Check the UI tooltips or contact your system administrator.
