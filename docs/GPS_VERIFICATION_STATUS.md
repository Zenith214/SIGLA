# GPS Verification Feature Status

## Current State

The GPS Verification Monitor is **partially implemented**. The UI exists but the database schema is missing required columns.

## Missing Database Columns

The `survey_response` table needs these additional columns:

```sql
ALTER TABLE survey_response
ADD COLUMN questionnaire_id VARCHAR(50),
ADD COLUMN spot_id INTEGER,
ADD COLUMN gps_verification_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN gps_distance_meters DECIMAL(10,2),
ADD COLUMN verification_location JSONB;

-- Add foreign key constraints
ALTER TABLE survey_response
ADD CONSTRAINT fk_survey_response_spot
FOREIGN KEY (spot_id) REFERENCES spots(spot_id);

-- Add index for performance
CREATE INDEX idx_survey_response_gps_status 
ON survey_response(gps_verification_status);

CREATE INDEX idx_survey_response_questionnaire 
ON survey_response(questionnaire_id);
```

## Current Workaround

The API currently returns basic survey response data with:
- ✅ Respondent name
- ✅ Interviewer name  
- ✅ Barangay name
- ✅ Location coordinates (lat/lng)
- ✅ Created date
- ⚠️ GPS verification status: Always shows "pending"
- ⚠️ GPS distance: Always shows "N/A"
- ⚠️ Spot name: Always shows "N/A"

## To Fully Implement GPS Verification

### 1. Run Database Migration

Execute the SQL above to add missing columns.

### 2. Update Survey Response API

File: `src/app/api/survey-responses/route.ts`

The code already calculates GPS verification but needs to save it:

```typescript
// Already calculated (lines 60-88):
- gpsVerificationStatus ('pending', 'verified', 'flagged')
- gpsDistanceMeters (distance in meters)
- verificationLocationJson (GPS coordinates)

// Need to save these in INSERT/UPDATE queries
```

### 3. Update GPS Verification API

File: `src/app/api/fs/gps-verification/route.ts`

Once columns exist, update query to:
```sql
SELECT 
  sr.response_id,
  sr.questionnaire_id,
  sr.survey_number,
  sr.gps_verification_status,
  sr.gps_distance_meters,
  sr.verification_location,
  sr.created_at,
  sr.respondent_name,
  CONCAT(u."firstName", ' ', u."lastName") as interviewer_name,
  b.barangay_name,
  s.spot_name
FROM survey_response sr
LEFT JOIN "user" u ON sr.interviewer_id = u.id
LEFT JOIN barangay b ON sr.barangay_id = b.barangay_id
LEFT JOIN spots s ON sr.spot_id = s.spot_id
WHERE sr.gps_verification_status IS NOT NULL
ORDER BY 
  CASE sr.gps_verification_status
    WHEN 'flagged' THEN 1
    WHEN 'pending' THEN 2
    WHEN 'verified' THEN 3
  END,
  sr.created_at DESC
```

## Benefits Once Implemented

✅ **Automatic GPS verification** - System calculates distance from assigned spot  
✅ **Flagging system** - Interviews >200m from spot are flagged for review  
✅ **Supervisor monitoring** - Real-time view of GPS verification status  
✅ **Data quality** - Ensures interviews conducted at correct locations  
✅ **Audit trail** - Complete location history for each interview  

## Current Functionality

Even without full GPS verification, the system still:
- ✅ Captures GPS coordinates during interviews
- ✅ Stores location data (lat/lng)
- ✅ Shows basic interview list
- ✅ Displays interviewer and barangay info
- ✅ Provides empty state handling

The GPS Verification Monitor will show "No GPS Records Yet" until survey responses are submitted.
