'use client';

// global-error must be a client component and self-contained
// Cannot use root layout or any context providers during prerendering

export default function GlobalError({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - PULSE</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 16px', color: '#e53e3e' }}>
            Error
          </h1>
          <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontWeight: 'normal', color: '#333' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#666', marginBottom: '24px', maxWidth: '500px' }}>
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
