"use client";

import DonutChart from "./DonutChart";

interface PerformanceSnapshotProps {
  satisfactionPercentage: number;
  satisfactionLabel: string;
  actionPercentage: number;
  actionLabel: string;
  className?: string;
}

export default function PerformanceSnapshot({
  satisfactionPercentage,
  satisfactionLabel,
  actionPercentage,
  actionLabel,
  className = ""
}: PerformanceSnapshotProps) {
  return (
    <div className={`bg-white px-6 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-8 text-center">
          Overall Performance Snapshot
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Satisfaction Card */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Overall Satisfaction
            </h3>
            <div className="flex justify-center">
              <DonutChart
                percentage={satisfactionPercentage}
                label={satisfactionLabel}
                color="#27ae60"
                size={140}
              />
            </div>
          </div>

          {/* Overall Need for Action Card */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Overall Need for Action
            </h3>
            <div className="flex justify-center">
              <DonutChart
                percentage={actionPercentage}
                label={actionLabel}
                color="#f39c12"
                size={140}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}