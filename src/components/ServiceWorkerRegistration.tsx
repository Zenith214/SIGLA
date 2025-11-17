'use client';

import { useEffect } from 'react';
import { register } from '@/lib/serviceWorkerRegistration';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register service worker in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true') {
      register();
    }
  }, []);

  return null;
}
