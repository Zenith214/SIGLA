# Quick Start: Flexible Slot Allocation

## 🚀 What's New?

You can now:
1. **Create spots with any number of questionnaires** (1-50, not just 5)
2. **Assign specific questionnaires to different interviewers**
3. **Track who has which questionnaires in real-time**

## 📋 Setup (One-Time)

### Step 1: Run Database Migration

```powershell
# Option A: Using psql command line
psql -U your_username -d your_database -f database/add-questionnaire-assignment-field.sql

# Option B: Using Supabase Dashboard
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of database/add-questionnaire-assignment-field.sql
# 3. Run the SQL
```

### Step 2: Verify Migration

Check that the new column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'questionnaires' 
AND column_name = 'assigned_interviewer_id';
```

## 🎯 How to Use

### Creating a Spot with Custom Questionnaire Count

1. **Go to Field Supervisor Dashboard**
   - Navigate to `/fs-dashboard` or your FS dashboard page

2. **Click "Create Spot"**
   - Click on the map to set starting point

3. **Fill in the form:**
   ```
   Spot Name: Poblacion Center
   Barangay: Poblacion
   Number of Questionnaires: 20  ← NEW FIELD!
   Random Start: 123
   ```

4. **Click "Create Spot"**
   - System creates 20 questionnaires (2024-001-001 through 2024-001-020)

### Assigning Questionnaires to Interviewers

1. **Find your spot in the list**

2. **Click "Manage Questionnaire Assignments"** button

3. **In the modal:**
   - See all questionnaires (e.g., 20 total)
   - See assignment status (e.g., 5 assigned, 15 unassigned)

4. **Select questionnaires:**
   - Click checkboxes to select (e.g., select 10 questionnaires)
   - Or use "Select All Unassigned" button

5. **Choose interviewer:**
   - Select from dropdown (e.g., "Maria Santos")

6. **Click "Assign"**
   - Selected questionnaires are now assigned to Maria

7. **Repeat for other interviewers:**
   - Select 7 more questionnaires
   - Assign to "Juan Dela Cruz"
   - Select remaining 3
   - Assign to "Pedro Garcia"

## 📊 Example Scenarios

### Scenario 1: Small Area (5 households)
```
Create Spot:
- Name: "Purok 1 Mountain"
- Questionnaires: 5

Assign:
- All 5 → Juan (single interviewer)
```

### Scenario 2: Medium Area (15 households)
```
Create Spot:
- Name: "Poblacion North"
- Questionnaires: 15

Assign:
- 8 → Maria (senior, experienced)
- 7 → Pedro (junior, learning)
```

### Scenario 3: Large Area (30 households)
```
Create Spot:
- Name: "Entire Sitio Riverside"
- Questionnaires: 30

Assign:
- 12 → Interviewer A
- 10 → Interviewer B
- 8 → Interviewer C

Result: 3 interviewers working in parallel!
```

## 🎨 Visual Guide

### Before (Old System)
```
Every spot = exactly 5 questionnaires
No choice, no flexibility

Spot A → 5 questionnaires → 1 interviewer
Spot B → 5 questionnaires → 1 interviewer
```

### After (New System)
```
Each spot = custom number (1-50)
Flexible assignment to multiple interviewers

Spot A → 20 questionnaires → 3 interviewers
  - Maria: 10 questionnaires
  - Juan: 7 questionnaires
  - Pedro: 3 questionnaires
```

## ✅ Benefits

### For Field Supervisors:
- ✅ Match spot size to actual area coverage
- ✅ Distribute work based on interviewer capacity
- ✅ Track assignments in real-time
- ✅ Reassign if needed

### For Interviewers:
- ✅ Clear assignment visibility
- ✅ Know exactly which questionnaires to complete
- ✅ Fair workload distribution

### For the Project:
- ✅ Faster data collection (parallel work)
- ✅ Better resource utilization
- ✅ More accurate planning

## 🔍 Checking Assignment Status

### In the Spot List:
```
Spot: Poblacion Center
Progress: 15/20 interviews (75%)
Status: In Progress

[Manage Questionnaire Assignments] ← Click here
```

### In the Assignment Modal:
```
Total: 20
Assigned: 17 (85%)
Unassigned: 3 (15%)

By Interviewer:
- Maria Santos: 10 questionnaires
- Juan Dela Cruz: 7 questionnaires
- Unassigned: 3 questionnaires
```

## 🛠️ Troubleshooting

### Issue: "Number of Questionnaires" field not showing
**Solution:** Clear browser cache and refresh
```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

### Issue: Can't assign questionnaires
**Solution:** Check database migration was run
```sql
-- Verify column exists
SELECT * FROM information_schema.columns 
WHERE table_name = 'questionnaires' 
AND column_name = 'assigned_interviewer_id';
```

### Issue: Assignment modal not opening
**Solution:** Check browser console for errors, refresh page

## 📝 Notes

- **Default is still 5:** If you don't specify, spots still create 5 questionnaires
- **Backward compatible:** Old spots continue to work
- **Reassignment allowed:** You can reassign questionnaires if needed
- **Max limit is 50:** For performance and practical reasons

## 🎓 Training Tips

### For Field Supervisors:
1. Start with small spots (5-10 questionnaires)
2. Practice assigning to one interviewer first
3. Then try splitting between multiple interviewers
4. Monitor progress and adjust as needed

### For Interviewers:
1. Check your assignments in the dashboard
2. Note your questionnaire IDs
3. Complete them in sequence
4. Report any issues to Field Supervisor

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify database migration was run
3. Clear cache and restart server
4. Check browser console for errors
5. Contact system administrator

## 🎉 You're Ready!

The flexible slot allocation system is now active. Start creating spots with custom questionnaire counts and assigning them to your team!

**Happy surveying! 📊**
