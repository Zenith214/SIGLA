import { renderHook, act } from '@testing-library/react';
import { useInactivityTimeout } from '../useInactivityTimeout';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('useInactivityTimeout', () => {
  let mockPush: jest.Mock;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockPush = jest.fn();
    mockFetch = jest.fn().mockResolvedValue({ ok: true });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should logout after timeout period with no activity', async () => {
    const onTimeout = jest.fn();
    
    renderHook(() =>
      useInactivityTimeout({
        timeoutMinutes: 10,
        onTimeout,
        enabled: true,
      })
    );

    // Fast-forward 10 minutes
    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
    expect(onTimeout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/login?reason=timeout');
  });

  it('should reset timer on user activity', async () => {
    const onTimeout = jest.fn();
    
    renderHook(() =>
      useInactivityTimeout({
        timeoutMinutes: 10,
        onTimeout,
        enabled: true,
      })
    );

    // Fast-forward 5 minutes
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    // Simulate user activity
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown'));
    });

    // Fast-forward another 5 minutes (total 10 minutes, but timer was reset)
    act(() => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    // Should not have logged out yet
    expect(mockFetch).not.toHaveBeenCalled();
    expect(onTimeout).not.toHaveBeenCalled();

    // Fast-forward another 5 minutes (now 10 minutes since last activity)
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
    });

    // Now should logout
    expect(mockFetch).toHaveBeenCalled();
    expect(onTimeout).toHaveBeenCalled();
  });

  it('should not start timer when disabled', async () => {
    const onTimeout = jest.fn();
    
    renderHook(() =>
      useInactivityTimeout({
        timeoutMinutes: 10,
        onTimeout,
        enabled: false,
      })
    );

    // Fast-forward 10 minutes
    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('should handle logout errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    renderHook(() =>
      useInactivityTimeout({
        timeoutMinutes: 10,
        enabled: true,
      })
    );

    // Fast-forward 10 minutes
    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000);
    });

    expect(consoleError).toHaveBeenCalledWith('Error during auto-logout:', expect.any(Error));
    expect(mockPush).toHaveBeenCalledWith('/login');
    
    consoleError.mockRestore();
  });
});
