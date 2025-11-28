# Supervisor Assignments - Visual Guide

## 🎯 Feature Overview

This guide provides a visual walkthrough of the Supervisor Assignments feature, showing how admins assign Field Supervisors to barangays.

---

## 📍 Navigation

### Step 1: Access Admin Settings
```
Dashboard → Settings (top right) → Admin Settings Panel
```

### Step 2: Navigate to Supervisor Assignments
```
Admin Sidebar → Supervisor Assignments (with UserCheck icon)
```

**Location in Sidebar:**
```
📅 Survey Cycles
📍 Barangays
🏆 Award Management
🎯 Survey Targets
✅ Supervisor Assignments  ← YOU ARE HERE
👥 Users & Roles
💾 Backup
```

---

## 📊 Main Dashboard View

### Statistics Cards (Top Section)
```
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│  Total Supervisors      │  Active Assignments     │  Assigned Supervisors   │
│  👥 5                   │  ✅ 12                  │  ✅ 3                   │
│  Users with FS role     │  Total barangay links   │  Supervisors with work  │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Search Bar
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search by supervisor name, barangay, or cycle...                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Assignment List (Grouped by Supervisor)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Maria Santos                                              [3 Barangays]     │
│ maria@example.com                                                           │
│ [Q1 2024 (2024)]                                                           │
│                                                                             │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐           │
│ │ Barangay A    🗑️ │ │ Barangay B    🗑️ │ │ Barangay C    🗑️ │           │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Juan Dela Cruz                                            [2 Barangays]     │
│ juan@example.com                                                            │
│ [Q1 2024 (2024)]                                                           │
│                                                                             │
│ ┌──────────────────┐ ┌──────────────────┐                                 │
│ │ Barangay D    🗑️ │ │ Barangay E    🗑️ │                                 │
│ └──────────────────┘ └──────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ➕ Creating New Assignment

### Step 1: Click "Assign Supervisor" Button
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Supervisor Assignments                    [➕ Assign Supervisor]            │
│ Assign supervisors to barangays for field operations management            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Assignment Dialog Opens
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Assign Supervisor to Barangays                                         [✕]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Select Supervisor                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ Choose a supervisor...                                              ▼│   │
│ │ Maria Santos (maria@example.com)                                     │   │
│ │ Juan Dela Cruz (juan@example.com)                                    │   │
│ │ Pedro Garcia (pedro@example.com)                                     │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ Select Barangays (0 selected)                                               │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ ☐ Barangay A                                                         │   │
│ │ ☐ Barangay B                                                         │   │
│ │ ☐ Barangay C                                                         │   │
│ │ ☐ Barangay D                                                         │   │
│ │ ☐ Barangay E                                                         │   │
│ │ ☐ Barangay F                                                         │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│ Survey Cycle                                                                │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ Q1 2024 (2024)                                                       │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                                          [Cancel] [Assign Supervisor]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Select Supervisor
```
│ Select Supervisor                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ Maria Santos (maria@example.com)                                ✓   │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
```

### Step 4: Select Barangays (Multi-select)
```
│ Select Barangays (3 selected)                                               │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ ☑ Barangay A                                                         │   │
│ │ ☑ Barangay B                                                         │   │
│ │ ☑ Barangay C                                                         │   │
│ │ ☐ Barangay D                                                         │   │
│ │ ☐ Barangay E                                                         │   │
│ │ ☐ Barangay F                                                         │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
```

### Step 5: Confirm Assignment
```
│                                          [Cancel] [Assign Supervisor]       │
                                                    ↑ Click here
```

### Step 6: Success Notification
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✅ Success!                                                                 │
│ Successfully assigned 3 barangay(s) to Maria Santos                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗑️ Removing Assignment

### Step 1: Click Trash Icon
```
┌──────────────────┐
│ Barangay A    🗑️ │  ← Click trash icon
└──────────────────┘
```

### Step 2: Confirmation Dialog
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Remove Assignment                                                      [✕]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ⚠️ Confirm Removal                                                          │
│                                                                             │
│ Are you sure you want to remove the assignment for Barangay A?             │
│                                                                             │
│                                                    [Cancel] [Remove]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Success Notification
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✅ Deleted                                                                  │
│ Supervisor assignment removed successfully                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Search Functionality

### Example: Search for "Maria"
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 maria                                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Results:
┌─────────────────────────────────────────────────────────────────────────────┐
│ Maria Santos                                              [3 Barangays]     │
│ maria@example.com                                                           │
│ [Q1 2024 (2024)]                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Example: Search for "Barangay A"
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🔍 barangay a                                                               │
└─────────────────────────────────────────────────────────────────────────────┘

Results:
┌─────────────────────────────────────────────────────────────────────────────┐
│ Maria Santos                                              [1 Barangay]      │
│ maria@example.com                                                           │
│ [Q1 2024 (2024)]                                                           │
│                                                                             │
│ ┌──────────────────┐                                                       │
│ │ Barangay A    🗑️ │                                                       │
│ └──────────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Edge Cases

### No Active Cycle
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ No active survey cycle. Please activate a cycle to create assignments.  │
└─────────────────────────────────────────────────────────────────────────────┘

[Assign Supervisor] button is disabled
```

### No Supervisors Available
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Select Supervisor                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐   │
│ │ Choose a supervisor...                                              ▼│   │
│ └─────────────────────────────────────────────────────────────────────┘   │
│ ⚠️ No supervisors found. Please create users with 'fs' role first.         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### No Assignments Yet
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              ✅                                             │
│                                                                             │
│                      No Assignments Yet                                     │
│              Start by assigning supervisors to barangays                    │
│                                                                             │
│                    [➕ Create First Assignment]                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Empty Search Results
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              🔍                                             │
│                                                                             │
│                        No users found                                       │
│              No users match your search criteria "xyz"                      │
│                                                                             │
│                         [Clear Search]                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Coding

### Status Badges
- **Active**: Green badge
- **Inactive**: Gray badge

### Role Badges
- **Supervisor (fs)**: Purple badge
- **Admin**: Red badge
- **Interviewer**: Blue badge
- **Officer**: Gray badge

### Statistics Cards
- **Total Supervisors**: Purple background
- **Active Assignments**: Blue background
- **Assigned Supervisors**: Green background

---

## 📱 Responsive Design

### Desktop View (>1024px)
- Statistics: 3 columns
- Barangay chips: 3 columns
- Full sidebar visible

### Tablet View (768px - 1024px)
- Statistics: 2 columns
- Barangay chips: 2 columns
- Collapsible sidebar

### Mobile View (<768px)
- Statistics: 1 column (stacked)
- Barangay chips: 1 column (stacked)
- Hidden sidebar (toggle button)

---

## 🔄 Real-time Updates

### After Creating Assignment
1. Dialog closes automatically
2. Success toast appears (top-right)
3. Assignment list refreshes
4. Statistics update
5. New assignment appears at top

### After Deleting Assignment
1. Confirmation dialog closes
2. Success toast appears
3. Assignment removed from list
4. Statistics update
5. If last barangay, supervisor group is removed

---

## 🎯 User Flow Summary

```
Admin Login
    ↓
Navigate to Settings
    ↓
Click "Supervisor Assignments"
    ↓
View Current Assignments
    ↓
Click "Assign Supervisor"
    ↓
Select Supervisor (dropdown)
    ↓
Select Barangays (checkboxes)
    ↓
Review Active Cycle (auto-filled)
    ↓
Click "Assign Supervisor"
    ↓
See Success Message
    ↓
View Updated Assignment List
```

---

## 💡 Tips for Admins

1. **Bulk Assignment**: Select multiple barangays at once to save time
2. **Search First**: Use search to quickly find specific supervisors or barangays
3. **Check Statistics**: Monitor workload distribution across supervisors
4. **Active Cycle**: Ensure a cycle is active before creating assignments
5. **Role Verification**: Only users with 'fs' role appear in supervisor dropdown

---

## 🚀 Quick Actions

| Action | Shortcut |
|--------|----------|
| Open assignment dialog | Click "Assign Supervisor" button |
| Search assignments | Type in search bar |
| Remove assignment | Click trash icon on barangay chip |
| Clear search | Click "Clear Search" or delete text |
| Close dialog | Click X or press ESC |

---

**Visual Guide Version**: 1.0  
**Last Updated**: November 27, 2024  
**For**: SIGLA Survey System - Admin Users
