# ML System Database Issues

## Overview
The SIGLA ML system is currently experiencing database permission issues that prevent it from saving analysis results, insights, and recommendations to the database. The core ML functionality works correctly, but database operations are failing.

## Current Status
- ✅ ML analysis and insights generation working
- ✅ JSON API responses working correctly
- ❌ Database saves failing due to permission issues
- ⚠️ Temporary workaround: `save_to_db=False` implemented

## Issues Identified

### 1. Supabase Permission Issues

#### Problem
- HTTP 403 Forbidden errors when accessing `action_grid_classification` table
- HTTP 400 Bad Request errors when inserting into `ai_insight` table
- Missing `confidence` column in `ai_insight` table schema

#### Error Messages
```
HTTP/2 403 Forbidden - action_grid_classification table access
HTTP/2 400 Bad Request - ai_insight table insert
Could not find the 'confidence' column of 'ai_insight' in the schema cache
```

#### Required Actions
1. **Add Missing Column**
   ```sql
   ALTER TABLE ai_insight ADD COLUMN confidence DECIMAL(5,4);
   ```

2. **Create RLS Policies**
   ```sql
   -- For action_grid_classification table
   CREATE POLICY "Service role can do everything" ON action_grid_classification
   FOR ALL USING (auth.role() = 'service_role');

   -- For ai_insight table
   CREATE POLICY "Service role can do everything" ON ai_insight
   FOR ALL USING (auth.role() = 'service_role');

   -- For ai_recommendation table
   CREATE POLICY "Service role can do everything" ON ai_recommendation
   FOR ALL USING (auth.role() = 'service_role');
   ```

3. **Verify Service Role Key**
   - Ensure `.env` contains the correct `SUPABASE_SERVICE_ROLE_KEY`
   - Not the anon key, but the service role key with elevated permissions

### 2. PostgreSQL Permission Issues

#### Problem
- "permission denied for schema public" errors
- ML user lacks necessary database permissions

#### Error Messages
```
permission denied for schema public
```

#### Required Actions
1. **Grant Schema Permissions**
   ```sql
   GRANT USAGE ON SCHEMA public TO your_ml_user;
   GRANT CREATE ON SCHEMA public TO your_ml_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_ml_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_ml_user;
   ```

2. **Verify Database Connection**
   - Check PostgreSQL connection details in `.env`
   - Ensure user has proper credentials and permissions

## Affected Components

### Python ML Scripts
- `ml/analyze_barangay.py` - Main analysis script
- `ml/sigla_ml/api.py` - ML API class
- `ml/sigla_ml/data_extraction.py` - Database operations

### API Endpoints
- `/api/ml/insights` - ML insights generation
- `/api/ml/predict` - ML predictions
- `/api/ml/funnel-analysis` - Funnel analysis

### Database Tables
- `action_grid_classification` - Service quadrant classifications
- `ai_insight` - Generated insights
- `ai_recommendation` - Generated recommendations
- `ml_model` - Model metadata
- `ml_prediction` - Prediction results

## Temporary Workaround

Currently implemented `save_to_db=False` in `ml/analyze_barangay.py`:
```python
result = api.analyze_barangay(barangay_id=args.barangay_id, save_to_db=False)
```

This allows the ML system to function without database saves while permission issues are resolved.

## Testing Status

### Working Features
- ✅ Survey data extraction (450 responses for barangay 17)
- ✅ Service score calculations (6 services analyzed)
- ✅ Action grid classifications (all services in MONITOR quadrant)
- ✅ Insight generation (performance concerns identified)
- ✅ Recommendation generation (community consultation suggested)
- ✅ JSON API responses (clean output without warnings)

### Failing Features
- ❌ Action grid classification saves to database
- ❌ AI insight saves to database
- ❌ AI recommendation saves to database
- ❌ ML model metadata saves
- ❌ Prediction result saves

## Resolution Priority

### High Priority (Immediate)
1. Add missing `confidence` column to `ai_insight` table
2. Create Supabase RLS policies for ML tables
3. Verify service role key configuration

### Medium Priority (This Week)
1. Fix PostgreSQL user permissions
2. Test database saves with proper permissions
3. Re-enable `save_to_db=True` in production

### Low Priority (Future)
1. Implement better error handling for database failures
2. Add retry logic for failed database operations
3. Create database health check endpoints

## Environment Variables Required

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PostgreSQL Configuration
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_ml_user
DB_PASSWORD=your_ml_password
```

## Contact
For questions about these issues, refer to the ML system implementation in:
- `ml/sigla_ml/` directory
- `src/app/api/ml/` API endpoints
- Database schema documentation

---
*Last Updated: October 1, 2025*
*Status: Database saves disabled, core ML functionality working*