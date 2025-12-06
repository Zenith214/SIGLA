import { NextResponse } from 'next/server';

// This endpoint retrieves the last middleware execution log
// Import is not possible due to module boundaries, so we'll use a workaround
export async function GET() {
  // We can't directly import from middleware, so this will just return a message
  // The actual logging will be in Railway logs
  return NextResponse.json({
    message: 'Check Railway logs for middleware execution details',
    instructions: [
      '1. Go to railway.app',
      '2. Select your project',
      '3. Click on SIGLA service',
      '4. Click on Deployments',
      '5. Click on latest deployment',
      '6. View logs',
      '7. Look for logs with 🚦 🔒 emojis'
    ],
    timestamp: new Date().toISOString()
  });
}
