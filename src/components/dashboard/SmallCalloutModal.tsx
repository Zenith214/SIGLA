"use client";

import { BarangayData } from "@/data/barangayData";

interface SmallCalloutModalProps {
  barangay: BarangayData;
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
  return (
    <div
      className="absolute z-50 cursor-pointer"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={onViewDetails}
    >
      {/* Pin Icon with Magnifying Glass */}
      <div className="relative group">
        {/* Pin Body */}
        <div className="w-10 h-10 bg-red-600 rounded-full border-3 border-white shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors">
          {/* Magnifying Glass Icon */}
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="21 21l-4.35-4.35"/>
          </svg>
        </div>
        
        {/* Pin Point */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-5 border-r-5 border-t-8 border-l-transparent border-r-transparent border-t-red-600 group-hover:border-t-red-700 transition-colors"></div>
        
        {/* Tooltip on hover */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          <div className="font-medium">{barangay.name}</div>
          <div className="text-xs text-gray-300">Click to view details</div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}