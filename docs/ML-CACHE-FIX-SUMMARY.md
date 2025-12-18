# ML Cache Database Fix Summary

## Issues Fixed

### 1. Database Relationship Errors
**Problem:** API routes were trying to use Supabase relationship joins on the `ml_cache` table, but no foreign key relationships were defined.

**Errors:**
- `Could not find a relationship between 'ml_cache' and 'barangay'`
- `Could not find a relationship between 'ml_cache' and 'survey_cycle'`

**Solution:** 
- Removed relationship joins from queries
- Fetch related data (barangay names, cycle years) in separate queries
- Join data in application code using Maps

### 2. Missing Column Data
**Problem:** The dashboard shows 0% for all satisfaction scores because the `ml_cache` table is empty or doesn't have data in the expected format.

**Solution:**
- Updated API routes to support both data storage formats:
  - Dedicated columns (e.g., `financial_assistance_satisfaction`)
  - JSONB `data` column (e.g., `data.financial_assistance_satisfaction`)
- Added console logging to debug data structure
- Created SQL script to populate sample data for testing

### 3. React Hooks Error
**Problem:** ServiceLeaderboard component had early return before all hooks were called, violating Rules of Hooks.

**Error:** `Rendered more hooks than during the previous render`

**Solution:**
- Moved empty check inside `useMemo` hook
- Added empty state check after all hooks are called

### 4. Duplicate React Keys
**Problem:** Table rows had duplicate keys when barangay_id appeared multiple times.

**Solution:** Use combination of `barangay_id` and `index` as the key

## Files Modified

1. **src/app/api/analytics/service-area-rankings/route.ts**
   - Removed barangay relationship join
   - Fetch barangay names separately
   - Support both column formats
   - Added debug logging

2. **src/app/api/analytics/service-trends/route.ts**
   - Removed survey_cycle relationship join
   - Fetch cycle data separately
   - Support both column formats

3. **src/components/dashboard/charts/ServiceLeaderboard.tsx**
   - Fixed React Hooks order
   - Fixed duplicate keys issue

## Files Created

1. **database/ml-cache-columns-migration.sql**
   - Optional migration to add dedicated columns for better performance

2. **database/populate-ml-cache-sample-data.sql**
   - Script to populate ml_cache with sample test data

3. **database/README-ML-CACHE-MIGRATION.md**
   - Documentation explaining the fix and how to populate data

## Next Steps

### To Fix the 0% Display Issue:

1. **Run the sample data script** (for testing):
   ```bash
   psql -h your-db-host -U postgres -d your-database -f database/populate-ml-cache-sample-data.sql
   ```

2. **Or in Supabase SQL Editor:**
   - Open the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `database/populate-ml-cache-sample-data.sql`
   - Run the query

3. **Check the console logs:**
   - Open browser DevTools Console
   - Look for `[SERVICE RANKINGS] Sample data structure:` to see what data exists
   - Look for `[SERVICE RANKINGS] Looking for columns:` to see what the API is searching for

4. **Verify the data:**
   ```sql
   SELECT 
     ml.cycle_id,
     b.barangay_name,
     ml.data->>'financial_assistance_satisfaction' as satisfaction
   FROM ml_cache ml
   JOIN barangay b ON b.barangay_id = ml.barangay_id
   WHERE ml.cycle_id = 18
   LIMIT 5;
   ```

### For Production:

You'll need to create a proper computation script that:
1. Reads survey responses from `survey_response` and `survey_answer` tables
2. Aggregates data by barangay and cycle
3. Calculates satisfaction, need_action, awareness, and availment scores
4. Stores results in `ml_cache` table

## Testing

After populating the ml_cache table, the dashboard should display:
- Satisfaction scores for each barangay
- Rankings by service area
- Trend data across cycles
- Proper barangay names

All API endpoints should work without database relationship errors.
