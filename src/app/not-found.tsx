import Link from 'next/link';

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function NotFound() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', margin: '0 0 16px' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 16px', fontWeight: 'normal' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link
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
      </Link>
    </div>
  );
}
