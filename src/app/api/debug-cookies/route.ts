import { NextRequest, NextResponse } from 'next/server';

// This endpoint is for debugging cookie issues
// It should NOT go through authentication middleware
export async function GET(req: NextRequest) {
  const allCookies = req.cookies.getAll();
  const cookieHeader = req.headers.get('cookie');
  const pulseToken = req.cookies.get('pulse_token');
  
  console.log('🐛 [DEBUG-COOKIES] Request received', {
    allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    cookieHeader: cookieHeader ? 'present' : 'missing',
    hasPulseToken: !!pulseToken
  });
  
  return NextResponse.json({
    message: 'Cookie debug information',
    cookiesFromAPI: allCookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 20) + '...',
      hasValue: !!c.value
    })),
    cookieHeader: cookieHeader ? cookieHeader.substring(0, 100) + '...' : null,
    hasPulseToken: !!pulseToken,
    pulseTokenPreview: pulseToken?.value?.substring(0, 30) + '...' || null,
    headers: {
      host: req.headers.get('host'),
      userAgent: req.headers.get('user-agent')?.substring(0, 50),
      protocol: req.headers.get('x-forwarded-proto')
    }
  });
}
