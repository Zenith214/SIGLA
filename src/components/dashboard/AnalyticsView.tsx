"use client";

import { useState, useRef, KeyboardEvent, lazy, Suspense } from "react";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { CycleDisplay } from "@/components/survey-cycle";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import LoadingSkeleton from "./shared/LoadingSkeleton";

// Lazy load tab components for code splitting
const HistoricalCycleViewer = lazy(() => import("./HistoricalCycleViewer"));
const BarangayComparisonViewer = lazy(() => import("./BarangayComparisonViewer"));
const ServiceAreaDeepDive = lazy(() => import("./ServiceAreaDeepDive"));
const OverallAnalytics = lazy(() => import("./OverallAnalytics"));
const AwardLeaderboard = lazy(() => import("./AwardLeaderboard"));
const DemographicsAnalytics = lazy(() => import("@/components/analytics/DemographicsAnalytics").then(mod => ({ default: mod.DemographicsAnalytics })));

type AnalyticsTab = "historical" | "comparison" | "trends" | "overall" | "awards" | "demographics";

const TABS: { id: AnalyticsTab; label: string; icon: string }[] = [
  { id: "historical", label: "Historical Cycles", icon: "📊" },
  { id: "comparison", label: "Barangay Comparison", icon: "🔄" },
  { id: "trends", label: "Service Deep Dive", icon: "🎯" },
  { id: "overall", label: "Overall Analytics", icon: "🌐" },
  { id: "demographics", label: "Demographics", icon: "👥" },
  { id: "awards", label: "Award Leaderboard", icon: "🏆" },
];

function AnalyticsViewContent() {
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("historical");
  const tabPanelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Handle tab change with focus management
  const handleTabChange = (newTab: AnalyticsTab) => {
    setActiveTab(newTab);
    // Move focus to tab panel content after tab change
    setTimeout(() => {
      tabPanelRef.current?.focus();
    }, 0);
  };

  // Handle touch swipe for mobile tab navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50; // Minimum swipe distance in pixels
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
      
      if (swipeDistance > 0 && currentIndex < TABS.length - 1) {
        // Swiped left - go to next tab
        handleTabChange(TABS[currentIndex + 1].id);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        // Swiped right - go to previous tab
        handleTabChange(TABS[currentIndex - 1].id);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Handle keyboard navigation for tabs
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = index > 0 ? index - 1 : TABS.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = index < TABS.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    tabRefs.current[newIndex]?.focus();
    handleTabChange(TABS[newIndex].id);
  };

  const renderTabContent = () => {
    // Wrap each tab component with Suspense for lazy loading
    switch (activeTab) {
      case "historical":
        return (
          <Suspense fallback={<LoadingSkeleton type="table" />}>
            <HistoricalCycleViewer />
          </Suspense>
        );
      case "comparison":
        return (
          <Suspense fallback={<LoadingSkeleton type="chart" />}>
            <BarangayComparisonViewer />
          </Suspense>
        );
      case "trends":
        return (
          <Suspense fallback={<LoadingSkeleton type="chart" />}>
            <ServiceAreaDeepDive />
          </Suspense>
        );
      case "overall":
        return (
          <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
            <OverallAnalytics />
          </Suspense>
        );
      case "demographics":
        return (
          <Suspense fallback={<LoadingSkeleton type="chart" />}>
            <DemographicsAnalytics />
          </Suspense>
        );
      case "awards":
        return (
          <Suspense fallback={<LoadingSkeleton type="table" />}>
            <AwardLeaderboard />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingSkeleton type="table" />}>
            <HistoricalCycleViewer />
          </Suspense>
        );
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

        {/* Tab Navigation - Mobile optimized with horizontal scroll */}
        <div 
          role="tablist" 
          aria-label="Analytics views" 
          className="flex space-x-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, index)}
              className={`flex-shrink-0 px-3 md:px-4 py-2.5 min-h-[44px] rounded-md text-xs md:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-base md:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - Swipeable on mobile */}
      <div
        ref={tabPanelRef}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white rounded-lg shadow-sm border p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-280px)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset touch-pan-y"
      >
        {renderTabContent()}
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  return (
    <AnalyticsProvider>
      <AnalyticsViewContent />
    </AnalyticsProvider>
  );
}

