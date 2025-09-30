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
  
  return (
    <div
      className="absolute z-[9999] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)'
      }}
    >
      {/* Simple, highly visible pin */}
      <div className="pointer-events-auto">
        {/* Main Pin - Smaller size */}
        <div 
          className="w-10 h-10 bg-red-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors"
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
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-600"></div>
        
        {/* Always visible info card */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-white rounded-lg shadow-xl border border-gray-300 p-2 min-w-[160px]">
          <div className="text-center">
            <div className="font-bold text-gray-900 text-xs mb-1">{barangay.name}</div>
            <div className="text-xs text-gray-600 mb-1">
              Pop: {barangay.population?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-xs text-blue-600 font-medium">
              Click pin for details
            </div>
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-white"></div>
        </div>
        
        {/* Close button - smaller */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // console.log('🖱️ Close button clicked');
            onClose();
          }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs hover:bg-black transition-colors shadow-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}