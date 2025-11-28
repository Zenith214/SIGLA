# Deployment Guide

## Pre-Deployment Cleanup

Run the cleanup script to remove unnecessary files:

```powershell
.\cleanup.ps1
```

This removes:
- Test output folders (coverage, test-results, playwright-report)
- Build artifacts (.next, tsconfig.tsbuildinfo)
- node_modules (will be reinstalled)

## Railway Deployment

### 1. Setup Railway Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

### 2. Configure Environment Variables

Add these in Railway dashboard:
- `DATABASE_URL` - Your Supabase connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `JWT_SECRET` - Your JWT secret
- `GEMINI_API_KEY` - Your Gemini API key (if using AI features)
- `NODE_ENV=production`

### 3. Deploy

```bash
railway up
```

## What Gets Excluded from Build

The following are automatically excluded (see `.vercelignore` and `.dockerignore`):

- **Test files**: `coverage/`, `test-results/`, `playwright-report/`, `*.test.ts`, `tests/`
- **Documentation**: `docs/`, `ml-algorithm-selection/`, `README-*.md`
- **Database files**: `*.sql`, `database/*.md`
- **Development scripts**: `scripts/examples/`, test scripts, db management scripts
- **PowerShell scripts**: `*.ps1`
- **Python ML**: `ml/`, `.venv/` (deploy separately)
- **IDE configs**: `.vscode/`, `.kiro/`

## Build Size Optimizations

The build is optimized through:

1. **Next.js config** (`next.config.ts`):
   - Console logs removed in production
   - Source maps disabled
   - Package imports optimized (lucide-react, recharts, leaflet)
   - Test files excluded from webpack bundle

2. **Dependencies**:
   - Only production dependencies installed on Railway
   - Dev dependencies excluded from final build

3. **Image optimization**:
   - WebP and AVIF formats enabled
   - Minimum cache TTL set

## Estimated Build Size

- **Without cleanup**: ~500-800 MB
- **With cleanup**: ~200-300 MB
- **Final deployed size**: ~150-200 MB

## Python ML Service (Separate Deployment)

Deploy the ML service separately on Railway:

1. Create a new Railway service
2. Point to the `ml/` directory
3. Set Python runtime
4. Add environment variables
5. Update Next.js app to call ML service URL

## Monitoring

After deployment:
- Check Railway logs for errors
- Monitor memory usage (should be <512 MB)
- Test all critical features
- Verify database connections

## Rollback

If issues occur:
```bash
railway rollback
```

Or redeploy previous version from Railway dashboard.
