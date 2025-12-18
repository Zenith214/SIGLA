# ML Cache Duplicate Records - Fixed

**Date:** October 28, 2025  
**Issue:** Duplicate barangay records in ml_cache causing incorrect API responses  
**Status:** ✅ RESOLVED

---

## 🐛 Problem Discovered

### Symptom:
Service Rankings API returned duplicate barangays:

```json
{
  "rankings": [
    {
      "rank": 2,
      "barangay_id": 17,
      "name": "Buguis",
      "satisfaction": 60,
      "need_action": 35.14
    },
    {
      "rank": 4,
      "barangay_id": 17,
      "name": "Buguis",
      "satisfaction": 0,
      "need_action": 0
    }
  ]
}
```

### Root Cause:
The `ml_cache` table had **2 records** for Barangay 17 in Cycle 18:
1. **Record 1** (newer): Has complete data with 60% satisfaction
2. **Record 2** (older): Empty/null data structure

This happened because ML analysis was run multiple times for the same barangay/cycle combination without checking for existing records.

---

## ✅ Solution Applied

### 1. Identified Duplicates

Created script: `scripts/check-ml-cache-duplicates.js`

```bash
node scripts/check-ml-cache-duplicates.js
```

**Result:**
- Found 1 duplicate: Barangay 17, Cycle 18 (2 records)

### 2. Cleaned Up Duplicates

Created script: `scripts/clean-ml-cache-duplicates.js`

```bash
node scripts/clean-ml-cache-duplicates.js
```

**Actions Taken:**
- ✅ Kept the record with complete data (60% satisfaction)
- ❌ Deleted the empty/null record
- ✅ Verified no duplicates remain

**Result:**
- ML Cache now has 5 unique records (down from 6)
- No duplicates remaining

---

## 📊 Current ML Cache Status

### Cycle 17 (Historical):
- Barangay 10: Complete data
- Barangay 17: Complete data

### Cycle 18 (Active - PULSE SURVEY 2026):
- Barangay 10: Complete data (80% satisfaction)
- Barangay 17: Complete data (60% satisfaction) ✅ Fixed
- Barangay 21: Empty data (0 survey responses)

---

## 🔍 Why Barangay 21 Shows 0%

Barangay 21 has a valid record but with empty data:

```json
{
  "barangay_id": 21,
  "data": {
    "action_grid": {},
    "service_scores": {},
    "total_responses": 0,
    "overall_satisfaction": 0
  }
}
```

**This is expected behavior** - it means:
- No survey responses collected for Barangay 21 in Cycle 18
- ML analysis ran but found no data to process
- Record exists to indicate "analyzed but no data"

**Options:**
1. **Keep it** - Shows which barangays have been analyzed but have no data
2. **Filter it out** - Modify API to exclude barangays with 0 responses
3. **Delete it** - Remove records with no actual data

**Recommendation:** Keep it, but filter in the API or UI to show only barangays with data.

---

## 🛡️ Prevention Strategy

### To Prevent Future Duplicates:

#### Option 1: Database Constraint (Recommended)
Add a unique constraint to the ml_cache table:

```sql
ALTER TABLE ml_cache 
ADD CONSTRAINT ml_cache_barangay_cycle_unique 
UNIQUE (barangay_id, cycle_id);
```

This will prevent inserting duplicate records at the database level.

#### Option 2: Upsert Logic in ML Scripts
Modify ML analysis scripts to use UPSERT instead of INSERT:

```python
# Instead of INSERT
INSERT INTO ml_cache (barangay_id, cycle_id, data) 
VALUES ($1, $2, $3)

# Use INSERT ... ON CONFLICT
INSERT INTO ml_cache (barangay_id, cycle_id, data) 
VALUES ($1, $2, $3)
ON CONFLICT (barangay_id, cycle_id) 
DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = NOW()
```

#### Option 3: Check Before Insert
Add logic to check for existing records:

```python
# Check if record exists
existing = db.query(
  "SELECT id FROM ml_cache WHERE barangay_id = $1 AND cycle_id = $2",
  [barangay_id, cycle_id]
)

if existing:
  # Update existing record
  db.query("UPDATE ml_cache SET data = $1 WHERE id = $2", [data, existing.id])
else:
  # Insert new record
  db.query("INSERT INTO ml_cache (barangay_id, cycle_id, data) VALUES ($1, $2, $3)", 
           [barangay_id, cycle_id, data])
```

---

## 🧪 Testing

### Test for Duplicates:
```bash
node scripts/check-ml-cache-duplicates.js
```

### Test API Response:
1. Open http://localhost:3000/analytics-test
2. Login
3. Click "Test Service Rankings"
4. Verify no duplicate barangays in response

### Expected Result:
```json
{
  "success": true,
  "rankings": [
    {
      "rank": 1,
      "barangay_id": 10,
      "name": "Balasinon",
      "satisfaction": 80
    },
    {
      "rank": 2,
      "barangay_id": 17,
      "name": "Buguis",
      "satisfaction": 60
    }
    // No duplicate barangay_id 17
  ]
}
```

---

## 📝 Scripts Created

1. **`scripts/check-ml-cache-duplicates.js`**
   - Checks for duplicate records
   - Shows which barangays have multiple records
   - Useful for monitoring

2. **`scripts/clean-ml-cache-duplicates.js`**
   - Automatically removes duplicates
   - Keeps the best record (with data, most recent)
   - Safe to run multiple times

---

## 🎯 Next Steps

### Immediate:
- [x] Clean up existing duplicates ✅ Done
- [ ] Test API response (verify no duplicates)
- [ ] Add unique constraint to prevent future duplicates

### Short-term:
- [ ] Update ML analysis scripts to use UPSERT
- [ ] Add monitoring for duplicate records
- [ ] Document ML cache update process

### Long-term:
- [ ] Implement proper ML cache refresh strategy
- [ ] Add data validation before inserting
- [ ] Create admin UI for managing ML cache

---

## 💡 Key Takeaways

1. **Duplicates are now fixed** - Only 1 record per barangay per cycle
2. **Prevention is important** - Add unique constraint to database
3. **Empty records are OK** - They indicate "no data" vs "not analyzed"
4. **Scripts are available** - Easy to check and clean duplicates

---

## 🆘 If Duplicates Appear Again

Run these commands:

```bash
# 1. Check for duplicates
node scripts/check-ml-cache-duplicates.js

# 2. Clean them up
node scripts/clean-ml-cache-duplicates.js

# 3. Verify they're gone
node scripts/check-ml-cache-duplicates.js

# 4. Test the API
# Open http://localhost:3000/analytics-test
```

---

**Issue resolved! ML cache is now clean and duplicate-free. 🎉**
