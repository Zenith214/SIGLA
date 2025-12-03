# Survey Cycle Creation - Year Mismatch Fix

## Issue
When creating "Survey Cycle 2026", the database stored `year: 2025` instead of `year: 2026`, causing the mock data generator to create questionnaires with the wrong year prefix (2025-10-01-001 instead of 2026-10-01-001).

## Root Cause
The survey cycle creation form in `src/app/settings/ui/sections/survey-cycles.tsx` had:
1. **Hardcoded default year**: `selectedYear` was initialized to `"2024"` instead of the current year
2. **No validation**: No warning when the cycle name contains a year that doesn't match the selected year dropdown
3. **Limited year options**: Only years 2024-2027 were available in the dropdown

This meant users could:
- Type "Survey Cycle 2026" in the name field
- Forget to change the year dropdown from its default
- Create a cycle with mismatched name and year

## Solutions Applied

### 1. Fixed Database (Immediate Fix)
Created `scripts/fix-cycle-year.js` to update cycle ID 21:
```javascript
await supabase
  .from('survey_cycle')
  .update({ year: 2026 })
  .eq('cycle_id', 21);
```

**Result:**
- Cycle ID 21 now correctly has `year: 2026`
- Mock data generator now creates questionnaires with 2026 prefix

### 2. Improved Form (Prevents Future Issues)
Updated `src/app/settings/ui/sections/survey-cycles.tsx`:

#### a) Dynamic Default Year
```typescript
// Before
const [selectedYear, setSelectedYear] = useState("2024")

// After
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
```

#### b) Year Mismatch Validation
```typescript
// Warn if cycle name contains a year that doesn't match selected year
const yearInName = cycleName.match(/\d{4}/);
if (yearInName && yearInName[0] !== selectedYear) {
  toast({
    variant: "destructive",
    title: "Year Mismatch",
    description: `The cycle name contains "${yearInName[0]}" but you selected year ${selectedYear}. Please make sure they match.`,
  });
  return
}
```

#### c) Dynamic Year Dropdown
```typescript
// Before: Hardcoded 2024-2027
<SelectItem value="2024">2024</SelectItem>
<SelectItem value="2025">2025</SelectItem>
<SelectItem value="2026">2026</SelectItem>
<SelectItem value="2027">2027</SelectItem>

// After: Dynamic range (current year - 2 to current year + 7)
{Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - 2 + i;
  return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
})}
```

## Verification

### Check Script
Created `scripts/check-cycle-data.js` to verify all cycles:
```bash
node scripts/check-cycle-data.js
```

**Output:**
```
✅ All cycle names match their year values

🎯 Active Cycle: Survey Cycle 2026 (ID: 21, Year: 2026)
```

### Form Validation
Now when creating a cycle:
1. Year defaults to current year (2025 in December 2025)
2. If you type "Survey Cycle 2026" but select year 2025, you get an error
3. Year dropdown shows 2023-2032 (dynamic range)

## Testing
1. Try creating a cycle named "Survey Cycle 2027" with year 2026 selected → Should show error
2. Try creating a cycle named "Survey Cycle 2027" with year 2027 selected → Should succeed
3. Verify the year dropdown shows current year by default
4. Run mock data generator → Should create questionnaires with correct year prefix

## Files Modified
- `src/app/settings/ui/sections/survey-cycles.tsx` - Form improvements
- `scripts/fix-cycle-year.js` - Database fix script
- `scripts/check-cycle-data.js` - Verification script
