'use client';

// global-error must be a client component
// Keep absolutely minimal - no hooks, no event handlers during SSR
export default function GlobalError() {
  return (
    <html>
      <body>
        <div style={{ padding: '40px', fontFamily: 'system-ui', textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 16px', color: '#e53e3e' }}>
            Error
          </h1>
          <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontWeight: 'normal' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Please refresh the page or contact support if the problem persists.
          </p>
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
            }}
          >
            Go Home
          </a>
        </div>
      </body>
    </html>
  );
}
