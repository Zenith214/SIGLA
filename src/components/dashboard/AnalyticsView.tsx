"use client";

import { useState } from "react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { CycleDisplay } from "@/components/survey-cycle";
import { Button } from "@/components/ui/button";
import { BarChart3, Layers, FileText, Users } from "lucide-react";
import DashboardSummaryView from "@/components/analytics/DashboardSummaryView";
import ServiceAreaDeepDive from "@/components/analytics/ServiceAreaDeepDive";
import SurveyAnalyticsDashboard from "@/components/analytics/SurveyAnalyticsDashboard";
import DemographicsAnalytics from "@/components/analytics/DemographicsAnalytics";

type ViewType = 'summary' | 'service-area' | 'demographics' | 'detailed'

export default function AnalyticsView() {
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle();
  const [activeView, setActiveView] = useState<ViewType>('summary');

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Cycle Context */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
            <p className="text-sm text-gray-600">
              Comprehensive survey data analysis and insights
            </p>
          </div>
          <div className="text-sm">
            {hasActiveCycle ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Active Cycle:</span>
                <CycleDisplay />
              </div>
            ) : (
              <div className="text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-md">
                ⚠️ No Active Cycle
              </div>
            )}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 border-t pt-4">
          <Button
            variant={activeView === 'summary' ? 'default' : 'outline'}
            onClick={() => setActiveView('summary')}
            className="flex items-center gap-2"
            size="sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard Summary</span>
            <span className="sm:hidden">Summary</span>
          </Button>
          <Button
            variant={activeView === 'service-area' ? 'default' : 'outline'}
            onClick={() => setActiveView('service-area')}
            className="flex items-center gap-2"
            size="sm"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Service Area Deep Dive</span>
            <span className="sm:hidden">Service Areas</span>
          </Button>
          <Button
            variant={activeView === 'demographics' ? 'default' : 'outline'}
            onClick={() => setActiveView('demographics')}
            className="flex items-center gap-2"
            size="sm"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Demographics</span>
            <span className="sm:hidden">Demo</span>
          </Button>
          <Button
            variant={activeView === 'detailed' ? 'default' : 'outline'}
            onClick={() => setActiveView('detailed')}
            className="flex items-center gap-2"
            size="sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Detailed Analytics</span>
            <span className="sm:hidden">Details</span>
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'summary' && <DashboardSummaryView />}
        {activeView === 'service-area' && <ServiceAreaDeepDive />}
        {activeView === 'demographics' && <DemographicsAnalytics />}
        {activeView === 'detailed' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <SurveyAnalyticsDashboard />
          </div>
        )}
      </div>
    </div>
  );
}

