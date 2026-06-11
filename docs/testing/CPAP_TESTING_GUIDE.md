# CPAP Testing Guide

## Overview
This guide walks you through testing the complete CPAP (Citizen Priority Action Plan) submission and management workflow.

## Prerequisites

1. **Development Server Running**
   ```bash
   npm run dev
   ```

2. **Database Setup**
   - Ensure your database is connected (check `.env` file)
   - CPAP tables should be migrated
   - At least one barangay and survey cycle should exist

## Test Users

You'll need to create or use existing test users with these roles:

### Officer User (for CPAP submission)
- **Email**: `test.officer1@cpap.test` or any Officer role user
- **Role**: Officer
- **Requirements**: Must be assigned to a barangay

### Admin User (for CPAP review)
- **Email**: `test.admin@cpap.test` or any Admin role user
- **Role**: Admin
- **Requirements**: No barangay assignment needed

## Complete Testing Flow

### Phase 1: Login as Officer

1. **Navigate to Login**
   - Go to: `http://localhost:3000/login`
   - Enter Officer credentials
   - Click "Sign In"

2. **Access CPAP Dashboard**
   - From the main dashboard, look for "CPAP" or "Action Plan" menu
   - Or directly navigate to: `http://localhost:3000/cpap`

3. **Verify Officer View**
   - You should see your assigned barangay name
   - Current survey cycle information
   - Status badge showing "Draft"
   - If no CPAP exists, one will be auto-created

### Phase 2: Create CPAP Items (as Officer)

1. **Add First Action Item**
   - Click "Add Item" button
   - Fill in the form:
     - **Priority Area**: e.g., "Health Services"
     - **Target Output**: e.g., "Establish community health clinic"
     - **Success Indicator**: e.g., "Clinic operational with 100+ patients/month"
     - **Responsible Person**: e.g., "Barangay Health Worker"
     - **Timeline Start**: Select start date
     - **Timeline End**: Select end date
   - Click "Save"

2. **Add More Items** (Recommended: 3-5 items)
   - Repeat the process for different priority areas:
     - Infrastructure (roads, bridges)
     - Education (learning centers)
     - Livelihood (skills training)
     - Environment (waste management)
     - Peace and Order (CCTV installation)

3. **Try AI Suggestions (Optional)**
   - Click "AI Suggestions" button
   - Review AI-generated action items based on survey responses
   - Click "Save All" to add them or "Discard" to ignore
   - Edit any AI-generated items as needed

4. **Edit/Delete Items**
   - Click "Edit" on any item to modify
   - Click "Delete" to remove an item
   - Changes auto-save after 1 second

### Phase 3: Submit CPAP (as Officer)

1. **Validate Items**
   - Ensure you have at least 1 action item
   - All required fields must be filled
   - Timeline dates should be logical

2. **Submit for Review**
   - Click "Submit to DILG for Review" button
   - Review the submission modal
   - Confirm submission
   - Status changes to "Submitted"

3. **Verify Submission**
   - Status badge should show "Submitted"
   - Items should now be read-only
   - No edit/delete buttons visible
   - Submit button should disappear

### Phase 4: Login as Admin

1. **Logout from Officer Account**
   - Click profile menu
   - Select "Logout"

2. **Login as Admin**
   - Go to: `http://localhost:3000/login`
   - Enter Admin credentials
   - Click "Sign In"

3. **Access Admin CPAP Dashboard**
   - Navigate to: `http://localhost:3000/admin/cpap`
   - Or find "CPAP Management" in admin menu

### Phase 5: Review CPAP (as Admin)

1. **View Submitted CPAPs**
   - You should see a list of all CPAPs
   - Filter by status: "Submitted"
   - Find the CPAP you just submitted

2. **Review CPAP Details**
   - Click "View" or "Review" on the CPAP
   - Review all action items
   - Check for completeness and quality

3. **Option A: Approve CPAP**
   - Click "Approve" button
   - Confirm approval
   - Status changes to "Approved"
   - Officer can now track progress

4. **Option B: Request Revision**
   - Click "Request Revision" button
   - Enter comments explaining what needs to be changed:
     - e.g., "Please add more specific success indicators for items 2 and 3"
   - Confirm revision request
   - Status changes to "Revision_Requested"

### Phase 6: Handle Revision (as Officer)

If Admin requested revision:

1. **Login as Officer Again**
   - Go to CPAP dashboard: `http://localhost:3000/cpap`

2. **View Revision Comments**
   - Orange banner shows "Revision Requested"
   - Read admin comments carefully

3. **Make Changes**
   - Edit items as requested
   - Add/remove items if needed
   - Ensure all feedback is addressed

4. **Resubmit**
   - Click "Resubmit to DILG" button
   - Status changes back to "Submitted"
   - Admin can review again

### Phase 7: Track Progress (as Officer)

After CPAP is approved:

1. **Login as Officer**
   - Navigate to: `http://localhost:3000/cpap`

2. **View Progress Tracker**
   - Interface changes to progress tracking mode
   - See all approved action items

3. **Update Progress**
   - For each item, update:
     - **Actual Output**: What was actually accomplished
     - **Accomplishment Status**: Not Started / In Progress / Completed / Delayed
     - **Remarks**: Additional notes or challenges
   - Click "Save Progress"

4. **Monitor Timeline**
   - Items show timeline progress
   - Visual indicators for on-track/delayed items

### Phase 8: Monitor Progress (as Admin)

1. **Login as Admin**
   - Navigate to: `http://localhost:3000/admin/cpap`

2. **Switch to Monitoring Tab**
   - Click "Monitoring" tab
   - View all approved CPAPs

3. **Review Progress**
   - See progress updates from officers
   - Filter by barangay or cycle
   - Export reports if available

## Testing Checklist

### Officer Tests
- [ ] Can access CPAP dashboard
- [ ] Can create new action items
- [ ] Can edit existing items
- [ ] Can delete items
- [ ] Can use AI suggestions
- [ ] Can submit CPAP
- [ ] Cannot submit empty CPAP
- [ ] Cannot edit after submission
- [ ] Can see revision comments
- [ ] Can resubmit after revision
- [ ] Can update progress after approval

### Admin Tests
- [ ] Can access admin CPAP dashboard
- [ ] Can view all submitted CPAPs
- [ ] Can review CPAP details
- [ ] Can approve CPAP
- [ ] Can request revision with comments
- [ ] Cannot approve already approved CPAP
- [ ] Can monitor progress of approved CPAPs
- [ ] Can filter CPAPs by status

### Permission Tests
- [ ] FS users cannot access CPAP
- [ ] Interviewer users cannot access CPAP
- [ ] Officer can only see their barangay's CPAP
- [ ] Admin can see all CPAPs
- [ ] Viewer can see but not edit

## Common Issues & Solutions

### Issue: "You are not assigned to any barangay"
**Solution**: 
- Admin needs to assign the Officer user to a barangay
- Update user record in database with `barangay_id`

### Issue: "No survey cycle found"
**Solution**:
- Create an active survey cycle in settings
- Ensure cycle has status "Active"

### Issue: Cannot submit CPAP
**Solution**:
- Ensure at least one action item exists
- Check all required fields are filled
- Verify timeline dates are valid

### Issue: 403 Forbidden error
**Solution**:
- Check user role is correct (Officer or Admin)
- Verify authentication token is valid
- Clear cookies and login again

## API Endpoints Reference

For manual testing with tools like Postman:

```
GET    /api/cpap                    - List CPAPs (role-based)
GET    /api/cpap/[id]               - Get CPAP details
POST   /api/cpap                    - Create new CPAP
PUT    /api/cpap/[id]               - Update CPAP items
POST   /api/cpap/[id]/submit        - Submit CPAP (Officer only)
POST   /api/cpap/[id]/approve       - Approve CPAP (Admin only)
POST   /api/cpap/[id]/request-revision - Request revision (Admin only)
PUT    /api/cpap/[id]/progress      - Update progress (Officer only)
```

## Database Verification

To verify data in database:

```sql
-- Check CPAP records
SELECT * FROM cpap ORDER BY created_at DESC;

-- Check CPAP items
SELECT * FROM cpap_item WHERE cpap_id = [your_cpap_id];

-- Check user barangay assignments
SELECT user_id, email, role, barangay_id FROM "user" WHERE role = 'Officer';

-- Check CPAP status changes
SELECT id, barangay_id, status, submitted_at, approved_at 
FROM cpap 
ORDER BY updated_at DESC;
```

## Next Steps

After completing this testing flow:

1. **Test Edge Cases**
   - Try submitting with invalid data
   - Test concurrent edits
   - Test with multiple officers in same barangay

2. **Performance Testing**
   - Create CPAPs with many items (20+)
   - Test with multiple barangays
   - Check loading times

3. **Integration Testing**
   - Run automated tests: `npm test -- tests/integration/cpap-api.test.ts`
   - Review test coverage

4. **User Acceptance Testing**
   - Have actual officers test the workflow
   - Gather feedback on UI/UX
   - Document any issues

## Support

If you encounter issues:
1. Check browser console for errors
2. Review server logs
3. Verify database connections
4. Check `.env` configuration
5. Refer to `tests/integration/CPAP-API-INTEGRATION-TESTS.md`
