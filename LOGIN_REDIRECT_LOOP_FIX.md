# Login Redirect Loop Fix

## Problem
Users are experiencing a redirect loop when logging in to the deployed application. After successful login, they are immediately redirected back to the login page.

## Root Causes Identified

### 1. Missing JWT_SECRET Environment Variable
The `.env` file was missing the `JWT_SECRET` variable, causing the application to fall back to the default `'dev_secret_key'`. This could cause token validation issues if the deployed environment uses a different secret.

### 2. Cookie Not Being Set/Read Properly
The authentication cookie `pulse_token` may not be properly set or read in the production environment due to:
- Domain mismatch
- Secure flag issues with HTTPS
- SameSite attribute conflicts
- Cookie not being sent with subsequent requests

### 3. Insufficient Logging
The application lacked detailed logging to diagnose cookie and authentication issues in production.

## Fixes Applied

### 1. Added JWT_SECRET to .env
```env
JWT_SECRET="your-secure-jwt-secret-key-change-this-in-production"
```

**IMPORTANT**: You MUST set this in your Railway environment variables:
1. Go to your Railway project dashboard
2. Navigate to Variables tab
3. Add `JWT_SECRET` with a strong, unique value
4. Redeploy the application

### 2. Enhanced Cookie Logging in Login API
Added comprehensive logging to track cookie setting:
- Cookie options (httpOnly, secure, sameSite, path, maxAge)
- Environment details (NODE_ENV, host, protocol)
- Cookie header value

### 3. Enhanced Middleware Logging
Added detailed logging to track authentication flow:
- Token presence and preview
- All cookies available
- Request headers (host, protocol, user-agent)

### 4. Enhanced /api/me Logging
Added logging to track token validation:
- Token presence
- Available cookies
- Request headers

## Testing Steps

### Local Testing
1. Clear all cookies for localhost
2. Try logging in
3. Check browser console for logs
4. Check Network tab for:
   - `/api/login` response headers (should have `Set-Cookie`)
   - Subsequent requests (should include `Cookie` header with `pulse_token`)

### Production Testing (Railway)
1. Open browser DevTools
2. Go to Application/Storage tab → Cookies
3. Clear all cookies for your Railway domain
4. Attempt login
5. Check:
   - Console logs (should show detailed authentication flow)
   - Network tab → `/api/login` response → Headers → `Set-Cookie`
   - Network tab → `/dashboard` request → Headers → `Cookie` (should include `pulse_token`)
   - Application tab → Cookies → Should see `pulse_token` cookie

## Railway Environment Variables Checklist

Ensure these are set in Railway:
- ✅ `DATABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ `JWT_SECRET` (ADD THIS!)
- ✅ `NODE_ENV=production`
- ✅ `ML_API_URL`
- ✅ `GEMINI_API_KEY`

## Common Issues and Solutions

### Issue 1: Cookie Not Set
**Symptoms**: No `Set-Cookie` header in `/api/login` response
**Solution**: 
- Check that `JWT_SECRET` is set in Railway
- Verify `NODE_ENV=production` is set
- Check Railway logs for cookie setting logs

### Issue 2: Cookie Not Sent
**Symptoms**: Cookie is set but not sent with subsequent requests
**Solution**:
- Check cookie domain (should match your Railway domain)
- Verify `secure` flag matches HTTPS usage
- Check `sameSite` attribute (should be `lax`)

### Issue 3: Token Validation Fails
**Symptoms**: Cookie is sent but middleware redirects to login
**Solution**:
- Verify `JWT_SECRET` matches between login and validation
- Check token expiration (7 days)
- Review middleware logs for validation errors

### Issue 4: CORS/Domain Issues
**Symptoms**: Cookie works locally but not in production
**Solution**:
- Ensure Railway domain is properly configured
- Check that no domain is explicitly set in cookie options (let browser handle it)
- Verify HTTPS is working (Railway provides this automatically)

## Debugging Commands

### Check Railway Logs
```bash
railway logs
```

### Check Environment Variables
```bash
railway variables
```

### Test Login API Directly
```bash
curl -X POST https://your-app.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -v
```

Look for `Set-Cookie` in the response headers.

## Next Steps

1. **Set JWT_SECRET in Railway**
   ```bash
   railway variables set JWT_SECRET="your-strong-secret-here"
   ```

2. **Redeploy**
   ```bash
   railway up
   ```

3. **Test Login Flow**
   - Clear cookies
   - Login
   - Check logs in Railway dashboard
   - Verify redirect works

4. **Monitor Logs**
   - Watch for cookie setting logs: `🍪 [LOGIN API] Cookie settings:`
   - Watch for middleware logs: `🔒 [MIDDLEWARE]`
   - Watch for /api/me logs: `👤 [/api/me]`

## Additional Notes

- The cookie is set with `httpOnly: true` for security (cannot be accessed via JavaScript)
- The cookie is set with `secure: true` in production (requires HTTPS)
- The cookie is set with `sameSite: 'lax'` to allow navigation
- The cookie expires after 7 days
- The middleware checks for the cookie on all protected routes

## If Issues Persist

If the login loop continues after these fixes:

1. Check Railway logs for specific error messages
2. Verify all environment variables are set correctly
3. Test with different browsers (some browsers have strict cookie policies)
4. Check if Railway domain is accessible via HTTPS
5. Verify database connection is working
6. Test with a fresh user account

## Contact

If you need further assistance, provide:
- Railway logs (last 100 lines)
- Browser console logs
- Network tab screenshots showing cookie headers
- Environment variables list (without sensitive values)
