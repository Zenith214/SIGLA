/**
 * ChartLoadingSkeleton Component
 * 
 * Specialized loading skeletons for different chart types
 * Matches the layout of actual chart components for smooth transitions
 */

import React from 'react';

export interface ChartLoadingSkeletonProps {
  type: 'radar' | 'funnel' | 'timeline' | 'leaderboard' | 'heatmap' | 'line' | 'bar';
  className?: string;
}

export const ChartLoadingSkeleton: React.FC<ChartLoadingSkeletonProps> = ({
  type,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'radar':
        return (
          <div className={`animate-pulse ${className}`}>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
            {/* Radar chart circle */}
            <div className="flex justify-center mb-4">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-gray-200 rounded-full opacity-20"></div>
                <div className="absolute inset-8 bg-gray-200 rounded-full opacity-30"></div>
                <div className="absolute inset-16 bg-gray-200 rounded-full opacity-40"></div>
                <div className="absolute inset-24 bg-gray-200 rounded-full opacity-50"></div>
              </div>
            </div>
            {/* Data table toggle */}
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        );

      case 'funnel':
        return (
          <div className={`animate-pulse space-y-4 ${className}`}>
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            {/* Funnel stages */}
            <div className="space-y-4">
              <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              <div className="flex justify-center">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5 mx-auto"></div>
              <div className="flex justify-center">
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/5 mx-auto"></div>
            </div>
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        );

      case 'timeline':
        return (
          <div className={`animate-pulse ${className}`}>
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            {/* Timeline */}
            <div className="relative py-8">
              {/* Timeline line */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>
              {/* Timeline points */}
              <div className="relative flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className={`animate-pulse ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
            {/* Table header */}
            <div className="flex gap-4 p-3 bg-gray-100 rounded-t-lg border-b-2 border-gray-200">
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            {/* Table rows */}
            <div className="space-y-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-white border-b border-gray-100">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'heatmap':
        return (
          <div className={`animate-pulse ${className}`}>
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            {/* Heatmap grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Header row */}
                <div className="flex gap-2 mb-2">
                  <div className="w-32 h-8 bg-gray-200 rounded"></div>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-24 h-8 bg-gray-200 rounded"></div>
                  ))}
                </div>
                {/* Data rows */}
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2 mb-2">
                    <div className="w-32 h-12 bg-gray-200 rounded"></div>
                    {Array.from({ length: 6 }).map((_, colIndex) => (
                      <div key={colIndex} className="w-24 h-12 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'line':
        return (
          <div className={`animate-pulse ${className}`}>
            {/* Title and controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            {/* Chart area */}
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
                ))}
              </div>
              {/* Chart lines */}
              <div className="ml-12 h-full relative">
                <div className="absolute inset-0 flex items-end justify-between">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="w-1 bg-gray-200 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                  ))}
                </div>
              </div>
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-12 right-0 flex justify-between pt-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded w-12"></div>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'bar':
        return (
          <div className={`animate-pulse ${className}`}>
            {/* Title */}
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            {/* Chart area */}
            <div className="relative h-64 bg-gray-50 rounded-lg p-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
                ))}
              </div>
              {/* Bars */}
              <div className="ml-12 h-full flex items-end justify-between gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 ml-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded w-16"></div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div role="status" aria-label={`Loading ${type} chart`} className="w-full">
      {renderSkeleton()}
      <span className="sr-only">Loading {type} chart...</span>
    </div>
  );
};

export default ChartLoadingSkeleton;
