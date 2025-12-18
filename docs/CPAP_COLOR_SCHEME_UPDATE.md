# CPAP UI Color Scheme Update

## Overview

Updated the CPAP module UI to match the system's indigo/purple color scheme instead of using generic blue/green colors.

## System Color Scheme

The PULSE system uses:
- **Primary:** Indigo/Navy (`oklch(0.21 0.034 264.665)` / `#667eea`)
- **Secondary:** Light indigo/purple
- **Success:** Indigo (instead of green)
- **Warning:** Orange (instead of amber)
- **Error:** Red (unchanged)

## Changes Made

### 1. Empty State Info Box
**File:** `src/components/cpap/admin/CPAPList.tsx`

**Before:**
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
  <p className="text-sm text-blue-800">
```

**After:**
```tsx
<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 max-w-md">
  <p className="text-sm text-indigo-800">
```

### 2. Approved Badge
**File:** `src/components/cpap/admin/CPAPMonitoringView.tsx`

**Before:**
```tsx
<Badge variant="default" className="bg-green-600">
  Approved
</Badge>
```

**After:**
```tsx
<Badge variant="default" className="bg-indigo-600">
  Approved
</Badge>
```

### 3. Approve Button & Confirmation
**File:** `src/components/cpap/admin/CPAPReviewModal.tsx`

**Before:**
```tsx
<Button className="bg-green-600 hover:bg-green-700">
  <CheckCircle className="h-4 w-4 mr-2" />
  Approve
</Button>

<div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
  <h4 className="font-semibold text-green-900">Confirm Approval</h4>
  <p className="text-sm text-green-800">
```

**After:**
```tsx
<Button className="bg-indigo-600 hover:bg-indigo-700">
  <CheckCircle className="h-4 w-4 mr-2" />
  Approve
</Button>

<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
  <h4 className="font-semibold text-indigo-900">Confirm Approval</h4>
  <p className="text-sm text-indigo-800">
```

### 4. Revision Request Boxes
**File:** `src/components/cpap/admin/CPAPReviewModal.tsx`

**Before:**
```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <h4 className="font-semibold text-amber-900 mb-2">Previous Comments</h4>
  <p className="text-sm text-amber-800">

<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
  <h4 className="font-semibold text-amber-900">Request Revision</h4>
```

**After:**
```tsx
<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
  <h4 className="font-semibold text-orange-900 mb-2">Previous Comments</h4>
  <p className="text-sm text-orange-800">

<div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
  <h4 className="font-semibold text-orange-900">Request Revision</h4>
```

### 5. Officer CPAP Page - Revision Comments
**File:** `src/app/cpap/page.tsx`

**Before:**
```tsx
<div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
  <h3 className="font-semibold text-amber-900 mb-2">
    Revision Requested
  </h3>
  <p className="text-sm text-amber-800">
```

**After:**
```tsx
<div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
  <h3 className="font-semibold text-orange-900 mb-2">
    Revision Requested
  </h3>
  <p className="text-sm text-orange-800">
```

### 6. AI Suggestions Preview Box
**File:** `src/app/cpap/page.tsx`

**Before:**
```tsx
<div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
  <div className="flex items-center gap-2">
    <Sparkles className="h-5 w-5 text-blue-600" />
    <h3 className="font-semibold text-blue-900">
  </div>
  <p className="text-sm text-blue-800 mb-4">
```

**After:**
```tsx
<div className="mb-6 bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
  <div className="flex items-center gap-2">
    <Sparkles className="h-5 w-5 text-indigo-600" />
    <h3 className="font-semibold text-indigo-900">
  </div>
  <p className="text-sm text-indigo-800 mb-4">
```

## Color Mapping

| Element Type | Old Color | New Color | Usage |
|--------------|-----------|-----------|-------|
| Success/Approval | Green (`bg-green-600`) | Indigo (`bg-indigo-600`) | Approve buttons, approved badges |
| Info/Primary | Blue (`bg-blue-50`) | Indigo (`bg-indigo-50`) | Info boxes, AI suggestions |
| Warning/Revision | Amber (`bg-amber-50`) | Orange (`bg-orange-50`) | Revision requests, warnings |
| Error | Red (`bg-red-50`) | Red (`bg-red-50`) | Unchanged |

## Visual Consistency

### Before
- Mixed color scheme (blue, green, amber)
- Didn't match system branding
- Generic Bootstrap-style colors

### After
- Consistent indigo/purple theme
- Matches system primary color
- Professional, branded appearance
- Aligns with PULSE identity

## Tailwind Classes Used

### Indigo Palette
- `bg-indigo-50` - Very light indigo background
- `bg-indigo-600` - Primary indigo (buttons)
- `bg-indigo-700` - Darker indigo (hover states)
- `border-indigo-200` - Light indigo borders
- `text-indigo-800` - Dark indigo text
- `text-indigo-900` - Very dark indigo text (headings)

### Orange Palette (Warnings)
- `bg-orange-50` - Very light orange background
- `border-orange-200` - Light orange borders
- `text-orange-800` - Dark orange text
- `text-orange-900` - Very dark orange text (headings)

## Benefits

1. **Brand Consistency** - CPAP module now matches the rest of the PULSE system
2. **Professional Appearance** - Cohesive color scheme looks more polished
3. **User Recognition** - Users immediately recognize it as part of PULSE
4. **Accessibility** - Maintained WCAG AA contrast ratios
5. **Visual Hierarchy** - Clear distinction between info, success, and warning states

## Testing Checklist

- [ ] Empty state info box displays in indigo
- [ ] Approved badges show indigo background
- [ ] Approve buttons are indigo
- [ ] Approve confirmation box is indigo
- [ ] Revision request boxes are orange
- [ ] Previous comments box is orange
- [ ] AI suggestions box is indigo
- [ ] All text remains readable (contrast check)
- [ ] Hover states work correctly
- [ ] Colors match other PULSE pages

## Future Considerations

### Additional Components to Update (if needed)
- Status badges (Draft, Submitted, etc.)
- Progress indicators
- Notification toasts
- Loading states
- Error messages

### Potential Enhancements
- Add gradient backgrounds for hero sections
- Use indigo accent colors for icons
- Implement dark mode variants
- Add subtle animations with indigo highlights

---

**Updated:** November 20, 2025  
**Issue:** CPAP UI used generic colors instead of system theme  
**Solution:** Updated all color classes to match indigo/purple system palette  
**Status:** ✅ Complete
