# View Toggle Feature

## Overview
Officers, admins, and viewers can now toggle between Map View and List View on the dashboard. This provides flexibility for users to choose their preferred interface for viewing barangay data.

## Implementation Details

### Default Views by Role
- **Officers**: Default to List View (mobile-style interface)
- **Admins & Viewers**: Default to Map View (traditional desktop interface)
- **Other roles (FS, Developer)**: Map View only (no toggle available)

### Toggle Location
The toggle is positioned in the **BarangayDetailsCard header** (upper right section) for users with toggle permission when in Map View. This placement:
- Keeps the toggle accessible and visible
- Doesn't block or cover card content
- Maintains a clean, organized interface
- Groups related controls together

### User Experience
1. **Officers** see List View by default when they open the dashboard
2. **Admins & Viewers** see Map View by default when they open the dashboard
3. When in Map View, the toggle appears in the BarangayDetailsCard header
4. The toggle allows seamless switching between Map and List views
5. The selected view persists during the session

### Main Header Toggle
The main header toggle was updated from "Map | Analytics" to "Overview | Analytics" to better reflect that the Overview section can show either map or list view.

## User Experience by Role

### For Officers (Desktop)
1. **Default View:** List View (mobile-style barangay list)
2. **Toggle Available:** In BarangayDetailsCard header when switching to Map View
3. **Can Switch:** Click either button to toggle between views
4. **Persistent:** View preference maintained during session

### For Admins & Viewers (Desktop)
1. **Default View:** Map View (traditional map with side panels)
2. **Toggle Available:** In BarangayDetailsCard header (upper right)
3. **Can Switch:** Click either button to toggle between views
4. **Persistent:** View preference maintained during session

### For Other Roles (FS, Developer)
- **Default View:** Map View (traditional map with side panels)
- **No Toggle:** Toggle buttons not shown
- **Standard Experience:** Full map interface as before

### Mobile (All Users)
- **Always List View:** Mobile devices always show list view
- **No Toggle:** Toggle not shown on mobile (< 768px width)

## Visual Design

### Toggle Button Group
- **Location:** BarangayDetailsCard header, upper right section
- **Style:** Gray background (bg-gray-100), rounded, compact size
- **Active State:** Default button variant (blue) for selected view
- **Inactive State:** Ghost variant for unselected view
- **Icons:** Map icon for Map View, List icon for List View
- **Size:** Small buttons (h-7, px-2) with smaller icons (h-3.5, w-3.5)
- **Placement:** Next to "Hover Preview" badge in card header

### Layout Behavior

**List View (Officers Default):**
- Full-width barangay list
- Search functionality
- Click barangay to see details
- Same as mobile experience

**Map View (Admins/Viewers Default):**
- Interactive SVG map on left
- Barangay details panel on right
- SGLGB history panel on right
- Hover preview functionality

## Technical Implementation

### State Management
```tsx
// Check if user can toggle views (officer, admin, viewer)
const userRole = user?.role?.toLowerCase();
const isOfficer = userRole === 'officer';
const canToggleView = userRole === 'officer' || userRole === 'admin' || userRole === 'viewer';

// For officers, default to list view; for admin/viewer, default to map view
const [viewMode, setViewMode] = useState<'map' | 'list'>(isOfficer ? 'list' : 'map');
```

### Conditional Rendering
```tsx
{/* Toggle in BarangayDetailsCard header for users with permission */}
{canToggleView && viewMode && onViewModeChange && (
  <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
    <Button
      variant={viewMode === 'map' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onViewModeChange('map')}
      className="h-7 px-2"
    >
      <Map className="h-3.5 w-3.5 mr-1" />
      Map
    </Button>
    <Button
      variant={viewMode === 'list' ? 'default' : 'ghost'}
      size="sm"
      onClick={() => onViewModeChange('list')}
      className="h-7 px-2"
    >
      <List className="h-3.5 w-3.5 mr-1" />
      List
    </Button>
  </div>
)}

{/* Map view - shown when user can't toggle OR when map is selected */}
{(!canToggleView || viewMode === 'map') && (
  <div className="hidden md:flex h-full gap-4">
    {/* Map and side panels */}
  </div>
)}

{/* List view - shown when user with toggle permission selects list */}
{canToggleView && viewMode === 'list' && (
  <div className="hidden md:block h-full">
    <BarangayListView 
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    />
  </div>
)}

{/* Mobile - always list view */}
<div className="block md:hidden h-full">
  <BarangayListView />
</div>
```

### Components Used
- `Button` from shadcn/ui
- `Map` and `List` icons from lucide-react
- `BarangayListView` component (existing)
- `MapCard` component (existing)

## Benefits

### For Officers
1. **Better Default Experience**
   - List view is simpler and more focused
   - Similar to mobile app experience
   - Easier to find their designated barangay

2. **Flexibility**
   - Can still access map view if needed
   - Easy toggle between views
   - No functionality lost

### For Admins & Viewers
1. **Traditional Experience**
   - Default to familiar map view
   - Full analytical capabilities
   - Can switch to list view when needed

2. **Flexibility**
   - Access to both views
   - Choose based on task at hand
   - List view for quick browsing, map for spatial analysis

### For All Users
1. **Role-Appropriate Defaults**
   - Officers get simplified view
   - Admins/Viewers get comprehensive view
   - Each role sees what they need most

2. **Consistency**
   - Desktop experience can match mobile
   - Familiar interface across devices
   - Reduced learning curve

## Use Cases

### Officer Workflow
1. Officer logs in → Dashboard loads with **List View**
2. Sees their designated barangay at top (if awardee)
3. Can search for other barangays
4. Clicks barangay to see satisfaction index
5. Can switch to Map View if needed for spatial context

### Admin/Viewer Workflow
1. Admin/Viewer logs in → Dashboard loads with **Map View**
2. Sees full map with all barangays
3. Can hover to preview, click to lock
4. Full analytical interface available
5. Can switch to List View for quick browsing

## Responsive Behavior

| Screen Size | Officer View | Admin/Viewer View | Other Roles View |
|-------------|--------------|-------------------|------------------|
| Mobile (< 768px) | List View (no toggle) | List View (no toggle) | List View (no toggle) |
| Desktop (≥ 768px) | List View (with toggle) | Map View (with toggle) | Map View (no toggle) |

## Files Modified

- `src/components/dashboard/MapView.tsx`
  - Added `canToggleView` logic for officer, admin, and viewer roles
  - Added `viewMode` state with role-based default
  - Passes toggle props to BarangayDetailsCard
  - Conditional rendering based on role and viewMode
  
- `src/components/dashboard/BarangayDetailsCard.tsx`
  - Added toggle button group in card header
  - Accepts `canToggleView`, `viewMode`, and `onViewModeChange` props
  - Imported Button, Map, and List components
  
- `src/components/dashboard/BarangayListView.tsx`
  - Accepts optional `viewMode` and `onViewModeChange` props
  - Supports toggle functionality when used in desktop mode

- `src/components/dashboard/Navbar.tsx`
  - Changed main header toggle from "Map" to "Overview"

## Testing Checklist

- [ ] Officer sees List View by default on desktop
- [ ] Admin sees Map View by default on desktop
- [ ] Viewer sees Map View by default on desktop
- [ ] FS/Developer see Map View only (no toggle)
- [ ] Officer can toggle to Map View
- [ ] Admin/Viewer can toggle to List View
- [ ] Toggle appears in BarangayDetailsCard header (upper right)
- [ ] Toggle doesn't block or cover card content
- [ ] Toggle buttons show active state correctly
- [ ] Mobile always shows List View (no toggle)
- [ ] Toggle positioned correctly next to "Hover Preview" badge
- [ ] Toggle doesn't interfere with other UI elements
- [ ] View state maintained during session
- [ ] Both views function correctly for all roles with toggle

## Future Enhancements

1. **Remember Preference**
   - Save view preference to localStorage
   - Persist across sessions
   - Per-user preference in database

2. **Keyboard Shortcuts**
   - Alt+M for Map View
   - Alt+L for List View
   - Quick switching without mouse

3. **View-Specific Features**
   - List view: Bulk actions, filtering
   - Map view: Spatial analysis, clustering
   - Context-aware tools per view

4. **Animation**
   - Smooth transition between views
   - Fade in/out effect
   - Loading states

5. **Mobile Toggle**
   - Optional toggle on larger mobile devices (tablets)
   - Landscape mode considerations
   - Touch-optimized controls

## Related Features

- [Officer Auto-Select Feature](OFFICER_AUTO_SELECT_FEATURE.md) - Auto-selects officer's barangay
- [Hover Preview Feature](HOVER_PREVIEW_FEATURE.md) - Map hover functionality
- [Role Restrictions Applied](ROLE_RESTRICTIONS_APPLIED.md) - Role-based access control

---

**Implementation Date:** January 2026
**Target Users:** Officers, Admins, Viewers
**Default View:** List View for Officers, Map View for Admins/Viewers
