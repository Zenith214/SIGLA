'use client';

import { useEffect, useState } from 'react';
import { register } from '@/lib/serviceWorkerRegistration';

export function ServiceWorkerRegistration() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Register service worker in production or when explicitly enabled
    // Skip only in development unless explicitly enabled
    if (typeof window !== 'undefined') {
      const isDev = process.env.NODE_ENV === 'development';
      const isEnabled = process.env.NEXT_PUBLIC_ENABLE_SW === 'true';
      
      if (!isDev || isEnabled) {
        register();
      }
    }
  }, []);

  // Don't render anything during SSR
  if (!mounted) {
    return null;
  }

  return null;
}
