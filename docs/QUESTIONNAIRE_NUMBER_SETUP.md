# Questionnaire Number Auto-Generation Setup Guide

## Quick Start

### Step 1: Run the Migration
This creates the `questionnaire_counter` table in your database:

```bash
npm run questionnaire:migrate
```

Expected output:
```
✅ Connected to database
📝 Running migration: add_questionnaire_counter.sql
✅ Migration completed successfully
✅ Questionnaire counter initialized at: 0
```

### Step 2: Test the Implementation
Run the test suite to verify everything works:

```bash
npm run questionnaire:test
```

Expected output:
```
═══════════════════════════════════════════════════════
  Questionnaire Number Generation Test Suite
═══════════════════════════════════════════════════════

🧪 Test 1: Sequential Generation
  ✅ Generated: 1
  ✅ Generated: 2
  ✅ Generated: 3
  ✅ Generated: 4
  ✅ Generated: 5
  Result: ✅ PASS

🧪 Test 2: Concurrent Generation
  Generated 10 numbers
  Unique numbers: 10
  Result: ✅ PASS - No duplicates

🧪 Test 3: Odd/Even Section Assignment
  ✅ Number 1 → odd sections
  ✅ Number 2 → even sections
  ✅ Number 3 → odd sections
  ✅ Number 4 → even sections
  ✅ Number 5 → odd sections
  Result: ✅ PASS

═══════════════════════════════════════════════════════
  Overall: ✅ ALL TESTS PASSED
═══════════════════════════════════════════════════════
```

### Step 3: Start Using the System
The survey form will now automatically generate questionnaire numbers!

## Available Commands

### Migration
```bash
npm run questionnaire:migrate
```
Creates the questionnaire_counter table and initializes it.

### Testing
```bash
npm run questionnaire:test
```
Runs comprehensive tests for:
- Sequential number generation
- Concurrent access handling
- Odd/even section assignment

### Reset Counter (Admin Only)
```bash
npm run questionnaire:reset
```
Resets the counter to a specific value. Use with caution!

## How It Works

### User Flow
1. User navigates to survey form
2. User captures location
3. User clicks "Continue to Survey"
4. System automatically generates next questionnaire number
5. Number is displayed with assigned sections
6. User proceeds with survey

### Technical Flow
```
Frontend Request
      ↓
POST /api/questionnaire-number/next
      ↓
Database Transaction (with lock)
      ↓
UPDATE questionnaire_counter
SET current_number = current_number + 1
RETURNING current_number
      ↓
Return number to frontend
      ↓
Display number and sections
```

## Troubleshooting

### Migration Fails
**Error:** "Table already exists"
- The table is already created, you're good to go!
- Run the test to verify: `npm run questionnaire:test`

**Error:** "Cannot connect to database"
- Check your `.env.local` file has `DATABASE_URL`
- Verify database is running
- Check network connection

### API Returns Error
**Error:** "Failed to generate questionnaire number"
- Check database connection
- Verify migration was run successfully
- Check server logs for details

### Numbers Not Sequential
- This shouldn't happen with atomic operations
- Check if multiple counter rows exist:
  ```sql
  SELECT * FROM questionnaire_counter;
  ```
- Should only have one row with counter_id = 1

### Need to Reset Counter
```bash
npm run questionnaire:reset
```
Follow the prompts to reset to a specific number.

## Database Schema

```sql
CREATE TABLE questionnaire_counter (
  counter_id INT PRIMARY KEY DEFAULT 1,
  current_number INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_counter CHECK (counter_id = 1)
);
```

**Fields:**
- `counter_id`: Always 1 (ensures single row)
- `current_number`: Current counter value
- `updated_at`: Last update timestamp

## API Endpoint

### POST /api/questionnaire-number/next

**Request:**
```bash
curl -X POST http://localhost:3000/api/questionnaire-number/next
```

**Response:**
```json
{
  "success": true,
  "questionnaireNumber": 42,
  "message": "Questionnaire number generated successfully"
}
```

**Error Response:**
```json
{
  "error": "Failed to generate questionnaire number"
}
```

## Section Assignment Logic

The questionnaire number determines which sections to answer:

- **Odd numbers (1, 3, 5, 7, ...)** → Odd sections
  - Financial Administration
  - Safety & Peace Order
  - Environmental Management

- **Even numbers (2, 4, 6, 8, ...)** → Even sections
  - Disaster Preparedness
  - Business Friendliness
  - Social Protection

## FAQ

**Q: What happens if two interviewers start at the exact same time?**  
A: The database handles this with row-level locking. One gets number N, the other gets N+1. No duplicates possible.

**Q: Can I manually set a questionnaire number?**  
A: No, the system generates it automatically. This ensures no duplicates and correct section assignment.

**Q: What if I need to skip a number?**  
A: You can reset the counter to skip numbers, but this is not recommended for normal operations.

**Q: Does the counter reset each cycle?**  
A: No, it's a global counter. If you need cycle-specific numbering, that would require additional development.

**Q: What happens to old surveys with manual numbers?**  
A: They remain unchanged. The auto-generation only affects new surveys.

**Q: Can I see the current counter value?**  
A: Yes, query the database:
```sql
SELECT current_number FROM questionnaire_counter WHERE counter_id = 1;
```

## Support

For issues or questions:
1. Check this guide
2. Run the test suite: `npm run questionnaire:test`
3. Check server logs
4. Review `AUTO_QUESTIONNAIRE_NUMBER_IMPLEMENTATION.md` for technical details

## Next Steps

After setup:
1. ✅ Run migration
2. ✅ Run tests
3. ✅ Test in development environment
4. ✅ Train interviewers on new flow
5. ✅ Deploy to production
