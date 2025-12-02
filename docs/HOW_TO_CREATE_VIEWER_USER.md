# How to Create a Viewer User

## Overview

Admins can now create viewer users directly from the Settings page. This guide walks you through the process.

## Prerequisites

- You must be logged in as an **Admin** or **Developer**
- Access to the Settings page

## Step-by-Step Guide

### Step 1: Navigate to Users & Roles

1. Log in to PULSE as an admin
2. Click on your profile or navigate to the main menu
3. Select **Settings**
4. In the sidebar, click on **Users & Roles**

### Step 2: Open Add User Dialog

1. On the Users & Roles page, locate the **"Add User"** button in the top-right corner
2. Click the **"Add User"** button
3. A dialog will appear with a form

### Step 3: Fill in User Details

Complete the following fields:

#### Required Fields

**First Name**
- Enter the user's first name
- Example: `John`

**Last Name**
- Enter the user's last name
- Example: `Doe`

**Email**
- Enter a valid email address
- This will be used for login
- Example: `john.doe@example.com`

**Password**
- Enter a secure password
- User can change this after first login
- Example: `SecurePass123!`

**Role**
- Click the dropdown menu
- Select **"Viewer"** from the list
- Options: Admin, Supervisor, Interviewer, Officer, **Viewer**

**Status**
- Select **"Active"** to enable the account immediately
- Select **"Inactive"** to create a disabled account

**Last Login**
- This field is auto-populated with today's date
- You can adjust if needed

#### Optional Fields

**Barangay Designation**
- This field is only shown for Officer role
- Not applicable for Viewer role

### Step 4: Save the User

1. Review all entered information
2. Click the **"Save"** button at the bottom of the dialog
3. Wait for the success message

### Step 5: Verify Creation

After saving, you should see:

1. **Success Toast**: "User Added Successfully! John Doe has been added to the system."
2. **User List Updated**: The new viewer appears in the table
3. **Green Badge**: The role column shows "viewer" with a green badge
4. **Statistics Updated**: The Viewers count increases by 1

## Example: Creating a Viewer User

```
First Name: Jane
Last Name: Smith
Email: jane.smith@example.com
Password: ViewerPass123!
Role: Viewer
Status: Active
Last Login: 2024-12-02
```

After clicking Save, Jane Smith will be able to log in with:
- **Email**: jane.smith@example.com
- **Password**: ViewerPass123!

## What the Viewer Can Do

Once logged in, the viewer user can:

✅ **Access Main Dashboard**
- View Map Tab with barangay locations
- View Analytics Tab with reports

✅ **Access CPAP Dashboard**
- View CPAP submissions (read-only)
- View action items and progress
- See status and comments

✅ **Access Backup Settings**
- View backup history
- Create and download backups

## What the Viewer Cannot Do

❌ **No Write Operations**
- Cannot create, edit, or delete any data
- Cannot submit CPAPs
- Cannot update progress
- Cannot manage users or settings

❌ **Limited Settings Access**
- Cannot access Survey Cycles
- Cannot access Barangays management
- Cannot access Award Management
- Cannot access Users & Roles (except viewing their own profile)

## Editing a Viewer User

To edit an existing viewer user:

1. Find the user in the Users & Roles table
2. Click the **Edit** icon (pencil) in the Actions column
3. Modify the desired fields
4. Click **"Save"** to apply changes

You can:
- Change their name
- Update their status (Active/Inactive)
- Change their role (e.g., upgrade to Officer)
- Update last login date

**Note**: You cannot change the email address after creation.

## Deleting a Viewer User

To delete a viewer user:

1. Find the user in the Users & Roles table
2. Click the **Delete** icon (trash) in the Actions column
3. Confirm the deletion in the warning dialog
4. Click **"Delete"** to permanently remove the user

⚠️ **Warning**: This action cannot be undone!

## Searching for Viewer Users

To find viewer users quickly:

1. Use the search bar above the user table
2. Type "viewer" to filter by role
3. Or search by name or email

## Role Statistics

The Users & Roles page shows statistics for each role:

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Admins    │ Supervisors │ Interviewers│  Officers   │   Viewers   │
│      2      │      5      │      12     │      8      │      3      │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

The Viewers card shows:
- **Count**: Number of viewer users
- **Color**: Green background
- **Icon**: Users icon

## Role Permissions Card

The collapsible "Role Permissions" section shows details for each role:

**Viewer Card** (Green):
- View dashboards (Map & Analytics)
- View CPAP submissions
- Access backup settings
- No write operations

## Troubleshooting

### Issue: "Viewer" not in dropdown

**Solution**: 
- Ensure you're running the latest version
- Check that `roleOptions` includes "viewer" in the code
- Refresh the page

### Issue: Cannot create viewer user

**Solution**:
- Verify you're logged in as Admin
- Check browser console for errors
- Ensure all required fields are filled
- Verify email is unique

### Issue: Viewer can still edit data

**Solution**:
- Check the user's role in the database
- Verify role is exactly "viewer" (lowercase)
- Clear browser cache
- Check API route protection

### Issue: Viewer cannot login

**Solution**:
- Verify status is "Active"
- Check email and password are correct
- Ensure viewer role is properly set
- Check authentication middleware

## Best Practices

1. **Use Descriptive Names**: Make it clear who the viewer is
2. **Secure Passwords**: Use strong passwords for all accounts
3. **Regular Audits**: Review viewer accounts periodically
4. **Deactivate Unused Accounts**: Set status to "Inactive" instead of deleting
5. **Document Access**: Keep a record of who has viewer access

## Security Notes

- Viewers have read-only access at the UI level
- API routes enforce viewer restrictions server-side
- Viewers cannot bypass restrictions through API calls
- All viewer actions should be logged (future enhancement)

## Related Documentation

- [Viewer Role Implementation](./VIEWER_ROLE_IMPLEMENTATION.md)
- [Viewer Role Quick Reference](./VIEWER_ROLE_QUICK_REFERENCE.md)
- [Viewer Role Permissions Diagram](./VIEWER_ROLE_PERMISSIONS_DIAGRAM.md)

## Support

For additional help:
- Contact your system administrator
- Review the full documentation
- Check the deployment checklist
- Test with the sample viewer account (viewer@sigla.com)
