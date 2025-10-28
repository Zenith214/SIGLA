/**
 * PartialDataWarning Component
 * 
 * Displays a warning when partial data is available
 * Shows which data is missing and what is displayed
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface PartialDataWarningProps {
  missingItems: string[];
  availableItems?: string[];
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

export const PartialDataWarning: React.FC<PartialDataWarningProps> = ({
  missingItems,
  availableItems,
  message,
  onDismiss,
  className = '',
}) => {
  if (missingItems.length === 0) {
    return null;
  }

  const defaultMessage = `Some data is not available. Displaying partial results.`;

  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <AlertTriangle
          className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 mb-1">
            Partial Data Available
          </h3>
          <p className="text-yellow-700 text-sm mb-2">
            {message || defaultMessage}
          </p>

          {missingItems.length > 0 && (
            <div className="mb-2">
              <p className="text-yellow-700 text-sm font-medium mb-1">
                Missing data for:
              </p>
              <ul className="text-yellow-700 text-sm list-disc list-inside space-y-0.5">
                {missingItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {availableItems && availableItems.length > 0 && (
            <div>
              <p className="text-yellow-700 text-sm font-medium mb-1">
                Showing data for:
              </p>
              <ul className="text-yellow-700 text-sm list-disc list-inside space-y-0.5">
                {availableItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="mt-3 text-yellow-600 hover:text-yellow-800 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded px-3 py-1"
              aria-label="Dismiss warning"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartialDataWarning;
