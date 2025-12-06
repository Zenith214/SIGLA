import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🏥 Health check endpoint called');
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDatabase: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
  });
}
