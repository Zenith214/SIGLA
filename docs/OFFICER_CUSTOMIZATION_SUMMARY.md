# Officer Customization Features Summary

## Overview
This document summarizes all customization features available to officers in the SIGLA system.

## Features Implemented

### 1. Barangay Designation
**Location:** User Management (Admin Settings)

**Description:** Admins can designate officers to specific barangays.

**Key Points:**
- Nullable field - officers can exist without designation
- One barangay per officer
- Stored in `user.barangayDesignation` column
- Foreign key to `barangay.barangay_id`

**Benefits:**
- Identifies which barangay an officer represents
- Enables barangay-specific customizations
- Controls access to barangay logo upload

**Documentation:** `docs/BARANGAY_DESIGNATION_FEATURE.md`

---

### 2. Barangay Logo Upload
**Location:** User Profile Page

**Description:** Officers can upload their barangay's logo to personalize reports and dashboards.

**Key Points:**
- Only available to officers with barangay designation
- Max file size: 5MB
- Supported formats: PNG, JPG, JPEG, SVG
- Stored in `/public/uploads/barangay-logos/`
- Updates `barangay.logo_url` column

**Where Logo Appears:**
1. **Dashboard - Barangay Details Card**
   - Replaces "BLGU LOGO" placeholder
   - Shows in satisfaction index modal

2. **Dashboard - Barangay List View**
   - Displays in barangay details section

3. **Report Card**
   - Appears in print header
   - Shows in screen view
   - Professional presentation for stakeholders

**Security:**
- Officers can only upload logos for their designated barangay
- Cannot modify other barangay properties
- Admins have full access to all barangays

**Documentation:** `docs/BARANGAY_LOGO_UPLOAD_FEATURE.md`

---

### 3. Profile Picture Upload
**Location:** User Profile Page

**Description:** All users can upload a profile picture.

**Key Points:**
- Available to all user roles
- Max file size: 5MB
- Stored as base64 in database
- Displays in user dropdown and profile page

**Documentation:** `docs/USER_PROFILE_FEATURE.md`

---

## User Journey: Officer Customization

### Step 1: Admin Designates Officer to Barangay
1. Admin navigates to Settings > Users & Roles
2. Edits or creates an officer user
3. Selects barangay from "Barangay Designation" dropdown
4. Saves user

### Step 2: Officer Uploads Barangay Logo
1. Officer logs in and navigates to Profile
2. Sees "Barangay Logo" section (only if designated)
3. Clicks "Upload Logo" button
4. Selects barangay logo image
5. Logo is automatically uploaded and saved

### Step 3: Logo Appears Throughout System
1. Officer views dashboard
2. Barangay cards show custom logo instead of "BLGU LOGO"
3. Report cards display custom logo
4. Professional, branded presentation for stakeholders

---

## Technical Architecture

### Database Schema

```sql
-- User table
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  "firstName" VARCHAR(191) NOT NULL,
  "lastName" VARCHAR(191) NOT NULL,
  role VARCHAR(32) DEFAULT 'officer',
  "profilePicture" TEXT,
  "barangayDesignation" INTEGER,
  FOREIGN KEY ("barangayDesignation") REFERENCES barangay(barangay_id) ON DELETE SET NULL
);

-- Barangay table
CREATE TABLE barangay (
  barangay_id SERIAL PRIMARY KEY,
  barangay_name VARCHAR(191) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  -- other fields...
);
```

### API Endpoints

#### User Management
- `GET /api/users` - List users with barangayDesignation
- `POST /api/users` - Create user with barangayDesignation
- `PATCH /api/users/[id]` - Update user barangayDesignation
- `GET /api/me` - Get current user with barangayDesignation

#### Barangay Management
- `GET /api/barangays/[id]` - Get barangay info including logo_url
- `PATCH /api/barangays/[id]` - Update barangay (officers: logo only)
- `POST /api/barangays/upload-logo` - Upload logo file

#### Profile Management
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile picture

### File Storage

```
/public/uploads/
├── barangay-logos/
│   ├── barangay-1-1701234567890.png
│   ├── barangay-2-1701234567891.jpg
│   └── ...
```

---

## Permissions Matrix

| Feature | Officer | Admin | Developer |
|---------|---------|-------|-----------|
| View own profile | ✅ | ✅ | ✅ |
| Upload profile picture | ✅ | ✅ | ✅ |
| View barangay designation | ✅ | ✅ | ✅ |
| Change barangay designation | ❌ | ✅ | ✅ |
| Upload barangay logo (own) | ✅ | ✅ | ✅ |
| Upload barangay logo (others) | ❌ | ✅ | ✅ |
| Update barangay properties | ❌ | ✅ | ✅ |

---

## Benefits

### For Officers
- **Professional Branding:** Custom logos on reports and dashboards
- **Local Identity:** Represent their specific barangay
- **Easy Management:** Simple upload process through profile
- **Immediate Updates:** Changes reflect instantly across the system

### For Barangays
- **Brand Recognition:** Consistent visual identity
- **Professional Reports:** Branded report cards for stakeholders
- **Local Pride:** Showcase barangay identity
- **Stakeholder Confidence:** Professional presentation builds trust

### For Administrators
- **Centralized Control:** Manage officer-barangay relationships
- **Flexible Assignment:** Easy to reassign officers
- **Audit Trail:** Track who manages which barangay
- **Scalable:** Works for any number of barangays

---

## Future Enhancements

### Potential Features
1. **Multiple Officers per Barangay**
   - Support for multiple designated officers
   - Primary/secondary officer roles

2. **Logo Approval Workflow**
   - Admin approval before logo goes live
   - Version history and rollback

3. **Additional Customizations**
   - Custom color schemes
   - Custom report templates
   - Barangay-specific messaging

4. **Bulk Operations**
   - Bulk logo upload for admins
   - Batch officer assignments
   - Import/export configurations

5. **Analytics**
   - Track logo usage
   - Monitor customization adoption
   - Report generation statistics

---

## Related Documentation

- [Barangay Designation Feature](./BARANGAY_DESIGNATION_FEATURE.md)
- [Barangay Logo Upload Feature](./BARANGAY_LOGO_UPLOAD_FEATURE.md)
- [User Profile Feature](./USER_PROFILE_FEATURE.md)
- [Legacy Assignment Removal](./LEGACY_ASSIGNMENT_REMOVAL.md)

---

## Support & Troubleshooting

### Common Issues

**Issue:** Officer doesn't see "Barangay Logo" section
- **Solution:** Ensure officer has a barangay designation set by admin

**Issue:** Logo upload fails
- **Solution:** Check file size (<5MB) and format (image types only)

**Issue:** Logo doesn't appear in reports
- **Solution:** Refresh the page, check logo_url in database

**Issue:** Officer can't upload logo
- **Solution:** Verify barangayDesignation matches the barangay they're trying to update

### Contact
For technical support or feature requests, contact the development team.
