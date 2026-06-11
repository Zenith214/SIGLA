'use client';

// global-error must be a client component and receive error/reset props
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
