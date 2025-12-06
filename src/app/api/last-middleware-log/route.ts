import { NextResponse } from 'next/server';

// Global variable to store last middleware execution (not ideal but works for debugging)
// @ts-ignore
global.lastMiddlewareLog = global.lastMiddlewareLog || null;

export async function GET() {
  // @ts-ignore
  const log = global.lastMiddlewareLog;
  
  return NextResponse.json({
    hasLog: !!log,
    log: log || 'No middleware execution logged yet',
    note: 'This endpoint shows the last middleware execution details'
  });
}
