"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MapHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapHelpModal({ isOpen, onClose }: MapHelpModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('mapHelpDontShowAgain', 'true');
    }
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How to Use the Map</DialogTitle>
          <DialogDescription>
            Learn how to interact with the Satisfaction Index Overview map
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
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
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Color Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#64D9B7" }}></div>
                <span className="text-sm">Awardee barangays</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: "#6A7280" }}></div>
                <span className="text-sm">Non-awardee barangays</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                <span className="text-sm">Selected/Highlighted barangay</span>
              </div>
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
          <div className="flex justify-end">
            <Button onClick={handleClose}>Got it!</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}