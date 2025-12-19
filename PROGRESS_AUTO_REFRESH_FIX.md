# Progress Auto-Refresh Fix

## Issue
After submitting a survey, the progress wasn't automatically updating in:
- Survey dashboard (main map and barangay cards)
- Barangay detail page (survey targets)

Users had to manually refresh the page to see updated progress.

## Root Cause
The survey dashboard and barangay detail pages only fetched data once when the component mounted. When users navigated back after submitting a survey, the component didn't remount, so it showed stale cached data.

## Solution
Added automatic data refresh when the page becomes visible or gains focus:

### 1. Survey Dashboard (`src/app/survey/page.tsx`)
- Moved `fetchBarangays` function outside of `useEffect` for reusability
- Added cache-busting parameter (`?t=${Date.now()}`) to API calls
- Added `visibilitychange` event listener to refresh when page becomes visible
- Added `focus` event listener to refresh when window gains focus

### 2. Barangay Detail Page (`src/app/survey/barangay/[id]/page.tsx`)
- Added `visibilitychange` event listener to refresh barangay data
- Added `focus` event listener to refresh when window gains focus
- Both listeners fetch fresh data with cache-busting parameters

## How It Works

1. **User submits survey** → Survey form page
2. **Success modal appears** → User clicks "Continue"
3. **Redirects to survey dashboard or barangay detail page**
4. **Page gains focus** → Triggers automatic refresh
5. **Fresh data loaded** → Progress updates immediately

## Benefits
- No manual refresh needed
- Real-time progress updates
- Better user experience
- Works across browser tabs

## Files Modified
- `src/app/survey/page.tsx`
- `src/app/survey/barangay/[id]/page.tsx`
