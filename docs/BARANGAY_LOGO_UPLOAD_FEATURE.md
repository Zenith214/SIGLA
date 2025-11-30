# Barangay Logo Upload Feature

## Overview
Officers can now upload their barangay's logo through their profile page. The uploaded logo will automatically replace the "BLGU LOGO" placeholder in:
- Barangay Details Card (Dashboard)
- Barangay Satisfaction Index Modal
- Report Card (both screen and print views)

## Implementation Details

### 1. User Profile Enhancement

#### New UI Section (Officers Only)
- Added "Barangay Logo" card in the profile page
- Only visible to users with role "officer" and a barangay designation
- Shows current logo or "BLGU LOGO" placeholder
- Upload button with file validation

#### Features
- Image preview before upload
- File size validation (max 5MB)
- File type validation (images only)
- Automatic upload and barangay update
- Success/error toast notifications

### 2. API Endpoints

#### GET /api/barangays/[id]
- Fetches single barangay information
- Returns: id, name, logo_url, description, etc.
- Requires authentication

#### PATCH /api/barangays/[id]
- Updates barangay information
- **Officer Restrictions:**
  - Can only update their designated barangay
  - Can only update the `logo_url` field
  - Cannot modify other barangay properties
- **Admin/Developer:** Can update all fields
- Requires authentication

#### POST /api/barangays/upload-logo
- Handles file upload to server
- Saves to `/public/uploads/barangay-logos/`
- Returns the public URL path
- Validates file type and size

### 3. Database Schema

#### User Table
```typescript
{
  barangayDesignation?: number  // Foreign key to barangay.barangay_id
}
```

#### Barangay Table
```sql
logo_url VARCHAR(500) NULL  -- Path to uploaded logo
```

### 4. Type Updates

#### User Interface (src/lib/auth.ts)
```typescript
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePicture?: string;
  barangayDesignation?: number;  // NEW
}
```

### 5. Component Integration

All components that display barangay information already support `logo_url`:

#### BarangaySatisfactionIndex.tsx
- Displays logo in the left column
- Falls back to "BLGU LOGO" text if no logo

#### BarangayListView.tsx
- Shows logo in barangay details section
- Falls back to "BLGU LOGO" text if no logo

#### Report Card (reportcard/page.tsx)
- Displays logo in print header
- Shows logo in screen view
- Falls back to "BLGU LOGO" text if no logo

## User Flow

### For Officers

1. **Navigate to Profile**
   - Click on user dropdown → "My Profile"

2. **Upload Barangay Logo**
   - Scroll to "Barangay Logo" section (only visible if designated to a barangay)
   - Click "Upload Logo" button
   - Select an image file (PNG, JPG, SVG recommended)
   - Logo is automatically uploaded and saved

3. **View Updated Logo**
   - Logo immediately appears in profile
   - Navigate to dashboard to see logo in barangay cards
   - View report card to see logo in reports

### For Admins

- Can upload logos for any barangay through the barangay management interface
- Can also update other barangay properties

## Security & Permissions

### Officer Permissions
- ✅ Can upload logo for their designated barangay only
- ✅ Can view their barangay information
- ❌ Cannot update other barangay properties
- ❌ Cannot upload logos for other barangays

### Admin/Developer Permissions
- ✅ Full access to all barangay properties
- ✅ Can upload logos for any barangay
- ✅ Can update all barangay fields

## File Storage

### Location
```
/public/uploads/barangay-logos/
```

### Naming Convention
```
barangay-{barangay_id}-{timestamp}.{extension}
```

Example: `barangay-5-1701234567890.png`

### File Constraints
- **Max Size:** 5MB
- **Allowed Types:** image/* (PNG, JPG, JPEG, SVG, etc.)
- **Recommended:** Square images for best display

## Error Handling

### Upload Errors
- File too large (>5MB)
- Invalid file type (non-image)
- Network errors
- Permission errors

### Display Errors
- Missing logo file
- Broken image URL
- Falls back to "BLGU LOGO" text placeholder

## Testing Checklist

- [ ] Officer can upload logo for their designated barangay
- [ ] Officer cannot upload logo for other barangays
- [ ] Logo appears in dashboard barangay cards
- [ ] Logo appears in satisfaction index modal
- [ ] Logo appears in report card (screen view)
- [ ] Logo appears in report card (print view)
- [ ] File size validation works (>5MB rejected)
- [ ] File type validation works (non-images rejected)
- [ ] Fallback to "BLGU LOGO" works when no logo
- [ ] Error handling shows appropriate messages

## Related Files

### Frontend
- `src/app/profile/page.tsx` - Profile page with logo upload
- `src/components/dashboard/BarangaySatisfactionIndex.tsx` - Modal display
- `src/components/dashboard/BarangayListView.tsx` - List view display
- `src/app/reportcard/page.tsx` - Report card display

### Backend
- `src/app/api/barangays/[id]/route.ts` - Get/update barangay
- `src/app/api/barangays/upload-logo/route.ts` - File upload
- `src/app/api/me/route.ts` - User info with barangayDesignation

### Types
- `src/lib/auth.ts` - User interface with barangayDesignation

## Future Enhancements

- [ ] Image cropping/resizing tool
- [ ] Logo preview before saving
- [ ] Multiple logo versions (thumbnail, full size)
- [ ] Logo history/versioning
- [ ] Bulk logo upload for admins
- [ ] Logo approval workflow
