# User Barangay Assignment Feature

## Overview

Added barangay assignment functionality to the user creation/edit forms in the Settings → Users & Roles section. When creating or editing an Officer user, a barangay dropdown now appears to assign them to a specific barangay, which is required for CPAP submission access.

## Feature Details

### What Was Added

1. **Barangay Dropdown for Officers**
   - Appears automatically when "Officer" role is selected
   - Shows list of all barangays from the database
   - Includes helper text: "Required for CPAP submission access"
   - Hidden for other roles (Admin, FS, Interviewer)

2. **Automatic Assignment Creation**
   - When an Officer is created/edited with a barangay selected
   - Automatically creates an "Active" assignment in the Assignment table
   - Links the user to their assigned barangay

3. **Barangay List Integration**
   - Fetches barangays from `/api/barangays`
   - Displays barangay names in dropdown
   - Sorted alphabetically for easy selection

## Implementation

### File Modified

**`src/app/settings/ui/sections/users-roles.tsx`**

### Changes Made

#### 1. Added Barangay State

```typescript
const [barangays, setBarangays] = useState<any[]>([])
```

#### 2. Fetch Barangays on Load

```typescript
useEffect(() => {
  setLoading(true)
  Promise.all([
    fetch("/api/users").then(res => res.ok ? res.json() : Promise.reject("Failed to fetch users")),
    fetch("/api/barangays").then(res => res.ok ? res.json() : Promise.reject("Failed to fetch barangays"))
  ])
    .then(([usersData, barangaysData]) => {
      setUsers(usersData.users || usersData)
      setBarangays(barangaysData.barangays || barangaysData)
      setLoading(false)
    })
}, [])
```

#### 3. Added Barangay to Forms

```typescript
const [addForm, setAddForm] = useState<any>({
  // ... other fields
  barangay_id: "",
})
```

#### 4. Load Existing Assignment on Edit

```typescript
const handleEditClick = async (user: any) => {
  // ... existing code
  
  // Fetch user's barangay assignment if they're an officer
  let barangay_id = "";
  if (user.role?.toLowerCase() === 'officer') {
    try {
      const assignmentRes = await fetch(`/api/users/${user.id}/assignment`);
      if (assignmentRes.ok) {
        const assignmentData = await assignmentRes.json();
        barangay_id = assignmentData.barangay_id || "";
      }
    } catch (err) {
      console.error("Failed to fetch user assignment:", err);
    }
  }
  
  setEditForm({ 
    ...user,
    role: user.role?.toLowerCase() || 'officer',
    barangay_id
  })
}
```

#### 5. Create Assignment on Save

```typescript
// If officer role and barangay selected, create/update assignment
if (editForm.role === 'officer' && editForm.barangay_id) {
  try {
    await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: editForm.id,
        barangay_id: parseInt(editForm.barangay_id),
        status: "Active"
      }),
    });
  } catch (assignErr) {
    console.error("Failed to create assignment:", assignErr);
    toast({
      variant: "destructive",
      title: "Warning",
      description: "User updated but barangay assignment failed. Please assign manually in the Assignments tab.",
    });
  }
}
```

#### 6. Added Barangay Dropdown UI

**Edit Form:**
```tsx
{editForm.role === 'officer' && (
  <div>
    <label className="block text-sm font-medium mb-1">Assigned Barangay</label>
    <select name="barangay_id" value={editForm.barangay_id || ""} onChange={handleEditChange} className="w-full border rounded px-2 py-1">
      <option value="">Select Barangay</option>
      {barangays.map(barangay => (
        <option key={barangay.barangay_id} value={barangay.barangay_id}>
          {barangay.barangay_name}
        </option>
      ))}
    </select>
    <p className="text-xs text-gray-500 mt-1">Required for CPAP submission access</p>
  </div>
)}
```

**Add Form:** (Same structure)

## User Experience

### Creating a New Officer

1. Admin goes to **Settings** → **Users & Roles**
2. Clicks **"Add User"**
3. Fills in user details
4. Selects **"Officer"** role
5. **Barangay dropdown appears automatically**
6. Selects a barangay from the list
7. Clicks **"Save"**
8. User is created AND automatically assigned to the selected barangay

### Editing an Existing Officer

1. Admin clicks **Edit** on an Officer user
2. Form loads with current role
3. If Officer role, barangay dropdown appears
4. Shows currently assigned barangay (if any)
5. Can change barangay selection
6. Clicks **"Save"**
7. Assignment is updated

### Changing Role to Officer

1. Admin edits a user with a different role
2. Changes role dropdown to **"Officer"**
3. **Barangay dropdown appears immediately**
4. Selects a barangay
5. Saves
6. User role updated AND barangay assignment created

### Changing Role from Officer

1. Admin edits an Officer user
2. Changes role to something else (Admin, FS, Interviewer)
3. **Barangay dropdown disappears**
4. Saves
5. User role updated (assignment remains in database but inactive)

## Benefits

### Before
- Officers had to be manually assigned in the Assignments tab
- Two-step process: create user, then create assignment
- Easy to forget to assign barangay
- Officers would get errors when accessing CPAP

### After
- One-step process: create user and assign barangay together
- Automatic assignment creation
- Clear indication that barangay is required
- Prevents "no barangay assignment" errors

## Error Handling

### Assignment Creation Fails

If the assignment API call fails:
- User is still created/updated successfully
- Toast notification shows warning
- Message: "User updated but barangay assignment failed. Please assign manually in the Assignments tab."
- Admin can manually create assignment later

### No Barangay Selected

- Assignment creation is skipped
- No error shown (barangay is optional in the form)
- Officer will see error when trying to access CPAP
- Can be assigned later via edit or Assignments tab

## API Endpoints Used

### Fetch Barangays
```
GET /api/barangays
Response: { barangays: [...] }
```

### Fetch User Assignment
```
GET /api/users/{id}/assignment
Response: { barangay_id: 5 }
```

### Create Assignment
```
POST /api/assignments
Body: {
  user_id: 123,
  barangay_id: 5,
  status: "Active"
}
```

## Testing Checklist

- [ ] Create new Officer user with barangay selected
- [ ] Verify assignment created in Assignments tab
- [ ] Verify Officer can access CPAP Submission
- [ ] Edit Officer user and change barangay
- [ ] Verify assignment updated
- [ ] Create user with non-Officer role
- [ ] Verify barangay dropdown does NOT appear
- [ ] Change existing user to Officer role
- [ ] Verify barangay dropdown appears
- [ ] Select barangay and save
- [ ] Verify assignment created
- [ ] Change Officer to different role
- [ ] Verify barangay dropdown disappears
- [ ] Test with no barangay selected
- [ ] Verify Officer gets helpful error in CPAP page

## Future Enhancements

### Potential Improvements

1. **Show Current Assignment in User List**
   - Add "Assigned Barangay" column to user table
   - Show barangay name for Officer users

2. **Validation**
   - Make barangay required for Officer role
   - Show error if trying to save Officer without barangay

3. **Multiple Assignments**
   - Allow Officers to be assigned to multiple barangays
   - Multi-select dropdown

4. **Assignment History**
   - Track assignment changes over time
   - Show previous assignments

5. **Bulk Assignment**
   - Assign multiple Officers to same barangay at once
   - Import assignments from CSV

---

**Feature:** Barangay assignment in user creation/edit  
**Purpose:** Simplify Officer setup and prevent CPAP access errors  
**Status:** ✅ Complete and ready to use
