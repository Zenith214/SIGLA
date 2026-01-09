# Interviewer Role Access Analysis

## Pages Interviewers Can Access

Based on the codebase analysis, here are the pages/features accessible to the **Interviewer** role:

### ✅ ACCESSIBLE (No role restrictions or interviewer-allowed)

1. **`/survey` - Survey Dashboard** (Main interviewer hub)
   - View assigned barangays
   - See survey progress
   - Access spot assignments
   - View cycle information
   - **Uses:** MySpotAssignments component

2. **`/survey/spot/[spotId]` - Spot Workflow Screen**
   - Complete interviews for assigned spots
   - View spot details and questionnaires
   - GPS verification
   - Visit history
   - **Uses:** SpotWorkflowScreen component

3. **`/survey/forms` - Survey Forms**
   - Fill out survey questionnaires
   - Multi-section forms (Financial, Disaster, Safety, Social, Business, Environmental)
   - Kish Grid selection
   - Geotagging
   - **Critical for offline:** This is where actual survey data entry happens

4. **`/survey/barangay/[id]` - Barangay Detail View**
   - View barangay information
   - See survey progress for specific barangay
   - Access assigned surveys

5. **`/profile` - User Profile**
   - View/edit personal information
   - Change password
   - View role and assignments

6. **`/settings` - Settings Page**
   - App configuration
   - Preferences
   - (May have limited features based on role)

### ❌ NOT ACCESSIBLE (Role-restricted)

1. **`/dashboard` - Main Dashboard** ⚠️ **NOW RESTRICTED**
   - Interactive map view
   - Analytics view
   - Barangay satisfaction index
   - **Restricted to:** Admin, Developer, FS, Officer, Viewer
   - **UI Note:** "Back to Dashboard" link already hidden from interviewers

2. **`/cpap` - CPAP Management**
   - Restricted to: Officer, Admin, Developer, Viewer
   - Interviewers get 403 Forbidden

3. **`/fs-dashboard` - Field Supervisor Dashboard** ⚠️ **NOW RESTRICTED**
   - Spot allocation
   - Interviewer assignment management
   - GPS threshold settings
   - Fieldwork monitoring
   - Performance tracking
   - **Restricted to:** Admin, Developer, FS

4. **`/admin/cpap/*` - Admin CPAP Pages** ⚠️ **NOW RESTRICTED**
   - CPAP review and management
   - **Restricted to:** Admin, Developer

## Service Worker Impact Analysis

### What Gets Cached for Interviewers

Based on `public/sw.js`, the service worker caches:

#### 1. **Static Assets** (Install-time cache)
- `/` (home page)
- `/offline.html`
- `/manifest.json`

#### 2. **API Responses** (Runtime cache - Network-first)
- `/api/barangays/*` - Barangay data
- `/api/survey/*` - Survey endpoints
- `/api/spots/*` - Spot assignments
- `/api/questionnaires/*` - Survey forms
- `/api/visits/*` - Visit history
- `/api/fi/*` - Field interviewer specific APIs
- **Exception:** `/api/cpap/*` - NEVER cached (network-only)

#### 3. **HTML Pages** (Runtime cache - Cache-first)
- `/survey` - Main dashboard
- `/survey/forms` - Survey forms
- `/survey/spot/[spotId]` - Spot workflow
- `/survey/barangay/[id]` - Barangay details
- `/profile` - User profile
- ~~`/dashboard` - Main dashboard~~ ⚠️ **NO LONGER ACCESSIBLE TO INTERVIEWERS**

#### 4. **Static Resources** (Runtime cache - Stale-while-revalidate)
- JavaScript bundles
- CSS files
- Images
- Fonts
- Next.js chunks

### Critical Offline Features for Interviewers

1. **Survey Form Access** - Can load and fill forms offline
2. **Spot Assignment View** - Can see assigned spots
3. **Barangay Information** - Cached barangay data available
4. **Visit History** - Previous visits cached
5. **IndexedDB Integration** - Survey responses stored locally (separate from service worker)

## Impact of Limiting Service Worker to Interviewers Only

### ✅ SAFE - No Breaking Changes

**Admin/Developer/FS Users:**
- Will work normally with internet connection
- Won't have offline capability (they don't need it)
- Won't have cached API responses
- Cleaner browser cache
- Easier debugging (no stale cache issues)

**Interviewer Users:**
- Full offline capability maintained
- Can conduct surveys in the field without internet
- All critical features cached
- PWA update prompts still work

### 🎯 Benefits

1. **Reduced Cache Bloat**
   - Admins don't cache dashboard analytics data
   - FS users don't cache spot allocation data
   - Only field-relevant data cached for interviewers

2. **Better Performance**
   - Admins always get fresh data (no cache staleness)
   - Faster admin dashboard (no service worker overhead)
   - Reduced memory usage for non-field users

3. **Easier Debugging**
   - Admin/FS users see real-time data issues immediately
   - No "clear cache" troubleshooting for office users
   - Service worker logs only from field users

4. **Security**
   - Sensitive admin data not cached on devices
   - CPAP data never cached (already implemented)
   - Reduced attack surface for office computers

### ⚠️ Considerations

1. **Role Detection Timing**
   - Service worker must register AFTER user authentication
   - Need to check role before calling `register()`
   - Handle role changes (user promoted/demoted)

2. **Existing Registrations**
   - Users who already have service worker registered will keep it
   - May need to unregister for non-interviewer users
   - Add cleanup logic for role changes

3. **PWA Features**
   - Only interviewers will see "Add to Home Screen" prompt
   - Only interviewers get update notifications
   - Offline indicator still works for all (separate component)

## Recommendation

**✅ YES - Implement role-based service worker registration**

The service worker is specifically designed for field interviewer offline capability. Limiting it to the Interviewer role:
- Won't break any functionality for other roles
- Improves performance and debugging for office users
- Maintains critical offline features for field users
- Aligns with the actual use case (field data collection)

## Implementation Approach

1. Modify `ServiceWorkerRegistration.tsx` to check user role
2. Only call `register()` if `user.role === 'Interviewer'`
3. Add cleanup to unregister service worker if role changes
4. Keep `OfflineIndicator` and `PWAUpdatePrompt` components (they handle their own checks)

## Files Modified

### Role Restrictions Added
- `src/app/dashboard/page.tsx` - Added `allowedRoles: ['admin', 'developer', 'fs', 'officer', 'viewer']`
- `src/app/fs-dashboard/page.tsx` - Added `allowedRoles: ['admin', 'developer', 'fs']`
- `src/app/admin/cpap/page.tsx` - Added `allowedRoles: ['admin', 'developer']`
- `src/app/admin/cpap/review/[id]/page.tsx` - Added `allowedRoles: ['admin', 'developer']`

### Security Improvements
- Closed "security by obscurity" gaps where pages had no UI links but were technically accessible
- Interviewers now get proper 403 Forbidden responses instead of being able to access restricted pages via direct URL
- Consistent role-based access control across all administrative pages

## Testing Checklist

After implementation:
- [ ] Interviewer can access survey forms offline
- [ ] Interviewer can view cached barangay data offline
- [ ] Admin/FS users work normally online
- [ ] Admin/FS users don't have service worker registered
- [ ] Role change triggers service worker unregister
- [ ] PWA update prompt only shows for interviewers
- [ ] Offline indicator works for all users
