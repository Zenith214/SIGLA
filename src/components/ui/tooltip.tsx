/**
 * Tooltip Component
 * Provides helpful hints and information on hover
 */

"use client";

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 200; // Approximate width
    const tooltipHeight = 40; // Approximate height
    const offset = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.top - tooltipHeight - offset;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.bottom + offset;
        break;
      case 'left':
        x = rect.left - tooltipWidth - offset;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = rect.right + offset;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
    }

    // Keep tooltip within viewport
    const padding = 8;
    x = Math.max(padding, Math.min(x, window.innerWidth - tooltipWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - tooltipHeight - padding));

    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'top-[-4px] left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'right-[-4px] top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
        return 'left-[-4px] top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent';
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className={cn(
              'fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
              'max-w-xs break-words',
              'animate-scale-in',
              className
            )}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
            }}
            role="tooltip"
          >
            {content}
            <div
              className={cn(
                'absolute w-0 h-0 border-4',
                getArrowPosition()
              )}
            />
          </div>,
          document.body
        )}
    </>
  );
}

/**
 * Info Icon with Tooltip
 * Convenient component for help text
 */
interface InfoTooltipProps {
  content: string | ReactNode;
  className?: string;
}

export function InfoTooltip({ content, className }: InfoTooltipProps) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600',
          'rounded-full border border-gray-300 hover:border-gray-400',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
          className
        )}
        aria-label="More information"
      >
        <svg
          className="w-3 h-3"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </Tooltip>
  );
}

// Radix UI-compatible exports for sidebar compatibility
export const TooltipProvider = ({ children, delayDuration }: { children: React.ReactNode; delayDuration?: number }) => {
  return <>{children}</>;
};

export const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  return <>{children}</>;
};

export const TooltipContent = ({ children, side, sideOffset }: { children: React.ReactNode; side?: string; sideOffset?: number }) => {
  return null; // Not used in our implementation
};
