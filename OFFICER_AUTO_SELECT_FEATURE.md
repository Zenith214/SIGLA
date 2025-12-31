# Officer Auto-Select Feature

## Overview
Implemented automatic barangay selection for officers based on their designated barangay assignment. When an officer logs in and views the dashboard, their assigned barangay is automatically selected and locked on the map.

## User Experience

### For Officers with Barangay Designation
1. Officer logs in and navigates to `/dashboard`
2. Map loads with barangay data
3. **Automatically:**
   - Their designated barangay is selected and locked
   - Barangay details panel shows their barangay info
   - SGLGB history panel shows their barangay's history
   - Map highlights their barangay in amber (locked state)
   - Pin marker appears on their barangay
4. Officer can still:
   - Hover over other barangays to preview (if they want to compare)
   - Click other barangays to switch selection
   - View full details modal for their barangay

### For Officers without Barangay Designation
- Normal behavior - no auto-selection
- Can freely explore all barangays

### For Other Roles (Admin, FS, Developer, Viewer)
- Normal behavior - no auto-selection
- Can freely explore all barangays

## Technical Implementation

### Data Flow

1. **User Authentication** (`src/lib/auth.ts`)
   - User object includes `barangayDesignation?: number`
   - Populated from database during login

2. **MapView Component** (`src/components/dashboard/MapView.tsx`)
   - Checks if user is an officer: `user?.role?.toLowerCase() === 'officer'`
   - Passes `officerBarangayId` to MapCard if officer

3. **MapCard Component** (`src/components/dashboard/MapCard.tsx`)
   - Receives `officerBarangayId` prop
   - Passes it down to InteractiveSVGMap

4. **InteractiveSVGMap Component** (`src/components/dashboard/InteractiveSVGMap.tsx`)
   - New `useEffect` hook triggers after barangays load
   - Finds barangay matching `officerBarangayId`
   - Fetches historical data for that barangay
   - Calls `onBarangayLock()` to lock the selection
   - Sets visual state (locked barangay name, pin marker)

### Key Code Changes

**MapView.tsx:**
```tsx
const { user } = useAuth();

<MapCard 
  officerBarangayId={user?.role?.toLowerCase() === 'officer' ? user.barangayDesignation : undefined}
  onAutoSelectComplete={() => setAutoSelectTriggered(true)}
/>
```

**MapCard.tsx:**
```tsx
interface MapCardProps {
  // ... existing props
  officerBarangayId?: number;
  onAutoSelectComplete?: () => void;
}
```

**InteractiveSVGMap.tsx:**
```tsx
// Auto-select officer's designated barangay
useEffect(() => {
  if (!officerBarangayId || !barangays || Object.keys(barangays).length === 0 || isLoading) {
    return;
  }

  const designatedBarangay = Object.values(barangays).find(
    (b) => b.id === officerBarangayId
  );

  if (designatedBarangay && onBarangayLock) {
    // Fetch history and lock selection
    // ...
  }
}, [officerBarangayId, barangays, isLoading, onBarangayLock, onAutoSelectComplete]);
```

## Database Schema

Officers have a `barangayDesignation` field in the `user` table:

```prisma
model User {
  id                  Int       @id @default(autoincrement())
  // ... other fields
  barangayDesignation Int?
  
  // Relations
  designated_barangay Barangay? @relation("OfficerDesignation", fields: [barangayDesignation], references: [barangay_id], onDelete: SetNull)
}
```

## Benefits

1. **Improved UX for Officers**
   - No need to search for their barangay
   - Immediate access to their barangay's data
   - Saves time and reduces confusion

2. **Role-Appropriate Defaults**
   - Officers typically focus on their assigned barangay
   - Auto-selection aligns with their workflow
   - Still allows exploration of other barangays if needed

3. **Maintains Flexibility**
   - Officers can still click other barangays
   - Hover preview still works
   - No functionality is locked or restricted

## Testing Checklist

- [ ] Officer with barangay designation sees auto-selection
- [ ] Officer without barangay designation has normal behavior
- [ ] Admin/FS/Developer/Viewer users have normal behavior
- [ ] Auto-selected barangay shows correct details
- [ ] Auto-selected barangay shows correct history
- [ ] Officer can still hover other barangays for preview
- [ ] Officer can click other barangays to change selection
- [ ] Pin marker appears on auto-selected barangay
- [ ] Map highlights auto-selected barangay in amber
- [ ] Side panels show auto-selected barangay data

## Files Modified

- `src/components/dashboard/MapView.tsx` - Added user auth check and officer barangay ID passing
- `src/components/dashboard/MapCard.tsx` - Added props for officer auto-select
- `src/components/dashboard/InteractiveSVGMap.tsx` - Added auto-selection logic with useEffect

## Related Features

- Hover preview feature (HOVER_PREVIEW_FEATURE.md)
- Role-based access control (ROLE_RESTRICTIONS_APPLIED.md)
- User barangay designation management (Settings > Users & Roles)

## Future Enhancements

1. **Visual Indicator**
   - Add a badge or icon showing "Your Barangay" for officers
   - Subtle notification: "Showing your designated barangay"

2. **Preference Override**
   - Allow officers to disable auto-selection in settings
   - Remember their preference across sessions

3. **Multi-Barangay Officers**
   - Support officers assigned to multiple barangays
   - Show dropdown to select which one to auto-select
