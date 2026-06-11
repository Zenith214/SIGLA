import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const cookieHeader = req.headers.get('cookie');
  const pulseToken = req.cookies.get('pulse_token');
  
  return NextResponse.json({
    message: 'Cookie Debug Info',
    cookies: {
      all: allCookies,
      pulseToken: pulseToken?.value ? `${pulseToken.value.substring(0, 30)}...` : null,
      hasPulseToken: !!pulseToken
    },
    headers: {
      cookie: cookieHeader,
      host: req.headers.get('host'),
      protocol: req.headers.get('x-forwarded-proto'),
      userAgent: req.headers.get('user-agent')
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });
}
