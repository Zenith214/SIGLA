"use client";

import { useState } from 'react';
import InteractiveSVGMap from '@/components/dashboard/InteractiveSVGMap';

export default function MapTestPage() {
  const [selectedBarangay, setSelectedBarangay] = useState<any>(null);

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
}