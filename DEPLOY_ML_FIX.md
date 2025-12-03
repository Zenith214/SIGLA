# Deploy ML Service Fix to Railway

## Changes Made

### 1. Updated Next.js App (SIGLA Service)
- Modified `/src/app/api/ml/funnel-analysis/route.ts` to call ML API via HTTP
- Modified `/src/app/api/ml/insights/route.ts` to call ML API via HTTP
- Added fallback to local Python execution for development

### 2. Updated Python ML Service
- Fixed `/ml/app.py` to actually call `analyze_barangay()` method
- Added proper logging and error handling

### 3. Added Environment Variable
- Added `ML_API_URL` to `.env` and `.env.example`

## Deployment Steps

### Step 1: Commit and Push Changes

```bash
git add .
git commit -m "fix: Update ML service to use HTTP API instead of local Python execution"
git push origin main
```

### Step 2: Add ML_API_URL to Railway (SIGLA Service)

**Option A: Via Railway Dashboard**
1. Go to https://railway.app
2. Open your project
3. Click **"SIGLA"** service (Next.js app)
4. Go to **"Variables"** tab
5. Click **"+ New Variable"**
6. Add:
   ```
   Variable: ML_API_URL
   Value: https://mlgrc-pulse-ml.up.railway.app
   ```
7. Click **"Add"**

**Option B: Via Railway CLI**
```bash
# Make sure you're in the project root
railway link  # Select SIGLA service

# Add the variable
railway variables set ML_API_URL=https://mlgrc-pulse-ml.up.railway.app
```

### Step 3: Wait for Deployments

Both services will automatically redeploy:
1. **ML Scripts** service (Python) - 2-3 minutes
2. **SIGLA** service (Next.js) - 3-5 minutes

Monitor deployments in Railway dashboard.

### Step 4: Verify the Fix

1. **Test ML Service Health:**
   ```bash
   curl https://mlgrc-pulse-ml.up.railway.app/health
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "model": "loaded"
   }
   ```

2. **Test ML Analysis Endpoint:**
   ```bash
   curl -X POST https://mlgrc-pulse-ml.up.railway.app/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"barangay_id": 10, "cycle_id": 21}'
   ```
   Should return analysis results (not an error).

3. **Test in Your App:**
   - Go to: https://mlgrc-pulse.up.railway.app
   - Click on a barangay card
   - Satisfaction scores should now load (not 0%)
   - Overall satisfaction should display correctly

## Troubleshooting

### ML Service Returns 500 Error

Check ML service logs:
```bash
cd ml
railway link  # Select ML Scripts service
railway logs
```

Look for:
- Database connection errors
- Missing dependencies
- Python import errors

### Next.js App Still Shows 0%

1. **Check SIGLA service logs:**
   ```bash
   railway link  # Select SIGLA service
   railway logs
   ```

2. **Look for errors like:**
   - "Failed to connect to ML service"
   - "ML_API_URL is not defined"
   - "ECONNREFUSED"

3. **Verify ML_API_URL is set:**
   ```bash
   railway variables
   ```
   Should show: `ML_API_URL=https://mlgrc-pulse-ml.up.railway.app`

### ML Service is Slow (First Request)

This is normal! Railway services "sleep" after inactivity. The first request after waking up can take 10-15 seconds. Subsequent requests will be fast (1-3 seconds).

To keep the service warm, you could:
- Add a cron job to ping the health endpoint every 5 minutes
- Upgrade to Railway Pro (keeps services always running)

### Database Connection Errors in ML Service

Make sure the ML service has `DATABASE_URL` set:

```bash
cd ml
railway link  # Select ML Scripts service
railway variables

# If missing, add it:
railway variables set DATABASE_URL=<your-database-url>
```

The DATABASE_URL should be the same as your SIGLA service.

## What Changed

### Before (Broken on Railway)
```typescript
// Tried to run Python locally
const pythonCommand = `python analyze_barangay.py`;
const { stdout } = await execAsync(pythonCommand);
// ❌ Fails on Railway - no Python environment
```

### After (Works on Railway)
```typescript
// Calls ML API via HTTP
const response = await fetch(`${ML_API_URL}/api/analyze`, {
  method: 'POST',
  body: JSON.stringify({ barangay_id, cycle_id })
});
const mlResults = await response.json();
// ✅ Works on Railway - uses separate ML service
```

## Expected Results

After deployment:

✅ Barangay cards show actual satisfaction scores (not 0%)
✅ Overall satisfaction calculates correctly
✅ Need for action percentages display
✅ ML insights and recommendations appear
✅ Funnel analysis works properly
✅ Action grid quadrants display correctly

## Performance Notes

- **First request**: 10-15 seconds (service wake-up)
- **Cached requests**: < 100ms (from cache)
- **Subsequent requests**: 1-3 seconds (ML computation)
- **Cache TTL**: 12 hours (configurable)

## Monitoring

Check both services are healthy:

```bash
# ML Service
curl https://mlgrc-pulse-ml.up.railway.app/health

# Next.js App
curl https://mlgrc-pulse.up.railway.app/api/health
```

## Rollback Plan

If something goes wrong:

1. **Remove ML_API_URL variable** (forces local Python execution)
2. **Revert code changes:**
   ```bash
   git revert HEAD
   git push origin main
   ```
3. **Wait for redeploy**

## Next Steps

After confirming everything works:

1. Update other ML routes (`/api/ml/predict/route.ts`, etc.)
2. Add error handling for ML service downtime
3. Implement retry logic for failed ML API calls
4. Add loading states in UI while waiting for ML analysis
5. Consider adding ML service health checks to dashboard

## Questions?

See:
- `RAILWAY_ML_FIX.md` - Detailed ML service connection guide
- `RAILWAY_COMPLETE_GUIDE.md` - Complete Railway deployment guide
- Railway logs for debugging
