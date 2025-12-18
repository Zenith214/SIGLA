"use client";

import { type ApiBarangayData } from "@/utils/barangayUtils";

interface SmallCalloutModalProps {
  barangay: ApiBarangayData;
  position: { x: number; y: number };
  onViewDetails: () => void;
  onClose: () => void;
}

export default function SmallCalloutModal({
  barangay,
  position,
  onViewDetails,
  onClose,
}: SmallCalloutModalProps) {
  // console.log('🎯 Modal rendering at position:', position, 'for barangay:', barangay.name);
  
  // List of barangays in the northern/top part of the map (show callout below)
  const topBarangays = [
    'Katipunan',
    'Tanwalang',
    'Solongvale',
    'Tala-O',
    'Balasinon',
    'Harada Butai',
    'Roxas',
    'New Cebu'
  ];
  
  // Determine if this barangay should show callout below
  const isInTopPortion = topBarangays.includes(barangay.name);
  
  return (
    <div
      className="absolute z-[99999] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {/* Simple, highly visible pin */}
      <div className="pointer-events-auto relative">
        {/* Always visible info card - position based on location */}
        {isInTopPortion ? (
          // Show below the pin for top territories
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-white rounded-lg shadow-2xl border-2 border-gray-400 p-3 min-w-[140px] z-[100000]">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-sm">{barangay.name}</div>
            </div>
            {/* Tooltip arrow pointing up */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white"></div>
          </div>
        ) : (
          // Show above the pin for other territories
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white rounded-lg shadow-2xl border-2 border-gray-400 p-3 min-w-[140px] z-[100000]">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-sm">{barangay.name}</div>
            </div>
            {/* Tooltip arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        )}
        
        {/* Main Pin - Smaller size */}
        <div 
          className="w-10 h-10 bg-red-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors relative z-[99999]"
          onClick={(e) => {
            e.stopPropagation();
            // console.log('🖱️ Pin clicked for:', barangay.name);
            onViewDetails();
          }}
        >
          {/* Simple icon */}
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
          </div>
        </div>
        
        {/* Pin Point */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-600 z-[99998]"></div>
        
        {/* Close button - smaller */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // console.log('🖱️ Close button clicked');
            onClose();
          }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs hover:bg-black transition-colors shadow-lg z-[100001]"
        >
          ×
        </button>
      </div>
    </div>
  );
}