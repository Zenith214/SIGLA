# Barangay Designation Feature

## Overview
This feature adds the ability to designate officers to specific barangays. The designation is optional and only applies to users with the "officer" role.

## Database Changes

### New Column: `barangayDesignation`
- **Table**: `user`
- **Type**: `INTEGER` (nullable)
- **Foreign Key**: References `barangay(barangay_id)`
- **Constraint**: `ON DELETE SET NULL`
- **Index**: Added for query performance

## Implementation Details

### 1. Database Schema (Prisma)
```prisma
model User {
  // ... existing fields
  barangayDesignation  Int?
  
  // Relations
  designated_barangay Barangay? @relation("OfficerDesignation", fields: [barangayDesignation], references: [barangay_id], onDelete: SetNull)
  
  @@index([barangayDesignation])
}

model Barangay {
  // ... existing fields
  designated_officers User[] @relation("OfficerDesignation")
}
```

### 2. API Updates

#### GET /api/users
- Now returns `barangayDesignation` field for all users

#### POST /api/users
- Accepts `barangayDesignation` in request body
- Converts empty strings to `null`
- Returns `barangayDesignation` in response

#### PATCH /api/users/[id]
- Accepts `barangayDesignation` in request body
- Converts empty strings to `null`
- Returns `barangayDesignation` in response

### 3. UI Changes

#### User Management Table
- Added "Barangay" column that displays the designated barangay name for officers
- Shows "-" for non-officers or officers without designation
- Supports both legacy (`barangay_id`/`barangay_name`) and new (`id`/`name`) API formats

#### Add User Dialog
- Shows "Barangay Designation" dropdown when role is "officer"
- Dropdown populated with all active barangays from the system
- Includes "No Designation" option
- Field is hidden for other roles

#### Edit User Dialog
- Shows "Barangay Designation" dropdown when role is "officer"
- Pre-populates with current designation if exists
- Dropdown populated with all active barangays from the system
- Includes "No Designation" option
- Field is hidden for other roles

## Usage

### Designating an Officer to a Barangay

1. Navigate to Settings > Users & Roles
2. Click "Add User" or edit an existing user
3. Select "officer" as the role
4. Choose a barangay from the "Barangay Designation" dropdown
5. Save the user

### Removing a Designation

1. Edit the officer user
2. Select "No Designation" from the dropdown
3. Save the user

## Notes

- The designation is **optional** - officers can exist without a barangay designation
- Only one designation per officer (not multiple barangays)
- If a barangay is deleted, the designation is automatically set to `null`
- The legacy "Assigned Barangay" field and assignment creation logic has been removed
- Assignments are now managed separately through the FS Dashboard for interviewers only
