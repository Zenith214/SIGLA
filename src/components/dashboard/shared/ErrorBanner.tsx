/**
 * ErrorBanner Component
 * 
 * Displays error messages with optional retry functionality
 * Accessible and user-friendly error presentation
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle
            className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
            aria-hidden="true"
          />
          <p className="text-red-700 text-sm md:text-base">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 text-red-600 hover:text-red-800 font-medium text-sm whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
            aria-label="Retry loading data"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
