# Running Python Scripts on Railway ML Service

## Overview

Your ML service has two types of Python files:

1. **Main Service** (`app.py`) - Runs automatically via Railway
2. **Utility Scripts** - Need to be run manually for maintenance/debugging

## Utility Scripts Available

- `check_available_data.py` - Check what data is available
- `check_tables.py` - Verify database tables
- `debug_survey_data.py` - Debug survey data issues
- `setup_database.py` - Initialize database
- `test_*.py` - Various test scripts
- `verify_database.py` - Verify database connection

## How to Run Python Scripts on Railway

### Method 1: Railway CLI (Recommended)

```bash
# Install Railway CLI (if not already installed)
iwr https://railway.app/install.ps1 | iex

# Login
railway login

# Link to your ML service
cd ml
railway link

# Run any Python script
railway run python check_available_data.py
railway run python verify_database.py
railway run python debug_survey_data.py
```

### Method 2: Railway Dashboard

1. Go to https://railway.app
2. Open your project
3. Click on your **ML service** (not the Next.js service)
4. Go to "Settings" tab
5. Find "One-off Commands" or "Run Command"
6. Enter: `python check_available_data.py` (or any script name)
7. Click "Run"

### Method 3: Add to package.json (for Next.js service to trigger)

If you want to run ML scripts from your main Next.js service:

```json
{
  "scripts": {
    "ml:check-data": "cd ml && python check_available_data.py",
    "ml:verify-db": "cd ml && python verify_database.py",
    "ml:debug": "cd ml && python debug_survey_data.py"
  }
}
```

Then run via Railway CLI:
```bash
railway run npm run ml:check-data
```

### Method 4: SSH into Railway Container

```bash
# Get a shell in your ML service
railway shell

# Once inside, run any script
python check_available_data.py
python verify_database.py
```

## Environment Variables Required

The Python scripts need these environment variables (should already be set):

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Service port (Railway sets automatically)

## Common Use Cases

### Check if ML service can access data
```bash
railway run python check_available_data.py
```

### Verify database connection
```bash
railway run python verify_database.py
```

### Debug survey data issues
```bash
railway run python debug_survey_data.py
```

### Test ML predictions
```bash
railway run python test_ml.py
```

### Check database tables
```bash
railway run python check_tables.py
```

## Important Notes

1. **Two Separate Services**: Your Next.js app and ML service are separate on Railway
   - Node.js scripts run on the Next.js service
   - Python scripts run on the ML service
   - Make sure you're linked to the correct service!

2. **Service Selection**: When using `railway link`, make sure you select the ML service, not the Next.js service

3. **Environment Variables**: Both services should have `DATABASE_URL` set to the same database

4. **Logs**: Check logs for each service separately:
   ```bash
   # For ML service
   cd ml
   railway logs
   
   # For Next.js service
   cd ..
   railway logs
   ```

## Troubleshooting

### "Module not found" errors
The ML service might not have all dependencies installed:
```bash
railway run pip install -r requirements.txt
```

### "Cannot connect to database"
Check that `DATABASE_URL` is set correctly:
```bash
railway variables
```

### Wrong service selected
Make sure you're in the `ml/` directory and linked to the ML service:
```bash
cd ml
railway link
railway status
```

### Script runs locally but not on Railway
Check Railway logs for the ML service:
```bash
cd ml
railway logs
```

## Quick Reference

```bash
# Setup (one time)
cd ml
railway login
railway link  # Select ML service

# Run scripts
railway run python <script-name>.py

# Check logs
railway logs

# Check environment
railway variables

# Get shell access
railway shell
```
