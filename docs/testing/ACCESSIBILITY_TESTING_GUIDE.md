# Accessibility Testing Guide for Two-ID System

## Overview
This guide explains how to test the accessibility improvements added to the Two-ID Questionnaire System.

## Testing Methods

### 1. Browser DevTools Inspection (Recommended for Quick Check)

**Steps:**
1. Start your development server: `npm run dev`
2. Open the application in your browser
3. Navigate to a page with questionnaire displays (e.g., FI Dashboard)
4. Right-click on an "Interview #6" element
5. Select "Inspect" or "Inspect Element"
6. In the Elements/Inspector tab, look for the `aria-label` attribute
7. Verify it shows: `aria-label="Interview number 6"`

**What to Check:**
- ✅ `aria-label` attribute is present
- ✅ Text reads "Interview number 6" (not "Interview #6")
- ✅ Fallback to full_id when display_id is null

### 2. Browser Accessibility Inspector

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to "Elements" tab
3. Click the "Accessibility" pane (bottom right)
4. Select an element with Interview #
5. Check "Computed Properties" → "Name" field
6. Should show: "Interview number 6"

**Firefox DevTools:**
1. Open DevTools (F12)
2. Go to "Accessibility" tab
3. Enable accessibility features if prompted
4. Navigate the accessibility tree
5. Find the Interview element
6. Check "Name" property

### 3. Screen Reader Testing (Most Thorough)

**Windows - NVDA (Free):**
1. Download NVDA: https://www.nvaccess.org/download/
2. Install and start NVDA
3. Open your application
4. Use Tab key to navigate
5. Listen for "Interview number 6" announcement
6. Should NOT hear "Interview hashtag 6" or complex IDs

**Windows - JAWS (Commercial):**
1. Use JAWS if available
2. Navigate with Tab/Arrow keys
3. Listen for proper announcements

**macOS - VoiceOver (Built-in):**
1. Press Cmd + F5 to enable VoiceOver
2. Navigate with VO keys (Control + Option + Arrow keys)
3. Listen for "Interview number 6"
4. Press Cmd + F5 to disable when done

**Linux - Orca (Free):**
1. Install Orca: `sudo apt-get install orca`
2. Start Orca: `orca`
3. Navigate and listen for announcements

### 4. Automated Accessibility Testing

**Using axe DevTools (Browser Extension):**
1. Install axe DevTools extension for Chrome/Firefox
2. Open your application
3. Open DevTools → axe DevTools tab
4. Click "Scan ALL of my page"
5. Review results for aria-label issues

**Using Lighthouse (Chrome Built-in):**
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Review accessibility score and issues

### 5. Manual Keyboard Navigation Test

**Steps:**
1. Open the application
2. Use only keyboard (no mouse):
   - Tab: Move forward
   - Shift + Tab: Move backward
   - Enter/Space: Activate buttons
3. Verify focus indicators are visible
4. Verify you can access all interactive elements

## Components to Test

### ✅ InterviewSlotCard
**Location:** FI Dashboard → Interview assignments
**Expected:** "Interview number 6" or "Questionnaire [full_id]"
**Test:** Navigate to FI dashboard and inspect interview cards

### ✅ QuestionnaireAssignmentModal
**Location:** FS Dashboard → Spot Assignment → Manage Questionnaire Assignments
**Expected:** 
- "Interview number 6, assigned to John Doe"
- "Interview number 6, unassigned"
- Checkbox: "Select interview 6"
**Test:** Open modal and inspect questionnaire list items

### ✅ SpotAssignmentPanel
**Location:** FS Dashboard → Spot Assignment
**Expected:**
- "Spot [name]"
- "Location coordinates: [lat], [lng]"
- "Status: [status]"
**Test:** View spot list and inspect spot cards

### ✅ Survey Form Header
**Location:** Survey Forms → Header
**Expected:** "Interview number 6" or "Questionnaire [full_id]"
**Test:** Start a survey and inspect the header

## Quick Verification Checklist

- [ ] All "Interview #6" displays have aria-label="Interview number 6"
- [ ] Screen reader announces "Interview number 6" (not "Interview hashtag 6")
- [ ] Fallback works when display_id is null (shows full_id)
- [ ] No console errors related to accessibility
- [ ] Keyboard navigation works smoothly
- [ ] Focus indicators are visible
- [ ] All interactive elements are reachable via keyboard

## Common Issues and Solutions

### Issue: aria-label not appearing
**Solution:** Clear browser cache and rebuild: `npm run build`

### Issue: Screen reader not announcing
**Solution:** 
- Ensure screen reader is running
- Try refreshing the page
- Check if element is focusable (add tabindex if needed)

### Issue: Wrong text being announced
**Solution:** Inspect the element and verify aria-label value matches expected format

## Testing with Real Data

1. Create test questionnaires with known display_ids
2. Navigate through the UI
3. Verify each component shows correct aria-labels
4. Test edge cases:
   - display_id = 1 (first questionnaire)
   - display_id = 150 (last questionnaire)
   - display_id = null (on-the-fly questionnaires)

## Automated Test Script (Optional)

You can create a simple test to verify aria-labels:

```javascript
// Example test using Playwright or Cypress
test('Interview cards have proper aria-labels', async () => {
  // Navigate to FI dashboard
  await page.goto('/fi-dashboard');
  
  // Find interview card
  const card = await page.locator('[aria-label*="Interview number"]').first();
  
  // Verify aria-label exists and has correct format
  const ariaLabel = await card.getAttribute('aria-label');
  expect(ariaLabel).toMatch(/Interview number \d+/);
});
```

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Success Criteria

✅ All display_id elements have descriptive aria-labels
✅ Screen readers announce "Interview number X" clearly
✅ No accessibility errors in automated scans
✅ Keyboard navigation works without issues
✅ Focus indicators are visible and clear
