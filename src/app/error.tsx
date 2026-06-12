'use client';

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function Error({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', margin: '0 0 16px', color: '#e53e3e' }}>
        Error
      </h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontWeight: 'normal' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        {error?.message || 'An unexpected error occurred.'}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {reset && (
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        )}
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
