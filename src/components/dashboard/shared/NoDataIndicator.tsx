/**
 * NoDataIndicator Component
 * 
 * Displays a user-friendly message when no data is available
 * Provides context and suggestions for users
 */

import React from 'react';
import { Database, FileQuestion, Search } from 'lucide-react';

export interface NoDataIndicatorProps {
  title?: string;
  message?: string;
  suggestion?: string;
  onAction?: () => void;
  actionLabel?: string;
  icon?: 'database' | 'search' | 'file';
  className?: string;
}

const iconComponents = {
  database: Database,
  search: Search,
  file: FileQuestion,
};

export const NoDataIndicator: React.FC<NoDataIndicatorProps> = ({
  title = 'No Data Available',
  message = 'There is no data to display at this time.',
  suggestion,
  onAction,
  actionLabel = 'Refresh',
  icon = 'database',
  className = '',
}) => {
  const IconComponent = iconComponents[icon];

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
      role="status"
      aria-live="polite"
    >
      <IconComponent
        className="h-12 w-12 text-gray-400 mb-4"
        aria-hidden="true"
      />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-2">
        {message}
      </p>
      {suggestion && (
        <p className="text-sm text-gray-500 text-center max-w-md mb-4">
          {suggestion}
        </p>
      )}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default NoDataIndicator;
