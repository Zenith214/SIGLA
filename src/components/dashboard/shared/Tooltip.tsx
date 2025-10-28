/**
 * Tooltip Component
 * 
 * Displays contextual information on hover or focus
 * Accessible tooltip with keyboard support
 */

import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }
    setIsVisible(false);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [showTimeout]);

  const getPositionClasses = () => {
    const baseClasses = 'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseClasses} bottom-[-4px] left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-[-4px] left-1/2 -translate-x-1/2`;
      case 'left':
        return `${baseClasses} right-[-4px] top-1/2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-[-4px] top-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={getPositionClasses()}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          <div className={getArrowClasses()} aria-hidden="true"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
