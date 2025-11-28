import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/register', '/success'];

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/survey', '/fs-dashboard', '/cpap', '/admin', '/settings', '/tools', '/reportcard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (pathname.startsWith('/api/login') || pathname.startsWith('/api/register') || pathname.startsWith('/api/logout')) {
    return NextResponse.next();
  }

  // Check if path requires authentication
  const requiresAuth = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  if (!requiresAuth) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get('pulse_token');
  
  if (!token || !token.value) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Validate token
  try {
    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    if (!decoded || !decoded.id || !decoded.email) {
      throw new Error('Invalid token');
    }
    
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.id.toString());
    response.headers.set('x-user-role', (decoded.role || 'officer').toLowerCase());
    response.headers.set('x-user-email', decoded.email);
    return response;
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }
}

// Simple matcher - no complex regex
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
