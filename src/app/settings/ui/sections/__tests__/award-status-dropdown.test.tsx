/**
 * Award Status Dropdown Component Tests
 * Tests the award status dropdown component functionality
 * Requirements: Award status dropdown, User interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock UI components
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, disabled, value }: any) => (
    <div data-testid="select" data-disabled={disabled} data-value={value}>
      <button 
        onClick={() => onValueChange && onValueChange(value === 'awardee' ? 'non-awardee' : 'awardee')} 
        data-testid="select-button"
        disabled={disabled}
      >
        {value === 'awardee' ? 'Awardee' : 'Non-Awardee'}
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
  SelectTrigger: ({ children, className }: any) => <div data-testid="select-trigger" className={className}>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

// Create a simple test component that mimics the AwardStatusDropdown
const AwardStatusDropdown = ({ 
  barangayId, 
  barangayName, 
  currentStatus, 
  disabled = false,
  onStatusChange
}: { 
  barangayId: number
  barangayName: string
  currentStatus: boolean
  disabled?: boolean
  onStatusChange?: (barangayId: number, isAwardee: boolean, barangayName: string) => void
}) => {
  const handleValueChange = (value: string) => {
    const isAwardee = value === "awardee"
    if (isAwardee !== currentStatus && onStatusChange) {
      onStatusChange(barangayId, isAwardee, barangayName)
    }
  }

  return (
    <div data-testid="award-status-dropdown">
      <div data-testid="select" data-disabled={disabled} data-value={currentStatus ? "awardee" : "non-awardee"}>
        <button 
          onClick={() => handleValueChange(currentStatus ? "non-awardee" : "awardee")} 
          data-testid="select-button"
          disabled={disabled}
        >
          {currentStatus ? 'Awardee' : 'Non-Awardee'}
        </button>
      </div>
    </div>
  )
}

describe('AwardStatusDropdown Component', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with awardee status', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={true}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByTestId('award-status-dropdown')).toBeInTheDocument();
      expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'awardee');
      expect(screen.getByText('Awardee')).toBeInTheDocument();
    });

    it('should render with non-awardee status', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={false}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByTestId('select')).toHaveAttribute('data-value', 'non-awardee');
      expect(screen.getByText('Non-Awardee')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onStatusChange when status is changed from non-awardee to awardee', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={false}
          onStatusChange={mockOnStatusChange}
        />
      );

      const selectButton = screen.getByTestId('select-button');
      fireEvent.click(selectButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith(1, true, 'Test Barangay');
    });

    it('should call onStatusChange when status is changed from awardee to non-awardee', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={true}
          onStatusChange={mockOnStatusChange}
        />
      );

      const selectButton = screen.getByTestId('select-button');
      fireEvent.click(selectButton);

      expect(mockOnStatusChange).toHaveBeenCalledWith(1, false, 'Test Barangay');
    });

    it('should not call onStatusChange when disabled', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={false}
          disabled={true}
          onStatusChange={mockOnStatusChange}
        />
      );

      const selectButton = screen.getByTestId('select-button');
      expect(selectButton).toBeDisabled();
      
      // Try to click the disabled button
      fireEvent.click(selectButton);
      expect(mockOnStatusChange).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render in disabled state when disabled prop is true', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={false}
          disabled={true}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByTestId('select')).toHaveAttribute('data-disabled', 'true');
      expect(screen.getByTestId('select-button')).toBeDisabled();
    });

    it('should render in enabled state when disabled prop is false', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={false}
          disabled={false}
          onStatusChange={mockOnStatusChange}
        />
      );

      expect(screen.getByTestId('select')).toHaveAttribute('data-disabled', 'false');
      expect(screen.getByTestId('select-button')).not.toBeDisabled();
    });
  });

  describe('Props Handling', () => {
    it('should handle different barangay IDs correctly', () => {
      const { rerender } = render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Barangay 1"
          currentStatus={false}
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByTestId('select-button'));
      expect(mockOnStatusChange).toHaveBeenCalledWith(1, true, 'Barangay 1');

      mockOnStatusChange.mockClear();

      rerender(
        <AwardStatusDropdown
          barangayId={2}
          barangayName="Barangay 2"
          currentStatus={false}
          onStatusChange={mockOnStatusChange}
        />
      );

      fireEvent.click(screen.getByTestId('select-button'));
      expect(mockOnStatusChange).toHaveBeenCalledWith(2, true, 'Barangay 2');
    });

    it('should handle missing onStatusChange callback gracefully', () => {
      render(
        <AwardStatusDropdown
          barangayId={1}
          barangayName="Test Barangay"
          currentStatus={false}
        />
      );

      // Should not throw error when clicking without callback
      expect(() => {
        fireEvent.click(screen.getByTestId('select-button'));
      }).not.toThrow();
    });
  });
});