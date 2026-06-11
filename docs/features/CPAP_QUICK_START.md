# CPAP Testing - Quick Start Guide

## 🚀 Setup (5 minutes)

### Step 1: Create Test Users

Run this command to create test users:

```bash
node scripts/create-cpap-test-users.js
```

This creates:
- **Officer**: `officer.test@cpap.local` (assigned to Barangay 1)
- **Officer 2**: `officer2.test@cpap.local` (assigned to Barangay 2)
- **Admin**: `admin.test@cpap.local`

**Password for all**: `test123`

### Step 2: Start Development Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## 📝 Testing Flow (15 minutes)

### Part 1: Officer Submits CPAP

1. **Login as Officer**
   - Go to: http://localhost:3000/login
   - Email: `officer.test@cpap.local`
   - Password: `test123`

2. **Navigate to CPAP**
   - Go to: http://localhost:3000/cpap
   - Or click "CPAP" from dashboard menu

3. **Add Action Items** (add 2-3 items)
   - Click "Add Item"
   - Fill in:
     - Priority Area: "Health Services"
     - Target Output: "Build community health center"
     - Success Indicator: "Health center operational by Q4"
     - Responsible Person: "Barangay Health Worker"
     - Timeline: Select start and end dates
   - Click "Save"
   - Repeat for more items

4. **Submit CPAP**
   - Click "Submit to DILG for Review"
   - Confirm submission
   - ✅ Status changes to "Submitted"

5. **Logout**
   - Click profile menu → Logout

---

### Part 2: Admin Reviews CPAP

1. **Login as Admin**
   - Go to: http://localhost:3000/login
   - Email: `admin.test@cpap.local`
   - Password: `test123`

2. **Navigate to Admin CPAP Dashboard**
   - Go to: http://localhost:3000/admin/cpap

3. **Review Submitted CPAP**
   - Find the CPAP you just submitted
   - Click "View" or "Review"
   - Review all action items

4. **Choose Action:**

   **Option A: Approve**
   - Click "Approve"
   - Confirm approval
   - ✅ Status changes to "Approved"

   **Option B: Request Revision**
   - Click "Request Revision"
   - Enter comments: "Please add more specific timelines"
   - Confirm
   - ✅ Status changes to "Revision_Requested"

5. **Logout**

---

### Part 3: Officer Handles Revision (if requested)

1. **Login as Officer**
   - Email: `officer.test@cpap.local`
   - Password: `test123`

2. **View Revision Comments**
   - Go to: http://localhost:3000/cpap
   - See orange banner with admin comments

3. **Make Changes**
   - Edit items as requested
   - Click "Save" on each edit

4. **Resubmit**
   - Click "Resubmit to DILG"
   - Confirm
   - ✅ Status back to "Submitted"

---

### Part 4: Track Progress (after approval)

1. **Login as Officer**
   - Email: `officer.test@cpap.local`
   - Password: `test123`

2. **Update Progress**
   - Go to: http://localhost:3000/cpap
   - For each item, update:
     - Actual Output: "Health center 80% complete"
     - Status: "In Progress"
     - Remarks: "On schedule"
   - Click "Save Progress"

3. **Admin Monitors**
   - Login as admin
   - Go to: http://localhost:3000/admin/cpap
   - Click "Monitoring" tab
   - View progress updates

---

## ✅ Testing Checklist

Quick verification:

- [ ] Officer can create CPAP items
- [ ] Officer can submit CPAP
- [ ] Admin can view submitted CPAPs
- [ ] Admin can approve CPAP
- [ ] Admin can request revision
- [ ] Officer can see revision comments
- [ ] Officer can resubmit after revision
- [ ] Officer can update progress after approval
- [ ] Admin can monitor progress

---

## 🐛 Troubleshooting

### "You are not assigned to any barangay"
- The officer user needs a `barangay_id`
- Re-run the setup script or manually update in database

### "No survey cycle found"
- Create an active survey cycle in settings
- Or check if one exists in your database

### Cannot login
- Verify test users were created: check database `user` table
- Password is: `test123`
- Clear browser cookies and try again

### 403 Forbidden
- Check user role is correct (Officer or Admin)
- Logout and login again

---

## 📚 Full Documentation

For detailed testing scenarios, see:
- **Full Guide**: `docs/CPAP_TESTING_GUIDE.md`
- **API Tests**: `tests/integration/CPAP-API-INTEGRATION-TESTS.md`

---

## 🎯 Key URLs

| Role | URL | Purpose |
|------|-----|---------|
| Officer | http://localhost:3000/cpap | Submit & track CPAP |
| Admin | http://localhost:3000/admin/cpap | Review & monitor CPAPs |
| Login | http://localhost:3000/login | Authentication |
| Dashboard | http://localhost:3000/dashboard | Main dashboard |

---

## 💡 Tips

1. **Use AI Suggestions**: Click "AI Suggestions" to auto-generate items based on survey data
2. **Auto-save**: Changes save automatically after 1 second
3. **Multiple Items**: Add 3-5 items for realistic testing
4. **Timeline**: Use realistic date ranges (3-12 months)
5. **Progress Updates**: Update regularly to test monitoring features

---

## 🎉 Success!

You've successfully tested the complete CPAP workflow:
1. ✅ Officer submission
2. ✅ Admin review
3. ✅ Revision handling
4. ✅ Progress tracking

Ready for production! 🚀
