# Cycle-Aware Questionnaire Number System - COMPLETE ✅

## Overview
Successfully implemented automatic, barangay-specific, cycle-aware questionnaire number generation.

## System Specifications

### Database Structure
```sql
questionnaire_counter (
  barangay_id INT,
  cycle_id INT,
  current_number INT,
  updated_at TIMESTAMP,
  PRIMARY KEY (barangay_id, cycle_id)
)
```

### Key Features
✅ **Barangay-Specific**: Each barangay has independent counters  
✅ **Cycle-Aware**: Counters reset per survey cycle  
✅ **Atomic Operations**: No race conditions with concurrent access  
✅ **Automatic**: No manual input required  
✅ **Odd/Even Logic**: Determines which sections to answer  

## How It Works

### Counter Scope
- **Per Barangay**: Each barangay has its own sequence
- **Per Cycle**: Numbers reset when a new cycle starts
- **Example**:
  ```
  Cycle 2026, Barangay 6: 1, 2, 3, 4, 5...
  Cycle 2026, Barangay 7: 1, 2, 3, 4, 5...
  Cycle 2027, Barangay 6: 1, 2, 3, 4, 5... (resets)
  ```

### Section Assignment
- **Odd numbers (1, 3, 5, 7...)** → Odd sections
  - Financial Administration
  - Safety & Peace Order
  - Environmental Management

- **Even numbers (2, 4, 6, 8...)** → Even sections
  - Disaster Preparedness
  - Business Friendliness
  - Social Protection

## Available Barangays
```
 6: Katipunan          16: Carre             26: Lapla
 7: Tanwalang          17: Buguis            27: Litos
 8: Solongvale         18: Mckinley          28: Parame
 9: Tala-O             19: Kiblagon          29: Labon
10: Balasinon          20: Laperas           30: Waterfall
11: Harada Butai       21: Clib
12: Roxas              22: Osmeña
13: New Cebu           23: Luparan
14: Palili             24: Poblacion
15: Talas              25: Tagolilong

Total: 25 barangays
```

## API Endpoint

### POST /api/questionnaire-number

**Request:**
```json
{
  "barangayId": 6
}
```

**Response:**
```json
{
  "success": true,
  "questionnaireNumber": 1,
  "barangayId": 6,
  "cycleId": 18,
  "cycleName": "PULSE SURVEY 2026"
}
```

## Test Results

### ✅ All Tests Passing

**Test 1: Sequential Generation**
- Barangay 6: 1, 2, 3, 4, 5 ✅

**Test 2: Barangay Isolation**
- Barangay 6: 1, 2, 3...
- Barangay 7: 1, 2, 3... (independent)
- Barangay 8: 1, 2, 3... (independent) ✅

**Test 3: Cycle Consistency**
- All numbers in same active cycle ✅

**Test 4: Odd/Even Assignment**
- #1 → odd sections ✅
- #2 → even sections ✅
- #3 → odd sections ✅

## Benefits for Analytics & ML

### 1. Clean Data Structure
```
barangay_id | cycle_id | questionnaire_number | sections_answered
-----------+----------+---------------------+------------------
     6     |    18    |          1          |    odd
     6     |    18    |          2          |    even
     7     |    18    |          1          |    odd
```

### 2. Easy Filtering
```sql
-- Get all odd questionnaires for Barangay 6 in Cycle 18
SELECT * FROM survey_response 
WHERE barangay_id = 6 
  AND survey_cycle_id = 18 
  AND questionnaire_number % 2 = 1;
```

### 3. Cross-Cycle Comparison
```sql
-- Compare questionnaire #1 across cycles
SELECT cycle_id, AVG(score) 
FROM survey_response 
WHERE questionnaire_number = 1 
GROUP BY cycle_id;
```

### 4. Barangay-Specific Analysis
```sql
-- Analyze Barangay 6 responses
SELECT questionnaire_number, COUNT(*) 
FROM survey_response 
WHERE barangay_id = 6 AND survey_cycle_id = 18
GROUP BY questionnaire_number;
```

## User Experience

### Before (Manual)
1. User manually enters questionnaire number
2. Risk of duplicates
3. Risk of wrong sections if timing issues
4. Extra cognitive load

### After (Automatic)
1. User selects barangay (or pre-selected)
2. System auto-generates number
3. Displays assigned sections
4. No possibility of errors

## Technical Implementation

### Atomic Operation
```sql
BEGIN;
  -- Initialize if needed
  INSERT INTO questionnaire_counter (barangay_id, cycle_id, current_number)
  VALUES (6, 18, 0)
  ON CONFLICT DO NOTHING;
  
  -- Atomically increment
  UPDATE questionnaire_counter
  SET current_number = current_number + 1
  WHERE barangay_id = 6 AND cycle_id = 18
  RETURNING current_number;
COMMIT;
```

### Concurrent Access
- Row-level locking prevents race conditions
- Multiple interviewers can work simultaneously
- Each gets unique sequential number
- No duplicates possible

## Scripts Available

### Migration
```bash
npm run questionnaire:migrate
```
Creates/updates the questionnaire_counter table

### Testing
```bash
node scripts/test-cycle-aware-questionnaire.js
```
Comprehensive test suite

### Check Barangays
```bash
node scripts/check-barangays.js
```
Lists all available barangays

## Database State

Current counters (as of last test):
```
Barangay 6 | Cycle 18 | Count: 5
Barangay 7 | Cycle 18 | Count: 3
Barangay 8 | Cycle 18 | Count: 1
```

Next numbers to be generated:
- Barangay 6: #6 (even sections)
- Barangay 7: #4 (even sections)
- Barangay 8: #2 (even sections)

## Integration Points

### Survey Form
- Auto-generates number when user clicks "Continue to Survey"
- Requires barangayId (from URL param or selection)
- Uses active cycle automatically

### Survey Response
- Stores questionnaire_number in survey_response table
- Links to barangay_id and survey_cycle_id
- Used for analytics and section filtering

### Analytics
- Group by questionnaire_number for odd/even analysis
- Filter by barangay_id for location-specific insights
- Compare across cycle_id for trend analysis

## Future Enhancements

- [ ] Admin UI to view/reset counters
- [ ] Counter statistics dashboard
- [ ] Audit log for number generation
- [ ] Bulk reset for new cycles
- [ ] Export counter history

## Status: PRODUCTION READY ✅

All systems tested and working:
- ✅ Database migration complete
- ✅ API endpoint functional
- ✅ Frontend integration ready
- ✅ Barangay-specific counters
- ✅ Cycle-aware numbering
- ✅ Atomic operations
- ✅ All tests passing

The system is ready for use in production!
