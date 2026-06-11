'use client';

// global-error MUST be completely self-contained
// Cannot import ANYTHING that might trigger context usage
// No React imports - use global React from Next.js

export default function GlobalError() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - PULSE</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#f5f5f5' }}>
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '40px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h1 style={{ fontSize: '48px', margin: '0 0 16px', color: '#e53e3e' }}>
              Error
            </h1>
            <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontWeight: 'normal', color: '#333' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
