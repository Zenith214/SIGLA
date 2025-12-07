import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/register', '/success'];

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/survey', '/fs-dashboard', '/cpap', '/admin', '/settings', '/tools', '/reportcard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🚦 [MIDDLEWARE START]', pathname);

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    console.log('✅ [MIDDLEWARE] Public path, allowing:', pathname);
    return NextResponse.next();
  }

  // Allow public API routes
  if (pathname.startsWith('/api/login') || pathname.startsWith('/api/register') || pathname.startsWith('/api/logout') || pathname.startsWith('/api/debug-cookies')) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const requiresAuth = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Check for authentication token
  const cookieHeader = request.headers.get('cookie');
  let token: string | null = null;
  let tokenSource = 'none';
  
  // Try to get token from Cookie header first (more reliable in Next.js 16)
  if (cookieHeader) {
    const match = cookieHeader.match(/pulse_token=([^;]+)/);
    if (match) {
      token = match[1];
      tokenSource = 'header';
    }
  }
  
  // Fallback to cookies API
  if (!token) {
    const cookieToken = request.cookies.get('pulse_token');
    if (cookieToken?.value) {
      token = cookieToken.value;
      tokenSource = 'cookies-api';
    }
  }
  
  console.log('🔒 [MIDDLEWARE]', {
    pathname,
    hasToken: !!token,
    tokenSource,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    timestamp: new Date().toISOString()
  });
  
  if (!token) {
    console.log('❌ [MIDDLEWARE] No token found, redirecting to login');
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Validate token using jose (Edge-compatible)
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload || !payload.id || !payload.email) {
      throw new Error('Invalid token payload');
    }
    
    console.log('✅ [MIDDLEWARE] Token valid for user:', payload.email);
    
    const response = NextResponse.next();
    response.headers.set('x-user-id', String(payload.id));
    response.headers.set('x-user-role', String(payload.role || 'officer').toLowerCase());
    response.headers.set('x-user-email', String(payload.email));
    return response;
  } catch (error) {
    console.log('❌ [MIDDLEWARE] Token validation failed:', error instanceof Error ? error.message : 'Unknown error');
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/survey/:path*',
    '/fs-dashboard/:path*',
    '/cpap/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/tools/:path*',
    '/reportcard/:path*',
    '/api/:path*',
  ],
};
