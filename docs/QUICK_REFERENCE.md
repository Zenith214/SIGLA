# CPAP Spreadsheet - Quick Reference Card

## 🎯 What Changed?

### Before
- Auto-created CPAP on page load
- Form-based interface (modal popups)
- One item at a time editing

### After
- "Create a Plan" button when no CPAP exists
- Spreadsheet interface (full view)
- Edit all items at once
- Organized by service areas

## 🗺️ Navigation

```
Dashboard → /cpap → /cpap/editor
                ↑         ↓
                └─────────┘
```

## 📊 Spreadsheet Structure

### 13 Columns
1. Results/Observations
2. Plan of Action
3. Activity
4. Output
5. Actual Output
6. Status of Accomplishment
7. Implementation Schedule
8. Actual Date
9. Financial Requirements
10. Responsible Person/Office
11. Committed/To be Committed
12. Means of Verification
13. Actions (Delete)

### 8 Service Areas (6 Total)
1. FINANCIAL ADMINISTRATION
2. DISASTER PREPAREDNESS
3. SOCIAL PROTECTION
4. SAFETY AND PEACE
5. BUSINESS-FRIENDLY
6. ENVIRONMENTAL MANAGEMENT

## 🎮 Controls

| Action | How To |
|--------|--------|
| Create CPAP | Click "Create a Plan" on `/cpap` |
| Edit CPAP | Click "Edit in Spreadsheet View" |
| Add Row | Click "+ Add row for [Area]" |
| Delete Row | Click trash icon in Actions column |
| Save | Click "Save Plan" or "Save All Changes" |
| Navigate Back | Click ← arrow in header |
| Move Between Cells | Press Tab key |

## 📁 Files

### New
- `src/app/cpap/editor/page.tsx`
- `src/components/cpap/CPAPSpreadsheet.tsx`

### Modified
- `src/app/cpap/page.tsx`

## 🧪 Quick Test

1. Go to `/cpap`
2. Click "Create a Plan"
3. Add row to HEALTH
4. Fill in some data
5. Click "Save Plan"
6. Go back to `/cpap`
7. Click "Edit in Spreadsheet View"
8. Verify data is there

## 🎨 Key UI Elements

- **Header**: "Barangay of:" + Survey Cycle Title
- **Service Area Headers**: Blue background
- **Add Row Buttons**: Blue text, ghost style
- **Delete Buttons**: Red trash icon
- **Save Buttons**: Blue, solid background
- **Empty State**: Centered "Add row" button

## 💾 Data Persistence

### Saved to Database
- Service Area → `priority_area`
- Output → `target_output`
- Actual Output → `actual_output`
- Status → `accomplishment_status`
- Schedule → `timeline_start` + `timeline_end`
- Responsible Person → `responsible_person`
- Verification → `success_indicator`

### Frontend Only (Not Saved Yet)
- Observation
- Plan of Action
- Activity
- Actual Date
- Financial Requirements
- Committed/To be Committed

## ⚡ Keyboard Shortcuts

- **Tab**: Next cell
- **Shift+Tab**: Previous cell
- **Enter**: New line in textarea
- **Esc**: (Future: Cancel edit)

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Can't access page | Check user role (Officer/Admin only) |
| No barangay shown | User needs barangay assignment |
| Changes not saving | Click save button, check network |
| Deleted row by mistake | Refresh if not saved yet |

## 📞 Need Help?

1. Check `CPAP_IMPLEMENTATION_README.md`
2. Review `docs/CPAP_SPREADSHEET_USER_GUIDE.md`
3. See `docs/CPAP_TESTING_CHECKLIST.md`
4. Contact system administrator

## ✅ Status

- ✅ Frontend Complete
- ✅ No Backend Changes Needed
- ✅ Ready for Testing
- ⏳ Backend Work for Additional Columns (Future)

---

**Version:** 1.0.0 | **Date:** Dec 20, 2024 | **Status:** Ready
