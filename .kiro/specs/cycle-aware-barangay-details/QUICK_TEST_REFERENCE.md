# Quick Test Reference Card

## 🚀 Quick Start Testing

### 1. Run Automated Verification
```bash
node scripts/verify-cycle-aware-components.js
```
**Expected:** All 40 checks should pass ✅

### 2. Start Development Server
```bash
npm run dev
```

### 3. Essential Manual Tests (5 minutes)

#### Test A: Basic Cycle Switching
1. Open Map Dashboard
2. Click any barangay
3. Change cycle in dropdown
4. ✓ Verify data updates

#### Test B: Barangay Switching
1. Select Barangay A
2. Note satisfaction score
3. Select Barangay B
4. ✓ Verify different data shows

#### Test C: Cache Behavior
1. Select Barangay A, Cycle 1
2. Select Barangay B, Cycle 1
3. Select Barangay A, Cycle 1 again
4. ✓ Verify instant load (cached)

#### Test D: Error Handling
1. Open DevTools Network tab
2. Set to "Offline"
3. Select a barangay
4. ✓ Verify error message shows
5. Set to "Online"
6. Click "Try Again"
7. ✓ Verify data loads

#### Test E: No Data Scenario
1. Find barangay with no historical data
2. Select old cycle
3. ✓ Verify "No Data Available" message

---

## 📱 Quick Mobile Test

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone SE
4. ✓ Verify layout works
5. ✓ Verify service areas stack vertically

---

## ✅ Success Criteria

All tests should show:
- ✓ Data updates when cycle changes
- ✓ Data updates when barangay changes
- ✓ Cache makes revisits instant
- ✓ Errors show with retry button
- ✓ No data message appears appropriately
- ✓ Mobile layout is usable

---

## 📋 Full Test Guide

For comprehensive testing, see:
`.kiro/specs/cycle-aware-barangay-details/INTEGRATION_TEST_GUIDE.md`

37 detailed test cases covering:
- Cycle selection (4 tests)
- Barangay selection (3 tests)
- Cache functionality (3 tests)
- Error handling (4 tests)
- No data scenarios (3 tests)
- Responsive layout (4 tests)
- Loading states (4 tests)
- Accessibility (4 tests)
- Edge cases (5 tests)
- Performance (3 tests)

---

## 🐛 Common Issues to Check

### Issue: Data doesn't update
- Check browser console for errors
- Verify network requests in DevTools
- Check if cycle selector is working

### Issue: Cache not working
- Check console for cache logs
- Verify same barangay + cycle combination
- Clear browser cache and retry

### Issue: Layout broken on mobile
- Check viewport width in DevTools
- Verify responsive classes in code
- Test on actual device if possible

---

## 📊 Verification Results

**Automated Checks:** 40/40 passed ✅  
**Manual Tests Required:** 37 test cases  
**Estimated Testing Time:** 30-45 minutes for full suite

---

## 🎯 Priority Testing Order

1. **Must Test** (Critical)
   - Cycle selection updates data
   - Barangay selection updates data
   - Error handling works

2. **Should Test** (Important)
   - Cache behavior
   - No data scenarios
   - Mobile responsive layout

3. **Nice to Test** (Optional)
   - Edge cases
   - Performance metrics
   - Accessibility features

---

## 📞 Need Help?

- Review implementation: `src/components/dashboard/BarangayDetailsCard.tsx`
- Check data helpers: `src/utils/satisfactionDataHelpers.ts`
- View cache logic: `src/utils/satisfactionCache.ts`
- Read design doc: `.kiro/specs/cycle-aware-barangay-details/design.md`
