# Report Card → Score Card Renaming Summary

## Overview
Renamed all user-facing instances of "Report Card" to "Score Card" throughout the application.

---

## ✅ Files Modified

### 1. **Report Card Page** (`src/app/reportcard/page.tsx`)

**Changes Made:**
- Page title: `{barangayData.barangay} Report Card` → `{barangayData.barangay} Score Card`
- Subtitle: `Satisfaction Index Analysis Report` → `Satisfaction Index Score Card`
- Component name: `ReportCard()` → `ScoreCard()`
- Error message: `Report Not Found` → `Score Card Not Found`
- Share data title: `Satisfaction Report` → `Satisfaction Score Card`
- Share data text: `Satisfaction Index Report` → `Satisfaction Index Score Card`
- Toast message: `Report URL copied` → `Score Card URL copied`
- Prompt text: `share the report` → `share the score card`
- CSV filename: `_Report_` → `_ScoreCard_`
- CSV header: `Barangay Report Data` → `Barangay Score Card Data`
- Print title: `BARANGAY SATISFACTION INDEX REPORT` → `BARANGAY SATISFACTION INDEX SCORE CARD`
- Export menu: `Detailed PDF Report` → `Detailed PDF Score Card`

**Lines Changed:** ~15 instances

---

### 2. **Barangay List View** (`src/components/dashboard/BarangayListView.tsx`)

**Changes Made:**
- Button text: `View Report Card` → `View Score Card`
- Comment: `Navigate to report card page` → `Navigate to score card page`

**Lines Changed:** 2 instances

---

### 3. **Barangay Satisfaction Index** (`src/components/dashboard/BarangaySatisfactionIndex.tsx`)

**Changes Made:**
- Button text: `View Report Card` → `View Score Card`
- Comment: `Navigate to report card page` → `Navigate to score card page`
- Comment: `Report Card thresholds` → `Score Card thresholds`

**Lines Changed:** 3 instances

---

## 📝 Technical Notes

### What Was NOT Changed:
- **File/folder names:** `src/app/reportcard/` remains unchanged (URL path stays the same)
- **Function names:** Internal function names like `handleViewReportCard()` remain unchanged
- **Cache utility:** `reportCardCache` variable name remains unchanged
- **Console logs:** Debug messages with "REPORT CARD" remain unchanged
- **Comments in code:** Most internal comments remain unchanged
- **API routes:** No API endpoint changes

### Why Keep Technical Names?
- Maintains backward compatibility with existing URLs
- Avoids breaking links/bookmarks
- No need to update routing configuration
- Internal code references don't affect user experience

---

## 🧪 Testing Checklist

### Visual Testing:
- [ ] Dashboard: "View Score Card" button displays correctly
- [ ] Score Card page: Title shows "Score Card" not "Report Card"
- [ ] Score Card page: Subtitle shows "Score Card" not "Report"
- [ ] Share functionality: Toast shows "Score Card URL copied"
- [ ] Export menu: Shows "Detailed PDF Score Card"
- [ ] Print view: Header shows "SCORE CARD" not "REPORT"
- [ ] Error page: Shows "Score Card Not Found"

### Functional Testing:
- [ ] Clicking "View Score Card" navigates correctly
- [ ] Share button works and copies correct URL
- [ ] Export/download generates files with "ScoreCard" in filename
- [ ] Print functionality works correctly
- [ ] All existing functionality remains intact

---

## 🔍 Search Terms for Future Updates

If you need to find remaining instances:

```bash
# Search for "Report Card" (case-sensitive)
grep -r "Report Card" src/

# Search for "report card" (case-insensitive)
grep -ri "report card" src/

# Search in specific file types
grep -r "Report Card" --include="*.tsx" --include="*.ts" src/
```

---

## ✅ Completion Status

- [x] Main Score Card page - All user-facing text updated
- [x] Dashboard components - Button text updated
- [x] Share/Export functionality - Messages updated
- [x] Print view - Headers updated
- [x] Error messages - Updated
- [x] CSV exports - Filenames updated
- [x] No errors or warnings

**Status:** ✅ Complete - All user-facing "Report Card" text changed to "Score Card"
