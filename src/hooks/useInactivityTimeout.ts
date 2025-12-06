import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseInactivityTimeoutOptions {
  timeoutMinutes?: number;
  onTimeout?: () => void;
  enabled?: boolean;
}

export function useInactivityTimeout({
  timeoutMinutes = 10,
  onTimeout,
  enabled = true,
}: UseInactivityTimeoutOptions = {}) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutMs = timeoutMinutes * 60 * 1000;

  const handleLogout = useCallback(async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Call custom callback if provided
      if (onTimeout) {
        onTimeout();
      }
      
      // Redirect to login with timeout message
      router.push('/login?reason=timeout');
    } catch (error) {
      console.error('Error during auto-logout:', error);
      router.push('/login');
    }
  }, [router, onTimeout]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeoutMs);
  }, [enabled, timeoutMs, handleLogout]);

  useEffect(() => {
    if (!enabled) return;

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Start initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, resetTimer]);

  return { resetTimer };
}
