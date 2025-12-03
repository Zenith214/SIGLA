# Complete Railway Deployment Guide

## Your Railway Setup

You have **TWO separate services** on Railway:

### 1. Next.js Application (Main App)
- **Location**: Root directory
- **Language**: Node.js/TypeScript
- **Scripts**: JavaScript/Node.js scripts in `/scripts` folder
- **URL**: `https://mlgrc-pulse.up.railway.app`

### 2. Python ML Service
- **Location**: `/ml` directory
- **Language**: Python (FastAPI)
- **Scripts**: Python scripts in `/ml` folder
- **URL**: `https://[your-ml-service].up.railway.app`

## Running Scripts on Railway

### For Node.js Scripts (Cycle Fixes, Database Updates)

```bash
# From project root
railway login
railway link  # Select your Next.js service

# Run Node.js scripts
railway run npm run check-cycle
railway run npm run fix-cycle
railway run npm run railway:fix-cycle
```

**Available Node.js Scripts:**
- `npm run check-cycle` - Check survey cycle data
- `npm run fix-cycle` - Fix cycle ID 21 year
- `npm run railway:fix-cycle` - Auto-fix all cycle mismatches
- `npm run seed-barangays` - Seed barangay data
- `npm run db:push` - Push Prisma schema
- And more (see `package.json`)

### For Python Scripts (ML Service, Data Analysis)

```bash
# From ml directory
cd ml
railway login
railway link  # Select your ML service

# Run Python scripts
railway run python check_available_data.py
railway run python verify_database.py
railway run python debug_survey_data.py
```

**Available Python Scripts:**
- `check_available_data.py` - Check data availability
- `verify_database.py` - Verify DB connection
- `debug_survey_data.py` - Debug survey data
- `check_tables.py` - Check database tables
- `test_ml.py` - Test ML predictions
- And more (see `/ml` folder)

## Quick Setup

### Install Railway CLI

```powershell
# Windows PowerShell
iwr https://railway.app/install.ps1 | iex

# Or via npm
npm install -g @railway/cli
```

### Login and Link Services

```bash
# For Next.js service
railway login
railway link  # Select Next.js service
railway run npm run check-cycle

# For ML service
cd ml
railway link  # Select ML service
railway run python verify_database.py
```

## Environment Variables

### Next.js Service Needs:
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- `JWT_SECRET` - JWT secret
- `ML_API_URL` - URL of your ML service

### ML Service Needs:
- `DATABASE_URL` - PostgreSQL connection (same as Next.js)
- `PORT` - Auto-set by Railway

### Check/Set Variables:

```bash
# List variables
railway variables

# Set a variable
railway variables set VARIABLE_NAME=value
```

## Common Tasks

### Fix Survey Cycle Data (Node.js)
```bash
# From project root
railway run npm run railway:fix-cycle
```

### Check ML Service Data (Python)
```bash
# From ml directory
cd ml
railway run python check_available_data.py
```

### View Logs
```bash
# Next.js service logs
railway logs

# ML service logs
cd ml
railway logs
```

### Run Database Migrations
```bash
# Next.js service
railway run npm run db:push
railway run npx prisma migrate deploy
```

### Test ML API
```bash
# From ml directory
cd ml
railway run python test_api_endpoint.py
```

## Troubleshooting

### "Wrong service" or "Command not found"

**Problem**: You're trying to run a Node.js script on the Python service or vice versa.

**Solution**: Make sure you're in the right directory and linked to the right service:

```bash
# For Node.js scripts
cd /path/to/project/root
railway link  # Select Next.js service
railway run npm run <script>

# For Python scripts
cd /path/to/project/ml
railway link  # Select ML service
railway run python <script>.py
```

### "Missing environment variables"

**Problem**: Required env vars not set on Railway.

**Solution**: Check and set variables:
```bash
railway variables
railway variables set VARIABLE_NAME=value
```

### "Cannot connect to database"

**Problem**: DATABASE_URL not set or incorrect.

**Solution**: 
1. Get DATABASE_URL from Railway dashboard
2. Set it on both services:
```bash
railway variables set DATABASE_URL=postgresql://...
```

### Scripts work locally but not on Railway

**Problem**: Local environment differs from Railway.

**Solution**: 
1. Check Railway logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Ensure dependencies are installed (Railway does this automatically on deploy)

## Alternative: Railway Dashboard

If CLI doesn't work, use the web dashboard:

1. Go to https://railway.app
2. Open your project
3. Click on the service (Next.js or ML)
4. Go to "Settings" → "One-off Commands"
5. Enter command:
   - For Node.js: `npm run railway:fix-cycle`
   - For Python: `python check_available_data.py`
6. Click "Run"

## File Structure Reference

```
your-project/
├── scripts/                    # Node.js scripts
│   ├── check-cycle-data.js
│   ├── fix-cycle-year.js
│   └── railway-fix-cycle.js
├── ml/                         # Python ML service
│   ├── app.py                  # Main FastAPI app
│   ├── check_available_data.py
│   ├── verify_database.py
│   └── ...other Python scripts
├── package.json                # Node.js dependencies & scripts
└── ml/requirements.txt         # Python dependencies
```

## Quick Reference Card

| Task | Service | Command |
|------|---------|---------|
| Fix cycle data | Next.js | `railway run npm run railway:fix-cycle` |
| Check cycle data | Next.js | `railway run npm run check-cycle` |
| Verify ML database | Python | `cd ml && railway run python verify_database.py` |
| Check ML data | Python | `cd ml && railway run python check_available_data.py` |
| View Next.js logs | Next.js | `railway logs` |
| View ML logs | Python | `cd ml && railway logs` |
| List env vars | Either | `railway variables` |
| Get shell access | Either | `railway shell` |

## Documentation Links

- **Node.js Scripts**: See `RAILWAY_QUICK_FIX.md` and `RAILWAY_SCRIPT_GUIDE.md`
- **Python Scripts**: See `ml/RAILWAY_PYTHON_SCRIPTS.md`
- **ML Deployment**: See `ml/DEPLOYMENT.md`
- **Railway Docs**: https://docs.railway.app
