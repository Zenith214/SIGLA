# Trend Skip Cycles Implementation

**Date:** January 19, 2026  
**Issue:** Trends showing "baseline" when barangay has historical data but was not surveyed in immediate previous cycle  
**Solution:** Smart cycle lookup that skips cycles with no data  
**Status:** ✅ IMPLEMENTED

---

## Problem Statement

### Scenario
A barangay has been surveyed in multiple cycles but was not surveyed in the most recent cycle (e.g., didn't pass awardee criteria):

```
Cycle 1 (2022): Barangay A surveyed ✅ (Satisfaction: 75%)
Cycle 2 (2023): Barangay A surveyed ✅ (Satisfaction: 80%)
Cycle 3 (2024): Barangay A NOT surveyed ❌ (didn't pass awardee)
Cycle 4 (2025): Barangay A surveyed ✅ (Satisfaction: 85%) [CURRENT]
```

### Previous Behavior ❌
- System looked at Cycle 3 (immediate previous)
- Found no data for Barangay A
- Returned: `{ direction: 'baseline', available: false }`
- UI displayed: "📊 Baseline Survey"
- **Problem:** This is misleading! The barangay has historical data from Cycles 1 & 2

### Expected Behavior ✅
- System should skip Cycle 3 (no data)
- Compare Cycle 4 vs Cycle 2 (most recent cycle with data)
- Return: `{ change: +5, direction: 'up', previousCycle: 'Survey Cycle 2023' }`
- UI displays: "↑ +5% vs Survey Cycle 2023*"
- The asterisk (*) indicates cycles were skipped

---

## Solution: Smart Cycle Lookup

### Algorithm

1. **Find immediate previous cycle** (by cycle_id and year)
2. **Check if barangay has data** in that cycle
3. **If no data found:**
   - Look for next older cycle
   - Check if barangay has data
   - Repeat up to 5 times
4. **If data found:**
   - Use that cycle for comparison
   - Track how many cycles were skipped
5. **If no data found after 5 attempts:**
   - Return baseline (truly no historical data)

### Code Implementation

**File:** `src/app/api/ml/funnel-analysis/route.ts`

```typescript
// Try to find a previous cycle with actual data for this barangay
let previousResponses: any[] | null = null;
let actualPreviousCycle = previousCycle;
let attemptsRemaining = 5; // Check up to 5 previous cycles

while (attemptsRemaining > 0 && (!previousResponses || previousResponses.length === 0)) {
  // Query for responses in this cycle
  const { data: responses } = await supabaseAdmin
    .from('survey_response')
    .select(...)
    .eq('barangay_id', barangayId)
    .eq('survey_cycle_id', actualPreviousCycle.cycle_id)
    .eq('survey_section.section_key', serviceArea);

  if (responses && responses.length > 0) {
    // Found data!
    previousResponses = responses;
    break;
  }

  // No data, try next older cycle
  const { data: olderCycle } = await supabaseAdmin
    .from('survey_cycle')
    .select('cycle_id, name, year, is_active')
    .lt('cycle_id', actualPreviousCycle.cycle_id)
    .order('cycle_id', { ascending: false })
    .limit(1)
    .single();

  if (!olderCycle) break;
  
  actualPreviousCycle = olderCycle;
  attemptsRemaining--;
}
```

---

## UI Updates

### Trend Badge with Skip Indicator

**Before:**
```
↑ +5% vs Survey Cycle 2023
```

**After (when cycles skipped):**
```
↑ +5% vs Survey Cycle 2023*
```

The asterisk (*) appears when `cyclesSkipped > 0`

### Tooltip on Hover

When you hover over a trend badge with an asterisk, you see:
```
Compared to Survey Cycle 2023 (skipped 1 cycle with no data)
```

Or for multiple skipped cycles:
```
Compared to Survey Cycle 2021 (skipped 3 cycles with no data)
```

### Implementation

**File:** `src/app/reportcard/page.tsx`

```tsx
const cyclesSkipped = trend.cyclesSkipped || 0;

<span 
  className={...}
  title={cyclesSkipped > 0 
    ? `Compared to ${trend.previousCycle} (skipped ${cyclesSkipped} cycle${cyclesSkipped > 1 ? 's' : ''} with no data)` 
    : undefined
  }
>
  {isUp ? '↑' : isDown ? '↓' : '→'} 
  {trend.change > 0 ? '+' : ''}{trend.change}% 
  vs {trend.previousCycle}
  {cyclesSkipped > 0 ? '*' : ''}
</span>
```

---

## Examples

### Example 1: Skip 1 Cycle

**Data:**
- Cycle 1 (2022): Barangay A - 75% satisfaction ✅
- Cycle 2 (2023): Barangay A - 80% satisfaction ✅
- Cycle 3 (2024): Barangay A - NO DATA ❌
- Cycle 4 (2025): Barangay A - 85% satisfaction ✅ [CURRENT]

**Result:**
```json
{
  "change": 5,
  "direction": "up",
  "available": true,
  "previousCycle": "Survey Cycle 2023",
  "previousCycleYear": 2023,
  "cyclesSkipped": 1
}
```

**UI Display:**
```
↑ +5% vs Survey Cycle 2023*
```

**Tooltip:**
```
Compared to Survey Cycle 2023 (skipped 1 cycle with no data)
```

---

### Example 2: Skip 2 Cycles

**Data:**
- Cycle 1 (2021): Barangay B - 70% satisfaction ✅
- Cycle 2 (2022): Barangay B - NO DATA ❌
- Cycle 3 (2023): Barangay B - NO DATA ❌
- Cycle 4 (2024): Barangay B - 65% satisfaction ✅ [CURRENT]

**Result:**
```json
{
  "change": -5,
  "direction": "down",
  "available": true,
  "previousCycle": "Survey Cycle 2021",
  "previousCycleYear": 2021,
  "cyclesSkipped": 2
}
```

**UI Display:**
```
↓ -5% vs Survey Cycle 2021*
```

**Tooltip:**
```
Compared to Survey Cycle 2021 (skipped 2 cycles with no data)
```

---

### Example 3: No Historical Data (True Baseline)

**Data:**
- Cycle 1 (2022): Barangay C - NO DATA ❌
- Cycle 2 (2023): Barangay C - NO DATA ❌
- Cycle 3 (2024): Barangay C - NO DATA ❌
- Cycle 4 (2025): Barangay C - 80% satisfaction ✅ [CURRENT]

**Result:**
```json
{
  "change": 0,
  "direction": "baseline",
  "available": false,
  "message": "No historical data available for this barangay"
}
```

**UI Display:**
```
📊 Baseline Survey
```

---

### Example 4: No Cycles Skipped (Normal)

**Data:**
- Cycle 1 (2023): Barangay D - 75% satisfaction ✅
- Cycle 2 (2024): Barangay D - 80% satisfaction ✅
- Cycle 3 (2025): Barangay D - 85% satisfaction ✅ [CURRENT]

**Result:**
```json
{
  "change": 5,
  "direction": "up",
  "available": true,
  "previousCycle": "Survey Cycle 2024",
  "previousCycleYear": 2024,
  "cyclesSkipped": 0
}
```

**UI Display:**
```
↑ +5% vs Survey Cycle 2024
```

**No asterisk** because no cycles were skipped.

---

## Benefits

### 1. Accurate Historical Context
- Barangays with gaps in survey participation still show meaningful trends
- Users can see long-term progress even with intermittent surveys

### 2. Transparency
- The asterisk (*) indicates something unusual happened
- Tooltip explains exactly what was skipped
- Users understand the comparison is not with immediate previous cycle

### 3. Flexibility
- Handles various survey participation patterns
- Works for barangays that:
  - Are surveyed every cycle (normal)
  - Skip occasional cycles (awardee criteria)
  - Have long gaps in participation
  - Are surveyed for the first time (baseline)

### 4. Prevents Misleading "Baseline" Labels
- "Baseline" now only appears for truly first-time surveys
- Barangays with historical data always show trends (if available)

---

## Limitations

### Maximum Lookback: 5 Cycles
The system checks up to 5 previous cycles. If a barangay hasn't been surveyed in the last 5 cycles, it shows "baseline".

**Rationale:**
- Prevents excessive database queries
- Comparisons beyond 5 cycles may not be meaningful (too much time passed)
- Can be adjusted if needed

### Service-Specific Skipping
Each service area (financial, disaster, etc.) is checked independently. A barangay might have:
- Financial data in Cycle 2 → shows trend
- Disaster data missing in all previous cycles → shows baseline

This is correct behavior since service areas are analyzed separately.

---

## Testing Scenarios

### Test 1: Skip 1 Cycle
1. Create 3 cycles (2023, 2024, 2025)
2. Survey Barangay A in 2023 and 2025 (skip 2024)
3. View Report Card for 2025
4. ✅ Should show: "↑/↓ X% vs Survey Cycle 2023*"

### Test 2: Skip Multiple Cycles
1. Create 5 cycles (2021-2025)
2. Survey Barangay B in 2021 and 2025 only
3. View Report Card for 2025
4. ✅ Should show: "↑/↓ X% vs Survey Cycle 2021*"
5. ✅ Tooltip should say "skipped 3 cycles"

### Test 3: True Baseline
1. Create 3 cycles
2. Survey Barangay C only in current cycle
3. View Report Card
4. ✅ Should show: "📊 Baseline Survey"

### Test 4: Normal (No Skip)
1. Create 3 cycles
2. Survey Barangay D in all cycles
3. View Report Card
4. ✅ Should show: "↑/↓ X% vs [previous cycle]" (no asterisk)

---

## Console Logs

The implementation includes detailed logging to track the cycle lookup process:

```
🔍 [TREND] Calculating trend for financial, Barangay 17, Current Cycle 4
✅ [TREND] Found previous cycle: Survey Cycle 2024 (ID: 3)
🔍 [TREND] Attempt 1: Fetching responses for Barangay 17, Cycle 3, Service financial...
🔍 [TREND] Query result: { cycleId: 3, cycleName: 'Survey Cycle 2024', count: 0 }
⚠️ [TREND] No data in Survey Cycle 2024, looking for older cycle...
🔍 [TREND] Attempt 2: Fetching responses for Barangay 17, Cycle 2, Service financial...
🔍 [TREND] Query result: { cycleId: 2, cycleName: 'Survey Cycle 2023', count: 150 }
✅ [TREND] Found 150 responses in Survey Cycle 2023
🔍 [TREND] Calculating scores from 150 previous responses...
✅ [TREND] Trend calculated successfully: { change: 5, direction: 'up' }
🎉 [TREND] Returning trend result: { 
  change: 5, 
  direction: 'up', 
  previousCycle: 'Survey Cycle 2023',
  cyclesSkipped: 1
}
```

---

## Files Modified

### Backend
- **src/app/api/ml/funnel-analysis/route.ts**
  - Updated `calculateTrend()` function
  - Added cycle lookup loop (up to 5 attempts)
  - Added `cyclesSkipped` to trend result

### Frontend
- **src/app/reportcard/page.tsx**
  - Added asterisk (*) indicator for skipped cycles
  - Added tooltip with skip explanation
  - Updated both grid view and modal view

---

## Summary

The trend system now intelligently handles gaps in survey participation:

✅ **Skips cycles with no data** and finds the most recent cycle with data  
✅ **Shows asterisk (*)** when cycles are skipped  
✅ **Provides tooltip** explaining what was skipped  
✅ **Prevents misleading "baseline"** labels for barangays with historical data  
✅ **Maintains accuracy** by comparing actual historical data  
✅ **Handles edge cases** like true baselines and normal comparisons  

This makes trends more meaningful and accurate for barangays with intermittent survey participation!
