# CPAP Spreadsheet - Bug Report & Logic Issues

## 🐛 Bugs Found

### 1. **CRITICAL: Timeline Parsing Issue in CPAPSpreadsheet**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - Line 127

**Issue:**
```typescript
timeline_start: row.implementationSchedule.split(" - ")[0] || new Date().toISOString().split("T")[0],
timeline_end: row.implementationSchedule.split(" - ")[1] || new Date().toISOString().split("T")[0],
```

**Problem:**
- If `implementationSchedule` is empty string, `split(" - ")[0]` returns `""` (empty string), not `undefined`
- Empty string is truthy in JavaScript, so the fallback `|| new Date()...` never executes
- This will cause validation errors when saving because timeline fields are required

**Fix:**
```typescript
const [startDate, endDate] = row.implementationSchedule.split(" - ");
timeline_start: startDate?.trim() || new Date().toISOString().split("T")[0],
timeline_end: endDate?.trim() || new Date().toISOString().split("T")[0],
```

**Impact:** HIGH - Prevents saving CPAPs with empty implementation schedules

---

### 2. **MEDIUM: Deleted Rows Not Tracked**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - `handleSave` function

**Issue:**
When a user deletes a row that has an `id` (existing item from database), the deletion is not tracked.

**Current Code:**
```typescript
const handleSave = () => {
  const items = rows
    .filter(row => row.output || row.observation || row.planOfAction)
    .map(row => ({
      id: row.id,
      // ... other fields
    }));
  
  onSave(items);
};
```

**Problem:**
- If a row with `id: 5` is deleted, it's simply not included in the items array
- The API expects `deleted_item_ids: [5]` to actually delete it from the database
- Currently, deleted items remain in the database

**Fix:**
```typescript
const [deletedIds, setDeletedIds] = useState<number[]>([]);

const deleteRow = (index: number) => {
  const rowToDelete = rows[index];
  if (rowToDelete.id) {
    setDeletedIds([...deletedIds, rowToDelete.id]);
  }
  const newRows = rows.filter((_, i) => i !== index);
  setRows(newRows);
};

const handleSave = () => {
  const items = rows
    .filter(row => row.output || row.observation || row.planOfAction)
    .map(row => ({
      id: row.id,
      // ... other fields
    }));
  
  onSave(items, deletedIds); // Pass deletedIds
  setDeletedIds([]); // Clear after save
};
```

**Impact:** MEDIUM - Deleted items persist in database

---

### 3. **MEDIUM: Save Button in Header Doesn't Use Spreadsheet State**
**Location:** `src/app/cpap/editor/page.tsx` - Line 197

**Issue:**
```typescript
<Button
  onClick={() => cpap && handleSave(cpap.items)}
  disabled={isSaving || !cpap}
>
```

**Problem:**
- The save button in the header saves `cpap.items` (original data)
- It doesn't save the current spreadsheet state (user's edits)
- User edits are lost when clicking the header save button

**Fix:**
The spreadsheet component should expose its current state, or we should remove the header save button and only use the one in the spreadsheet component.

**Option 1: Remove header save button**
```typescript
// Remove the save button from header, only use the one in CPAPSpreadsheet
```

**Option 2: Expose spreadsheet state**
```typescript
// In CPAPSpreadsheet, add a ref or callback to expose current rows
const spreadsheetRef = useRef<{ getCurrentItems: () => any[] }>(null);

<CPAPSpreadsheet
  ref={spreadsheetRef}
  cpap={cpap}
  onSave={handleSave}
  isSaving={isSaving}
/>

// In header button
onClick={() => {
  const items = spreadsheetRef.current?.getCurrentItems();
  if (items) handleSave(items);
}}
```

**Impact:** MEDIUM - User loses edits when clicking header save button

---

### 4. **LOW: Unused Import in Editor Page**
**Location:** `src/app/cpap/editor/page.tsx` - Line 3

**Issue:**
```typescript
import { useRouter, useSearchParams } from "next/navigation";
```

**Problem:**
- `useSearchParams` is imported but never used
- This is just code cleanliness, not a functional bug

**Fix:**
```typescript
import { useRouter } from "next/navigation";
```

**Impact:** LOW - Code cleanliness only

---

### 5. **LOW: Unused Variable in Main CPAP Page**
**Location:** `src/app/cpap/page.tsx` - Line 186

**Issue:**
```typescript
const debouncedSave = useCallback(
  (items: CPAPItemInput[], deletedIds: number[] = []) => {
    // ... implementation
  },
  [saveTimeout]
);
```

**Problem:**
- `debouncedSave` is defined but never used
- This was probably intended for auto-save functionality
- Currently just dead code

**Fix:**
Either remove it or implement auto-save:
```typescript
// Option 1: Remove it
// Delete the debouncedSave function

// Option 2: Use it for auto-save
useEffect(() => {
  if (cpap && cpap.items.length > 0) {
    debouncedSave(cpap.items);
  }
}, [cpap?.items]);
```

**Impact:** LOW - Code cleanliness only

---

### 6. **MEDIUM: Missing React Key Warning**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - Line 202

**Issue:**
```typescript
{rowsByServiceArea.map(({ area, rows: areaRows }) => (
  <>
    {/* Service Area Header Row */}
    <tr key={`header-${area}`} className="bg-blue-50">
```

**Problem:**
- React Fragment (`<>`) doesn't have a key prop
- This will cause React warnings in the console
- Can cause rendering issues when reordering

**Fix:**
```typescript
{rowsByServiceArea.map(({ area, rows: areaRows }) => (
  <React.Fragment key={`section-${area}`}>
    {/* Service Area Header Row */}
    <tr key={`header-${area}`} className="bg-blue-50">
```

Or use array instead of fragment:
```typescript
{rowsByServiceArea.flatMap(({ area, rows: areaRows }) => [
  // Service Area Header Row
  <tr key={`header-${area}`} className="bg-blue-50">
  // ... rest of rows
])}
```

**Impact:** MEDIUM - React warnings, potential rendering issues

---

### 7. **LOW: Missing Error Handling for Empty Timeline**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - Line 56

**Issue:**
```typescript
implementationSchedule: item.timeline_start && item.timeline_end 
  ? `${item.timeline_start} - ${item.timeline_end}` 
  : "",
```

**Problem:**
- If `timeline_start` or `timeline_end` contain "T" (ISO format), they're not formatted
- Example: `2024-01-01T00:00:00.000Z - 2024-12-31T00:00:00.000Z`
- This looks ugly in the UI

**Fix:**
```typescript
implementationSchedule: item.timeline_start && item.timeline_end 
  ? `${item.timeline_start.split('T')[0]} - ${item.timeline_end.split('T')[0]}` 
  : "",
```

**Impact:** LOW - UI display issue only

---

### 8. **CRITICAL: No Permission Check in Editor Page**
**Location:** `src/app/cpap/editor/page.tsx`

**Issue:**
The editor page doesn't check if the user has permission to edit CPAPs.

**Problem:**
- Any authenticated user can access `/cpap/editor`
- Viewer role should not be able to edit
- Admin role should not be able to create/edit (only review)

**Fix:**
Add permission check:
```typescript
import { usePermissions } from "@/hooks/usePermissions";

export default function CPAPEditorPage() {
  const { canEditCPAP } = usePermissions();
  
  useEffect(() => {
    if (user && !canEditCPAP) {
      router.push("/forbidden?reason=permission_denied&attempted_path=/cpap/editor");
    }
  }, [user, canEditCPAP, router]);
  
  // ... rest of component
}
```

**Impact:** HIGH - Security issue, unauthorized editing

---

### 9. **MEDIUM: No Validation Before Save**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - `handleSave` function

**Issue:**
No validation is performed before saving.

**Problem:**
- Users can save items with empty required fields
- This will cause issues when trying to submit the CPAP
- Better to validate early

**Fix:**
```typescript
const handleSave = () => {
  const items = rows
    .filter(row => row.output || row.observation || row.planOfAction)
    .map(row => {
      // Validate required fields
      if (!row.output) {
        toast({
          title: "Validation Error",
          description: "Output is required for all items",
          type: "error",
        });
        return null;
      }
      
      return {
        id: row.id,
        priority_area: row.serviceArea,
        target_output: row.output,
        // ... other fields
      };
    })
    .filter(item => item !== null);
  
  if (items.length === 0) {
    toast({
      title: "No Items to Save",
      description: "Please add at least one item with output",
      type: "warning",
    });
    return;
  }
  
  onSave(items);
};
```

**Impact:** MEDIUM - Poor user experience, validation errors later

---

### 10. **LOW: Inconsistent Date Format Handling**
**Location:** Multiple files

**Issue:**
Date formats are handled inconsistently:
- Sometimes `split('T')[0]` is used
- Sometimes dates are assumed to be in `YYYY-MM-DD` format
- No validation of date format

**Problem:**
- Can cause parsing errors
- Inconsistent display
- Hard to maintain

**Fix:**
Create a utility function:
```typescript
// src/utils/dateUtils.ts
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  return dateString.split('T')[0];
}

export function parseDateRange(rangeString: string): { start: string; end: string } {
  const [start, end] = rangeString.split(' - ').map(d => d?.trim() || '');
  return {
    start: start || new Date().toISOString().split('T')[0],
    end: end || new Date().toISOString().split('T')[0]
  };
}
```

**Impact:** LOW - Code maintainability

---

## 🔍 Logic Issues

### 1. **Empty Rows Initialization**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - Line 70

**Issue:**
When no CPAP items exist, the component creates one empty row for each service area (8 rows total).

**Problem:**
- This might be confusing for users
- They see 8 empty rows immediately
- Might think they need to fill all of them

**Suggestion:**
Start with no rows, show "Add row" buttons for each service area:
```typescript
} else {
  // Start with empty array
  setRows([]);
}
```

**Impact:** LOW - UX consideration

---

### 2. **Filter Logic for Saving**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - Line 124

**Issue:**
```typescript
.filter(row => row.output || row.observation || row.planOfAction)
```

**Problem:**
- Saves rows if ANY of these fields have content
- But `observation` and `planOfAction` are not saved to database
- So a row with only `observation` filled will be saved with empty `output`
- This will fail validation when submitting

**Fix:**
```typescript
.filter(row => row.output && row.output.trim())
```

Only save rows that have the required `output` field.

**Impact:** MEDIUM - Can save invalid data

---

### 3. **No Confirmation for Delete**
**Location:** `src/components/cpap/CPAPSpreadsheet.tsx` - `deleteRow` function

**Issue:**
Rows are deleted immediately without confirmation.

**Problem:**
- User might accidentally click delete
- No way to undo
- Data loss

**Suggestion:**
Add confirmation dialog:
```typescript
const deleteRow = (index: number) => {
  if (confirm('Are you sure you want to delete this row?')) {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
  }
};
```

**Impact:** LOW - UX improvement

---

## 📊 Summary

| Priority | Count | Issues |
|----------|-------|--------|
| CRITICAL | 3 | Timeline parsing, Permission check, Deleted rows |
| MEDIUM | 5 | Save button state, React keys, Validation, Filter logic, Deleted tracking |
| LOW | 5 | Unused imports, Date formatting, Delete confirmation, Empty rows, Code cleanup |

## 🔧 Recommended Fixes Priority

### Immediate (Before Testing)
1. ✅ Fix timeline parsing issue (#1)
2. ✅ Add permission check to editor (#8)
3. ✅ Track deleted rows properly (#2)
4. ✅ Fix save button in header (#3)

### Before Production
5. ✅ Add React Fragment keys (#6)
6. ✅ Add validation before save (#9)
7. ✅ Fix filter logic for saving (#Logic Issue #2)
8. ✅ Format timeline dates properly (#7)

### Nice to Have
9. ⏳ Remove unused code (#4, #5)
10. ⏳ Add delete confirmation (#Logic Issue #3)
11. ⏳ Create date utility functions (#10)
12. ⏳ Reconsider empty rows initialization (#Logic Issue #1)

---

**Last Updated:** December 20, 2024
**Status:** Ready for Fixes
