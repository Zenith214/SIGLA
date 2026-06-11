'use client';

// Force dynamic rendering (skip SSR prerendering during build)
export const dynamic = 'force-dynamic';

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
        <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
          <h1>Something went wrong!</h1>
          <p>An unexpected error occurred. Please try again.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              marginTop: '20px',
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
