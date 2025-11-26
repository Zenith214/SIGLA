'use client';

import { useEffect, useState } from 'react';
import { register } from '@/lib/serviceWorkerRegistration';

export function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only register service worker in production or when explicitly enabled
    // AND only in browser environment
    if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true')) {
      register();
    }
  }, []);

  // Don't render anything during SSR
  if (!mounted) {
    return null;
  }

  return null;
}
