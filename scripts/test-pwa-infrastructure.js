/**
 * Test script for PWA Infrastructure
 * Verifies that all PWA components are properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing PWA Infrastructure...\n');

let allTestsPassed = true;

// Test 1: Check if service worker file exists
console.log('Test 1: Service Worker File');
const swPath = path.join(__dirname, '../public/sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service worker file exists at public/sw.js');
  
  // Check if it contains required functions
  const swContent = fs.readFileSync(swPath, 'utf8');
  const requiredPatterns = [
    'install',
    'activate',
    'fetch',
    'CACHE_NAME',
    'caches.open',
    'caches.match'
  ];
  
  let allPatternsFound = true;
  requiredPatterns.forEach(pattern => {
    if (!swContent.includes(pattern)) {
      console.log(`❌ Service worker missing required pattern: ${pattern}`);
      allPatternsFound = false;
      allTestsPassed = false;
    }
  });
  
  if (allPatternsFound) {
    console.log('✅ Service worker contains all required patterns');
  }
} else {
  console.log('❌ Service worker file not found');
  allTestsPassed = false;
}

console.log('');

// Test 2: Check if offline page exists
console.log('Test 2: Offline Fallback Page');
const offlinePath = path.join(__dirname, '../public/offline.html');
if (fs.existsSync(offlinePath)) {
  console.log('✅ Offline page exists at public/offline.html');
  
  const offlineContent = fs.readFileSync(offlinePath, 'utf8');
  if (offlineContent.includes('offline') || offlineContent.includes('Offline')) {
    console.log('✅ Offline page contains offline messaging');
  } else {
    console.log('⚠️  Offline page may not have proper messaging');
  }
} else {
  console.log('❌ Offline page not found');
  allTestsPassed = false;
}

console.log('');

// Test 3: Check if manifest exists
console.log('Test 3: Web App Manifest');
const manifestPath = path.join(__dirname, '../public/manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('✅ Manifest file exists at public/manifest.json');
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Check required fields
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    let allFieldsPresent = true;
    
    requiredFields.forEach(field => {
      if (!manifest[field]) {
        console.log(`❌ Manifest missing required field: ${field}`);
        allFieldsPresent = false;
        allTestsPassed = false;
      }
    });
    
    if (allFieldsPresent) {
      console.log('✅ Manifest contains all required fields');
      console.log(`   - Name: ${manifest.name}`);
      console.log(`   - Start URL: ${manifest.start_url}`);
      console.log(`   - Display: ${manifest.display}`);
      console.log(`   - Orientation: ${manifest.orientation}`);
    }
  } catch (error) {
    console.log('❌ Manifest file is not valid JSON');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Manifest file not found');
  allTestsPassed = false;
}

console.log('');

// Test 4: Check if service worker registration utility exists
console.log('Test 4: Service Worker Registration Utility');
const swRegPath = path.join(__dirname, '../src/lib/serviceWorkerRegistration.ts');
if (fs.existsSync(swRegPath)) {
  console.log('✅ Service worker registration utility exists');
  
  const swRegContent = fs.readFileSync(swRegPath, 'utf8');
  const requiredFunctions = ['register', 'unregister', 'clearCache'];
  
  let allFunctionsPresent = true;
  requiredFunctions.forEach(func => {
    if (!swRegContent.includes(`function ${func}`) && !swRegContent.includes(`export function ${func}`)) {
      console.log(`❌ Registration utility missing function: ${func}`);
      allFunctionsPresent = false;
      allTestsPassed = false;
    }
  });
  
  if (allFunctionsPresent) {
    console.log('✅ Registration utility contains all required functions');
  }
} else {
  console.log('❌ Service worker registration utility not found');
  allTestsPassed = false;
}

console.log('');

// Test 5: Check if offline indicator component exists
console.log('Test 5: Offline Indicator Component');
const offlineIndicatorPath = path.join(__dirname, '../src/components/OfflineIndicator.tsx');
if (fs.existsSync(offlineIndicatorPath)) {
  console.log('✅ Offline indicator component exists');
  
  const indicatorContent = fs.readFileSync(offlineIndicatorPath, 'utf8');
  if (indicatorContent.includes('useOnlineStatus')) {
    console.log('✅ Offline indicator uses online status hook');
  } else {
    console.log('⚠️  Offline indicator may not be using online status hook');
  }
} else {
  console.log('❌ Offline indicator component not found');
  allTestsPassed = false;
}

console.log('');

// Test 6: Check if online status hook exists
console.log('Test 6: Online Status Hook');
const onlineStatusHookPath = path.join(__dirname, '../src/hooks/useOnlineStatus.ts');
if (fs.existsSync(onlineStatusHookPath)) {
  console.log('✅ Online status hook exists');
  
  const hookContent = fs.readFileSync(onlineStatusHookPath, 'utf8');
  if (hookContent.includes('navigator.onLine')) {
    console.log('✅ Hook uses navigator.onLine API');
  }
  if (hookContent.includes('addEventListener') && hookContent.includes('online')) {
    console.log('✅ Hook listens to online/offline events');
  }
} else {
  console.log('❌ Online status hook not found');
  allTestsPassed = false;
}

console.log('');

// Test 7: Check if layout includes PWA components
console.log('Test 7: Layout Integration');
const layoutPath = path.join(__dirname, '../src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('ServiceWorkerRegistration')) {
    console.log('✅ Layout includes ServiceWorkerRegistration component');
  } else {
    console.log('❌ Layout missing ServiceWorkerRegistration component');
    allTestsPassed = false;
  }
  
  if (layoutContent.includes('OfflineIndicator')) {
    console.log('✅ Layout includes OfflineIndicator component');
  } else {
    console.log('❌ Layout missing OfflineIndicator component');
    allTestsPassed = false;
  }
  
  if (layoutContent.includes('manifest')) {
    console.log('✅ Layout includes manifest reference');
  } else {
    console.log('⚠️  Layout may not reference manifest');
  }
  
  if (layoutContent.includes('viewport')) {
    console.log('✅ Layout includes viewport configuration');
  } else {
    console.log('⚠️  Layout may not have viewport configuration');
  }
} else {
  console.log('❌ Layout file not found');
  allTestsPassed = false;
}

console.log('');

// Test 8: Check icon files (placeholders are OK for now)
console.log('Test 8: PWA Icons');
const icon192Path = path.join(__dirname, '../public/icon-192.png');
const icon512Path = path.join(__dirname, '../public/icon-512.png');

if (fs.existsSync(icon192Path)) {
  console.log('✅ 192x192 icon file exists (placeholder)');
} else {
  console.log('⚠️  192x192 icon file not found');
}

if (fs.existsSync(icon512Path)) {
  console.log('✅ 512x512 icon file exists (placeholder)');
} else {
  console.log('⚠️  512x512 icon file not found');
}

console.log('\n📝 Note: Icon files are placeholders and should be replaced with actual PNG images');

console.log('');

// Final summary
console.log('═'.repeat(50));
if (allTestsPassed) {
  console.log('✅ All PWA infrastructure tests passed!');
  console.log('\n📱 PWA is ready for testing:');
  console.log('   1. Build the app: npm run build');
  console.log('   2. Start production server: npm start');
  console.log('   3. Open in Chrome and check DevTools > Application > Service Workers');
  console.log('   4. Test offline mode in DevTools > Network > Offline');
  console.log('   5. Try installing the PWA from browser menu');
  console.log('\n⚠️  Remember to replace placeholder icons with actual PNG images!');
  process.exit(0);
} else {
  console.log('❌ Some PWA infrastructure tests failed');
  console.log('   Please review the errors above and fix the issues');
  process.exit(1);
}
