/**
 * LoadingSkeleton Component
 * 
 * Displays loading placeholders for various content types
 * Provides visual feedback during data fetching
 */

import React from 'react';

export interface LoadingSkeletonProps {
  type?: 'chart' | 'table' | 'card' | 'text' | 'dashboard' | 'radar' | 'funnel' | 'timeline' | 'leaderboard';
  variant?: 'chart' | 'table' | 'card' | 'text'; // Deprecated, use 'type' instead
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  variant = 'card',
  count = 1,
  className = '',
}) => {
  // Use 'type' if provided, otherwise fall back to 'variant'
  const skeletonType = type || variant;

  const renderSkeleton = () => {
    switch (skeletonType) {
      case 'chart':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-10 bg-gray-200 rounded mb-2"></div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded mb-1"></div>
            ))}
          </div>
        );
      
      case 'card':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className={`animate-pulse ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            ))}
          </div>
        );
      
      case 'dashboard':
        return (
          <div className={`animate-pulse space-y-6 ${className}`}>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        );
      
      case 'radar':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex justify-center mb-4">
              <div className="w-80 h-80 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex justify-center gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
          </div>
        );
      
      case 'funnel':
        return (
          <div className={`animate-pulse space-y-4 ${className}`}>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-16 bg-gray-200 rounded w-full"></div>
            <div className="h-16 bg-gray-200 rounded w-4/5 mx-auto"></div>
            <div className="h-16 bg-gray-200 rounded w-3/5 mx-auto"></div>
          </div>
        );
      
      case 'timeline':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex justify-between">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-12 h-12 bg-gray-200 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'leaderboard':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: count || 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-100 rounded">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div role="status" aria-label="Loading content">
      {renderSkeleton()}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSkeleton;
