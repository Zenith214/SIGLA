import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define routes that do NOT require authentication
const PUBLIC_PATHS = [
  '/',
  '/register',
  '/success',
];

// Helper to check if the path is public
function isPublic(path: string) {
  // Allow API routes and static files
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/assets') ||
    path.startsWith('/public') ||
    path.match(/\.(svg|png|jpg|jpeg|css|js|ico|woff|woff2|ttf)$/)
  ) {
    return true;
  }
  return PUBLIC_PATHS.includes(path);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Check for the sigla_token cookie
  const token = request.cookies.get('sigla_token');
  if (!token) {
    // Redirect to login page
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/';
    loginUrl.searchParams.set('redirected', '1');
    return NextResponse.redirect(loginUrl);
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except those in PUBLIC_PATHS and static/api
    '/((?!api|_next|favicon.ico|assets|public|.*\\.(svg|png|jpg|jpeg|css|js|ico|woff|woff2|ttf)$).*)',
  ],
}; 