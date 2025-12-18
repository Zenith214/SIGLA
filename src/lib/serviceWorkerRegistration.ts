// Service Worker Registration Utility
// Handles registration, updates, and lifecycle management

export function register() {
  console.log('🔧 [SW Registration] register() called');
  
  if (typeof window === 'undefined') {
    console.log('❌ [SW Registration] Window is undefined, skipping');
    return;
  }

  if ('serviceWorker' in navigator) {
    console.log('✅ [SW Registration] Service Worker API is available');
    
    // Register immediately instead of waiting for load event
    const swUrl = '/sw.js';
    console.log('🔧 [SW Registration] Registering /sw.js immediately...');

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('✅ [SW] Service Worker registered successfully:', registration);

          // Check for updates more frequently (every 30 seconds)
          setInterval(() => {
            registration.update();
          }, 30000);

          // Also check for updates when page becomes visible
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
              registration.update();
            }
          });

          // Handle updates - PWAUpdatePrompt component will show the UI
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New content available');
                // PWAUpdatePrompt component will handle the user notification
              }
            });
          });
        })
      .catch((error) => {
        console.error('❌ [SW] Service Worker registration failed:', error);
      });

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 [SW] Controller changed, reloading page');
      window.location.reload();
    });
  } else {
    console.log('❌ [SW] Service Workers not supported in this browser');
  }
}

export function unregister() {
  if (typeof window === 'undefined') {
    return;
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('[SW] Error unregistering service worker:', error);
      });
  }
}

export function clearCache() {
  if (typeof window === 'undefined') {
    return;
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}
