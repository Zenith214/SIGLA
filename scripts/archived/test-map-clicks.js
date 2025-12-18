#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🖱️ Testing Map Click Functionality...\n');

// Test 1: Check if barangay data API is working
console.log('1. Testing barangay API...');
try {
  // This would need to be tested in browser, but we can check the route exists
  const apiPath = path.join(process.cwd(), 'src/app/api/barangays/route.ts');
  if (fs.existsSync(apiPath)) {
    console.log('   ✅ Barangay API route exists');
  } else {
    console.log('   ❌ Barangay API route missing');
  }
} catch (error) {
  console.log('   ❌ Error checking API route:', error.message);
}

// Test 2: Check if all required components exist
console.log('\n2. Checking component files...');
const requiredFiles = [
  'src/components/dashboard/InteractiveSVGMap.tsx',
  'src/components/dashboard/SmallCalloutModal.tsx',
  'src/components/dashboard/BarangaySatisfactionIndex.tsx',
  'src/data/barangayPaths.ts'
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// Test 3: Check for debug logs in components
console.log('\n3. Checking for debug logging...');
try {
  const mapPath = path.join(process.cwd(), 'src/components/dashboard/InteractiveSVGMap.tsx');
  const mapContent = fs.readFileSync(mapPath, 'utf8');
  
  const hasClickLog = /console\.log.*Click event triggered/.test(mapContent);
  const hasPositionLog = /console\.log.*Position calculated/.test(mapContent);
  const hasDataLog = /console\.log.*Barangay data loaded/.test(mapContent);
  
  console.log(`   ${hasClickLog ? '✅' : '❌'} Click event logging`);
  console.log(`   ${hasPositionLog ? '✅' : '❌'} Position calculation logging`);
  console.log(`   ${hasDataLog ? '✅' : '❌'} Data loading logging`);
} catch (error) {
  console.log('   ❌ Error checking debug logs:', error.message);
}

// Test 4: Check modal positioning logic
console.log('\n4. Checking modal positioning...');
try {
  const modalPath = path.join(process.cwd(), 'src/components/dashboard/SmallCalloutModal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');
  
  const hasSSRCheck = /typeof window !== 'undefined'/.test(modalContent);
  const hasPositionLog = /console\.log.*Modal rendering/.test(modalContent);
  
  console.log(`   ${hasSSRCheck ? '✅' : '❌'} SSR-safe window check`);
  console.log(`   ${hasPositionLog ? '✅' : '❌'} Modal position logging`);
} catch (error) {
  console.log('   ❌ Error checking modal:', error.message);
}

console.log('\n🎯 Testing Instructions:');
console.log('1. Open the dashboard in your browser');
console.log('2. Open browser dev tools (F12)');
console.log('3. Click on any colored area of the map');
console.log('4. Check console for debug messages:');
console.log('   - "🖱️ Click event triggered for: [barangay-id]"');
console.log('   - "📍 Barangay found: [name] [data]"');
console.log('   - "📐 Position calculated: {x, y, rect}"');
console.log('   - "🎯 Modal rendering at position: {x, y}"');
console.log('\n5. If you see these logs, the click detection is working');
console.log('6. If the modal appears in wrong position, check the position values');

console.log('\n🔧 Quick Fixes:');
console.log('• If no click logs: Check if paths have valid d attribute');
console.log('• If wrong position: Check container getBoundingClientRect()');
console.log('• If modal not visible: Check z-index and positioning');
console.log('• If no barangay data: Check /api/barangays endpoint');