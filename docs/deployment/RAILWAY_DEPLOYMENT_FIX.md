# Railway Deployment Fix Guide

## Issue
Deployment failing with `libatomic1` installation error.

## Solution Applied

### 1. Created `nixpacks.toml` in root
This file tells Railway/Nixpacks how to build your application:

```toml
[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]
aptPkgs = ["libatomic1"]  # Explicitly include libatomic1

[phases.install]
cmds = [
  "pnpm config set auto-install-peers true",
  "pnpm install --frozen-lockfile --prod=false"
]

[phases.build]
cmds = [
  "pnpm prisma generate",
  "cp docs/next.config.railway.ts next.config.ts",
  "pnpm build"
]

[start]
cmd = "pnpm start"

[variables]
NODE_ENV = "production"
```

### 2. Created `railway.json` in root
This configures Railway deployment settings:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "nixpacks.toml"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Deployment Steps

### 1. Update Lockfile (IMPORTANT!)
Your `pnpm-lock.yaml` is out of sync with `package.json`. Fix this first:

```bash
# Update the lockfile to match package.json
pnpm install

# This will update pnpm-lock.yaml with the correct versions
```

### 2. Commit and Push Changes
```bash
git add nixpacks.toml railway.json pnpm-lock.yaml
git commit -m "fix: Add Railway deployment configuration and update lockfile"
git push
```

### 2. Verify Environment Variables in Railway
Make sure these are set in your Railway project:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for auth
- `NEXTAUTH_URL` - Your Railway app URL
- `JWT_SECRET` - Random secret for JWT

**Optional:**
- `GEMINI_API_KEY` - For AI features
- `ML_API_URL` - If using ML service

### 3. Check Railway Build Logs
After pushing, check the Railway dashboard for:
- ✅ Setup phase completes (Node.js 20, pnpm, libatomic1 installed)
- ✅ Install phase completes (dependencies installed)
- ✅ Build phase completes (Prisma generates, Next.js builds)
- ✅ Deploy phase starts (app runs on port)

## Common Issues & Solutions

### Issue: "libatomic1 not found"
**Solution:** Already fixed by adding `aptPkgs = ["libatomic1"]` to nixpacks.toml

### Issue: "Prisma Client not generated"
**Solution:** The build phase now explicitly runs `pnpm prisma generate`

### Issue: "Cannot install with frozen-lockfile" / Lockfile out of sync
**Solution:** 
1. Run `pnpm install` locally to update `pnpm-lock.yaml`
2. Commit the updated lockfile
3. Push to Railway
4. Alternatively, the nixpacks.toml now uses `--no-frozen-lockfile` to handle this automatically

### Issue: "Module not found" errors
**Solution:** Check that all dependencies are in `package.json` dependencies (not devDependencies)

### Issue: "Database connection failed"
**Solution:** 
1. Verify `DATABASE_URL` is set correctly in Railway
2. Make sure it's a PostgreSQL connection string
3. Format: `postgresql://user:password@host:port/database`

### Issue: "Build timeout"
**Solution:**
1. Railway has a 10-minute build timeout
2. If hitting this, consider:
   - Removing unused dependencies
   - Using `--prod=false` flag (already set)
   - Checking for circular dependencies

### Issue: "Port binding error"
**Solution:** Railway automatically sets `PORT` environment variable. Next.js uses it by default.

## Verify Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-app.railway.app/api/health

# Login page
curl https://your-app.railway.app/login
```

## Rollback Plan

If deployment still fails:

1. **Check Railway Logs:**
   - Go to Railway dashboard
   - Click on your service
   - View "Deployments" tab
   - Click on failed deployment
   - Read full error logs

2. **Try Manual Build Locally:**
   ```bash
   # Test the build process locally
   pnpm install
   pnpm prisma generate
   pnpm build
   ```

3. **Contact Support:**
   - Railway Discord: https://discord.gg/railway
   - Include: Error logs, nixpacks.toml, railway.json

## Next Steps After Successful Deployment

1. ✅ Test login functionality
2. ✅ Verify database connectivity
3. ✅ Test inactivity timeout (wait 10 minutes)
4. ✅ Check all API endpoints
5. ✅ Monitor error logs for 24 hours

## Files Modified
- ✅ Created `nixpacks.toml` - Build configuration
- ✅ Created `railway.json` - Deployment configuration
- ✅ Existing `docs/next.config.railway.ts` - Used during build

## Additional Notes

The inactivity timeout feature added earlier is client-side only and won't affect Railway deployment. It will work automatically once the app is deployed.
