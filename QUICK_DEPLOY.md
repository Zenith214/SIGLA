# Quick Deploy - ML Service Fix

## What Was Fixed

The code now automatically adds `https://` to the ML_API_URL if it's missing. This fixes the "Failed to parse URL" error.

## Deploy Now

```bash
# 1. Commit changes
git add .
git commit -m "fix: Auto-add https:// protocol to ML_API_URL"
git push origin main

# 2. Railway will auto-deploy (wait 3-5 minutes)

# 3. Test it!
# Visit: https://mlgrc-pulse.up.railway.app
# Click a barangay card
# Satisfaction scores should now load!
```

## If ML_API_URL is Not Set on Railway

Add it via Railway CLI:

```bash
railway link  # Select SIGLA service
railway variables set ML_API_URL=mlgrc-pulse-ml.up.railway.app
```

Or via Railway Dashboard:
1. Go to SIGLA service
2. Variables tab
3. Add: `ML_API_URL` = `mlgrc-pulse-ml.up.railway.app`

## Verify It Works

After deployment completes:

```bash
# Check Railway logs
railway logs

# Should see:
# ✅ "Calling ML API at https://mlgrc-pulse-ml.up.railway.app"
# ✅ "Received ML results from API"
```

## What Changed

**Before:**
```typescript
const mlApiUrl = process.env.ML_API_URL; // "mlgrc-pulse-ml.up.railway.app"
fetch(`${mlApiUrl}/api/analyze`); // ❌ Invalid URL
```

**After:**
```typescript
let mlApiUrl = process.env.ML_API_URL; // "mlgrc-pulse-ml.up.railway.app"
if (!mlApiUrl.startsWith('http')) {
  mlApiUrl = `https://${mlApiUrl}`; // "https://mlgrc-pulse-ml.up.railway.app"
}
fetch(`${mlApiUrl}/api/analyze`); // ✅ Valid URL
```

## Expected Result

✅ Barangay cards show satisfaction scores
✅ Overall satisfaction displays correctly
✅ No more "Failed to parse URL" errors
✅ ML analysis runs successfully

## Still Having Issues?

Check Railway logs:
```bash
railway link  # Select SIGLA service
railway logs
```

Look for:
- ✅ "Calling ML API at https://..." (should have https://)
- ❌ Any fetch errors or timeouts
- ❌ ML service returning 500 errors

If ML service has errors, check ML service logs:
```bash
cd ml
railway link  # Select ML Scripts service
railway logs
```
