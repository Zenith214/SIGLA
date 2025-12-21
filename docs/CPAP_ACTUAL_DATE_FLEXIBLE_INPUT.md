# CPAP Actual Date - Flexible Text Input

## Change Summary
Changed the "Actual Date" field from a strict date-only field to a flexible text field that accepts both dates and descriptive text.

## Reason for Change
Users need to enter various types of temporal information, not just specific dates:
- Specific dates: "2025-12-21"
- Time periods: "Within the year", "Whole school year"
- Quarters: "4th quarter", "Q1 2025"
- Ranges: "January-March 2025"
- Descriptive: "Ongoing", "As needed"

## Changes Made

### 1. Database Schema Change
**File:** `database/change-actual-date-to-text.sql`

Changed column type from DATE to TEXT:
```sql
ALTER TABLE cpap_items 
ALTER COLUMN actual_date TYPE TEXT;
```

**Before:** `actual_date DATE` (only accepts YYYY-MM-DD format)
**After:** `actual_date TEXT` (accepts any text)

### 2. Prisma Schema Update
**File:** `prisma/schema.prisma`

```prisma
// Before
actual_date DateTime? @db.Date

// After
actual_date String? @db.Text
```

### 3. Spreadsheet Component Update
**File:** `src/components/cpap/CPAPSpreadsheet.tsx`

**Input Field:**
```tsx
// Changed from type="date" to type="text"
<Input
  type="text"
  value={row.actualDate}
  onChange={(e) => updateCell(globalIndex, "actualDate", e.target.value)}
  placeholder="e.g., 2025-12-21 or Within the year"
/>
```

**Validation:**
- Removed strict date format validation
- Now accepts any text input
- Empty values saved as null

## Migration Steps

### Step 1: Run SQL Migration
Execute the SQL script in Supabase SQL Editor:

```bash
# Open database/change-actual-date-to-text.sql
# Copy and paste into Supabase SQL Editor
# Execute the query
```

### Step 2: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 3: Restart Dev Server
```bash
# Stop the dev server (Ctrl+C)
# Start it again
npm run dev
```

## Example Valid Inputs

The field now accepts any of these:

### Specific Dates
- `2025-12-21`
- `December 21, 2025`
- `21/12/2025`

### Time Periods
- `Within the year`
- `Whole school year`
- `Calendar year 2025`
- `Fiscal year 2025-2026`

### Quarters
- `4th quarter`
- `Q1 2025`
- `1st Quarter 2026`

### Ranges
- `January-March 2025`
- `2025-01-01 to 2025-03-31`
- `First half of 2025`

### Descriptive
- `Ongoing`
- `As needed`
- `Upon completion of Phase 1`
- `TBD`
- `Not yet started`

## User Experience

### Input Field
- Text input with placeholder: "e.g., 2025-12-21 or Within the year"
- Users can type any text
- No format restrictions
- No validation errors

### Display
- Shows exactly what the user typed
- No automatic formatting
- Preserves user's intended meaning

## Benefits

1. **Flexibility** - Accommodates various temporal descriptions
2. **User-Friendly** - No strict format requirements
3. **Real-World Usage** - Matches how people actually describe timeframes
4. **No Errors** - Won't reject valid descriptive text
5. **Context-Appropriate** - Users can be as specific or general as needed

## Considerations

### Pros
- ✅ Accepts any temporal description
- ✅ No validation errors
- ✅ Matches real-world usage
- ✅ Flexible for different contexts

### Cons
- ❌ No automatic date parsing
- ❌ Can't sort by date programmatically
- ❌ No date range validation
- ❌ Relies on user to enter meaningful text

## Alternative Approaches Considered

### 1. Dropdown with Common Options
- Predefined list: "Within the year", "Q1", "Q2", etc.
- **Rejected:** Too restrictive, can't cover all cases

### 2. Date Picker + Text Field Toggle
- Switch between date picker and text input
- **Rejected:** Too complex UI, confusing for users

### 3. Multiple Fields (Date + Description)
- Separate fields for date and description
- **Rejected:** Adds complexity, most users only need one

### 4. Smart Parsing (Current Choice)
- Accept any text, let users decide format
- **Chosen:** Most flexible, simplest UX

## Related Fields

| Field | Type | Format | Example |
|-------|------|--------|---------|
| Implementation Schedule | Text | Date range | "2025-12-21 - 2026-06-21" |
| Actual Date | Text | Flexible | "Within the year" or "2025-12-21" |
| Timeline Start | Date | YYYY-MM-DD | "2025-12-21" |
| Timeline End | Date | YYYY-MM-DD | "2026-06-21" |

## Testing Checklist

- [ ] Type a specific date (2025-12-21) - saves correctly
- [ ] Type "Within the year" - saves correctly
- [ ] Type "4th quarter" - saves correctly
- [ ] Type "Whole school year" - saves correctly
- [ ] Leave field empty - saves as null
- [ ] Save and reload - text displays correctly
- [ ] Check database - text stored correctly
- [ ] Verify no 500 errors
- [ ] Test in read-only view - displays correctly

## Files Modified

1. `database/change-actual-date-to-text.sql` - SQL migration script
2. `prisma/schema.prisma` - Changed DateTime to String
3. `src/components/cpap/CPAPSpreadsheet.tsx` - Changed input type and validation

## Date
December 21, 2025
