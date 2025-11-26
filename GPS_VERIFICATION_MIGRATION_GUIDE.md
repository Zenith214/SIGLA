# GPS Verification Columns Migration Guide

## Problem
The application is trying to save GPS verification data, but the database is missing the required columns:
- `verification_location`
- `gps_verification_status`
- `gps_distance_meters`

## Error Message
```
error: column "verification_location" of relation "survey_response" does not exist
```

## Solution: Add Missing Columns

### Step 1: Run SQL Migration in Supabase

1. Open your Supabase project
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the following SQL:

```sql
-- Add GPS verification columns to survey_response table

-- Add verification_location column (JSONB to store GPS coordinates)
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS verification_location JSONB;

-- Add gps_verification_status column
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS gps_verification_status VARCHAR(20) DEFAULT 'pending';

-- Add gps_distance_meters column (distance from assigned spot)
ALTER TABLE survey_response 
ADD COLUMN IF NOT EXISTS gps_distance_meters DECIMAL(10, 2);

-- Add comments for documentation
COMMENT ON COLUMN survey_response.verification_location IS 'GPS coordinates captured at household for quality control verification';
COMMENT ON COLUMN survey_response.gps_verification_status IS 'Status of GPS verification: pending, verified, or flagged';
COMMENT ON COLUMN survey_response.gps_distance_meters IS 'Distance in meters from assigned spot to verification location';

-- Create index for GPS verification status queries
CREATE INDEX IF NOT EXISTS idx_survey_response_gps_status 
ON survey_response(gps_verification_status);
```

5. Click **Run** or press `Ctrl+Enter`
6. Verify the columns were added:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'survey_response'
AND column_name IN ('verification_location', 'gps_verification_status', 'gps_distance_meters')
ORDER BY ordinal_position;
```

### Step 2: Update Prisma Schema (Already Done)

The Prisma schema has been updated in `prisma/schema-postgresql.prisma`:

```prisma
model survey_response {
  // ... existing fields ...
  verification_location    String?  @db.Json
  gps_verification_status  String?  @default("pending")
  gps_distance_meters      Decimal? @db.Decimal(10, 2)
  // ... rest of fields ...
}
```

### Step 3: Verify the Migration

After running the SQL migration, test the survey submission:

1. Start a new survey
2. Complete all sections
3. Submit the survey
4. Check that it saves successfully without errors

## Column Details

### 1. verification_location (JSONB)
Stores GPS coordinates captured at the household for quality control.

**Format:**
```json
{
  "lat": 14.123456,
  "lng": 121.234567,
  "accuracy": 15.5,
  "timestamp": 1732612345678
}
```

**Usage:**
- Captured automatically when user arrives at household
- Used to verify interviewer was at correct location
- Compared against assigned spot coordinates

### 2. gps_verification_status (VARCHAR)
Indicates the verification status of the GPS location.

**Values:**
- `pending` - GPS not yet captured or verified
- `verified` - GPS captured and within acceptable range
- `flagged` - GPS captured but outside acceptable range (needs review)

**Usage:**
- Automatically set based on distance from assigned spot
- Supervisors can filter flagged surveys for review
- Quality control metric

### 3. gps_distance_meters (DECIMAL)
Distance in meters from assigned spot to verification location.

**Format:**
- Decimal number with 2 decimal places
- Example: `45.23` (45.23 meters)
- `NULL` if no verification location captured

**Usage:**
- Calculated when GPS is captured
- Used to determine if location should be flagged
- Threshold: 200 meters (configurable via `GPS_VERIFICATION_THRESHOLD` env var)

## Data Flow

### 1. GPS Capture (Respondent Selection)
```typescript
// User arrives at household
// GPS automatically captured
const verificationLocation = {
  lat: 14.123456,
  lng: 121.234567,
  accuracy: 15.5,
  timestamp: Date.now()
}

// Saved to survey data
onUpdate("verificationLocation", verificationLocation)
```

### 2. Verification Calculation (API)
```typescript
// When survey is submitted
if (verificationLocation && spotId) {
  // Get assigned spot coordinates
  const assignedSpot = await getSpotCoordinates(spotId)
  
  // Calculate distance
  const distance = calculateDistance(assignedSpot, verificationLocation)
  
  // Determine status
  const status = distance > 200 ? 'flagged' : 'verified'
  
  // Save to database
  gps_verification_status = status
  gps_distance_meters = distance
}
```

### 3. Database Storage
```sql
INSERT INTO survey_response (
  ...,
  verification_location,
  gps_verification_status,
  gps_distance_meters
) VALUES (
  ...,
  '{"lat":14.123456,"lng":121.234567,"accuracy":15.5,"timestamp":1732612345678}',
  'verified',
  45.23
);
```

## Quality Control Queries

### Find Flagged Surveys
```sql
SELECT 
  survey_number,
  respondent_name,
  gps_verification_status,
  gps_distance_meters,
  verification_location,
  submitted_at
FROM survey_response
WHERE gps_verification_status = 'flagged'
ORDER BY submitted_at DESC;
```

### Find Surveys Without GPS
```sql
SELECT 
  survey_number,
  respondent_name,
  submitted_at
FROM survey_response
WHERE verification_location IS NULL
ORDER BY submitted_at DESC;
```

### GPS Verification Statistics
```sql
SELECT 
  gps_verification_status,
  COUNT(*) as count,
  ROUND(AVG(gps_distance_meters), 2) as avg_distance,
  MAX(gps_distance_meters) as max_distance
FROM survey_response
WHERE verification_location IS NOT NULL
GROUP BY gps_verification_status;
```

## Rollback (If Needed)

If you need to remove these columns:

```sql
-- Remove columns
ALTER TABLE survey_response DROP COLUMN IF EXISTS verification_location;
ALTER TABLE survey_response DROP COLUMN IF EXISTS gps_verification_status;
ALTER TABLE survey_response DROP COLUMN IF EXISTS gps_distance_meters;

-- Remove index
DROP INDEX IF EXISTS idx_survey_response_gps_status;
```

## Files Modified

1. ✅ `add_gps_verification_columns.sql` - SQL migration script
2. ✅ `prisma/schema-postgresql.prisma` - Updated Prisma schema
3. ✅ `GPS_VERIFICATION_MIGRATION_GUIDE.md` - This guide

## Testing Checklist

After running the migration:

- [ ] SQL migration runs without errors
- [ ] Columns appear in database
- [ ] Index is created
- [ ] Survey submission works
- [ ] GPS data is saved correctly
- [ ] Verification status is calculated
- [ ] Distance is calculated
- [ ] Flagged surveys can be queried
- [ ] Existing surveys still work

## Troubleshooting

### Error: "column already exists"
This is fine - the migration uses `IF NOT EXISTS` so it's safe to run multiple times.

### Error: "permission denied"
Make sure you're running the SQL as a database owner or have ALTER TABLE permissions.

### GPS data not saving
Check that the API route is correctly formatting the JSON before inserting.

### Distance always NULL
Verify that `spotId` is being passed to the API and the spot has coordinates.

## Next Steps

After migration is complete:

1. Test survey submission end-to-end
2. Verify GPS data appears in database
3. Check that flagged surveys are identified correctly
4. Update any reports/dashboards to show GPS verification status
5. Train supervisors on reviewing flagged surveys
