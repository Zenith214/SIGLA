import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'SIGLA Web App',
    timestamp: new Date().toISOString()
  });
}
