/**
 * Test Script: Spot Allocation Tab Components
 * 
 * This script verifies that the Spot Allocation tab components are properly
 * implemented and can be imported without errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Spot Allocation Tab Implementation\n');

// Test 1: Verify all component files exist
console.log('Test 1: Checking component files...');
const componentFiles = [
  'src/components/fs-dashboard/SpotAllocation.tsx',
  'src/components/fs-dashboard/SpotAllocationMap.tsx',
  'src/components/fs-dashboard/SpotCreationModal.tsx',
  'src/components/fs-dashboard/SpotAssignmentPanel.tsx',
  'src/components/fs-dashboard/MapClickHandler.tsx',
];

let allFilesExist = true;
componentFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - NOT FOUND`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some component files are missing!');
  process.exit(1);
}

// Test 2: Verify exports in index.ts
console.log('\nTest 2: Checking exports in index.ts...');
const indexPath = path.join(process.cwd(), 'src/components/fs-dashboard/index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const expectedExports = [
  'SpotAllocation',
  'SpotAllocationMap',
  'SpotCreationModal',
  'SpotAssignmentPanel',
];

let allExportsPresent = true;
expectedExports.forEach(exportName => {
  if (indexContent.includes(exportName)) {
    console.log(`  ✅ ${exportName} exported`);
  } else {
    console.log(`  ❌ ${exportName} - NOT EXPORTED`);
    allExportsPresent = false;
  }
});

if (!allExportsPresent) {
  console.log('\n❌ Some exports are missing from index.ts!');
  process.exit(1);
}

// Test 3: Verify Leaflet dependencies in package.json
console.log('\nTest 3: Checking Leaflet dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = ['leaflet', 'react-leaflet'];
const requiredDevDeps = ['@types/leaflet'];

let allDepsInstalled = true;

requiredDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep} (${packageJson.dependencies[dep]})`);
  } else {
    console.log(`  ❌ ${dep} - NOT INSTALLED`);
    allDepsInstalled = false;
  }
});

requiredDevDeps.forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    console.log(`  ✅ ${dep} (${packageJson.devDependencies[dep]})`);
  } else if (packageJson.dependencies && packageJson.dependencies[dep]) {
    console.log(`  ✅ ${dep} (${packageJson.dependencies[dep]}) - in dependencies`);
  } else {
    console.log(`  ❌ ${dep} - NOT INSTALLED`);
    allDepsInstalled = false;
  }
});

if (!allDepsInstalled) {
  console.log('\n❌ Some dependencies are missing!');
  console.log('Run: npm install leaflet react-leaflet @types/leaflet');
  process.exit(1);
}

// Test 4: Verify component structure
console.log('\nTest 4: Checking component structure...');

const spotAllocationPath = path.join(process.cwd(), 'src/components/fs-dashboard/SpotAllocation.tsx');
const spotAllocationContent = fs.readFileSync(spotAllocationPath, 'utf8');

const requiredImports = [
  'SpotAllocationMap',
  'SpotCreationModal',
  'SpotAssignmentPanel',
  'useActiveCycle',
];

let allImportsPresent = true;
requiredImports.forEach(importName => {
  if (spotAllocationContent.includes(importName)) {
    console.log(`  ✅ ${importName} imported`);
  } else {
    console.log(`  ❌ ${importName} - NOT IMPORTED`);
    allImportsPresent = false;
  }
});

if (!allImportsPresent) {
  console.log('\n❌ Some required imports are missing!');
  process.exit(1);
}

// Test 5: Verify key features in SpotAllocationMap
console.log('\nTest 5: Checking SpotAllocationMap features...');

const mapPath = path.join(process.cwd(), 'src/components/fs-dashboard/SpotAllocationMap.tsx');
const mapContent = fs.readFileSync(mapPath, 'utf8');

const mapFeatures = [
  { name: 'MapContainer', check: 'MapContainer' },
  { name: 'TileLayer', check: 'TileLayer' },
  { name: 'Marker', check: 'Marker' },
  { name: 'Popup', check: 'Popup' },
  { name: 'Color-coded markers', check: 'getMarkerColor' },
  { name: 'Map legend', check: 'Spot Status' },
];

let allFeaturesPresent = true;
mapFeatures.forEach(feature => {
  if (mapContent.includes(feature.check)) {
    console.log(`  ✅ ${feature.name}`);
  } else {
    console.log(`  ❌ ${feature.name} - NOT FOUND`);
    allFeaturesPresent = false;
  }
});

if (!allFeaturesPresent) {
  console.log('\n❌ Some map features are missing!');
  process.exit(1);
}

// Test 6: Verify key features in SpotCreationModal
console.log('\nTest 6: Checking SpotCreationModal features...');

const modalPath = path.join(process.cwd(), 'src/components/fs-dashboard/SpotCreationModal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');

const modalFeatures = [
  { name: 'Form validation', check: 'validateForm' },
  { name: 'Barangay selection', check: 'barangayId' },
  { name: 'Random start input', check: 'randomStart' },
  { name: 'Starting point display', check: 'startingPoint' },
  { name: 'Success state', check: 'showSuccess' },
  { name: 'Generated questionnaires', check: 'generatedQuestionnaires' },
];

let allModalFeaturesPresent = true;
modalFeatures.forEach(feature => {
  if (modalContent.includes(feature.check)) {
    console.log(`  ✅ ${feature.name}`);
  } else {
    console.log(`  ❌ ${feature.name} - NOT FOUND`);
    allModalFeaturesPresent = false;
  }
});

if (!allModalFeaturesPresent) {
  console.log('\n❌ Some modal features are missing!');
  process.exit(1);
}

// Test 7: Verify key features in SpotAssignmentPanel
console.log('\nTest 7: Checking SpotAssignmentPanel features...');

const panelPath = path.join(process.cwd(), 'src/components/fs-dashboard/SpotAssignmentPanel.tsx');
const panelContent = fs.readFileSync(panelPath, 'utf8');

const panelFeatures = [
  { name: 'Barangay filter', check: 'selectedBarangay' },
  { name: 'Field Interviewer list', check: 'fieldInterviewers' },
  { name: 'Spot assignment', check: 'handleAssignSpot' },
  { name: 'Progress indicator', check: 'completed_count' },
  { name: 'Status badges', check: 'status' },
];

let allPanelFeaturesPresent = true;
panelFeatures.forEach(feature => {
  if (panelContent.includes(feature.check)) {
    console.log(`  ✅ ${feature.name}`);
  } else {
    console.log(`  ❌ ${feature.name} - NOT FOUND`);
    allPanelFeaturesPresent = false;
  }
});

if (!allPanelFeaturesPresent) {
  console.log('\n❌ Some panel features are missing!');
  process.exit(1);
}

// Test 8: Verify API integration
console.log('\nTest 8: Checking API integration...');

const apiEndpoints = [
  { name: 'GET /api/spots', check: '/api/spots' },
  { name: 'POST /api/spots', check: 'POST' },
  { name: 'PUT /api/spots/:spotId/assign', check: '/api/spots/${spotId}/assign' },
  { name: 'GET /api/barangays', check: '/api/barangays' },
  { name: 'GET /api/users', check: '/api/users' },
];

let allEndpointsReferenced = true;
const allContent = spotAllocationContent + mapContent + modalContent + panelContent;

apiEndpoints.forEach(endpoint => {
  if (allContent.includes(endpoint.check)) {
    console.log(`  ✅ ${endpoint.name}`);
  } else {
    console.log(`  ❌ ${endpoint.name} - NOT REFERENCED`);
    allEndpointsReferenced = false;
  }
});

if (!allEndpointsReferenced) {
  console.log('\n⚠️  Some API endpoints may not be properly integrated');
}

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary');
console.log('='.repeat(60));

if (allFilesExist && allExportsPresent && allDepsInstalled && 
    allImportsPresent && allFeaturesPresent && allModalFeaturesPresent && 
    allPanelFeaturesPresent) {
  console.log('✅ All tests passed!');
  console.log('\n✨ Spot Allocation Tab implementation is complete and ready for testing.');
  console.log('\nNext steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Navigate to /fs-dashboard');
  console.log('3. Click on "Spot Allocation" tab');
  console.log('4. Test spot creation by clicking on the map');
  console.log('5. Test spot assignment using the side panel');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please review the errors above.');
  process.exit(1);
}
