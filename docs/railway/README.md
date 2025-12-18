# Railway Deployment Documentation

This folder contains all documentation related to deploying and managing the SIGLA application on Railway.

## Quick Start

**New to Railway?** Start here:
1. [RAILWAY_COMPLETE_GUIDE.md](./RAILWAY_COMPLETE_GUIDE.md) - Complete overview of both services
2. [SUCCESS_SUMMARY.md](./SUCCESS_SUMMARY.md) - What's working and how it works

## Service Architecture

SIGLA runs on **two separate Railway services**:

1. **SIGLA Service** (Next.js) - Main application
   - URL: `https://mlgrc-pulse.up.railway.app`
   - Handles web interface, API routes, authentication

2. **ML Scripts Service** (Python/FastAPI) - Machine learning service
   - URL: `https://mlgrc-pulse-ml.up.railway.app`
   - Handles ML analysis, predictions, insights

## Documentation Index

### Setup & Configuration

- **[RAILWAY_COMPLETE_GUIDE.md](./RAILWAY_COMPLETE_GUIDE.md)** - Master guide for both services
- **[RAILWAY_ML_FIX.md](./RAILWAY_ML_FIX.md)** - How to connect ML service to main app
- **[ML_SERVICE_ENV_FIX.md](./ML_SERVICE_ENV_FIX.md)** - Add Supabase credentials to ML service

### Deployment

- **[DEPLOY_ML_FIX.md](./DEPLOY_ML_FIX.md)** - Complete deployment steps
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick deployment commands
- **[FINAL_ML_FIX.md](./FINAL_ML_FIX.md)** - Final deployment checklist

### Running Scripts

- **[RAILWAY_SCRIPT_GUIDE.md](./RAILWAY_SCRIPT_GUIDE.md)** - How to run Node.js scripts on Railway
- **[RAILWAY_PYTHON_SCRIPTS.md](./RAILWAY_PYTHON_SCRIPTS.md)** - How to run Python scripts on Railway
- **[RAILWAY_QUICK_FIX.md](./RAILWAY_QUICK_FIX.md)** - Quick fixes for common issues

### Troubleshooting

- **[SUCCESS_SUMMARY.md](./SUCCESS_SUMMARY.md)** - What should be working
- **[RAILWAY_SURVEY_TARGETS_FIX.md](./RAILWAY_SURVEY_TARGETS_FIX.md)** - Survey targets error fixes

## Common Tasks

### Deploy Changes
```bash
git add .
git commit -m "your message"
git push origin main
# Railway auto-deploys
```

### Run Node.js Scripts
```bash
railway link  # Select SIGLA service
railway run npm run <script-name>
```

### Run Python Scripts
```bash
cd ml
railway link  # Select ML Scripts service
railway run python <script-name>.py
```

### Check Logs
```bash
# SIGLA service
railway logs

# ML service
cd ml
railway logs
```

### Environment Variables
```bash
# List variables
railway variables

# Set a variable
railway variables set KEY=value
```

## Required Environment Variables

### SIGLA Service (Next.js)
- `DATABASE_URL` - PostgreSQL connection
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- `JWT_SECRET` - JWT secret
- `ML_API_URL` - ML service URL (e.g., `https://mlgrc-pulse-ml.up.railway.app`)

### ML Scripts Service (Python)
- `DATABASE_URL` - PostgreSQL connection (same as SIGLA)
- `SUPABASE_URL` - Supabase URL
- `SUPABASE_KEY` - Supabase service role key
- `PORT` - Auto-set by Railway

## Support

If you encounter issues:

1. Check the relevant documentation above
2. Review Railway logs: `railway logs`
3. Verify environment variables: `railway variables`
4. Check Railway service status in dashboard

## Related Documentation

- [Main README](../../README.md) - Project overview
- [Quick Start Guide](../../QUICK_START_GUIDE.md) - Local development setup
- [Project Structure](../../PROJECT_STRUCTURE.md) - Codebase organization
