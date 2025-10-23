"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import HistoricalCycleViewer from "@/components/dashboard/HistoricalCycleViewer";
import CycleComparisonViewer from "@/components/dashboard/CycleComparisonViewer";
import HistoricalTrendAnalysis from "@/components/dashboard/HistoricalTrendAnalysis";
import { CycleDisplay } from "@/components/survey-cycle";

type HistoricalView = "cycle-viewer" | "comparison" | "trends";

export default function HistoricalDashboard() {
  const [activeView, setActiveView] = useState<HistoricalView>("cycle-viewer");

  const renderContent = () => {
    switch (activeView) {
      case "cycle-viewer":
        return <HistoricalCycleViewer />;
      case "comparison":
        return <CycleComparisonViewer />;
      case "trends":
        return <HistoricalTrendAnalysis />;
      default:
        return <HistoricalCycleViewer />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  Historical Survey Dashboard
                </h1>
                {/* Current Active Cycle Display */}
                <div className="text-sm text-gray-600 border-l pl-4">
                  <span className="font-medium">Current Active Cycle:</span>
                  <div className="mt-1">
                    <CycleDisplay />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    (Historical data shown separately below)
                  </div>
                </div>
              </div>
              
              {/* View Selector */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView("cycle-viewer")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "cycle-viewer"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Cycle Viewer
                </button>
                <button
                  onClick={() => setActiveView("comparison")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "comparison"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Comparison
                </button>
                <button
                  onClick={() => setActiveView("trends")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "trends"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Trends
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* View Description */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-blue-900 mb-1">Historical Data View</div>
                {activeView === "cycle-viewer" && (
                  <div className="text-blue-800 text-sm">
                    View detailed dashboard data for individual historical survey cycles. 
                    This data is separate from your current active cycle and represents completed survey periods.
                  </div>
                )}
                {activeView === "comparison" && (
                  <div className="text-blue-800 text-sm">
                    Compare performance metrics across multiple survey cycles to identify trends and improvements.
                    All data shown represents completed historical cycles.
                  </div>
                )}
                {activeView === "trends" && (
                  <div className="text-blue-800 text-sm">
                    Analyze historical trends and patterns across all survey cycles over time.
                    This view helps identify long-term patterns and performance changes.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          {renderContent()}
        </div>

        {/* Back to Main Dashboard Link */}
        <div className="fixed bottom-4 right-4">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Main Dashboard
          </a>
        </div>
      </div>
    </ProtectedRoute>
  );
}