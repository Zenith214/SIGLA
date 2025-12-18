/**
 * EmptyState Component
 * 
 * Displays empty state messages when no data is available
 * Provides helpful guidance to users
 */

import React from 'react';
import { FileQuestion, BarChart3, Users } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'chart' | 'data' | 'users';
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  message = 'There is no data to display at this time.',
  icon = 'data',
  action,
  className = '',
}) => {
  const getIcon = () => {
    const iconProps = {
      className: 'h-12 w-12 text-gray-400 mb-4',
      'aria-hidden': 'true' as const,
    };

    switch (icon) {
      case 'chart':
        return <BarChart3 {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'data':
      default:
        return <FileQuestion {...iconProps} />;
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {getIcon()}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
