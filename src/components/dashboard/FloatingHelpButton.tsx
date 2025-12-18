"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import MapHelpModal from "./MapHelpModal";

export default function FloatingHelpButton() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    // Check if user has opted out of auto-showing the modal
    const dontShowAgain = localStorage.getItem('mapHelpDontShowAgain');
    if (!dontShowAgain) {
      setIsHelpOpen(true);
    }
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
        size="sm"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="md:w-6 md:h-6"
        >
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </Button>
      
      <MapHelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </>
  );
}