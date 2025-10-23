/**
 * Cycle Selector Component Tests - Task 6.3
 * Tests cycle selector component behavior and user interactions
 * Requirements: 6.3, 6.4
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CycleSelectorDropdown, CompactCycleSelector, CycleDisplay } from '../CycleSelectorDropdown';
import { useSurveyCycle } from '@/contexts/SurveyCycleContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { SurveyCycle } from '@/utils/surveyCycleHelpers';

// Mock the context hooks
jest.mock('@/contexts/SurveyCycleContext');
jest.mock('@/components/auth/AuthProvider');

const mockUseSurveyCycle = useSurveyCycle as jest.MockedFunction<typeof useSurveyCycle>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock UI components
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, disabled, value }: any) => (
    <div data-testid="select" data-disabled={disabled} data-value={value}>
      <button onClick={() => onValueChange && onValueChange('2')} data-testid="select-button">
        Select Trigger
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid={`select-item-${value}`} data-value={String(value)}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger-wrapper">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, variant }: any) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: any) => <div data-testid="skeleton" className={className} />,
}));

describe('CycleSelectorDropdown', () => {
  const mockCycles = [
    { 
      cycle_id: 1, 
      name: 'Cycle 2023', 
      year: 2023, 
      is_active: false, 
      start_date: new Date('2023-01-01'), 
      end_date: new Date('2023-12-31'),
      created_at: new Date('2023-01-01'),
      updated_at: new Date('2023-01-01')
    },
    { 
      cycle_id: 2, 
      name: 'Cycle 2024', 
      year: 2024, 
      is_active: true, 
      start_date: new Date('2024-01-01'), 
      end_date: new Date('2024-12-31'),
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
  ];

  const mockActiveCycle = mockCycles[1];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    mockUseSurveyCycle.mockReturnValue({
      activeCycle: mockActiveCycle,
      allCycles: mockCycles,
      loading: false,
      error: null,
      refreshActiveCycle: jest.fn(),
      refreshAllCycles: jest.fn(),
      setActiveCycle: jest.fn(),
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when loading', () => {
      mockUseSurveyCycle.mockReturnValue({
        activeCycle: null,
        allCycles: [],
        loading: true,
        error: null,
        refreshActiveCycle: jest.fn(),
        refreshAllCycles: jest.fn(),
        setActiveCycle: jest.fn(),
      });

      render(<CycleSelectorDropdown />);

      expect(screen.getAllByTestId('skeleton')).toHaveLength(2); // Label and select skeletons
    });
  });

  describe('Error State', () => {
    it('should show error alert when there is an error', () => {
      mockUseSurveyCycle.mockReturnValue({
        activeCycle: null,
        allCycles: [],
        loading: false,
        error: 'Failed to load cycles',
        refreshActiveCycle: jest.fn(),
        refreshAllCycles: jest.fn(),
        setActiveCycle: jest.fn(),
      });

      render(<CycleSelectorDropdown />);

      expect(screen.getByTestId('alert')).toHaveAttribute('data-variant', 'destructive');
      expect(screen.getByTestId('alert-description')).toHaveTextContent('Failed to load survey cycles: Failed to load cycles');
    });
  });

  describe('No Cycles State', () => {
    it('should show no cycles message when cycles array is empty', () => {
      mockUseSurveyCycle.mockReturnValue({
        activeCycle: null,
        allCycles: [],
        loading: false,
        error: null,
        refreshActiveCycle: jest.fn(),
        refreshAllCycles: jest.fn(),
        setActiveCycle: jest.fn(),
      });

      render(<CycleSelectorDropdown />);

      expect(screen.getByTestId('alert-description')).toHaveTextContent(
        'No survey cycles available. Contact an administrator to create cycles.'
      );
    });
  });

  describe('Normal Operation', () => {
    it('should render cycle selector with active cycle', () => {
      render(<CycleSelectorDropdown />);

      expect(screen.getByText('Survey Cycle')).toBeInTheDocument();
      expect(screen.getAllByTestId('badge')[0]).toHaveTextContent('Active');
      expect(screen.getByTestId('select')).toHaveAttribute('data-value', '2');
      expect(screen.getByTestId('select-value')).toHaveTextContent('Cycle 2024 (2024)');
    });

    it('should render all cycles in dropdown', () => {
      render(<CycleSelectorDropdown />);

      expect(screen.getByTestId('select-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('select-item-2')).toBeInTheDocument();
    });

    it('should handle cycle change for admin users', async () => {
      const mockSetActiveCycle = jest.fn().mockResolvedValue(undefined);
      mockUseSurveyCycle.mockReturnValue({
        activeCycle: mockActiveCycle,
        allCycles: mockCycles,
        loading: false,
        error: null,
        refreshActiveCycle: jest.fn(),
        refreshAllCycles: jest.fn(),
        setActiveCycle: mockSetActiveCycle,
      });

      render(<CycleSelectorDropdown />);

      const selectButton = screen.getByTestId('select-button');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(mockSetActiveCycle).toHaveBeenCalledWith(2);
      });
    });

    it('should show error when cycle change fails', async () => {
      const mockSetActiveCycle = jest.fn().mockRejectedValue(new Error('Failed to change cycle'));
      mockUseSurveyCycle.mockReturnValue({
        activeCycle: mockActiveCycle,
        allCycles: mockCycles,
        loading: false,
        error: null,
        refreshActiveCycle: jest.fn(),
        refreshAllCycles: jest.fn(),
        setActiveCycle: mockSetActiveCycle,
      });

      render(<CycleSelectorDropdown />);

      const selectButton = screen.getByTestId('select-button');
      fireEvent.click(selectButton);

      await waitFor(() => {
        expect(screen.getByTestId('alert-description')).toHaveTextContent('Failed to change cycle');
      });
    });
  });

  describe('Permission Handling', () => {
    it('should disable selector for non-admin users', () => {
      mockUseAuth.mockReturnValue({
        user: { id: '1', firstName: 'Test', lastName: 'User', email: 'user@test.com', role: 'viewer' },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      render(<CycleSelectorDropdown />);

      expect(screen.getByTestId('select')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByText('Only administrators can change the active survey cycle.')).toBeInTheDocument();
    });

    it('should disable selector for unauthenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
      });

      render(<CycleSelectorDropdown />);

      expect(screen.getByTestId('select')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Component Variants', () => {
    it('should render without label when showLabel is false', () => {
      render(<CycleSelectorDropdown showLabel={false} />);

      expect(screen.queryByText('Survey Cycle')).not.toBeInTheDocument();
    });

    it('should apply compact styling when compact is true', () => {
      render(<CycleSelectorDropdown compact={true} />);

      // The compact prop should be passed to the SelectTrigger
      expect(screen.getByTestId('select-trigger-wrapper')).toBeInTheDocument();
    });
  });
});

describe('CompactCycleSelector', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
    });

    mockUseSurveyCycle.mockReturnValue({
      activeCycle: { 
        cycle_id: 1, 
        name: 'Test Cycle', 
        year: 2024, 
        is_active: true,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      },
      allCycles: [{ 
        cycle_id: 1, 
        name: 'Test Cycle', 
        year: 2024, 
        is_active: true,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      }],
      loading: false,
      error: null,
      refreshActiveCycle: jest.fn(),
      refreshAllCycles: jest.fn(),
      setActiveCycle: jest.fn(),
    });
  });

  it('should render compact version without label', () => {
    render(<CompactCycleSelector />);

    expect(screen.queryByText('Survey Cycle')).not.toBeInTheDocument();
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });
});

describe('CycleDisplay', () => {
  beforeEach(() => {
    mockUseSurveyCycle.mockReturnValue({
      activeCycle: { 
        cycle_id: 1, 
        name: 'Display Cycle', 
        year: 2024, 
        is_active: true,
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-12-31'),
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01')
      },
      allCycles: [],
      loading: false,
      error: null,
      refreshActiveCycle: jest.fn(),
      refreshAllCycles: jest.fn(),
      setActiveCycle: jest.fn(),
    });
  });

  it('should display active cycle information', () => {
    render(<CycleDisplay />);

    expect(screen.getByText('Display Cycle')).toBeInTheDocument();
    expect(screen.getByTestId('badge')).toHaveTextContent('2024');
  });

  it('should show loading skeleton when loading', () => {
    mockUseSurveyCycle.mockReturnValue({
      activeCycle: null,
      allCycles: [],
      loading: true,
      error: null,
      refreshActiveCycle: jest.fn(),
      refreshAllCycles: jest.fn(),
      setActiveCycle: jest.fn(),
    });

    render(<CycleDisplay />);

    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should show no active cycle message when no cycle is active', () => {
    mockUseSurveyCycle.mockReturnValue({
      activeCycle: null,
      allCycles: [],
      loading: false,
      error: 'No active cycle',
      refreshActiveCycle: jest.fn(),
      refreshAllCycles: jest.fn(),
      setActiveCycle: jest.fn(),
    });

    render(<CycleDisplay />);

    expect(screen.getByText('No active cycle')).toBeInTheDocument();
  });

  it('should apply white text styling when className includes text-white', () => {
    render(<CycleDisplay className="text-white" />);

    expect(screen.getByText('Display Cycle')).toBeInTheDocument();
    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'outline');
  });
});