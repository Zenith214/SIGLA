# Multiple Interviewers Per Barangay - Feature Specification

**Date:** October 28, 2025  
**Status:** 📋 SPECIFICATION  
**Priority:** Medium

---

## 🎯 Goal

Allow multiple interviewers to be assigned to the same barangay and display this information clearly in the UI.

---

## 📊 Current State

**Database:**
- One-to-one relationship: One barangay → One assignment → One interviewer
- Table: `assignment` with `barangay_id` (should be unique per cycle)

**UI Display:**
- Survey dashboard cards show: "Interviewer: John Doe"
- Only shows one interviewer name

**Problem:**
- Cannot assign multiple interviewers to the same barangay
- If multiple assignments exist, only the first one is shown

---

## 🎨 Proposed Solution

### 1. Survey Dashboard Cards

**Current:**
```
Interviewer: John Doe
```

**Proposed:**
```
Interviewer: John Doe and 2 more
```

**Logic:**
- If 1 interviewer: "Interviewer: John Doe"
- If 2 interviewers: "Interviewer: John Doe and 1 more"
- If 3+ interviewers: "Interviewer: John Doe and 2 more"

### 2. Barangay Detail Page

**Add new section:** "Assigned Interviewers"

**Table columns:**
- Interviewer Name
- Email
- Status (Assigned/In Progress/Completed)
- Progress (%)
- Assigned Date
- Actions (View/Remove - admin only)

**Example:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Assigned Interviewers                                           │
├──────────────────┬─────────────────┬────────────┬──────────────┤
│ Name             │ Email           │ Status     │ Progress     │
├──────────────────┼─────────────────┼────────────┼──────────────┤
│ John Doe         │ john@email.com  │ In Progress│ 45%          │
│ Jane Smith       │ jane@email.com  │ Assigned   │ 0%           │
│ Bob Johnson      │ bob@email.com   │ Completed  │ 100%         │
└──────────────────┴─────────────────┴────────────┴──────────────┘
```

---

## 🔧 Implementation Requirements

### Phase 1: Database Changes

**Option A: Keep current schema (simpler)**
- Allow multiple rows in `assignment` table for same barangay
- Remove unique constraint on `barangay_id` per cycle
- Each interviewer gets their own assignment record

**Option B: New schema (more complex)**
- Create `assignment_interviewers` junction table
- One assignment → Many interviewers
- Requires more refactoring

**Recommendation:** Option A (simpler, less breaking changes)

### Phase 2: API Updates

**Update `/api/barangays-with-assignments`:**

Current response:
```json
{
  "id": 1,
  "name": "Buguis",
  "assignment": {
    "interviewer": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

New response:
```json
{
  "id": 1,
  "name": "Buguis",
  "assignments": [
    {
      "assignment_id": 1,
      "status": "In Progress",
      "progress": 45,
      "interviewer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@email.com"
      }
    },
    {
      "assignment_id": 2,
      "status": "Assigned",
      "progress": 0,
      "interviewer": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@email.com"
      }
    }
  ]
}
```

**New API endpoint:**
```
GET /api/barangays/{id}/assignments
```
Returns all assignments for a specific barangay.

### Phase 3: UI Updates

**File: `src/app/survey/page.tsx`**

Update the interviewer display logic:
```tsx
{barangay.assignments ? (
  barangay.assignments.length === 1 ? (
    <div className="flex justify-between">
      <span>Interviewer:</span>
      <span className="font-medium truncate ml-1">
        {barangay.assignments[0].interviewer.firstName} {barangay.assignments[0].interviewer.lastName}
      </span>
    </div>
  ) : (
    <div className="flex justify-between">
      <span>Interviewers:</span>
      <span className="font-medium truncate ml-1">
        {barangay.assignments[0].interviewer.firstName} {barangay.assignments[0].interviewer.lastName} and {barangay.assignments.length - 1} more
      </span>
    </div>
  )
) : (
  <div className="flex justify-between">
    <span>Status:</span>
    <span className="font-medium text-amber-600">No assignment</span>
  </div>
)}
```

**File: `src/app/survey/barangay/[id]/page.tsx`**

Add new section after "Survey Summary":
```tsx
{/* Assigned Interviewers Section */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigned Interviewers</h3>
  
  {assignments.length === 0 ? (
    <p className="text-gray-500 text-center py-4">No interviewers assigned yet</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4">Name</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-center py-3 px-4">Status</th>
            <th className="text-center py-3 px-4">Progress</th>
            <th className="text-left py-3 px-4">Assigned Date</th>
            {user?.role === 'admin' && (
              <th className="text-center py-3 px-4">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.assignment_id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">
                {assignment.interviewer.firstName} {assignment.interviewer.lastName}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {assignment.interviewer.email}
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  assignment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {assignment.status}
                </span>
              </td>
              <td className="py-3 px-4 text-center font-medium">
                {assignment.progress}%
              </td>
              <td className="py-3 px-4 text-gray-600">
                {new Date(assignment.created_at).toLocaleDateString()}
              </td>
              {user?.role === 'admin' && (
                <td className="py-3 px-4 text-center">
                  <button className="text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
```

### Phase 4: Progress Calculation

**Question:** How to calculate overall barangay progress with multiple interviewers?

**Options:**
1. **Average:** Average of all interviewer progress
2. **Highest:** Use the highest progress
3. **Combined:** Track total surveys needed vs completed
4. **Independent:** Each interviewer has their own target

**Recommendation:** Option 3 (Combined)
- Each barangay has a target (e.g., 150 surveys)
- Multiple interviewers work together to reach that target
- Progress = (Total completed surveys / Target) × 100%

---

## 🧪 Testing Checklist

- [ ] Assign multiple interviewers to same barangay
- [ ] Verify dashboard shows "and X more" text
- [ ] Verify barangay detail page shows all interviewers
- [ ] Verify each interviewer sees the barangay in "My Assignments"
- [ ] Verify progress calculation is correct
- [ ] Verify removing one interviewer doesn't affect others
- [ ] Verify completed status handling with multiple interviewers
- [ ] Test with 1, 2, 3, and 5+ interviewers

---

## 📝 Migration Steps

1. **Backup database** before making changes
2. **Remove unique constraint** on assignment table (if exists)
3. **Update API** to return assignments array
4. **Update UI components** to handle arrays
5. **Test thoroughly** with existing data
6. **Deploy** with rollback plan ready

---

## 🚧 Potential Issues

1. **Backward compatibility:** Existing code expects single assignment
2. **Performance:** More database queries for multiple assignments
3. **UI space:** Limited space to show multiple names on cards
4. **Progress tracking:** Need clear logic for combined progress
5. **Permissions:** Who can see/modify which assignments?

---

## 💡 Alternative Approaches

### Approach 1: Team Assignments
- Create "teams" of interviewers
- Assign teams to barangays instead of individuals
- More complex but better for large-scale operations

### Approach 2: Primary + Secondary
- One primary interviewer (shown on card)
- Multiple secondary interviewers (shown in detail page)
- Simpler UI but less flexible

### Approach 3: Current System (No Change)
- Keep one interviewer per barangay
- Use assignment rotation if needed
- Simplest but least flexible

---

## 📅 Estimated Effort

- **Database changes:** 1-2 hours
- **API updates:** 2-3 hours
- **UI updates:** 3-4 hours
- **Testing:** 2-3 hours
- **Total:** 8-12 hours

---

**This feature requires careful planning and testing to avoid breaking existing functionality. Recommend implementing in a development environment first.**
