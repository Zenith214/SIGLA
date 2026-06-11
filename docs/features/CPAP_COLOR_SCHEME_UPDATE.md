# CPAP Color Scheme Update

## Overview
Updated the CPAP spreadsheet editor to match the main system's color scheme instead of using plain white colors.

## Color Changes

### Header (Editor Page)

**Before:**
- Background: White (`bg-white`)
- Text: Gray-900 (`text-gray-900`)
- Border: Gray (`border-b`)

**After:**
- Background: Slate-800 (`bg-slate-800`)
- Text: White (`text-white`)
- Border: Slate-700 (`border-b border-slate-700`)
- Matches the main CPAP page header

### Page Background

**Before:**
- Background: Gray-50 (`bg-gray-50`)

**After:**
- Background: Light Blue (`#dbeafe`)
- Matches the main CPAP page background

### Table Header Row

**Before:**
- Background: Gray-100 (`bg-gray-100`)
- Text: Default (black)
- Border: Gray-300 (`border-gray-300`)

**After:**
- Background: Slate-700 (`bg-slate-700`)
- Text: White (`text-white`)
- Border: Slate-600 (`border-slate-600`)
- Professional dark header

### Service Area Headers

**Before:**
- Background: Blue-50 (`bg-blue-50`)
- Text: Gray-900 (`text-gray-900`)
- Border: Gray-300 (`border-gray-300`)

**After:**
- Background: Blue-100 (`bg-blue-100`)
- Text: Slate-800 (`text-slate-800`)
- Border: Slate-300 (`border-slate-300`)
- More visible distinction

### Table Cells

**Before:**
- Background: Default (white)
- Border: Gray-300 (`border-gray-300`)
- Focus ring: Default

**After:**
- Background: White (`bg-white`)
- Border: Slate-300 (`border-slate-300`)
- Focus ring: Blue-500 (`focus:ring-blue-500`)
- Hover: Blue-50 (`hover:bg-blue-50`)

### Empty State & Add Row Buttons

**Before:**
- Background: Gray-50 (`bg-gray-50`)
- Border: Gray-300 (`border-gray-300`)

**After:**
- Background: Slate-50 (`bg-slate-50`)
- Border: Slate-300 (`border-slate-300`)
- Hover: Blue-50 (`hover:bg-blue-50`)

### Footer (Save Button Area)

**Before:**
- Background: Gray-50 (`bg-gray-50`)
- Border: Default

**After:**
- Background: Slate-50 (`bg-slate-50`)
- Border: Slate-300 (`border-slate-300`)

## Color Palette

### Primary Colors
- **Slate-800**: `#1e293b` - Header background
- **Slate-700**: `#334155` - Table header, hover states
- **Slate-600**: `#475569` - Borders (dark)
- **Slate-300**: `#cbd5e1` - Borders (light)
- **Slate-50**: `#f8fafc` - Footer background

### Accent Colors
- **Blue-600**: `#2563eb` - Primary buttons
- **Blue-500**: `#3b82f6` - Focus rings
- **Blue-100**: `#dbeafe` - Service area headers, page background
- **Blue-50**: `#eff6ff` - Hover states

### Text Colors
- **White**: `#ffffff` - Header text
- **Slate-800**: `#1e293b` - Service area header text
- **Slate-300**: `#cbd5e1` - Subtitle text in header

## Visual Comparison

### Before (Plain White)
```
┌─────────────────────────────────────────┐
│ White Header                            │
├─────────────────────────────────────────┤
│ Gray-50 Background                      │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Gray-100 Table Header               ││
│ ├─────────────────────────────────────┤│
│ │ Blue-50 Service Area                ││
│ ├─────────────────────────────────────┤│
│ │ White Cells                         ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### After (System Colors)
```
┌─────────────────────────────────────────┐
│ Slate-800 Header (Dark)                 │
├─────────────────────────────────────────┤
│ Light Blue Background (#dbeafe)         │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ Slate-700 Table Header (Dark)       ││
│ ├─────────────────────────────────────┤│
│ │ Blue-100 Service Area (Light Blue)  ││
│ ├─────────────────────────────────────┤│
│ │ White Cells with Blue Focus         ││
│ └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Benefits

1. **Consistency**: Matches the main CPAP page design
2. **Professional**: Dark header looks more polished
3. **Visibility**: Better contrast for headers
4. **Branding**: Consistent color scheme across the system
5. **User Experience**: Familiar colors reduce cognitive load

## Files Modified

1. ✅ `src/app/cpap/editor/page.tsx` - Header colors
2. ✅ `src/components/cpap/CPAPSpreadsheet.tsx` - Table colors

## Testing Checklist

- [ ] Header is dark slate with white text
- [ ] Page background is light blue
- [ ] Table header is dark slate with white text
- [ ] Service area headers are light blue
- [ ] Table cells are white with slate borders
- [ ] Focus rings are blue
- [ ] Hover states work correctly
- [ ] Colors match main CPAP page
- [ ] Text is readable on all backgrounds
- [ ] No color contrast issues

## Accessibility

All color combinations meet WCAG AA standards:
- White text on Slate-800: ✅ AAA (contrast ratio > 7:1)
- Slate-800 text on Blue-100: ✅ AA (contrast ratio > 4.5:1)
- Blue-600 buttons: ✅ AA (contrast ratio > 4.5:1)

---

**Last Updated:** December 20, 2024
**Status:** Complete
**Impact:** Visual only, no functional changes
