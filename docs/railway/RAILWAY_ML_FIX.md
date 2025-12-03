# Fix ML Service Connection on Railway

## The Problem

Your barangay details page shows 0% satisfaction because the Next.js app **cannot connect to the Python ML service**. The ML service is running at `https://mlgrc-pulse-ml.up.railway.app/` but the Next.js app doesn't know where to find it.

## The Solution

Add the `ML_API_URL` environment variable to your **SIGLA service** (Next.js app) on Railway.

## Steps to Fix

### 1. Add Environment Variable in Railway Dashboard

1. Go to https://railway.app
2. Open your project
3. Click on **"SIGLA"** service (the Next.js app, NOT the ML Scripts service)
4. Go to **"Variables"** tab
5. Click **"+ New Variable"**
6. Add:
   ```
   Variable: ML_API_URL
   Value: https://mlgrc-pulse-ml.up.railway.app
   ```
   (Note: You can also use `mlgrc-pulse-ml.up.railway.app` without `https://` - the code will add it automatically)
7. Click **"Add"**

### 2. Redeploy the SIGLA Service

After adding the variable, Railway should automatically redeploy. If not:

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

### 3. Verify the Fix

1. Wait for deployment to complete (2-3 minutes)
2. Go to: `https://mlgrc-pulse.up.railway.app`
3. Click on a barangay card
4. The satisfaction scores should now load properly!

## Alternative: Use Railway CLI

```bash
# Make sure you're linked to the SIGLA service (not ML service)
railway link

# Add the environment variable
railway variables set ML_API_URL=https://mlgrc-pulse-ml.up.railway.app

# Trigger a redeploy
railway up
```

## Why This Fixes It

The Next.js app has code that tries to run Python scripts locally:

```typescript
// This doesn't work on Railway:
const mlScriptPath = path.join(process.cwd(), 'ml', 'analyze_barangay.py');
const pythonCommand = `python ${mlScriptPath}`;
```

Instead, it should call your ML API:

```typescript
// This works on Railway:
const response = await fetch(`${process.env.ML_API_URL}/api/analyze`, {
  method: 'POST',
  body: JSON.stringify({ barangay_id, cycle_id })
});
```

By setting `ML_API_URL`, the app will know to use the HTTP API instead of trying to run Python locally.

## Verify ML Service is Working

Test your ML service directly:

```bash
# Health check
curl https://mlgrc-pulse-ml.up.railway.app/health

# Should return:
# {"status":"healthy","service":"SIGLA ML API","version":"1.0.0"}
```

## After Adding the Variable

Once you add `ML_API_URL` and redeploy:

1. ✅ Barangay satisfaction scores will load
2. ✅ Overall satisfaction will calculate correctly
3. ✅ Need for action percentages will display
4. ✅ ML insights and recommendations will appear

## Troubleshooting

### ML service returns 404 or 500 errors

Check the ML service logs:
```bash
cd ml
railway link  # Select ML Scripts service
railway logs
```

### Still showing 0%

1. Check that data was generated:
   - Go to your app's Tools page
   - Verify synthetic data was created
   - Check that responses exist for the barangay

2. Check Railway logs for the SIGLA service:
   ```bash
   railway link  # Select SIGLA service
   railway logs
   ```

3. Look for errors like:
   - "Failed to connect to ML service"
   - "ML_API_URL is not defined"
   - "ECONNREFUSED" or "ETIMEDOUT"

### ML service is slow

The first request after deployment may take 10-15 seconds as the service "wakes up". Subsequent requests should be faster (1-3 seconds).

## Quick Checklist

- [ ] ML service is running at `https://mlgrc-pulse-ml.up.railway.app`
- [ ] ML service health check returns `{"status":"healthy"}`
- [ ] `ML_API_URL` variable added to SIGLA service
- [ ] SIGLA service redeployed after adding variable
- [ ] Synthetic data generated for barangays
- [ ] Barangay cards now show satisfaction scores

## Next Steps

After fixing this, you may want to:

1. **Update the ML funnel analysis code** to use HTTP calls instead of local Python execution
2. **Add error handling** for when ML service is unavailable
3. **Implement caching** to reduce ML API calls
4. **Add loading states** while waiting for ML analysis

See `RAILWAY_COMPLETE_GUIDE.md` for more information about managing both services.
