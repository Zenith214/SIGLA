"use client";

import { useState } from "react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { CycleDisplay } from "@/components/survey-cycle";
import HistoricalCycleViewer from "./HistoricalCycleViewer";
import CycleComparisonViewer from "./CycleComparisonViewer";
import HistoricalTrendAnalysis from "./HistoricalTrendAnalysis";
import OverallAnalytics from "./OverallAnalytics";

type AnalyticsTab = "historical" | "comparison" | "trends" | "overall";

export default function AnalyticsView() {
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("historical");

  const renderTabContent = () => {
    switch (activeTab) {
      case "historical":
        return <HistoricalCycleViewer />;
      case "comparison":
        return <CycleComparisonViewer />;
      case "trends":
        return <HistoricalTrendAnalysis />;
      case "overall":
        return <OverallAnalytics />;
      default:
        return <HistoricalCycleViewer />;
    }
  };

  return (
    <div className="w-full h-full">
      {/* Header with Cycle Context */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analytics & Trends Dashboard</h2>
            <p className="text-sm text-gray-600">
              Comprehensive analytics across all survey cycles
            </p>
          </div>
          <div className="text-sm">
            {hasActiveCycle ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Current Active Cycle:</span>
                <CycleDisplay />
              </div>
            ) : (
              <div className="text-amber-600 font-medium">
                ⚠️ No Active Cycle
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("historical")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "historical"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 Historical Cycles
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "comparison"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🔄 Cycle Comparison
          </button>
          <button
            onClick={() => setActiveTab("trends")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "trends"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            📈 Trend Analysis
          </button>
          <button
            onClick={() => setActiveTab("overall")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "overall"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            🌐 Overall Analytics
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 overflow-y-auto max-h-[calc(100vh-280px)]">
        {renderTabContent()}
      </div>
    </div>
  );
}

