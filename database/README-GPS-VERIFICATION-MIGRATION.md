# GPS Verification Migration Guide

## Overview

This migration adds GPS verification fields to the `survey_response` table to support quality control verification of interview locations. The system compares pre-assigned spot locations with actual GPS coordinates captured during interviews to detect potential fraud or data quality issues.

## What's Included

### 1. Database Schema Changes

**New Columns:**
- `verification_location` (JSONB) - GPS coordinates captured when FI confirms arrival at household
- `gps_verification_status` (VARCHAR) - Status: 'pending', 'verified', 'flagged', 'reviewed'
- `gps_distance_meters` (INTEGER) - Distance between assigned spot and actual location

**New Indexes:**
- `idx_survey_response_gps_flagged` - Partial index for flagged interviews
- `idx_survey_response_verification_location` - GIN index for verification location queries
- `idx_survey_response_cycle_gps_status` - Composite index for cycle-aware queries

### 2. Migration Files

- **SQL File:** `database/add-gps-verification-fields.sql`
- **Migration Script:** `scripts/apply-gps-verification-migration.js`

### 3. API Updates

The `POST /api/survey-responses` endpoint now:
- Accepts `verificationLocation` in the request body
- Calculates GPS verification automatically on submission
- Stores verification results in the new database columns
- Flags interviews exceeding the threshold (default: 200m)
- Returns GPS verification status in the response

## How to Apply the Migration

### Step 1: Review the SQL

```bash
# Review the migration SQL file
cat database/add-gps-verification-fields.sql
```

### Step 2: Apply the Migration

```bash
# Apply the migration
node scripts/apply-gps-verification-migration.js
```

The script will:
- Check for existing columns
- Add new columns if they don't exist
- Create indexes for efficient querying
- Provide a detailed summary of changes

### Step 3: Verify the Migration

```bash
# Check that columns were added successfully
# You can use your database client or run a query
```

## Rollback

If you need to rollback the migration:

```bash
# Rollback the migration
node scripts/apply-gps-verification-migration.js --rollback
```

This will:
- Drop all created indexes
- Remove all added columns
- Restore the table to its previous state

## Configuration

### GPS Verification Threshold

The default threshold is 200 meters. You can configure this by setting an environment variable:

```env
GPS_VERIFICATION_THRESHOLD=200
```

Interviews where the actual location is more than this distance from the assigned spot will be automatically flagged for review.

## API Usage

### Request Format

```json
{
  "surveyNumber": "BB-2024-0001",
  "location": {
    "lat": 6.1234,
    "lng": 125.5678,
    "address": "Sample Address"
  },
  "verificationLocation": {
    "lat": 6.1235,
    "lng": 125.5679,
    "accuracy": 10,
    "timestamp": 1699999999999
  },
  "spotId": 123,
  "interviewerId": 1,
  "barangayId": 5,
  "selectedMember": "John Doe",
  "respondentDemographics": { ... },
  "sections": { ... }
}
```

### Response Format

```json
{
  "success": true,
  "responseId": 456,
  "surveyNumber": "BB-2024-0001",
  "cycleId": 1,
  "cycleName": "2024 Survey Cycle",
  "gpsVerification": {
    "status": "verified",
    "distanceMeters": 45,
    "flagged": false
  },
  "message": "Survey submitted successfully"
}
```

### GPS Verification Status Values

- **pending** - GPS verification not yet performed (no verificationLocation provided)
- **verified** - Location is within acceptable threshold
- **flagged** - Location exceeds threshold, needs supervisor review
- **reviewed** - Manually reviewed by supervisor

## Database Queries

### Find Flagged Interviews

```sql
SELECT 
  response_id,
  survey_number,
  gps_distance_meters,
  gps_verification_status
FROM survey_response
WHERE gps_verification_status = 'flagged'
ORDER BY gps_distance_meters DESC;
```

### Get GPS Verification Statistics

```sql
SELECT 
  gps_verification_status,
  COUNT(*) as count,
  AVG(gps_distance_meters) as avg_distance,
  MAX(gps_distance_meters) as max_distance
FROM survey_response
WHERE verification_location IS NOT NULL
GROUP BY gps_verification_status;
```

### Find Interviews by Distance Range

```sql
SELECT 
  response_id,
  survey_number,
  gps_distance_meters
FROM survey_response
WHERE gps_distance_meters > 200
  AND gps_distance_meters <= 500
ORDER BY gps_distance_meters DESC;
```

## Next Steps

After applying this migration:

1. ✅ Database schema updated
2. ✅ API endpoint updated to accept verificationLocation
3. ✅ GPS verification calculated automatically on submission
4. ⏳ Update frontend to capture GPS at household confirmation
5. ⏳ Create supervisor dashboard for GPS verification review
6. ⏳ Add GPS verification reports and analytics

## Troubleshooting

### Migration Fails

If the migration fails:
1. Check database connection settings
2. Verify you have the required permissions
3. Check if columns already exist
4. Review error messages in the console

### GPS Verification Not Working

If GPS verification is not calculating:
1. Ensure `verificationLocation` is included in the request
2. Verify `spotId` is provided (needed to get assigned location)
3. Check that the spot has a valid `starting_point` coordinate
4. Review API logs for error messages

### Performance Issues

If you experience performance issues:
1. Verify indexes were created successfully
2. Run `ANALYZE survey_response;` to update statistics
3. Monitor query performance with `EXPLAIN ANALYZE`

## Requirements Addressed

This migration addresses the following requirements from the CSIS Workflow Upgrade spec:

- **5.4** - Display pre-assigned spot location on supervisor dashboard
- **5.5** - Display actual GPS capture location on supervisor dashboard
- **5.6** - Calculate distance between locations
- **5.7** - Flag interviews exceeding threshold
- **8.1** - GPS verification configuration
- **8.2** - Apply threshold dynamically
- **8.3** - Store verification results

## Support

For issues or questions:
1. Check the main project documentation
2. Review the CSIS Workflow Upgrade spec
3. Contact the development team
