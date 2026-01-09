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
import { HelpCircle, MapPin, BarChart3, FileText, Settings, ChevronRight, ChevronLeft, Lightbulb, Rocket } from "lucide-react";

interface WelcomeHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeHelpModal({ isOpen, onClose }: WelcomeHelpModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('welcomeHelpDontShowAgain', 'true');
    }
    setCurrentStep(0); // Reset for next time
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Welcome to PULSE!
          </DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Welcome */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome to PULSE!
                </h3>
                <p className="text-gray-700">
                  Public Understanding and Local Satisfaction Evaluation
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  PULSE is a comprehensive survey platform designed to measure citizen satisfaction 
                  with local government services and improve governance effectiveness.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This quick guide will help you understand the key features and get started with the system.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Tip</p>
                    <p className="text-sm text-yellow-800">
                      You can access this guide anytime by clicking the help button (?) in the navigation menu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Navigation Menu */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Navigation Menu</h3>
                <p className="text-gray-600">Explore the main features of PULSE</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-900">Dashboard</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      View the Satisfaction Index Overview map and barangay performance metrics
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-900">Reports</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Generate and view detailed survey reports and analytics
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-900">Survey Management</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage survey cycles, questionnaires, and responses
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-900">Settings</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Configure your profile, manage users, and system settings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Quick Tips */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Tips</h3>
                <p className="text-gray-600">Essential things to know</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Check the Active Survey Cycle</p>
                      <p className="text-sm text-gray-600 mt-1">
                        The current survey cycle is always displayed in the header
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Use Help Buttons</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Look for the (?) icon on any page for context-specific guidance
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Role-Based Access</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Your role determines which features you can access
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Keep Profile Updated</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Maintain accurate profile information in Settings
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      5
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Need Help?</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Contact your administrator for additional permissions or support
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Getting Started */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">You're All Set!</h3>
                <p className="text-gray-600">Follow these steps to get started</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Familiarize with Navigation</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Explore the main menu and understand where each feature is located
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Update Your Profile</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Go to Settings and review your profile information
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Explore the Dashboard</p>
                      <p className="text-sm text-gray-600 mt-1">
                        View current survey data and barangay performance metrics
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Check Your Tasks</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Review your assigned responsibilities and pending work
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      5
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ask Questions</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Don't hesitate to reach out to your supervisor for guidance
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Remember</p>
                    <p className="text-sm text-blue-800">
                      You can always access this guide again from the help menu. Good luck!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="space-y-4 pt-4 border-t">
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
              Don't show this again
            </label>
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < totalSteps - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleClose}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                Get Started!
                <Rocket className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
