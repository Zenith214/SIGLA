#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for missing barangay paths...\n');

// Read the mapping from InteractiveSVGMap
const mapComponentPath = path.join(process.cwd(), 'src/components/dashboard/InteractiveSVGMap.tsx');
const mapContent = fs.readFileSync(mapComponentPath, 'utf8');

// Extract barangay mapping
const mappingMatch = mapContent.match(/barangayMapping\s*=\s*{([^}]+)}/s);
if (!mappingMatch) {
  console.log('❌ Could not find barangayMapping in InteractiveSVGMap.tsx');
  process.exit(1);
}

const mappingContent = mappingMatch[1];
const mappingEntries = mappingContent.match(/"([^"]+)":\s*"([^"]+)"/g) || [];
const expectedPaths = mappingEntries.map(entry => {
  const match = entry.match(/"([^"]+)":/);
  return match ? match[1] : null;
}).filter(Boolean);

console.log(`Expected paths: ${expectedPaths.length}`);
expectedPaths.forEach(path => console.log(`  - ${path}`));

// Read the paths file
const pathsFilePath = path.join(process.cwd(), 'src/data/barangayPaths.ts');
const pathsContent = fs.readFileSync(pathsFilePath, 'utf8');

// Extract existing paths
const pathMatches = pathsContent.match(/"([^"]+)":\s*"[^"]*"/g) || [];
const existingPaths = pathMatches.map(match => {
  const pathMatch = match.match(/"([^"]+)":/);
  return pathMatch ? pathMatch[1] : null;
}).filter(Boolean);

console.log(`\nExisting paths: ${existingPaths.length}`);
existingPaths.forEach(path => console.log(`  - ${path}`));

// Find missing paths
const missingPaths = expectedPaths.filter(path => !existingPaths.includes(path));

console.log(`\nMissing paths: ${missingPaths.length}`);
if (missingPaths.length > 0) {
  missingPaths.forEach(path => console.log(`  ❌ ${path}`));
} else {
  console.log('  ✅ All paths are present');
}

// Find extra paths
const extraPaths = existingPaths.filter(path => !expectedPaths.includes(path));
console.log(`\nExtra paths: ${extraPaths.length}`);
if (extraPaths.length > 0) {
  extraPaths.forEach(path => console.log(`  ⚠️  ${path}`));
} else {
  console.log('  ✅ No extra paths');
}