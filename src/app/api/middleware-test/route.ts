import { NextRequest, NextResponse } from 'next/server';

// This endpoint will be protected by middleware
// We can check if middleware headers are set
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userEmail = req.headers.get('x-user-email');
  const userRole = req.headers.get('x-user-role');
  
  const allHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.startsWith('x-') || key === 'cookie') {
      allHeaders[key] = value.substring(0, 100);
    }
  });
  
  return NextResponse.json({
    message: 'Middleware test endpoint',
    middlewareHeaders: {
      userId,
      userEmail,
      userRole
    },
    hasMiddlewareHeaders: !!(userId && userEmail && userRole),
    relevantHeaders: allHeaders,
    cookies: req.cookies.getAll().map(c => ({
      name: c.name,
      hasValue: !!c.value
    }))
  });
}
