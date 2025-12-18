"use client";

import { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearDelay?: number;
}

/**
 * LiveRegion Component
 * 
 * Provides an ARIA live region for announcing dynamic content changes to screen readers
 * 
 * @param message - The message to announce
 * @param politeness - The politeness level ('polite' or 'assertive')
 * @param clearDelay - Time in ms before clearing the message (default: 3000)
 */
export default function LiveRegion({ 
  message, 
  politeness = 'polite',
  clearDelay = 3000 
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      
      if (clearDelay > 0) {
        const timer = setTimeout(() => {
          setCurrentMessage('');
        }, clearDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, clearDelay]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  );
}
