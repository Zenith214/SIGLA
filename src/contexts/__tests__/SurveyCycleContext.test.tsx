/**
 * Survey Cycle Context Provider Tests - Task 6.3
 * Tests cycle context provider functionality and automatic data refresh
 * Requirements: 6.3, 6.4
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SurveyCycleProvider, useSurveyCycle } from '../SurveyCycleContext';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Test component to access context
function TestComponent() {
  const {
    activeCycle,
    allCycles,
    loading,
    error,
    refreshActiveCycle,
    refreshAllCycles,
    setActiveCycle,
  } = useSurveyCycle();

  const handleSetActive = async () => {
    try {
      await setActiveCycle(2);
    } catch (error) {
      // Error is handled by the context provider
    }
  };

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'loaded'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="active-cycle">
        {activeCycle ? `${activeCycle.name}-${activeCycle.year}` : 'no-active-cycle'}
      </div>
      <div data-testid="all-cycles-count">{allCycles.length}</div>
      <button onClick={refreshActiveCycle} data-testid="refresh-active">
        Refresh Active
      </button>
      <button onClick={refreshAllCycles} data-testid="refresh-all">
        Refresh All
      </button>
      <button onClick={handleSetActive} data-testid="set-active">
        Set Active
      </button>
    </div>
  );
}

describe('SurveyCycleContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initial Loading', () => {
    it('should load initial data on mount', async () => {
      // Mock successful API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { cycle_id: 1, name: 'Test Cycle', year: 2024, is_active: true }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [
              { cycle_id: 1, name: 'Test Cycle', year: 2024, is_active: true },
              { cycle_id: 2, name: 'Old Cycle', year: 2023, is_active: false }
            ]
          }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('active-cycle')).toHaveTextContent('Test Cycle-2024');
      expect(screen.getByTestId('all-cycles-count')).toHaveTextContent('2');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');

      // Verify API calls
      expect(mockFetch).toHaveBeenCalledWith('/api/survey-cycles/active');
      expect(mockFetch).toHaveBeenCalledWith('/api/survey-cycles');
    });

    it('should handle no active cycle scenario', async () => {
      // Mock 404 for active cycle and empty cycles list
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ message: 'No active cycle found' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('active-cycle')).toHaveTextContent('no-active-cycle');
      expect(screen.getByTestId('all-cycles-count')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });

    it('should handle API errors during initial load', async () => {
      // Mock API error
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(screen.getByTestId('active-cycle')).toHaveTextContent('no-active-cycle');
    });
  });

  describe('Refresh Functions', () => {
    it('should refresh active cycle when requested', async () => {
      // Initial load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { cycle_id: 1, name: 'Initial Cycle', year: 2024, is_active: true }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Mock refresh response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { cycle_id: 2, name: 'Updated Cycle', year: 2024, is_active: true }
        }),
      } as Response);

      // Trigger refresh
      act(() => {
        screen.getByTestId('refresh-active').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-cycle')).toHaveTextContent('Updated Cycle-2024');
      });
    });

    it('should refresh all cycles when requested', async () => {
      // Initial load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: null }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [{ cycle_id: 1, name: 'Initial', year: 2024, is_active: false }] }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('all-cycles-count')).toHaveTextContent('1');
      });

      // Mock refresh response with more cycles
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [
            { cycle_id: 1, name: 'Initial', year: 2024, is_active: false },
            { cycle_id: 2, name: 'New Cycle', year: 2024, is_active: true }
          ]
        }),
      } as Response);

      // Trigger refresh
      act(() => {
        screen.getByTestId('refresh-all').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('all-cycles-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Set Active Cycle', () => {
    it('should set active cycle and refresh data', async () => {
      // Initial load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: null }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Mock set active cycle response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { cycle_id: 2, name: 'New Active', year: 2024, is_active: true }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [{ cycle_id: 2, name: 'New Active', year: 2024, is_active: true }]
          }),
        } as Response);

      // Trigger set active cycle
      act(() => {
        screen.getByTestId('set-active').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-cycle')).toHaveTextContent('New Active-2024');
      });

      // Verify API calls
      expect(mockFetch).toHaveBeenCalledWith('/api/survey-cycles/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycle_id: 2 }),
      });
    });

    it('should handle set active cycle errors', async () => {
      // Initial load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: null }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      // Mock error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Failed to set active cycle' }),
      } as Response);

      // Trigger set active cycle - the error should be caught and set in state
      act(() => {
        screen.getByTestId('set-active').click();
      });

      // Wait for error to appear in UI
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to set active cycle');
      }, { timeout: 5000 });
    });
  });

  describe('Automatic Data Refresh', () => {
    it('should automatically refresh data when cycle changes', async () => {
      // Initial load
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { cycle_id: 1, name: 'Initial Cycle', year: 2024, is_active: true }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [{ cycle_id: 1, name: 'Initial Cycle', year: 2024, is_active: true }]
          }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('active-cycle')).toHaveTextContent('Initial Cycle-2024');
      });

      // Mock cycle change response - setActiveCycle should refresh all cycles
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { cycle_id: 2, name: 'New Cycle', year: 2024, is_active: true }
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [
              { cycle_id: 1, name: 'Initial Cycle', year: 2024, is_active: false },
              { cycle_id: 2, name: 'New Cycle', year: 2024, is_active: true }
            ]
          }),
        } as Response);

      // Trigger cycle change
      act(() => {
        screen.getByTestId('set-active').click();
      });

      // Verify automatic refresh of both active cycle and all cycles
      await waitFor(() => {
        expect(screen.getByTestId('active-cycle')).toHaveTextContent('New Cycle-2024');
        expect(screen.getByTestId('all-cycles-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(screen.getByTestId('active-cycle')).toHaveTextContent('no-active-cycle');
    });

    it('should handle API error responses', async () => {
      // Mock API error response
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Server error' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        } as Response);

      render(
        <SurveyCycleProvider>
          <TestComponent />
        </SurveyCycleProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Server error');
    });
  });
});