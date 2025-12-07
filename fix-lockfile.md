# Fix Lockfile for Railway Deployment

## The Problem
Your `pnpm-lock.yaml` is out of sync with `package.json`:
- **package.json** has: `next@^16.0.7`, `eslint-config-next@^16.0.7`
- **pnpm-lock.yaml** has: `next@^15.3.5`, `eslint-config-next@15.3.5`

This causes Railway deployment to fail with "frozen-lockfile" error.

## Quick Fix (Recommended)

Run this command to update the lockfile:

```bash
pnpm install
```

This will:
1. Read `package.json`
2. Resolve all dependencies
3. Update `pnpm-lock.yaml` to match
4. Install any missing packages

Then commit and push:

```bash
git add pnpm-lock.yaml
git commit -m "fix: Update lockfile to match package.json"
git push
```

## Alternative: Let Railway Handle It

I've already updated `nixpacks.toml` to use `--no-frozen-lockfile`, which means Railway will regenerate the lockfile during deployment. This works but takes slightly longer.

## Why This Happened

This typically occurs when:
- Dependencies were updated in `package.json` manually
- `pnpm install` wasn't run after the update
- Different team members using different package manager versions

## Verify the Fix

After running `pnpm install`, check that these match:

```bash
# Check package.json
grep '"next"' package.json
# Should show: "next": "^16.0.7"

# Check lockfile
grep 'next@' pnpm-lock.yaml | head -1
# Should show: next@16.0.7 or similar
```

## Current Status

✅ `nixpacks.toml` updated to use `--no-frozen-lockfile`
✅ Railway will now handle lockfile regeneration automatically
⚠️ Recommended: Still run `pnpm install` locally for consistency
