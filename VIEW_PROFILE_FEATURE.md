# View Profile Feature - Users & Roles

## Overview
Added a "View Profile" feature in the Settings > Users & Roles section that allows admins to view detailed user information by clicking on the user's name.

## User Experience

### How to Use
1. Navigate to **Settings > Users & Roles**
2. Click on any user's name in the table (name appears in blue and underlined on hover)
3. A modal opens showing the user's complete profile information
4. Click "Close" to dismiss or "Edit Profile" to switch to edit mode

### Profile Information Displayed

**Profile Header:**
- User profile picture (if available) or initials in a colored circle avatar
- Barangay logo badge (for Officers with barangay designation, shown as small badge on profile picture)
- Full name
- Role badge (color-coded by role)

**Contact Information:**
- Email address (always shown)
- Phone number (if available)

**Professional Information:**
- Job Title (if available)
- Organization (if available)
- Barangay Designation (for Officers only, if assigned)

**Account Information:**
- Account Status (Active/Inactive badge)
- Member Since (account creation date)
- Last Login (last login timestamp)

## Visual Design

### Profile Picture
- **With Picture:** Shows actual profile picture in 64x64px circle with border
- **Without Picture:** Shows initials in gradient blue circle
- **Officer Badge:** Small 32x32px barangay logo badge on bottom-right corner (if officer has barangay designation and barangay has logo)

### Name Cell
- **Default:** Blue text (`text-blue-600`)
- **Hover:** Darker blue with underline (`hover:text-blue-800 hover:underline`)
- **Cursor:** Pointer to indicate clickability

### Modal Layout
- **Max Width:** 2xl (672px)
- **Max Height:** 90vh with scroll
- **Sections:** Organized with clear headings and icons
- **Icons:** Lucide icons for visual clarity
  - Mail, Phone for contact
  - Briefcase, Building2, MapPin for professional info
  - Shield, Calendar, User for account info

### Role Badge Colors
- **Admin:** Red border/text/background
- **Field Supervisor:** Purple border/text/background
- **Interviewer:** Blue border/text/background
- **Viewer:** Green border/text/background
- **Officer:** Gray border/text/background

## Technical Implementation

### State Management
```tsx
const [viewingUser, setViewingUser] = useState<any | null>(null)
```

### Profile Header
```tsx
{viewingUser.profilePicture ? (
  <img 
    src={viewingUser.profilePicture} 
    alt={`${viewingUser.firstName} ${viewingUser.lastName}`}
    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
  />
) : (
  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
    {viewingUser.firstName?.[0]}{viewingUser.lastName?.[0]}
  </div>
)}

{/* Barangay Logo Badge for Officers */}
{viewingUser.role?.toLowerCase() === 'officer' && viewingUser.barangayDesignation && (
  // Shows barangay logo as small badge on bottom-right of profile picture
)}
```
```tsx
<TableCell 
  className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
  onClick={() => setViewingUser(user)}
>
  {user.firstName} {user.lastName}
</TableCell>
```

### Modal Structure
- Uses shadcn/ui Dialog component
- Controlled by `viewingUser` state
- Closes when clicking outside or "Close" button
- "Edit Profile" button transitions to edit mode

### Data Display Logic
- Conditionally shows fields only if they have values
- Special handling for Officer role to show Barangay Designation
- Formats dates using `toLocaleDateString()` for readability
- Looks up barangay name from barangays array

## Benefits

1. **Quick Access to User Info**
   - No need to edit to view details
   - Read-only view prevents accidental changes
   - All information in one organized view

2. **Better UX**
   - Intuitive click interaction
   - Clear visual feedback (blue, underlined)
   - Professional modal design

3. **Efficient Workflow**
   - View profile without leaving the page
   - Easy transition to edit mode if needed
   - Organized information sections

4. **Role-Specific Information**
   - Shows relevant fields based on role
   - Officers see their barangay designation
   - Hides empty fields for cleaner view

## Files Modified

- `src/app/settings/ui/sections/users-roles.tsx`
  - Added `viewingUser` state
  - Made name cell clickable
  - Added View Profile modal with complete user information
  - Imported additional Lucide icons (User, Mail, Phone, Briefcase, Building2, Calendar, MapPin)
  - Added profile picture display with fallback to initials
  - Added barangay logo badge for officers

- `src/app/api/users/route.ts`
  - Added `profilePicture` to SELECT query to include profile pictures in user data

## Future Enhancements

1. **Profile Picture Display**
   - Show actual profile picture if available
   - Fallback to initials avatar

2. **Activity History**
   - Show recent actions/logins
   - Survey completion statistics for interviewers

3. **Quick Actions**
   - Reset password button
   - Send notification button
   - View assignments button

4. **Export Profile**
   - Download user profile as PDF
   - Print-friendly view

5. **Audit Trail**
   - Show who created/modified the user
   - Track profile changes history
