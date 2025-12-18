# User Profile & Customization Feature

## Overview
Added comprehensive user profile management for all non-admin and non-developer roles (Interviewers, Officers, Field Supervisors).

## Features Implemented

### 1. Profile Page (`/profile`)
**Location**: `src/app/profile/page.tsx`

**Features**:
- ✅ Profile picture upload (max 5MB)
- ✅ Edit first name and last name
- ✅ View email (read-only)
- ✅ View role (read-only)
- ✅ Change password
- ✅ Tabbed interface (Profile / Security)

### 2. API Endpoints

#### Update Profile
**Endpoint**: `PUT /api/user/profile`
**File**: `src/app/api/user/profile/route.ts`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "profilePicture": "data:image/png;base64,..."
}
```

**Features**:
- Updates user's first name, last name
- Stores profile picture as base64 string
- JWT authentication required
- Returns updated user data

#### Change Password
**Endpoint**: `POST /api/user/change-password`
**File**: `src/app/api/user/change-password/route.ts`

**Request Body**:
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Features**:
- Verifies current password
- Validates new password (min 8 characters)
- Hashes new password with bcrypt
- JWT authentication required

### 3. Navigation Updates

#### Main Dashboard
- Added "My Profile" link to UserDropdown
- Available for all users
- Icon: User icon

#### FI Dashboard
- Added "My Profile" link to user menu
- Appears above Settings (for admins)
- Available for all users

## User Interface

### Profile Tab
```
┌─────────────────────────────────┐
│     [Profile Picture]           │
│     [Camera Icon to Upload]     │
├─────────────────────────────────┤
│ First Name: [Input]             │
│ Last Name:  [Input]             │
│ Email:      [Read-only]         │
│ Role:       [Read-only]         │
├─────────────────────────────────┤
│        [Save Changes]           │
└─────────────────────────────────┘
```

### Security Tab
```
┌─────────────────────────────────┐
│ Current Password: [Input] [👁]  │
│ New Password:     [Input] [👁]  │
│ Confirm Password: [Input] [👁]  │
├─────────────────────────────────┤
│      [Change Password]          │
└─────────────────────────────────┘
```

## Validation

### Profile Picture
- ✅ Max size: 5MB
- ✅ File type: Images only
- ✅ Format: Converted to base64
- ✅ Preview before save

### Password Change
- ✅ All fields required
- ✅ New password min 8 characters
- ✅ Passwords must match
- ✅ Current password verified
- ✅ Password hashed with bcrypt

## Security

### Authentication
- JWT token required (`pulse_token` cookie)
- Token verified on every request
- User can only update their own profile

### Password Security
- Current password must be correct
- New password hashed with bcrypt (10 rounds)
- Password strength validation
- Secure password input fields with show/hide toggle

## Database Schema

### Users Table Updates
Existing columns used:
- `first_name` - Updated via profile
- `last_name` - Updated via profile
- `profile_picture` - Stores base64 image
- `password_hash` - Updated via change password
- `updated_at` - Auto-updated on changes

## Access Control

### Who Can Access
- ✅ Interviewers
- ✅ Officers
- ✅ Field Supervisors
- ✅ Admins
- ✅ Developers

### What They Can Do
- ✅ Upload/change profile picture
- ✅ Edit first and last name
- ✅ Change their password
- ❌ Cannot change email
- ❌ Cannot change role

## Toast Notifications

### Success Messages
- "Profile updated successfully"
- "Password changed successfully"

### Error Messages
- "Image size must be less than 5MB"
- "Please upload an image file"
- "Please fill in all password fields"
- "New passwords do not match"
- "Password must be at least 8 characters long"
- "Current password is incorrect"
- "Failed to update profile"
- "Failed to change password"

## Responsive Design

### Mobile (< 640px)
- Single column layout
- Full-width inputs
- Stacked form fields
- Touch-friendly buttons

### Desktop (≥ 640px)
- Two-column layout for name fields
- Wider form container
- Better spacing

## Future Enhancements

### Potential Additions
1. **Email Verification** - Verify email changes
2. **Two-Factor Authentication** - Add 2FA support
3. **Profile Completion** - Show profile completion percentage
4. **Activity Log** - Show recent account activity
5. **Notification Preferences** - Email/SMS preferences
6. **Theme Preferences** - Dark/light mode
7. **Language Preferences** - Multi-language support
8. **Avatar Options** - Choose from preset avatars
9. **Crop Tool** - Crop profile pictures before upload
10. **Password Strength Meter** - Visual password strength indicator

## Testing Checklist

- [ ] Upload profile picture (< 5MB)
- [ ] Upload profile picture (> 5MB) - should fail
- [ ] Upload non-image file - should fail
- [ ] Update first and last name
- [ ] Try to edit email - should be disabled
- [ ] Try to edit role - should be disabled
- [ ] Change password with correct current password
- [ ] Change password with incorrect current password - should fail
- [ ] Change password with mismatched new passwords - should fail
- [ ] Change password with short password (< 8 chars) - should fail
- [ ] Access profile from main dashboard
- [ ] Access profile from FI dashboard
- [ ] Test on mobile device
- [ ] Test on desktop
- [ ] Verify JWT authentication
- [ ] Verify profile picture displays in avatar

## Notes

- Profile pictures stored as base64 in database
- For production, consider using cloud storage (S3, Cloudinary)
- Password changes log user out on other devices (JWT invalidation)
- Profile updates reflect immediately in UI
- All API calls use JWT authentication
- Toast notifications provide user feedback
