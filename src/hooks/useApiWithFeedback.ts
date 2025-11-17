"use client"

import { useState } from 'react';
import { useToast } from './use-toast';

interface ApiCallOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useApiWithFeedback() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const execute = async <T = any>(
    apiCall: () => Promise<Response>,
    options: ApiCallOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage = 'Operation completed successfully',
      errorMessage = 'An error occurred',
      onSuccess,
      onError,
      showSuccessToast = true,
      showErrorToast = true
    } = options;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      const data = await response.json();

      if (!response.ok) {
        // Handle API error response
        const errorMsg = data.error || data.message || errorMessage;
        setError(errorMsg);

        if (showErrorToast) {
          toast({
            title: 'Error',
            description: errorMsg,
            type: 'error',
            duration: 5000
          });
        }

        if (onError) {
          onError(data);
        }

        return null;
      }

      // Success
      if (showSuccessToast) {
        toast({
          title: 'Success',
          description: data.message || successMessage,
          type: 'success',
          duration: 3000
        });
      }

      if (onSuccess) {
        onSuccess(data);
      }

      return data as T;

    } catch (err: any) {
      // Handle network or other errors
      const errorMsg = err.message || errorMessage;
      setError(errorMsg);

      if (showErrorToast) {
        toast({
          title: 'Error',
          description: errorMsg,
          type: 'error',
          duration: 5000
        });
      }

      if (onError) {
        onError(err);
      }

      return null;

    } finally {
      setIsLoading(false);
    }
  };

  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}
