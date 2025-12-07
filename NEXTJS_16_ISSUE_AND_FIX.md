# Next.js 16 Middleware Cookie Issue

## Problem
After upgrading to Next.js 16.0.7, the middleware cannot read cookies for page routes, causing authentication to fail and users to be redirected to login in an infinite loop.

## Root Cause
Next.js 16 introduced breaking changes in how middleware handles cookies. The `request.cookies.get()` API may not work reliably for page routes in the Edge Runtime.

## Evidence
- ✅ Login API works (sets cookie)
- ✅ API routes can read cookies (`/api/me`, `/api/debug-cookies`)
- ❌ Middleware cannot read cookies for page routes (`/dashboard`)
- ✅ Cookie is being sent (confirmed via network inspection)

## Solutions

### Option 1: Downgrade Next.js (Recommended for Quick Fix)

Downgrade to Next.js 15.x which has stable middleware:

```bash
npm install next@15.1.0
# or
npm install next@^15.0.0
```

Then rebuild and redeploy:
```bash
npm run build
railway up
```

### Option 2: Use Alternative Authentication Method

Instead of middleware, use Server Components with `cookies()` from `next/headers`:

```typescript
// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('pulse_token');
  
  if (!token) {
    redirect('/login');
  }
  
  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!);
    // User is authenticated
  } catch {
    redirect('/login');
  }
  
  // Rest of page...
}
```

### Option 3: Wait for Next.js Fix

Next.js 16 is very new (released recently) and this might be a bug that will be fixed in upcoming patches. Monitor:
- https://github.com/vercel/next.js/issues
- Next.js 16.0.8, 16.0.9, etc. releases

### Option 4: Use Next-Auth or Similar

Migrate to a battle-tested authentication library:
- NextAuth.js (now Auth.js)
- Clerk
- Supabase Auth (you're already using Supabase!)

## Recommended Immediate Action

**Downgrade to Next.js 15:**

1. Update package.json:
```json
{
  "dependencies": {
    "next": "15.1.0"
  }
}
```

2. Install:
```bash
npm install
```

3. Test locally:
```bash
npm run dev
# Test login at localhost:3000
```

4. If it works, deploy:
```bash
git add package.json package-lock.json
git commit -m "Downgrade to Next.js 15 to fix middleware cookie issue"
git push origin master
```

## Alternative: Fix Middleware for Next.js 16

If you want to stay on Next.js 16, try this middleware configuration:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths
  if (['/login', '/register', '/'].includes(pathname)) {
    return NextResponse.next();
  }
  
  // Get token from request - Next.js 16 way
  const response = NextResponse.next();
  
  // Read cookie from request
  const cookieStore = request.cookies;
  const token = cookieStore.get('pulse_token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Validate token...
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Testing After Fix

1. Clear browser cookies
2. Login
3. Should redirect to dashboard successfully
4. Refresh page - should stay logged in
5. Navigate to other protected routes - should work

## Long-term Recommendation

Consider migrating to Supabase Auth since you're already using Supabase:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Check auth in middleware
const { data: { session } } = await supabase.auth.getSession();
```

This handles all cookie/session management for you and is compatible with Next.js 16.

## Status

- ⚠️ Current: Stuck on Next.js 16 with broken middleware
- ✅ Quick Fix: Downgrade to Next.js 15
- 🔄 Long-term: Migrate to Supabase Auth or wait for Next.js fix
