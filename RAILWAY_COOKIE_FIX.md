# Railway Cookie/Session Fix

## Problem
Login succeeds but immediately redirects back to login page. This is a cookie issue.

## Root Cause
The `pulse_token` cookie is not being set or read properly in production. Possible causes:
1. `secure: true` flag requires HTTPS (Railway provides this, but might have routing issues)
2. `sameSite: 'lax'` might be too restrictive
3. Domain mismatch between cookie and request

## Quick Fix - Check Railway Environment

### 1. Verify Environment Variables in Railway
Make sure these are set:
- `NODE_ENV=production`
- `JWT_SECRET` (should be a long random string)
- `DATABASE_URL` (PostgreSQL connection string)

### 2. Check Railway Logs
Look for these log messages after login:
```
🍪 [LOGIN API] Cookie settings: { ... }
✅ [LOGIN API] Login successful
```

If you see these, the cookie is being set server-side.

### 3. Check Browser Console
After login attempt:
1. Open DevTools → Application → Cookies
2. Look for `pulse_token` cookie
3. Check if it exists and has the right domain

## Solution Options

### Option 1: Temporary Debug (Recommended First)
Add logging to see what's happening:

Already added logging to `src/app/api/login/route.ts`. Check Railway logs after login.

### Option 2: Adjust Cookie Settings
If Railway is behind a proxy or has domain issues, try:

```typescript
response.cookies.set('pulse_token', token, {
  httpOnly: true,
  secure: true, // Force true for Railway HTTPS
  sameSite: 'none', // More permissive for cross-domain
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
});
```

### Option 3: Check Railway Domain
Ensure you're accessing via Railway's provided domain (e.g., `https://your-app.up.railway.app`), not:
- HTTP (not HTTPS)
- IP address
- Localhost forwarding

## Testing Steps

1. **Clear all cookies** in your browser for the Railway domain
2. **Open DevTools** → Network tab
3. **Login** and watch the `/api/login` request
4. **Check Response Headers** for `Set-Cookie: pulse_token=...`
5. **Check if cookie appears** in Application → Cookies

## Expected Behavior

### Successful Login Flow:
1. POST to `/api/login` → Returns 200 with `Set-Cookie` header
2. Cookie `pulse_token` appears in browser
3. Redirect to dashboard
4. Middleware reads cookie and allows access

### Current Broken Flow:
1. POST to `/api/login` → Returns 200 ✅
2. Cookie NOT set or not readable ❌
3. Redirect to dashboard
4. Middleware doesn't find cookie → Redirects to login ❌

## Railway-Specific Issues

### Issue: Railway Proxy Headers
Railway might be behind a proxy. Check if you need to trust proxy headers.

Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
      ],
    },
  ];
},
```

### Issue: Railway Domain
Make sure `NEXTAUTH_URL` or similar is set to your Railway domain:
```
NEXTAUTH_URL=https://your-app.up.railway.app
```

## Quick Test Command

Run this in Railway logs to see cookie settings:
```bash
railway logs --follow
```

Then login and look for the cookie settings log.

## If Nothing Works

Try switching to a different session storage method:
1. Use localStorage (less secure but works)
2. Use session tokens in headers instead of cookies
3. Use Railway's Redis addon for session storage

## Current Status

✅ Login API works
✅ JWT token generated
✅ Cookie set command executed
❌ Cookie not persisting/readable
❌ Middleware can't find cookie

Next step: Check Railway logs for cookie settings output.
