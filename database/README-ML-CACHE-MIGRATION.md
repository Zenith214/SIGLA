# ML Cache Database Migration

## Issue
The `ml_cache` table was initially created with only a generic `data` JSONB column, but the analytics API routes expect specific columns for each service area metric.

## Solution
You have two options:

### Option 1: Add Specific Columns (Recommended for Performance)
Run the migration script to add dedicated columns for each service area:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d your-database -f database/ml-cache-columns-migration.sql
```

Or execute the SQL directly in the Supabase SQL Editor.

This migration adds:
- Columns for each service area (financial_assistance, disaster_preparedness, health_services, peace_and_order, infrastructure, environmental_management)
- Each service area has 4 metrics: satisfaction, need_action, awareness, availment
- Foreign key constraints to survey_cycle and barangay tables
- Indexes for better query performance

### Option 2: Use JSONB Data Column (Current Implementation)
The API routes have been updated to work with the existing `data` JSONB column structure. This is the current working solution and requires no database changes.

The data should be stored in this format:
```json
{
  "financial_assistance_satisfaction": 85.5,
  "financial_assistance_need_action": 12.3,
  "financial_assistance_awareness": 78.2,
  "financial_assistance_availment": 65.4,
  "disaster_preparedness_satisfaction": 72.1,
  ...
}
```

## What Was Fixed
1. **Service Area Rankings API** (`/api/analytics/service-area-rankings`)
   - Removed relationship join with barangay table
   - Fetches barangay names separately
   - Extracts metrics from JSONB data column
   - Sorts results in application code

2. **Service Trends API** (`/api/analytics/service-trends`)
   - Removed relationship join with survey_cycle table
   - Fetches cycle information separately
   - Extracts metrics from JSONB data column
   - Properly handles aggregation across barangays

## Populating ML Cache with Data

The ml_cache table needs to be populated with computed analytics data. You have two options:

### Option A: Use Sample Data (For Testing)
Run the sample data script to populate ml_cache with random test data:

```bash
psql -h your-db-host -U postgres -d your-database -f database/populate-ml-cache-sample-data.sql
```

Or execute it in the Supabase SQL Editor.

### Option B: Compute from Survey Responses (Production)
You need to create a computation script that:
1. Aggregates survey responses by barangay and cycle
2. Calculates satisfaction, need_action, awareness, and availment scores for each service area
3. Stores the results in the ml_cache table

The data should be stored in the JSONB `data` column with this structure:
```json
{
  "financial_assistance_satisfaction": 85.5,
  "financial_assistance_need_action": 12.3,
  "financial_assistance_awareness": 78.2,
  "financial_assistance_availment": 65.4,
  ...
}
```

## Testing
After populating the ml_cache table, test the following endpoints:
- `GET /api/analytics/service-area-rankings?service_area=financial&cycle_id=18`
- `GET /api/analytics/service-trends?service_area=financial`
- `GET /api/analytics/service-trends?service_area=financial&barangay_id=10`

Check the browser console for logs showing the data structure:
- `[SERVICE RANKINGS] Sample data structure:` - shows what's in ml_cache
- `[SERVICE RANKINGS] Looking for columns:` - shows which columns the API is trying to access

## Notes
- The current implementation uses the JSONB `data` column and works without database migrations
- If you want better query performance, run the column migration (Option 1)
- The API code is compatible with both approaches
- **The ml_cache table must be populated with data for the dashboard to display analytics**
