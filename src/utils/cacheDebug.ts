// Cache debugging utilities for PWA

export async function inspectCache() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    console.log('Cache API not available');
    return;
  }

  try {
    const cacheNames = await caches.keys();
    console.log('📦 Available caches:', cacheNames);

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      console.log(`\n📂 Cache: ${cacheName}`);
      console.log(`   Items: ${requests.length}`);
      
      // Show API endpoints cached
      const apiRequests = requests.filter(req => req.url.includes('/api/'));
      if (apiRequests.length > 0) {
        console.log('   API Endpoints cached:');
        apiRequests.forEach(req => {
          const url = new URL(req.url);
          console.log(`   - ${url.pathname}${url.search}`);
        });
      }
    }
  } catch (error) {
    console.error('Error inspecting cache:', error);
  }
}

export async function clearAllCaches() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    console.log('Cache API not available');
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('✅ All caches cleared');
  } catch (error) {
    console.error('Error clearing caches:', error);
  }
}

// Add to window for easy debugging in console
if (typeof window !== 'undefined') {
  (window as any).inspectCache = inspectCache;
  (window as any).clearAllCaches = clearAllCaches;
}
