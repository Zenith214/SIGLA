# Mock Data Deletion Tool - Update

## What Changed

The mock data deletion tool has been **enhanced** to provide complete cleanup of barangay data.

### Previous Behavior
- Only deleted `survey_response` and related tables
- **Did NOT delete** `questionnaires` or `spots`
- This caused the "1/150 completed" issue because questionnaires with `status='Completed'` remained in the database

### New Behavior
The tool now deletes **everything** for a barangay in the correct order:

1. ✅ Survey sections
2. ✅ Survey metadata
3. ✅ Survey answers
4. ✅ Survey attachments
5. ✅ Survey validations
6. ✅ Survey responses
7. ✅ **Questionnaires** (NEW!)
8. ✅ **Spots** (NEW!)
9. ✅ Resets survey target progress

## How to Use

### Step 1: Access the Tools Page
Navigate to: `/tools` in your application

### Step 2: Select Barangay
Choose the barangay you want to clean up from the dropdown (e.g., "Balasinon")

### Step 3: Delete Mock Data
Click the "Delete Mock Data" button and confirm

### Step 4: Verify Results
The tool will show you:
```
Successfully deleted X responses, Y questionnaires, Z spots for Barangay [Name]

Details:
- Responses: X
- Questionnaires: Y  ← NEW!
- Spots: Z  ← NEW!
- Sections: X
- Metadata: X
- Answers: X
- Attachments: X
- Validations: X
```

### Step 5: Refresh
The page will automatically reload after 2 seconds to clear all caches

## What This Fixes

### Before Update:
```
Balasinon: 1/150 Completed  ← Old questionnaire data still in DB
(But no actual interviews visible)
```

### After Update:
```
Balasinon: 0/0 Completed  ← All data cleaned up
(Ready for fresh data generation)
```

## Testing the Fix

1. **Delete old data:**
   - Go to `/tools`
   - Select "Balasinon" (or any barangay with old data)
   - Click "Delete Mock Data"
   - Confirm deletion

2. **Verify cleanup:**
   - Check the deletion results
   - Should show questionnaires and spots deleted
   - Page will auto-reload

3. **Check UI:**
   - Navigate to FI Dashboard or FS Dashboard
   - Balasinon should now show 0/0 or no spots
   - No more "1/150 completed" issue

4. **Generate fresh data:**
   - Use the mock data generator to create new data
   - New data will have proper display_ids and accessibility labels

## Technical Details

### Database Deletion Order
The tool respects foreign key constraints by deleting in this order:

```
survey_section     → depends on survey_response
survey_metadata    → depends on survey_response
survey_answer      → depends on survey_response
survey_attachment  → depends on survey_response
survey_validation  → depends on survey_response
survey_response    → depends on questionnaires
questionnaires     → depends on spots
spots              → independent
```

### SQL Queries Added
```sql
-- Count questionnaires
SELECT COUNT(*) FROM questionnaires WHERE barangay_id = $1;

-- Count spots
SELECT COUNT(*) FROM spots WHERE barangay_id = $1;

-- Delete questionnaires
DELETE FROM questionnaires WHERE barangay_id = $1;

-- Delete spots
DELETE FROM spots WHERE barangay_id = $1;
```

## Troubleshooting

### Issue: Still seeing old data after deletion
**Solution:** 
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Restart dev server

### Issue: Deletion shows 0 records deleted
**Possible causes:**
1. Wrong barangay ID selected
2. Data already deleted
3. Data exists in a different cycle

**Solution:** Check the database directly:
```sql
SELECT * FROM questionnaires WHERE barangay_id = 10;
SELECT * FROM spots WHERE barangay_id = 10;
```

### Issue: Foreign key constraint error
**Cause:** Deletion order is wrong

**Solution:** The updated tool handles this automatically. If you still see errors, there may be additional foreign key relationships not covered.

## Related Files

- **API Route:** `src/app/api/tools/delete-mock-data/route.ts`
- **UI Component:** `src/app/tools/page.tsx`
- **Related Issue:** Two-ID System Task 14 (Accessibility)

## Next Steps

After deleting old data:

1. ✅ Generate fresh mock data with the updated system
2. ✅ New data will include `display_id` fields
3. ✅ Accessibility labels will work correctly
4. ✅ UI will show "Interview #6" instead of full IDs

## Notes

- This is a **destructive operation** - deleted data cannot be recovered
- Always confirm you're deleting the correct barangay
- The tool includes a confirmation prompt for safety
- Survey target progress is automatically reset to 0
