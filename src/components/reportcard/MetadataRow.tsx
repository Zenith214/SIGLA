"use client";

interface MetadataRowProps {
  barangay: string;
  municipality: string;
  reportDate: string;
  className?: string;
}

export default function MetadataRow({ 
  barangay, 
  municipality, 
  reportDate, 
  className = "" 
}: MetadataRowProps) {
  return (
    <div className={`bg-white px-6 py-4 border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
          <div>
            <span className="font-semibold text-gray-700">Barangay: </span>
            <span className="text-gray-900">{barangay}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Municipality: </span>
            <span className="text-gray-900">{municipality}</span>
          </div>
          <div className="md:text-right">
            <span className="font-semibold text-gray-700">Report Date: </span>
            <span className="text-gray-900">{reportDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}