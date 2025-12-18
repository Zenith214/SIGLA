/**
 * ErrorMessage Component
 * 
 * Comprehensive error message component with different severity levels
 * and actionable error messages
 */

import React from 'react';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  details?: string[];
  className?: string;
  showIcon?: boolean;
}

const severityConfig = {
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
    buttonColor: 'text-red-600 hover:text-red-800',
    Icon: XCircle,
  },
  warning: {
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-500',
    buttonColor: 'text-yellow-600 hover:text-yellow-800',
    Icon: AlertTriangle,
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500',
    buttonColor: 'text-blue-600 hover:text-blue-800',
    Icon: Info,
  },
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  severity = 'error',
  onRetry,
  onDismiss,
  details,
  className = '',
  showIcon = true,
}) => {
  const config = severityConfig[severity];
  const Icon = config.Icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        {showIcon && (
          <Icon
            className={`h-5 w-5 ${config.iconColor} mr-3 flex-shrink-0 mt-0.5`}
            aria-hidden="true"
          />
        )}
        <div className="flex-1">
          {title && (
            <h3 className={`font-semibold ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          <p className={`${config.textColor} text-sm`}>{message}</p>
          
          {details && details.length > 0 && (
            <ul className={`mt-2 ${config.textColor} text-sm list-disc list-inside space-y-1`}>
              {details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          )}

          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`${config.buttonColor} font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-3 py-1`}
                  aria-label="Retry action"
                >
                  Try Again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${config.buttonColor} font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-3 py-1`}
                  aria-label="Dismiss message"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
