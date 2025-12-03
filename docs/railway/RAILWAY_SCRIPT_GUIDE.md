# Running Scripts on Railway

## Problem
The cycle check and fix scripts (`check-cycle-data.js` and `fix-cycle-year.js`) need to be run on Railway's production database.

## Prerequisites

### 1. Install Railway CLI
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Or using npm
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Link to Your Project
```bash
# Navigate to your project directory
cd path/to/your/project

# Link to Railway project
railway link
```

## Running Scripts on Railway

### Method 1: Using Railway CLI (Recommended)

#### Check Cycle Data
```bash
railway run npm run check-cycle
```

#### Fix Cycle Year
```bash
railway run npm run fix-cycle
```

This automatically uses Railway's environment variables (DATABASE_URL, SUPABASE keys, etc.)

### Method 2: Using Railway Shell

```bash
# Open a shell in your Railway environment
railway shell

# Then run the scripts
npm run check-cycle
npm run fix-cycle
```

### Method 3: One-Time Command via Railway Dashboard

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Settings" tab
4. Scroll to "One-off Commands"
5. Enter: `npm run check-cycle` or `npm run fix-cycle`
6. Click "Run"

## Environment Variables Required

Make sure these are set in Railway:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (found in Supabase dashboard under Settings > API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### To Check/Set Environment Variables on Railway:

```bash
# List all environment variables
railway variables

# Set a variable
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key-here
```

Or via Railway Dashboard:
1. Go to your project
2. Click on your service
3. Go to "Variables" tab
4. Add/edit variables

## Troubleshooting

### Error: "Cannot find module '@supabase/supabase-js'"
**Solution:** The scripts run after deployment, so dependencies should be installed. If not:
```bash
railway run npm install
```

### Error: "Missing environment variables"
**Solution:** Check that all required env vars are set:
```bash
railway variables
```

### Error: "Permission denied" or "Authentication failed"
**Solution:** Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct:
1. Go to Supabase Dashboard
2. Settings > API
3. Copy the "service_role" key (not the anon key)
4. Update in Railway: `railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key`

### Scripts work locally but not on Railway
**Solution:** Check that your local `.env` and Railway environment variables match:
```bash
# Compare local vs Railway
cat .env
railway variables
```

## Alternative: Run Scripts Locally Against Production DB

If Railway CLI isn't working, you can run scripts locally but point to production:

1. Get your production DATABASE_URL from Railway:
```bash
railway variables get DATABASE_URL
```

2. Temporarily update your local `.env`:
```env
# BACKUP YOUR LOCAL .env FIRST!
DATABASE_URL=<production-url-from-railway>
NEXT_PUBLIC_SUPABASE_URL=<your-production-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-production-service-key>
```

3. Run the scripts locally:
```bash
npm run check-cycle
npm run fix-cycle
```

4. **IMPORTANT:** Restore your local `.env` after running!

## What These Scripts Do

### check-cycle-data.js
- Fetches all survey cycles from the database
- Displays cycle information (ID, name, year, dates, active status)
- Checks for mismatches between cycle name and year field
- Shows which cycle is currently active

### fix-cycle-year.js
- Specifically updates cycle ID 21 to have year 2026
- Verifies the current state before updating
- Confirms the update was successful

## Next Steps After Running Scripts

1. **Verify the fix:**
   - Visit your Railway app: `https://mlgrc-pulse.up.railway.app/settings`
   - Check the Survey Targets section
   - Verify the cycle year displays correctly

2. **Check the data:**
   - Run `npm run check-cycle` to confirm all cycles are correct
   - Look for the ✅ confirmation that names match years

3. **Monitor logs:**
   ```bash
   railway logs
   ```

## Quick Reference

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Run scripts
railway run npm run check-cycle
railway run npm run fix-cycle

# Check logs
railway logs

# Check environment variables
railway variables
```
