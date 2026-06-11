# Supervisor Assignments - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This quick start guide will help you set up and use the Supervisor Assignments feature immediately.

---

## ⚡ Prerequisites

Before you begin, ensure:
- ✅ You have admin access to the system
- ✅ Database migration has been applied
- ✅ At least one user with 'fs' (supervisor) role exists
- ✅ At least one survey cycle is active
- ✅ Barangays are configured in the system

---

## 📋 Step-by-Step Setup

### Step 1: Apply Database Migration (One-time)

```bash
# Backup your database first
pg_dump -U your_username -d your_database > backup.sql

# Apply the migration
psql -U your_username -d your_database -f database/supervisor-assignments-migration.sql

# Verify it worked
psql -U your_username -d your_database -c "SELECT * FROM supervisor_assignments LIMIT 1;"
```

**Expected Result**: Table exists (even if empty)

---

### Step 2: Create Supervisor Users (If Needed)

If you don't have any supervisors yet:

1. Go to **Settings → Users & Roles**
2. Click **"Add User"**
3. Fill in the form:
   - First Name: `Maria`
   - Last Name: `Santos`
   - Email: `maria.santos@example.com`
   - Password: `SecurePassword123`
   - **Role: `fs` (Supervisor)** ← Important!
   - Status: `Active`
4. Click **"Save"**

**Tip**: The role must be exactly `fs` for the user to appear in supervisor assignments.

---

### Step 3: Activate a Survey Cycle (If Needed)

If no cycle is active:

1. Go to **Settings → Survey Cycles**
2. Find the cycle you want to activate
3. Click **"Activate"** button
4. Confirm activation

**Note**: Only one cycle can be active at a time.

---

### Step 4: Create Your First Assignment

1. **Navigate**: Settings → **Supervisor Assignments**

2. **Click**: **"Assign Supervisor"** button (top-right)

3. **Select Supervisor**: Choose from dropdown
   ```
   Example: Maria Santos (maria.santos@example.com)
   ```

4. **Select Barangays**: Check one or more barangays
   ```
   ☑ Barangay A
   ☑ Barangay B
   ☑ Barangay C
   ```

5. **Review Cycle**: Automatically shows active cycle
   ```
   Q1 2024 (2024)
   ```

6. **Click**: **"Assign Supervisor"**

7. **Success!** You'll see:
   ```
   ✅ Success!
   Successfully assigned 3 barangay(s) to Maria Santos
   ```

---

## 🎯 Common Tasks

### View All Assignments

**Location**: Settings → Supervisor Assignments

**What You'll See**:
- Statistics cards (total supervisors, assignments, etc.)
- List of assignments grouped by supervisor
- Each supervisor shows their assigned barangays

### Search for Specific Assignment

1. Use the search bar at the top
2. Type supervisor name, barangay name, or cycle name
3. Results filter in real-time

**Examples**:
- Search: `Maria` → Shows all Maria's assignments
- Search: `Barangay A` → Shows who's assigned to Barangay A
- Search: `Q1 2024` → Shows all assignments for Q1 2024 cycle

### Remove an Assignment

1. Find the assignment in the list
2. Click the **trash icon (🗑️)** next to the barangay name
3. Confirm removal in the dialog
4. Assignment is immediately removed

### Assign More Barangays to Existing Supervisor

1. Click **"Assign Supervisor"**
2. Select the same supervisor
3. Select additional barangays
4. Click **"Assign Supervisor"**

**Note**: If you select a barangay already assigned, it will update the status instead of creating a duplicate.

---

## 📊 Understanding the Dashboard

### Statistics Cards

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ Total Supervisors   │  │ Active Assignments  │  │ Assigned Supervisors│
│ 5                   │  │ 12                  │  │ 3                   │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

- **Total Supervisors**: All users with 'fs' role
- **Active Assignments**: Total barangay-supervisor links
- **Assigned Supervisors**: Supervisors with at least one assignment

### Assignment Groups

Each supervisor's assignments are grouped together:

```
Maria Santos (maria@example.com)
[Q1 2024 (2024)]                    [3 Barangays]

[Barangay A 🗑️] [Barangay B 🗑️] [Barangay C 🗑️]
```

---

## ⚠️ Troubleshooting

### Problem: "Assign Supervisor" button is disabled

**Cause**: No active survey cycle

**Solution**:
1. Go to Settings → Survey Cycles
2. Activate a cycle
3. Return to Supervisor Assignments

---

### Problem: No supervisors in dropdown

**Cause**: No users with 'fs' role

**Solution**:
1. Go to Settings → Users & Roles
2. Create a new user with role = `fs`
3. Or edit existing user and change role to `fs`
4. Return to Supervisor Assignments

---

### Problem: Assignment creation fails

**Possible Causes**:
- Supervisor doesn't have 'fs' role
- No barangays selected
- Database connection issue

**Solution**:
1. Check error message in toast notification
2. Verify supervisor role is exactly `fs`
3. Ensure at least one barangay is selected
4. Check browser console for detailed errors

---

### Problem: Can't see assignments after creating

**Cause**: Page didn't refresh

**Solution**:
- Refresh the page manually (F5)
- Or navigate away and back to Supervisor Assignments

---

## 🎓 Best Practices

### 1. Balanced Workload
Distribute barangays evenly across supervisors:
```
✅ Good:
- Supervisor A: 3 barangays
- Supervisor B: 3 barangays
- Supervisor C: 3 barangays

❌ Avoid:
- Supervisor A: 8 barangays
- Supervisor B: 1 barangay
- Supervisor C: 0 barangays
```

### 2. Geographic Clustering
Assign nearby barangays to the same supervisor:
```
✅ Good:
- Supervisor A: Barangay 1, 2, 3 (all in North district)
- Supervisor B: Barangay 4, 5, 6 (all in South district)

❌ Avoid:
- Supervisor A: Barangay 1 (North), 5 (South), 9 (East)
```

### 3. Regular Review
Check assignments at the start of each cycle:
- Remove supervisors who are no longer available
- Reassign barangays if needed
- Balance workload based on previous cycle performance

### 4. Clear Communication
After assigning:
- Notify supervisors via email or meeting
- Provide list of their assigned barangays
- Share contact info for barangay officials

---

## 📈 Workflow Example

### Scenario: New Survey Cycle Starting

**Goal**: Assign 3 supervisors to 15 barangays

**Steps**:

1. **Activate Cycle**
   - Settings → Survey Cycles
   - Activate "Q2 2024"

2. **Review Supervisors**
   - Settings → Users & Roles
   - Verify 3 users have 'fs' role
   - Maria, Juan, Pedro

3. **Create Assignments**
   
   **Assignment 1**:
   - Supervisor: Maria Santos
   - Barangays: A, B, C, D, E (5 barangays)
   
   **Assignment 2**:
   - Supervisor: Juan Dela Cruz
   - Barangays: F, G, H, I, J (5 barangays)
   
   **Assignment 3**:
   - Supervisor: Pedro Garcia
   - Barangays: K, L, M, N, O (5 barangays)

4. **Verify**
   - Check statistics: 3 assigned supervisors, 15 active assignments
   - Search for each supervisor to verify their barangays
   - Export or screenshot for records

5. **Communicate**
   - Email each supervisor their assignment list
   - Schedule kickoff meeting
   - Provide field operation guidelines

---

## 🔗 Related Features

After setting up supervisor assignments, you may want to:

1. **Spot Management** (Settings → Spot Management)
   - Create spots within assigned barangays
   - Supervisors can then assign spots to interviewers

2. **Survey Targets** (Settings → Survey Targets)
   - Set target number of surveys per barangay
   - Track progress against targets

3. **Users & Roles** (Settings → Users & Roles)
   - Manage supervisor accounts
   - Create interviewer accounts for supervisors to assign

---

## 📞 Need Help?

### Documentation
- **Full Documentation**: `docs/SUPERVISOR_ASSIGNMENTS.md`
- **Visual Guide**: `docs/SUPERVISOR_ASSIGNMENTS_VISUAL_GUIDE.md`
- **Migration Guide**: `database/README-SUPERVISOR-ASSIGNMENTS.md`

### Common Questions

**Q: Can a barangay be assigned to multiple supervisors?**  
A: Yes, but only in different cycles. Within the same cycle, one barangay = one supervisor.

**Q: Can I change assignments after creation?**  
A: Yes, remove the old assignment and create a new one.

**Q: What happens if I delete a supervisor user?**  
A: Their assignments are automatically removed (cascade delete).

**Q: Can supervisors see their assignments?**  
A: Currently, this is admin-only. Future versions may include a supervisor dashboard.

---

## ✅ Checklist

Before going live with supervisor assignments:

- [ ] Database migration applied successfully
- [ ] At least 3 supervisor users created (role = 'fs')
- [ ] Active survey cycle configured
- [ ] All barangays configured in system
- [ ] Test assignment created and verified
- [ ] Test assignment deleted and verified
- [ ] Search functionality tested
- [ ] Supervisors notified of their assignments
- [ ] Backup of database taken
- [ ] Admin team trained on the feature

---

## 🎉 You're Ready!

You now know how to:
- ✅ Create supervisor assignments
- ✅ View and search assignments
- ✅ Remove assignments
- ✅ Troubleshoot common issues
- ✅ Follow best practices

**Next Steps**:
1. Create your first real assignment
2. Notify your supervisors
3. Monitor field operations progress

---

**Quick Start Guide Version**: 1.0  
**Last Updated**: November 27, 2024  
**Estimated Setup Time**: 5-10 minutes
