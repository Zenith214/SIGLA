# Admin Password Reset Feature

**Date:** January 22, 2026  
**Feature:** Admin can reset user passwords from the User Management section  
**Status:** ✅ IMPLEMENTED

---

## Overview

Administrators can now reset passwords for any user in the system through the User Management interface. This feature is accessible from the Edit User modal in Settings → Users & Roles.

---

## How It Works

### User Interface

1. **Navigate to User Management**
   - Go to Settings → Users & Roles
   - Find the user whose password needs to be reset
   - Click the Edit button (pencil icon)

2. **Access Password Reset**
   - In the Edit User modal, scroll down to find the "Reset Password" button
   - The button is located below the Status field, separated by a border
   - Click "Reset Password" to reveal the password reset form

3. **Reset the Password**
   - Enter a new password (minimum 6 characters)
   - Click "Confirm Reset" to apply the change
   - Or click "Cancel" to close the password reset form without changes

4. **Confirmation**
   - A success toast notification appears when the password is reset
   - The user can now log in with the new password
   - The password reset form automatically closes

---

## Features

### Security
✅ **Minimum password length:** 6 characters  
✅ **Password hashing:** Uses bcrypt with 10 salt rounds  
✅ **Admin-only access:** Only admins can access the User Management section  
✅ **Audit trail:** Updates the user's `updatedAt` timestamp

### User Experience
✅ **Inline form:** Password reset form appears within the edit modal  
✅ **Clear visual separation:** Orange-themed UI distinguishes password reset from other fields  
✅ **Validation:** Prevents submission of empty or too-short passwords  
✅ **Loading states:** Shows "Resetting..." during the operation  
✅ **Toast notifications:** Success and error messages for user feedback

### Workflow
✅ **Non-destructive:** Can cancel password reset without affecting other edits  
✅ **Independent operation:** Password reset doesn't require saving other user fields  
✅ **Immediate effect:** New password is active immediately after reset

---

## UI Components

### Reset Password Button (Collapsed State)
```
┌─────────────────────────────────────┐
│ [🛡️ Reset Password]                 │
└─────────────────────────────────────┘
```
- Orange outline button
- Shield icon
- Full width

### Password Reset Form (Expanded State)
```
┌─────────────────────────────────────┐
│ 🛡️ Reset Password                   │
│                                     │
│ New Password                        │
│ [••••••••••••••••••••••••••••••]   │
│                                     │
│ [Cancel] [Confirm Reset]            │
└─────────────────────────────────────┘
```
- Password input field (masked)
- Cancel button (outline)
- Confirm Reset button (orange, primary)

---

## API Endpoint

### POST `/api/users/[id]/reset-password`

**Request Body:**
```json
{
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses:**

**400 - Invalid Password:**
```json
{
  "error": "Password must be at least 6 characters long"
}
```

**404 - User Not Found:**
```json
{
  "error": "User not found"
}
```

**500 - Server Error:**
```json
{
  "error": "Failed to reset password"
}
```

---

## Implementation Details

### Frontend Changes

**File:** `src/app/settings/ui/sections/users-roles.tsx`

**New State Variables:**
```typescript
const [resettingPassword, setResettingPassword] = useState(false)
const [newPassword, setNewPassword] = useState("")
const [showPasswordReset, setShowPasswordReset] = useState(false)
```

**New Handler:**
```typescript
const handlePasswordReset = async () => {
  if (!newPassword || newPassword.length < 6) {
    toast({
      variant: "destructive",
      title: "Invalid Password",
      description: "Password must be at least 6 characters long.",
    });
    return;
  }

  setResettingPassword(true)
  try {
    const res = await fetch(`/api/users/${editForm.id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    })
    
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Failed to reset password")
    }
    
    setShowPasswordReset(false)
    setNewPassword("")
    toast({
      title: "Password Reset Successfully!",
      description: `Password for ${editForm.firstName} ${editForm.lastName} has been updated.`,
    });
  } catch (err: any) {
    toast({
      variant: "destructive",
      title: "Password Reset Failed",
      description: err.message || "An unexpected error occurred.",
    });
  } finally {
    setResettingPassword(false)
  }
}
```

### Backend Changes

**File:** `src/app/api/users/[id]/reset-password/route.ts`

**Key Features:**
- Validates password length (minimum 6 characters)
- Hashes password using bcrypt with 10 salt rounds
- Updates user record in Supabase
- Returns sanitized user data (no password in response)
- Updates `updatedAt` timestamp for audit trail

---

## Use Cases

### 1. User Forgot Password
**Scenario:** A user contacts the admin saying they forgot their password.

**Steps:**
1. Admin navigates to Settings → Users & Roles
2. Searches for the user by name or email
3. Clicks Edit on the user's row
4. Clicks "Reset Password"
5. Enters a temporary password
6. Clicks "Confirm Reset"
7. Communicates the temporary password to the user securely
8. User logs in and changes password in their profile

### 2. Account Lockout
**Scenario:** A user's account is locked due to too many failed login attempts.

**Steps:**
1. Admin resets the user's password
2. User can log in with the new password
3. Account is automatically unlocked

### 3. Security Incident
**Scenario:** A potential security breach requires immediate password reset.

**Steps:**
1. Admin quickly resets passwords for affected users
2. Users are notified to log in with new credentials
3. System security is restored

### 4. New Employee Onboarding
**Scenario:** A new user was created but needs a different initial password.

**Steps:**
1. Admin creates the user account
2. Immediately resets password to a secure temporary one
3. Provides credentials to the new employee
4. Employee logs in and changes password

---

## Security Considerations

### Password Storage
- Passwords are hashed using bcrypt with 10 salt rounds
- Original passwords are never stored in plain text
- Hash is stored in the `password` column of the `users` table

### Access Control
- Only users with `admin` role can access User Management
- Password reset requires admin authentication
- No user can reset their own password through this interface (use profile settings)

### Audit Trail
- `updatedAt` timestamp is updated when password is reset
- Consider adding a separate `password_reset_log` table for detailed audit trail

### Best Practices
✅ **Communicate securely:** Send temporary passwords through secure channels  
✅ **Temporary passwords:** Encourage users to change password after reset  
✅ **Strong passwords:** Recommend passwords with 8+ characters, mixed case, numbers, symbols  
✅ **Regular updates:** Implement password expiration policies if needed

---

## Testing Checklist

### Functional Tests
- [ ] Reset password with valid input (6+ characters)
- [ ] Attempt reset with password < 6 characters (should fail)
- [ ] Attempt reset with empty password (should fail)
- [ ] User can log in with new password after reset
- [ ] Old password no longer works after reset
- [ ] Cancel password reset without affecting other edits
- [ ] Reset password for different user roles (admin, officer, interviewer, etc.)

### UI Tests
- [ ] "Reset Password" button appears in edit modal
- [ ] Clicking button reveals password input form
- [ ] Cancel button hides the form
- [ ] Success toast appears after successful reset
- [ ] Error toast appears on failure
- [ ] Loading state shows "Resetting..." during operation
- [ ] Form is disabled during reset operation

### Security Tests
- [ ] Non-admin users cannot access User Management
- [ ] Password is hashed in database (not plain text)
- [ ] API endpoint requires authentication
- [ ] Cannot reset password for non-existent user
- [ ] `updatedAt` timestamp is updated

### Edge Cases
- [ ] Reset password while other fields are edited (should not affect other edits)
- [ ] Reset password multiple times in succession
- [ ] Reset password for inactive user
- [ ] Reset password for user with no previous login

---

## Future Enhancements

### 1. Password Strength Indicator
Show visual feedback on password strength:
- Weak (red): < 8 characters
- Medium (yellow): 8-12 characters, mixed case
- Strong (green): 12+ characters, mixed case, numbers, symbols

### 2. Generate Random Password
Add a button to auto-generate a secure random password:
```
[Generate Random Password]
```

### 3. Send Password Reset Email
Instead of manually communicating the password:
- Send automated email with temporary password
- Or send password reset link
- User clicks link and sets their own password

### 4. Password Reset History
Track password reset events:
- Who reset the password (admin user)
- When it was reset
- IP address of the admin
- Reason for reset (optional note)

### 5. Force Password Change on Next Login
Add checkbox:
```
☑ Require user to change password on next login
```

### 6. Bulk Password Reset
Reset passwords for multiple users at once:
- Select multiple users
- Click "Bulk Reset Passwords"
- Generate unique passwords for each
- Export list of new passwords

---

## Files Modified

### Frontend
- **src/app/settings/ui/sections/users-roles.tsx**
  - Added password reset state variables
  - Added `handlePasswordReset` function
  - Updated edit modal with password reset UI
  - Added password reset form with validation

### Backend
- **src/app/api/users/[id]/reset-password/route.ts** (NEW)
  - POST endpoint for password reset
  - Password validation
  - Bcrypt hashing
  - Database update
  - Error handling

---

## Summary

The admin password reset feature provides a secure and user-friendly way for administrators to reset user passwords when needed. The feature:

✅ **Is secure** - Uses bcrypt hashing and validates input  
✅ **Is accessible** - Integrated into existing User Management interface  
✅ **Is intuitive** - Clear UI with visual feedback  
✅ **Is safe** - Can be cancelled without affecting other edits  
✅ **Is immediate** - New password works right away  

Administrators can now efficiently manage user access and resolve password-related issues without requiring developer intervention.
