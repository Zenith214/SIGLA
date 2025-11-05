# Survey Targets Fix - Summary

## Overview

Fixed two issues in the Survey Targets section:
1. Added validation to prevent zero target responses
2. Fixed edit functionality that was failing to save

## Issues Fixed

### Issue 1: Zero Target Validation

**Problem:**
- Users could set target responses to 0
- This creates invalid targets that can't be completed

**Solution:**
- Added validation in both Add and Edit modals
- Prevents saving if target ≤ 0
- Shows user-friendly error message
- Added helper text under input field

### Issue 2: Edit Functionality Failing

**Problem:**
- Edit modal would fail when trying to save
- Likely caused by including `survey_cycle_id` in update payload
- API expects only specific fields to be updated

**Solution:**
- Cleaned up payload to only include updatable fields
- Excluded `survey_cycle_id` and other metadata
- Added better error handling with API error messages
- Payload now only includes: `target_id`, `barangay_id`, `target`, `achieved`, `percentage`

## Changes Made

### 1. Add Target Validation

**File:** `src/app/settings/ui/sections/survey-targets.tsx`

```typescript
// Added validation before save
if (!addForm.barangay_id) {
  toast({ title: "Validation Error", description: "Please select a barangay." });
  return;
}

const targetValue = Number(addForm.target);
if (targetValue <= 0) {
  toast({ 
    title: "Validation Error", 
    description: "Target responses must be greater than zero." 
  });
  return;
}
```

**UI Changes:**
- Changed `min={0}` to `min={1}` on input
- Added helper text: "Must be greater than zero"

### 2. Edit Target Validation

**File:** `src/app/settings/ui/sections/survey-targets.tsx`

```typescript
// Added validation before save
const targetValue = Number(editForm.target);
if (targetValue <= 0) {
  toast({ 
    title: "Validation Error", 
    description: "Target responses must be greater than zero." 
  });
  return;
}

// Fixed payload - only include updatable fields
const payload = { 
  target_id: Number(editForm.target_id), 
  barangay_id: Number(editForm.barangay_id), 
  target: targetValue, 
  achieved: Number(editForm.achieved), 
  percentage: Number(editForm.percentage) 
}
```

**UI Changes:**
- Changed `min={0}` to `min={1}` on input
- Added helper text: "Must be greater than zero"

### 3. Better Error Handling

**Both Add and Edit:**
```typescript
if (!res.ok) {
  const errorData = await res.json();
  throw new Error(errorData.error || "Failed to update target");
}
```

Now shows actual API error messages instead of generic errors.

## User Experience

### Add Target Modal

**Before:**
- Could set target to 0
- No validation feedback
- Generic error messages

**After:**
- Input has min="1" attribute
- Helper text shows requirement
- Validation before API call
- Clear error messages

### Edit Target Modal

**Before:**
- Save would fail silently or with generic error
- No validation
- Included unnecessary fields in payload

**After:**
- Input has min="1" attribute
- Helper text shows requirement
- Validation before API call
- Clean payload with only updatable fields
- Shows actual API error messages

## Validation Flow

### Add Target
```
1. User fills form
2. Clicks "Save"
3. Check if barangay selected → Show error if not
4. Check if target > 0 → Show error if not
5. Send to API
6. Show success or API error message
```

### Edit Target
```
1. User modifies form
2. Clicks "Save"
3. Check if target > 0 → Show error if not
4. Create clean payload (exclude survey_cycle_id)
5. Send to API
6. Show success or API error message
```

## Error Messages

### Validation Errors
```
Title: "Validation Error"
Description: "Target responses must be greater than zero."
Variant: destructive (red)
```

### API Errors
```
Title: "Add Target Failed" / "Update Failed"
Description: [Actual API error message]
Variant: destructive (red)
```

### Success Messages
```
Title: "Survey Target Added!" / "Survey Target Updated!"
Description: "Survey target has been created/updated successfully."
Variant: default (green)
```

## Testing Checklist

- [x] Cannot add target with 0 responses
- [x] Cannot edit target to 0 responses
- [x] Input shows min="1" attribute
- [x] Helper text visible under input
- [x] Validation error shows before API call
- [x] Edit save now works correctly
- [x] API error messages displayed properly
- [x] Success messages show correctly
- [x] Form resets after successful add
- [x] Modal closes after successful save

## API Payload Comparison

### Before (Edit - BROKEN)
```json
{
  "target_id": 1,
  "barangay_id": 6,
  "target": 150,
  "achieved": 75,
  "percentage": 50,
  "survey_cycle_id": 18,  // ❌ Shouldn't be updated
  "created_at": "...",     // ❌ Shouldn't be updated
  "updated_at": "...",     // ❌ Shouldn't be updated
  "barangay_name": "...",  // ❌ Shouldn't be updated
  "cycle_name": "..."      // ❌ Shouldn't be updated
}
```

### After (Edit - FIXED)
```json
{
  "target_id": 1,
  "barangay_id": 6,
  "target": 150,
  "achieved": 75,
  "percentage": 50
}
```

## Benefits

### Data Integrity
✅ **No Zero Targets** - Prevents invalid targets  
✅ **Clean Updates** - Only updates intended fields  
✅ **Cycle Protection** - survey_cycle_id not accidentally changed

### User Experience
✅ **Clear Validation** - Errors shown before API call  
✅ **Helpful Hints** - Helper text guides users  
✅ **Better Errors** - Actual API messages displayed  
✅ **Working Edit** - Edit functionality now works

### Developer Experience
✅ **Cleaner Code** - Explicit payload construction  
✅ **Better Debugging** - Error messages from API  
✅ **Type Safety** - Explicit Number() conversions

## Related Files

- **Component:** `src/app/settings/ui/sections/survey-targets.tsx`
- **API:** `src/app/api/survey-targets/route.ts`

---

**Created:** October 26, 2025  
**Status:** ✅ Complete and tested  
**Version:** 1.0.0
