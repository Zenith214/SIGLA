/**
 * useErrorHandler Hook
 * 
 * Custom hook for handling errors in components
 * Provides error state management and user-friendly error messages
 */

import { useState, useCallback } from 'react';
import { getUserFriendlyError, UserFriendlyError } from '@/utils/errorMessages';

export interface UseErrorHandlerReturn {
  error: UserFriendlyError | null;
  hasError: boolean;
  setError: (error: any, context?: string) => void;
  clearError: () => void;
  isRetryable: boolean;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<UserFriendlyError | null>(null);

  const setError = useCallback((error: any, context?: string) => {
    if (!error) {
      setErrorState(null);
      return;
    }

    const friendlyError = getUserFriendlyError(error, context);
    setErrorState(friendlyError);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    setError,
    clearError,
    isRetryable: error?.isRetryable ?? false,
  };
};

export default useErrorHandler;
