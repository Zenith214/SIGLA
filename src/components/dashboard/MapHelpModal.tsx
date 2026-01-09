"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/auth/AuthProvider";

interface MapHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapHelpModal({ isOpen, onClose }: MapHelpModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isListView, setIsListView] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const checkView = () => {
      // Check if list view is currently displayed
      const listViewElement = document.querySelector('[data-tour="list-view"]');
      const hasListView = !!listViewElement;
      
      // Officers default to list view, so if we can't find the element yet,
      // check the user's role
      if (!hasListView && user?.role?.toLowerCase() === 'officer') {
        setIsListView(true);
      } else {
        setIsListView(hasListView);
      }
    };
    
    checkMobile();
    checkView();
    
    window.addEventListener('resize', checkMobile);
    
    // Check view when modal opens or user changes
    if (isOpen) {
      // Small delay to ensure DOM is ready
      setTimeout(checkView, 100);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isOpen, user]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('mapHelpDontShowAgain', 'true');
    }
    onClose();
  };

  const handleRestartTour = () => {
    // Clear the tour completion flag
    localStorage.removeItem('onboardingTourCompleted');
    // Close the modal
    onClose();
    // Reload the page to restart the tour
    window.location.reload();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isMobile ? "How to Use the Dashboard" : isListView ? "How to Use the List View" : "How to Use the Map"}
          </DialogTitle>
          <DialogDescription>
            {isMobile 
              ? "Learn how to navigate the Satisfaction Index Overview"
              : isListView
              ? "Learn how to navigate the Barangay List View"
              : "Learn how to interact with the Satisfaction Index Overview map"
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            {isMobile ? (
              // Mobile instructions
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Browse barangays</h4>
                    <p className="text-sm text-gray-600">
                      Scroll through the list to see all barangays and their status.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Search barangays</h4>
                    <p className="text-sm text-gray-600">
                      Use the search bar at the top to quickly find specific barangays.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Tap to view details</h4>
                    <p className="text-sm text-gray-600">
                      Tap on any barangay card to view detailed satisfaction index and action grid.
                    </p>
                  </div>
                </div>
              </>
            ) : isListView ? (
              // List view instructions
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Browse barangays</h4>
                    <p className="text-sm text-gray-600">
                      Scroll through the list to see all barangays and their satisfaction index status.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Search and filter</h4>
                    <p className="text-sm text-gray-600">
                      Use the search bar to quickly find specific barangays by name.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Click to view details</h4>
                    <p className="text-sm text-gray-600">
                      Click on any barangay card to view detailed satisfaction index and action grid.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Switch to map view</h4>
                    <p className="text-sm text-gray-600">
                      Click the "Map" button at the top right to switch to the interactive map view.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              // Desktop instructions
              <>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Hover over barangays</h4>
                    <p className="text-sm text-gray-600">
                      Move your mouse over any barangay to see it highlighted in yellow.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Click to select</h4>
                    <p className="text-sm text-gray-600">
                      Click on a barangay to select it and see a red pin with details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">View details</h4>
                    <p className="text-sm text-gray-600">
                      Click the red pin to open detailed information about the barangay.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">
              {isMobile ? "Badge Legend" : isListView ? "Status Indicators" : "Color Legend"}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#10b981" }}></div>
                <span className="text-sm">SGLGB Awardee barangays</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#6b7280" }}></div>
                <span className="text-sm">Non-awardee barangays</span>
              </div>
              {!isMobile && !isListView && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <span className="text-sm">Selected/Highlighted barangay</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dontShowAgain" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label 
              htmlFor="dontShowAgain" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't show again
            </label>
          </div>
          
          <div className="border-t pt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Want a guided tour of the entire system? Click the button below to restart the step-by-step walkthrough.
              </p>
            </div>
            <Button 
              onClick={handleRestartTour}
              variant="outline"
              className="w-full mb-3 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              🎯 Restart System Tour
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleClose}>Got it!</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}