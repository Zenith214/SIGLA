#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Creating map test page...\n');

const testPageContent = `"use client";

import { useState } from 'react';
import InteractiveSVGMap from '@/components/dashboard/InteractiveSVGMap';

export default function MapTestPage() {
  const [selectedBarangay, setSelectedBarangay] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Map Click Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Open browser dev tools (F12)</li>
            <li>Click on any colored area of the map below</li>
            <li>Check console for debug messages</li>
            <li>A red pin should appear where you clicked</li>
            <li>Click the pin to see barangay details</li>
          </ol>
        </div>

        {selectedBarangay && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900">Selected Barangay:</h3>
            <p className="text-blue-800">{selectedBarangay.name}</p>
            <p className="text-sm text-blue-600">Population: {selectedBarangay.population?.toLocaleString() || 'N/A'}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <InteractiveSVGMap 
            onBarangaySelect={(barangay) => {
              console.log('🎯 Barangay selected in test page:', barangay);
              setSelectedBarangay(barangay);
            }}
          />
        </div>
      </div>
    </div>
  );
}`;

// Create the test page
const testPagePath = path.join(process.cwd(), 'src/app/map-test/page.tsx');
const testDir = path.dirname(testPagePath);

// Create directory if it doesn't exist
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  console.log('✅ Created directory:', testDir);
}

// Write the test page
fs.writeFileSync(testPagePath, testPageContent);
console.log('✅ Created test page:', testPagePath);

console.log('\n🚀 Test page created successfully!');
console.log('\nTo test the map:');
console.log('1. Start your development server: npm run dev');
console.log('2. Navigate to: http://localhost:3000/map-test');
console.log('3. Follow the instructions on the page');
console.log('4. Check browser console for debug messages');

console.log('\n🔍 What to look for:');
console.log('• Console logs when clicking map areas');
console.log('• Red pins appearing at click locations');
console.log('• Selected barangay info appearing above the map');
console.log('• Hover effects on map areas');

console.log('\n🐛 If issues persist:');
console.log('• Check if barangay API returns data: /api/barangays');
console.log('• Verify SVG paths are valid in barangayPaths.ts');
console.log('• Check browser network tab for API errors');
console.log('• Look for JavaScript errors in console');