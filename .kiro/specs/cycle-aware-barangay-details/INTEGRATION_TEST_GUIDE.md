# Cycle-Aware Barangay Details - Integration Test Guide

This document provides a comprehensive manual testing guide for verifying the cycle-aware barangay details feature integration.

## Test Environment Setup

### Prerequisites
- Application running locally (`npm run dev`)
- Database seeded with:
  - Multiple barangays
  - Multiple survey cycles (at least 2)
  - Survey responses for at least some barangays
- User logged in with appropriate permissions

### Test Data Requirements
- At least 3 barangays with survey data
- At least 2 survey cycles (one active, one historical)
- At least 1 barangay with no data in historical cycle
- At least 1 barangay with data in multiple cycles

---

## Test Suite 1: Cycle Selection Updates BarangayDetailsCard

### Test 1.1: Initial Load with Active Cycle
**Steps:**
1. Navigate to Map Dashboard
2. Verify HistoricalCycleSelector shows "Current cycle data" or active cycle name
3. Click on any barangay on the map
4. Observe BarangayDetailsCard

**Expected Results:**
- ✓ BarangayDetailsCard displays barangay name in header
- ✓ Cycle name and year shown below barangay name
- ✓ No "Historical" badge displayed (active cycle)
- ✓ Static info (population, households, area, status) displayed
- ✓ Satisfaction data section shows either:
  - Loading skeleton (briefly)
  - Satisfaction scores with service breakdown
  - "No data available" message

**Status:** [ ] Pass [ ] Fail

---

### Test 1.2: Switch to Historical Cycle
**Steps:**
1. With a barangay selected, click HistoricalCycleSelector dropdown
2. Select a historical cycle (not the active one)
3. Observe BarangayDetailsCard updates

**Expected Results:**
- ✓ Card header updates with new cycle name and year
- ✓ "Historical" badge appears next to cycle name
- ✓ Loading skeleton appears briefly
- ✓ Satisfaction data updates to show historical cycle data
- ✓ Static barangay info remains unchanged
- ✓ Service area scores update (if data exists)
- ✓ Response count updates to reflect historical cycle

**Status:** [ ] Pass [ ] Fail

---

### Test 1.3: Switch Back to Active Cycle
**Steps:**
1. With historical cycle selected, open HistoricalCycleSelector
2. Select the active cycle or "Current cycle data"
3. Observe BarangayDetailsCard updates

**Expected Results:**
- ✓ "Historical" badge disappears
- ✓ Cycle name updates to active cycle
- ✓ Satisfaction data updates to current cycle
- ✓ Transition is smooth without layout shift

**Status:** [ ] Pass [ ] Fail

---

### Test 1.4: Rapid Cycle Switching
**Steps:**
1. Quickly switch between 3-4 different cycles
2. Observe loading states and data updates

**Expected Results:**
- ✓ Each cycle change triggers loading state
- ✓ Data updates correctly for each cycle
- ✓ No race conditions (final data matches selected cycle)
- ✓ No console errors
- ✓ UI remains responsive

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 2: Barangay Selection Shows Correct Cycle Data

### Test 2.1: Select Different Barangays with Same Cycle
**Steps:**
1. Select a specific cycle (e.g., Survey Cycle 2025)
2. Click on Barangay A
3. Note the satisfaction score
4. Click on Barangay B
5. Note the satisfaction score

**Expected Results:**
- ✓ Each barangay shows different satisfaction data
- ✓ Cycle name remains the same
- ✓ Static info updates for each barangay
- ✓ Service area scores are different (or both show no data)
- ✓ Response counts are different

**Status:** [ ] Pass [ ] Fail

---

### Test 2.2: Select Same Barangay with Different Cycles
**Steps:**
1. Select Barangay A
2. Note satisfaction score for active cycle
3. Switch to historical cycle (e.g., 2024)
4. Note satisfaction score
5. Compare the two scores

**Expected Results:**
- ✓ Satisfaction scores are different (or one shows no data)
- ✓ Service area breakdown differs between cycles
- ✓ Response counts differ
- ✓ Static barangay info remains the same
- ✓ Cycle indicator updates correctly

**Status:** [ ] Pass [ ] Fail

---

### Test 2.3: Deselect and Reselect Barangay
**Steps:**
1. Select a barangay with a specific cycle
2. Click on empty area of map to deselect
3. Verify BarangayDetailsCard shows placeholder
4. Reselect the same barangay

**Expected Results:**
- ✓ Placeholder message appears when deselected
- ✓ Data reloads when reselected
- ✓ Same cycle is still selected
- ✓ Data matches previous selection

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 3: Cache Functionality

### Test 3.1: Cache Hit on Revisit
**Steps:**
1. Select Barangay A with Cycle 1
2. Wait for data to load completely
3. Select Barangay B with Cycle 1
4. Wait for data to load
5. Select Barangay A again (same cycle)
6. Observe loading behavior

**Expected Results:**
- ✓ Data appears almost instantly (< 100ms)
- ✓ No loading skeleton shown (or very brief)
- ✓ Data is identical to first load
- ✓ Console shows cache hit (if logging enabled)

**Status:** [ ] Pass [ ] Fail

---

### Test 3.2: Cache Miss on Different Cycle
**Steps:**
1. Select Barangay A with Cycle 1
2. Wait for data to load
3. Switch to Cycle 2 (same barangay)
4. Observe loading behavior

**Expected Results:**
- ✓ Loading skeleton appears
- ✓ New data is fetched from API
- ✓ Data is different from Cycle 1
- ✓ Console shows cache miss (if logging enabled)

**Status:** [ ] Pass [ ] Fail

---

### Test 3.3: Cache Expiration (5 minutes)
**Steps:**
1. Select Barangay A with Cycle 1
2. Wait for data to load
3. Wait 6 minutes (or modify cache TTL for testing)
4. Select Barangay A with Cycle 1 again
5. Observe loading behavior

**Expected Results:**
- ✓ Loading skeleton appears
- ✓ Fresh data is fetched from API
- ✓ Cache entry was expired and refreshed

**Status:** [ ] Pass [ ] Fail (or N/A if TTL not modified)

---

## Test Suite 4: Error States and Retry Functionality

### Test 4.1: Network Error Handling
**Steps:**
1. Open browser DevTools Network tab
2. Set network to "Offline" mode
3. Select a barangay
4. Observe error handling

**Expected Results:**
- ✓ Error message appears in red box
- ✓ Message says "Unable to Load Data"
- ✓ Error details shown (e.g., "Failed to fetch")
- ✓ "Try Again" button is visible
- ✓ Static barangay info still displayed
- ✓ No console errors that crash the app

**Status:** [ ] Pass [ ] Fail

---

### Test 4.2: Retry After Network Error
**Steps:**
1. With network offline and error displayed
2. Set network back to "Online"
3. Click "Try Again" button
4. Observe behavior

**Expected Results:**
- ✓ Loading skeleton appears
- ✓ Data loads successfully
- ✓ Error message disappears
- ✓ Satisfaction data displays correctly

**Status:** [ ] Pass [ ] Fail

---

### Test 4.3: API Error (500)
**Steps:**
1. Use browser DevTools to block or modify API response
2. Select a barangay
3. Observe error handling

**Expected Results:**
- ✓ Error message appears
- ✓ Retry button available
- ✓ Application doesn't crash
- ✓ User can still interact with other parts of UI

**Status:** [ ] Pass [ ] Fail (or N/A if cannot simulate)

---

### Test 4.4: Cached Data During Error
**Steps:**
1. Select Barangay A with Cycle 1
2. Wait for data to load (now cached)
3. Set network to offline
4. Switch to Cycle 2 (will error)
5. Switch back to Cycle 1
6. Observe behavior

**Expected Results:**
- ✓ Cycle 2 shows error message
- ✓ Cycle 1 loads from cache successfully
- ✓ No network request made for Cycle 1
- ✓ Data displays correctly

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 5: No Data Scenarios

### Test 5.1: Barangay with No Data in Selected Cycle
**Steps:**
1. Identify a barangay with no survey responses in a specific cycle
2. Select that cycle
3. Select that barangay
4. Observe display

**Expected Results:**
- ✓ Blue info box appears
- ✓ Message says "No Data Available"
- ✓ Explains no satisfaction data collected
- ✓ Shows barangay name and cycle name in message
- ✓ Suggests trying different cycle
- ✓ Static barangay info still displayed
- ✓ No satisfaction scores or service areas shown

**Status:** [ ] Pass [ ] Fail

---

### Test 5.2: Barangay with Data in One Cycle, None in Another
**Steps:**
1. Find a barangay with data in active cycle
2. Select barangay, verify data shows
3. Switch to historical cycle where barangay has no data
4. Observe transition

**Expected Results:**
- ✓ Active cycle shows satisfaction data
- ✓ Historical cycle shows "No Data Available" message
- ✓ Transition is smooth
- ✓ Static info remains consistent

**Status:** [ ] Pass [ ] Fail

---

### Test 5.3: All Barangays Have No Data in Cycle
**Steps:**
1. Select a very old historical cycle (if available)
2. Try selecting multiple barangays
3. Observe consistent behavior

**Expected Results:**
- ✓ All barangays show "No Data Available"
- ✓ Message is consistent across barangays
- ✓ No errors in console
- ✓ UI remains functional

**Status:** [ ] Pass [ ] Fail (or N/A if no such cycle)

---

## Test Suite 6: Responsive Layout (Mobile)

### Test 6.1: Mobile Viewport (375px width)
**Steps:**
1. Open browser DevTools
2. Set device to iPhone SE or custom 375px width
3. Navigate to Map Dashboard
4. Observe layout

**Expected Results:**
- ✓ BarangayDetailsCard is visible (or accessible via mobile view)
- ✓ Service area grid stacks vertically (1 column)
- ✓ Text is readable without horizontal scroll
- ✓ Buttons are tappable (min 44px touch target)
- ✓ No content overflow

**Status:** [ ] Pass [ ] Fail

---

### Test 6.2: Tablet Viewport (768px width)
**Steps:**
1. Set device to iPad or custom 768px width
2. Navigate to Map Dashboard
3. Select barangay and cycle
4. Observe layout

**Expected Results:**
- ✓ Service area grid shows 2 columns
- ✓ Card layout is optimized for tablet
- ✓ All content is accessible
- ✓ Touch interactions work smoothly

**Status:** [ ] Pass [ ] Fail

---

### Test 6.3: Desktop Viewport (1920px width)
**Steps:**
1. Set viewport to 1920px width
2. Navigate to Map Dashboard
3. Select barangay and cycle
4. Observe layout

**Expected Results:**
- ✓ Service area grid shows 2 columns
- ✓ Card doesn't stretch too wide
- ✓ Content is well-proportioned
- ✓ No wasted space

**Status:** [ ] Pass [ ] Fail

---

### Test 6.4: Orientation Change (Mobile)
**Steps:**
1. Set device to mobile viewport
2. Select a barangay
3. Rotate device (portrait ↔ landscape)
4. Observe layout adaptation

**Expected Results:**
- ✓ Layout adapts to new orientation
- ✓ Data remains visible
- ✓ No layout breaks
- ✓ Selected barangay remains selected

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 7: Loading and Transition States

### Test 7.1: Initial Loading State
**Steps:**
1. Clear browser cache
2. Navigate to Map Dashboard
3. Select a barangay
4. Observe loading sequence

**Expected Results:**
- ✓ Skeleton loader appears immediately
- ✓ Static info displays while satisfaction data loads
- ✓ Skeleton has proper animation
- ✓ Skeleton matches final layout structure
- ✓ Transition from skeleton to data is smooth

**Status:** [ ] Pass [ ] Fail

---

### Test 7.2: Cycle Switch Loading State
**Steps:**
1. Select a barangay with data
2. Switch to different cycle
3. Observe loading behavior

**Expected Results:**
- ✓ Skeleton loader appears
- ✓ Previous data fades out smoothly
- ✓ New data fades in smoothly
- ✓ No jarring layout shifts
- ✓ Static info remains stable

**Status:** [ ] Pass [ ] Fail

---

### Test 7.3: Fast Network (< 100ms response)
**Steps:**
1. Use browser DevTools to simulate fast 3G or better
2. Select multiple barangays rapidly
3. Observe loading states

**Expected Results:**
- ✓ Loading state may be very brief or not visible
- ✓ Data updates smoothly
- ✓ No flickering
- ✓ UI feels responsive

**Status:** [ ] Pass [ ] Fail

---

### Test 7.4: Slow Network (> 2s response)
**Steps:**
1. Use browser DevTools to simulate slow 3G
2. Select a barangay
3. Observe loading state duration

**Expected Results:**
- ✓ Skeleton loader visible for extended period
- ✓ User can still interact with other UI elements
- ✓ Loading doesn't block entire interface
- ✓ Eventually loads or shows error (timeout at 10s)

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 8: Visual Design and Accessibility

### Test 8.1: Color Coding Accuracy
**Steps:**
1. Find barangays with different satisfaction scores
2. Verify color coding matches thresholds

**Expected Results:**
- ✓ Score ≥ 70%: Green color (bg-green-500)
- ✓ Score 50-69%: Yellow color (bg-yellow-500)
- ✓ Score < 50%: Red color (bg-red-500)
- ✓ No data: Gray color (bg-gray-400)
- ✓ Colors are consistent across overall and service scores

**Status:** [ ] Pass [ ] Fail

---

### Test 8.2: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate through interface
2. Try to interact with HistoricalCycleSelector using keyboard
3. Try to click retry button using Enter key

**Expected Results:**
- ✓ All interactive elements are focusable
- ✓ Focus indicator is visible
- ✓ Can open dropdown with keyboard
- ✓ Can select cycle with keyboard
- ✓ Can trigger retry with Enter/Space

**Status:** [ ] Pass [ ] Fail

---

### Test 8.3: Screen Reader Compatibility
**Steps:**
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate to BarangayDetailsCard
3. Listen to announcements

**Expected Results:**
- ✓ Barangay name is announced
- ✓ Cycle information is announced
- ✓ Satisfaction scores are announced with context
- ✓ Service area names and scores are announced
- ✓ Error messages are announced
- ✓ Loading states are announced

**Status:** [ ] Pass [ ] Fail (or N/A if no screen reader)

---

### Test 8.4: Color Contrast
**Steps:**
1. Use browser DevTools or WAVE tool
2. Check color contrast ratios
3. Verify text readability

**Expected Results:**
- ✓ All text meets WCAG AA standards (4.5:1 for normal text)
- ✓ Color-coded badges have sufficient contrast
- ✓ Error messages are readable
- ✓ Disabled states are distinguishable

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 9: Edge Cases

### Test 9.1: Very Long Barangay Name
**Steps:**
1. If available, select a barangay with a long name
2. Observe header layout

**Expected Results:**
- ✓ Name doesn't overflow card
- ✓ Text wraps appropriately
- ✓ Cycle info remains visible
- ✓ Layout doesn't break

**Status:** [ ] Pass [ ] Fail (or N/A)

---

### Test 9.2: Zero Responses
**Steps:**
1. Find a barangay with 0 responses in a cycle
2. Select that combination
3. Observe display

**Expected Results:**
- ✓ Shows "No Data Available" message
- ✓ Doesn't show "Based on 0 responses"
- ✓ No division by zero errors

**Status:** [ ] Pass [ ] Fail (or N/A)

---

### Test 9.3: Exactly One Response
**Steps:**
1. Find a barangay with exactly 1 response
2. Select that combination
3. Observe display

**Expected Results:**
- ✓ Shows satisfaction data
- ✓ Text says "Based on 1 response" (singular)
- ✓ Scores calculate correctly
- ✓ No errors

**Status:** [ ] Pass [ ] Fail (or N/A)

---

### Test 9.4: All Service Scores are Null
**Steps:**
1. Find a barangay where service scores are null
2. Select that combination
3. Observe service area display

**Expected Results:**
- ✓ All service areas show "N/A"
- ✓ No errors in console
- ✓ Layout remains intact
- ✓ Overall satisfaction may still show (if available)

**Status:** [ ] Pass [ ] Fail (or N/A)

---

### Test 9.5: Browser Back/Forward Navigation
**Steps:**
1. Select a barangay and cycle
2. Navigate to different page
3. Use browser back button
4. Observe state restoration

**Expected Results:**
- ✓ Returns to Map Dashboard
- ✓ Selected barangay may or may not be restored (acceptable either way)
- ✓ No errors occur
- ✓ Page is functional

**Status:** [ ] Pass [ ] Fail

---

## Test Suite 10: Performance

### Test 10.1: Initial Page Load Time
**Steps:**
1. Clear browser cache
2. Open browser DevTools Performance tab
3. Navigate to Map Dashboard
4. Measure time to interactive

**Expected Results:**
- ✓ Page loads in < 3 seconds on good connection
- ✓ No blocking JavaScript
- ✓ Progressive rendering
- ✓ Lighthouse score > 80

**Status:** [ ] Pass [ ] Fail

---

### Test 10.2: Memory Usage
**Steps:**
1. Open browser DevTools Memory tab
2. Take heap snapshot
3. Select 20+ different barangay/cycle combinations
4. Take another heap snapshot
5. Compare memory usage

**Expected Results:**
- ✓ Memory usage doesn't grow unbounded
- ✓ Cache eviction works (max 50 entries)
- ✓ No memory leaks detected
- ✓ Memory increase is reasonable (< 10MB)

**Status:** [ ] Pass [ ] Fail

---

### Test 10.3: Rapid Interactions
**Steps:**
1. Rapidly click different barangays
2. Rapidly switch cycles
3. Observe UI responsiveness

**Expected Results:**
- ✓ UI remains responsive
- ✓ No race conditions
- ✓ Final state matches last selection
- ✓ No console errors

**Status:** [ ] Pass [ ] Fail

---

## Summary

### Test Results Overview

| Test Suite | Total Tests | Passed | Failed | N/A |
|------------|-------------|--------|--------|-----|
| 1. Cycle Selection | 4 | | | |
| 2. Barangay Selection | 3 | | | |
| 3. Cache Functionality | 3 | | | |
| 4. Error States | 4 | | | |
| 5. No Data Scenarios | 3 | | | |
| 6. Responsive Layout | 4 | | | |
| 7. Loading States | 4 | | | |
| 8. Visual & A11y | 4 | | | |
| 9. Edge Cases | 5 | | | |
| 10. Performance | 3 | | | |
| **TOTAL** | **37** | | | |

### Critical Issues Found
(List any critical issues that block functionality)

1. 
2. 
3. 

### Non-Critical Issues Found
(List any minor issues or improvements)

1. 
2. 
3. 

### Recommendations
(List any recommendations for improvements)

1. 
2. 
3. 

### Sign-Off

**Tester Name:** ___________________________

**Date:** ___________________________

**Overall Status:** [ ] Approved [ ] Approved with Minor Issues [ ] Rejected

**Notes:**
