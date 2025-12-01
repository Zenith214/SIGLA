# GPS Timeout Fix

## Issue
GPS location capture was timing out with the error "Location request timed out" in the respondent selection form.

## Root Cause
- The timeout was set too low (15 seconds) for reliable GPS acquisition
- GPS signals can take longer to acquire, especially:
  - Indoors or in areas with poor sky visibility
  - On first use (cold start)
  - In areas with weak GPS signal

## Changes Made

### 1. Increased Timeout Duration
**File:** `src/app/survey/forms/sections/respondent-selection.tsx`
- Changed timeout from 15 seconds to 30 seconds
- Added `maximumAge: 0` to prevent using cached positions for verification

### 2. Improved Error Handling
**File:** `src/app/survey/forms/utils/geotagging.ts`
- Increased default timeout from 10 seconds to 30 seconds
- Added custom timeout handler with clearer error message
- Enhanced error messages for all GPS error types:
  - Permission denied: Instructs user to enable location access
  - Position unavailable: Suggests checking GPS settings
  - Timeout: Advises ensuring GPS is enabled and clear sky view
- Fixed cache handling to respect `maximumAge: 0` setting

## Benefits
- More reliable GPS capture, especially in challenging conditions
- Better user guidance when GPS fails
- Clearer error messages for troubleshooting
- Proper handling of verification requirements (no cached positions)

## Testing Recommendations
1. Test GPS capture in various conditions:
   - Indoors
   - Outdoors with clear sky
   - Areas with poor GPS signal
2. Verify error messages are helpful and actionable
3. Confirm manual location picker works as fallback
4. Test that "proceed without GPS" properly flags interviews
