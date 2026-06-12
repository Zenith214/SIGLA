'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SurveyCycleProvider } from "@/contexts/SurveyCycleContext";
import { ToastProviderWrapper } from "@/components/providers/ToastProviderWrapper";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import FirstTimeLoginWrapper from "@/components/auth/FirstTimeLoginWrapper";

/**
 * Client-side only providers wrapper
 * Prevents SSR/static generation crashes by only mounting providers on client
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR/static gen, render children without providers
  if (!mounted) {
    return <>{children}</>;
  }

  // Client-side: full provider tree
  return (
    <ToastProviderWrapper>
      <AuthProvider>
        <SurveyCycleProvider>
          <ServiceWorkerRegistration />
          <PWAUpdatePrompt />
          <OfflineIndicator />
          <FirstTimeLoginWrapper>
            {children}
          </FirstTimeLoginWrapper>
        </SurveyCycleProvider>
      </AuthProvider>
    </ToastProviderWrapper>
  );
}
