# Quick Fix for Railway Scripts

## The Problem
Your cycle fix scripts aren't working on Railway because they need to be run in Railway's environment with the correct environment variables.

## Quick Solution (3 Steps)

### 1. Install Railway CLI
```powershell
# Windows PowerShell (run as administrator)
iwr https://railway.app/install.ps1 | iex
```

### 2. Login and Link
```bash
railway login
railway link
```

### 3. Run the Fix
```bash
railway run npm run railway:fix-cycle
```

That's it! The script will automatically:
- Check all survey cycles
- Find any with mismatched years
- Fix them automatically
- Verify the fixes

## Alternative: Use Railway Dashboard

If CLI doesn't work:

1. Go to https://railway.app
2. Open your project
3. Click on your service
4. Go to "Settings" tab
5. Find "One-off Commands" or "Run Command"
6. Enter: `npm run railway:fix-cycle`
7. Click "Run"

## What If Environment Variables Are Missing?

Check in Railway Dashboard:
1. Go to your service
2. Click "Variables" tab
3. Make sure these exist:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

Get the service role key from:
1. Go to https://supabase.com
2. Open your project
3. Settings > API
4. Copy the "service_role" key (NOT the anon key)
5. Add it to Railway variables

## Verify the Fix

After running the script:
1. Visit: https://mlgrc-pulse.up.railway.app/settings
2. Check the Survey Targets section
3. The year should now display correctly

## Troubleshooting

### "railway: command not found"
- Railway CLI not installed. Use the installation command above.

### "Missing environment variables"
- Add `SUPABASE_SERVICE_ROLE_KEY` to Railway variables (see above)

### "Cannot find module"
- Run: `railway run npm install` first

### Still not working?
Run locally against production:
```bash
# Get production DATABASE_URL
railway variables get NEXT_PUBLIC_SUPABASE_URL
railway variables get SUPABASE_SERVICE_ROLE_KEY

# Add to your local .env temporarily
# Then run: npm run railway:fix-cycle
# Then restore your local .env
```

## Need More Help?

See the full guide: `RAILWAY_SCRIPT_GUIDE.md`
