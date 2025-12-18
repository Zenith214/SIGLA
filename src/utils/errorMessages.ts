/**
 * User-Friendly Error Messages
 * 
 * Converts technical errors into user-friendly messages
 * with actionable suggestions
 */

import { ErrorType } from '@/lib/api-error-handler';

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestion?: string;
  isRetryable: boolean;
}

// Convert API error to user-friendly message
export const getUserFriendlyError = (
  error: any,
  context?: string
): UserFriendlyError => {
  // Default error
  const defaultError: UserFriendlyError = {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    suggestion: 'If the problem persists, please contact support.',
    isRetryable: true,
  };

  // Handle null/undefined
  if (!error) {
    return defaultError;
  }

  // Extract error information
  const errorType = error.type || error.name;
  const errorMessage = error.message || String(error);
  const isRetryable = error.isRetryable !== undefined ? error.isRetryable : true;

  // Map error types to user-friendly messages
  switch (errorType) {
    case ErrorType.VALIDATION:
    case 'VALIDATION_ERROR':
      return {
        title: 'Invalid Input',
        message: errorMessage || 'The provided information is invalid.',
        suggestion: 'Please check your input and try again.',
        isRetryable: false,
      };

    case ErrorType.AUTHENTICATION:
    case 'AUTHENTICATION_ERROR':
      return {
        title: 'Authentication Required',
        message: 'You need to be logged in to access this feature.',
        suggestion: 'Please log in and try again.',
        isRetryable: false,
      };

    case ErrorType.AUTHORIZATION:
    case 'AUTHORIZATION_ERROR':
      return {
        title: 'Access Denied',
        message: 'You do not have permission to access this resource.',
        suggestion: 'Please contact your administrator if you believe this is an error.',
        isRetryable: false,
      };

    case ErrorType.NOT_FOUND:
    case 'NOT_FOUND':
      return {
        title: 'Not Found',
        message: errorMessage || 'The requested resource could not be found.',
        suggestion: context
          ? `Try selecting a different ${context}.`
          : 'Please check your selection and try again.',
        isRetryable: false,
      };

    case ErrorType.DATABASE:
    case 'DATABASE_ERROR':
      return {
        title: 'Database Error',
        message: 'Unable to retrieve data from the database.',
        suggestion: 'This is usually temporary. Please try again in a moment.',
        isRetryable: true,
      };

    case ErrorType.EXTERNAL_API:
    case 'EXTERNAL_API_ERROR':
      return {
        title: 'Service Unavailable',
        message: 'Unable to connect to the required service.',
        suggestion: 'Please check your internet connection and try again.',
        isRetryable: true,
      };

    case ErrorType.TIMEOUT:
    case 'TIMEOUT_ERROR':
      return {
        title: 'Request Timed Out',
        message: 'The request took too long to complete.',
        suggestion: 'Please try again. If the problem persists, try refreshing the page.',
        isRetryable: true,
      };

    case ErrorType.RATE_LIMIT:
    case 'RATE_LIMIT_ERROR':
      return {
        title: 'Too Many Requests',
        message: 'You have made too many requests in a short time.',
        suggestion: 'Please wait a moment before trying again.',
        isRetryable: true,
      };

    case 'NetworkError':
    case 'Network request failed':
      return {
        title: 'Network Error',
        message: 'Unable to connect to the server.',
        suggestion: 'Please check your internet connection and try again.',
        isRetryable: true,
      };

    case 'AbortError':
      return {
        title: 'Request Cancelled',
        message: 'The request was cancelled.',
        suggestion: 'Please try again.',
        isRetryable: true,
      };

    default:
      // Check for specific error messages
      if (errorMessage.toLowerCase().includes('network')) {
        return {
          title: 'Network Error',
          message: 'Unable to connect to the server.',
          suggestion: 'Please check your internet connection and try again.',
          isRetryable: true,
        };
      }

      if (errorMessage.toLowerCase().includes('timeout')) {
        return {
          title: 'Request Timed Out',
          message: 'The request took too long to complete.',
          suggestion: 'Please try again.',
          isRetryable: true,
        };
      }

      if (errorMessage.toLowerCase().includes('not found')) {
        return {
          title: 'Not Found',
          message: errorMessage,
          suggestion: 'Please check your selection and try again.',
          isRetryable: false,
        };
      }

      // Return default with original message if available
      return {
        ...defaultError,
        message: errorMessage || defaultError.message,
        isRetryable,
      };
  }
};

// Get error message for specific contexts
export const getBarangayComparisonError = (error: any): UserFriendlyError => {
  const baseError = getUserFriendlyError(error, 'barangay or cycle');

  // Customize for barangay comparison context
  if (error.type === ErrorType.VALIDATION) {
    return {
      ...baseError,
      message: 'Please select 2-5 barangays to compare.',
      suggestion: 'Use the dropdown to select barangays, then try again.',
    };
  }

  if (error.type === ErrorType.NOT_FOUND) {
    return {
      ...baseError,
      message: 'One or more selected barangays or the cycle could not be found.',
      suggestion: 'Please select different barangays or cycle and try again.',
    };
  }

  return baseError;
};

export const getServiceAreaError = (error: any): UserFriendlyError => {
  const baseError = getUserFriendlyError(error, 'service area or cycle');

  // Customize for service area context
  if (error.type === ErrorType.VALIDATION) {
    return {
      ...baseError,
      message: 'Please select a valid service area.',
      suggestion: 'Choose a service area from the dropdown and try again.',
    };
  }

  if (error.type === ErrorType.NOT_FOUND) {
    return {
      ...baseError,
      message: 'No data available for the selected service area and cycle.',
      suggestion: 'Try selecting a different cycle or service area.',
    };
  }

  return baseError;
};

export const getAwardLeaderboardError = (error: any): UserFriendlyError => {
  const baseError = getUserFriendlyError(error, 'award data');

  // Customize for award leaderboard context
  if (error.type === ErrorType.DATABASE) {
    return {
      ...baseError,
      message: 'Unable to load award rankings.',
      suggestion: 'Please try again in a moment.',
    };
  }

  return baseError;
};

// Format error for display
export const formatErrorForDisplay = (
  error: any,
  context?: string
): {
  title: string;
  message: string;
  details?: string[];
  isRetryable: boolean;
} => {
  const friendlyError = getUserFriendlyError(error, context);

  const result: any = {
    title: friendlyError.title,
    message: friendlyError.message,
    isRetryable: friendlyError.isRetryable,
  };

  // Add suggestion as detail if available
  if (friendlyError.suggestion) {
    result.details = [friendlyError.suggestion];
  }

  // Add technical details in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    result.details = result.details || [];
    result.details.push(`Technical details: ${error.message || String(error)}`);
  }

  return result;
};

// Check if error is retryable
export const isErrorRetryable = (error: any): boolean => {
  if (error.isRetryable !== undefined) {
    return error.isRetryable;
  }

  const friendlyError = getUserFriendlyError(error);
  return friendlyError.isRetryable;
};

// Get no data message for specific contexts
export const getNoDataMessage = (context: string): {
  title: string;
  message: string;
  suggestion?: string;
} => {
  const messages: Record<string, { title: string; message: string; suggestion?: string }> = {
    'barangay-comparison': {
      title: 'No Comparison Data',
      message: 'Select 2-5 barangays to compare their performance.',
      suggestion: 'Use the dropdown above to select barangays.',
    },
    'service-rankings': {
      title: 'No Rankings Available',
      message: 'No ranking data is available for this service area and cycle.',
      suggestion: 'Try selecting a different cycle or service area.',
    },
    'service-trends': {
      title: 'No Trend Data',
      message: 'No historical trend data is available for this service area.',
      suggestion: 'Trend data requires multiple survey cycles.',
    },
    'award-leaderboard': {
      title: 'No Awards Yet',
      message: 'No awards have been given yet.',
      suggestion: 'Awards will appear here once cycles are completed.',
    },
    'chart': {
      title: 'No Data to Display',
      message: 'There is no data available to display in this chart.',
      suggestion: 'Try selecting different filters or check back later.',
    },
  };

  return messages[context] || {
    title: 'No Data Available',
    message: 'There is no data to display at this time.',
    suggestion: 'Please try again later or contact support if the problem persists.',
  };
};
