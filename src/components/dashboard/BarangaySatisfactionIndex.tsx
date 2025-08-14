"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarangayData } from "@/data/barangayData";

interface BarangaySatisfactionIndexProps {
  barangay: BarangayData;
  isOpen: boolean;
  onClose: () => void;
}

export default function BarangaySatisfactionIndex({
  barangay,
  isOpen,
  onClose,
}: BarangaySatisfactionIndexProps) {
  const router = useRouter();

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Mock satisfaction percentage - you can replace this with actual data
  const satisfactionPercentage = 65; // Example value
  const isHighSatisfaction = satisfactionPercentage >= 58;

  const handleViewReportCard = () => {
    // Navigate to report card page with barangay data
    const params = new URLSearchParams({
      barangay: barangay.name,
      population: barangay.population.toString(),
      households: barangay.households.toString(),
      area: barangay.area.toString(),
      surveyStatus: barangay.surveyStatus,
      satisfaction: satisfactionPercentage.toString()
    });
    
    router.push(`/reportcard?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop - 30% opacity */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{barangay.name}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 hover:bg-gray-200 rounded-full transition-colors"
          >
            <span className="text-2xl text-gray-600">×</span>
          </Button>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="p-6">
          <div className="grid grid-cols-5 gap-6">
            {/* Left Column - 2/5 width */}
            <div className="col-span-2 space-y-4">
              {/* BLGU Logo */}
              <div className="border-2 border-gray-200 rounded-xl p-6 h-40 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm">
                <span className="text-2xl font-bold text-gray-700 tracking-wide">BLGU LOGO</span>
              </div>

              {/* View Report Card Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={handleViewReportCard}
              >
                View Report Card
              </Button>

              {/* How to Use Section */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50 shadow-sm">
                <h3 className="text-gray-800 font-semibold mb-3 text-base">How to Read This Report</h3>

                <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                  {/* Overall Satisfaction */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Overall Satisfaction</h4>
                    <p>Shows the barangay's overall performance score. Green (58% or higher) indicates good performance, while red (below 58%) suggests areas needing improvement.</p>
                  </div>

                  {/* Action Grid */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Action Grid</h4>
                    <p>Categorizes services based on satisfaction levels and action priority:</p>
                    <ul className="mt-1 ml-2 space-y-1">
                      <li><span className="text-green-700 font-medium">• MAINTAIN:</span> Keep up good work</li>
                      <li><span className="text-blue-700 font-medium">• OPPORTUNITIES:</span> Build on strengths</li>
                      <li><span className="text-yellow-700 font-medium">• MONITOR:</span> Watch for changes</li>
                      <li><span className="text-red-700 font-medium">• FIX NOW:</span> Immediate attention needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 3/5 width */}
            <div className="col-span-3 space-y-4">
              {/* Overall Satisfaction */}
              <div className="border border-gray-200 rounded-full px-6 py-3 text-center bg-white shadow-sm">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-gray-700 font-medium text-base">Overall Satisfaction:</span>
                  <span className={`text-xl font-bold ${isHighSatisfaction ? 'text-green-600' : 'text-red-600'}`}>
                    {satisfactionPercentage}%
                  </span>
                </div>
              </div>

              {/* Action Grid */}
              <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-blue-50 shadow-sm mb-4">
                <div className="flex flex-col">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Action Grid</h2>
                  </div>

                  {/* 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-4 h-80">
                    {/* Top Left - Maintain */}
                    <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 flex flex-col">
                      <div className="text-center mb-3">
                        <h3 className="text-green-800 font-bold text-base mb-1">MAINTAIN</h3>
                        <span className="text-green-600 font-medium text-xs">High Satisfaction, Low Need for Action</span>
                      </div>
                      <div className="space-y-1 text-xs text-green-800">
                        <div className="flex items-center">
                          <span className="mr-2">★</span>
                          <span>Safety, Peace & Order</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">★</span>
                          <span>Business Friendliness</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Right - Opportunities */}
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 flex flex-col">
                      <div className="text-center mb-3">
                        <h3 className="text-blue-800 font-bold text-base mb-1">OPPORTUNITIES</h3>
                        <span className="text-blue-600 font-medium text-xs">High Satisfaction, High Need for Action</span>
                      </div>
                      <div className="space-y-1 text-xs text-blue-800">
                        <div className="flex items-center">
                          <span className="mr-2">★</span>
                          <span>Disaster Preparedness</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-2">★</span>
                          <span>Social Protection</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left - Monitor */}
                    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 flex flex-col">
                      <div className="text-center mb-3">
                        <h3 className="text-yellow-800 font-bold text-base mb-1">MONITOR</h3>
                        <span className="text-yellow-600 font-medium text-xs">Low Satisfaction, Low Need for Action</span>
                      </div>
                      <div className="space-y-1 text-xs text-yellow-800">
                        <div className="flex items-center">
                          <span className="mr-2">★</span>
                          <span>Environmental Management</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Right - Fix Now */}
                    <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 flex flex-col">
                      <div className="text-center mb-3">
                        <h3 className="text-red-800 font-bold text-base mb-1">FIX NOW</h3>
                        <span className="text-red-600 font-medium text-xs">Low Satisfaction, High Need for Action</span>
                      </div>
                      <div className="space-y-1 text-xs text-red-800">
                        <div className="flex items-center">
                          <span className="mr-2">★</span>
                          <span>Finance Administration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}