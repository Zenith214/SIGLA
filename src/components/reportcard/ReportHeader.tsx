"use client";

interface ReportHeaderProps {
  className?: string;
}

export default function ReportHeader({ className = "" }: ReportHeaderProps) {
  return (
    <div className={`bg-gray-100 border-b border-gray-200 px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: MLGRC Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">MLGRC</span>
          </div>
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 uppercase tracking-wide">
            PULSE Barangay Performance Report
          </h1>
        </div>

        {/* Right: PULSE Logo */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">PULSE</span>
          </div>
        </div>
      </div>
    </div>
  );
}