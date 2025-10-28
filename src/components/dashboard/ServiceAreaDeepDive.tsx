"use client";

import { useState, useRef, KeyboardEvent } from 'react';
import { ServiceAreaType } from '@/types/analytics';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useServiceAreaRankings } from '@/hooks/useServiceAreaRankings';
import { useServiceTrends } from '@/hooks/useServiceTrends';
import ErrorBanner from './shared/ErrorBanner';
import LoadingSkeleton from './shared/LoadingSkeleton';
import EmptyState from './shared/EmptyState';
import HelpText, { InfoCard, metricExplanations } from './shared/HelpText';
import ServiceLeaderboard from './charts/ServiceLeaderboard';
import FunnelVisualization from './charts/FunnelVisualization';
import ServiceTrendChart from './charts/ServiceTrendChart';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const SERVICE_AREAS: { value: ServiceAreaType; label: string; icon: string }[] = [
  { value: 'financial', label: 'Financial Assistance', icon: '💰' },
  { value: 'disaster', label: 'Disaster Preparedness', icon: '🚨' },
  { value: 'health', label: 'Health Services', icon: '🏥' },
  { value: 'peace', label: 'Peace and Order', icon: '👮' },
  { value: 'infrastructure', label: 'Business Friendliness', icon: '💼' },
  { value: 'environmental', label: 'Environmental Management', icon: '🌳' }
];

export default function ServiceAreaDeepDive() {
  const { currentCycleId } = useAnalytics();
  const [selectedServiceArea, setSelectedServiceArea] = useState<ServiceAreaType>('financial');
  const serviceAreaRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Handle keyboard navigation for service area selector
  const handleServiceAreaKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = index > 0 ? index - 1 : SERVICE_AREAS.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = index < SERVICE_AREAS.length - 1 ? index + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = SERVICE_AREAS.length - 1;
        break;
      default:
        return;
    }

    serviceAreaRefs.current[newIndex]?.focus();
    setSelectedServiceArea(SERVICE_AREAS[newIndex].value);
  };

  // Fetch rankings and trends
  const {
    rankings,
    loading: rankingsLoading,
    error: rankingsError,
    refetch: refetchRankings
  } = useServiceAreaRankings({
    serviceArea: selectedServiceArea,
    cycleId: currentCycleId || 0,
    enabled: !!currentCycleId
  });

  const {
    trends,
    loading: trendsLoading,
    error: trendsError,
    refetch: refetchTrends
  } = useServiceTrends({
    serviceArea: selectedServiceArea,
    enabled: true
  });

  // Calculate funnel data from rankings (average across all barangays)
  const funnelData = rankings.length > 0 ? {
    awareness: 85, // Placeholder - would come from API
    availment: 70,
    satisfaction: Math.round(
      rankings.reduce((sum, r) => sum + r.satisfaction, 0) / rankings.length
    ),
    awareness_to_availment_rate: 82,
    availment_to_satisfaction_rate: 86
  } : null;

  // Prepare scatter plot data
  const scatterData = rankings.map(r => ({
    name: r.name,
    satisfaction: r.satisfaction,
    need_action: r.need_action,
    barangay_id: r.barangay_id
  }));

  // Determine quadrant color
  const getQuadrantColor = (satisfaction: number, needAction: number): string => {
    if (satisfaction >= 70 && needAction < 50) return '#10b981'; // Green - Maintain
    if (satisfaction < 70 && needAction >= 50) return '#ef4444'; // Red - Fix Now
    if (satisfaction < 70 && needAction < 50) return '#f59e0b'; // Yellow - Monitor
    return '#6b7280'; // Gray - Low Priority
  };

  const loading = rankingsLoading || trendsLoading;
  const error = rankingsError || trendsError;

  if (!currentCycleId) {
    return (
      <EmptyState
        icon="chart"
        title="No Active Cycle"
        message="Please select or create an active survey cycle to view service area analysis."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Help Information */}
      <InfoCard title="What does this mean?" icon="💡">
        <p>
          <strong>Service Area Deep Dive</strong> provides detailed analysis for each of the 6 service areas.
        </p>
        <p className="mt-2">
          For each service area, you'll see:
        </p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Leaderboard:</strong> Rankings of all barangays with satisfaction and need-action scores</li>
          <li><strong>Service Funnel:</strong> Progression from Awareness → Availment → Satisfaction</li>
          <li><strong>Action Grid Analysis:</strong> Scatter plot showing which barangays need attention</li>
          <li><strong>Historical Trends:</strong> Satisfaction changes over time</li>
        </ul>
      </InfoCard>

      {/* Header and Service Area Selector */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Service Area Deep Dive</h3>
            <HelpText
              title="Service Area Selection"
              content="Select a service area to analyze. Use keyboard arrow keys to navigate between service areas."
            />
          </div>
          <p className="text-sm text-gray-600">
            Analyze performance, rankings, and trends for specific service areas
          </p>
        </div>

        {/* Service Area Selector */}
        <div 
          role="radiogroup" 
          aria-label="Select service area"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2"
        >
          {SERVICE_AREAS.map((area, index) => (
            <button
              key={area.value}
              ref={(el) => { serviceAreaRefs.current[index] = el; }}
              role="radio"
              aria-checked={selectedServiceArea === area.value}
              tabIndex={selectedServiceArea === area.value ? 0 : -1}
              onClick={() => setSelectedServiceArea(area.value)}
              onKeyDown={(e) => handleServiceAreaKeyDown(e, index)}
              className={`p-3 min-h-[80px] rounded-lg border-2 transition-all text-center focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 ${
                selectedServiceArea === area.value
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="text-xl md:text-2xl mb-1" aria-hidden="true">{area.icon}</div>
              <div className={`text-xs md:text-sm font-medium ${
                selectedServiceArea === area.value ? 'text-blue-700' : 'text-gray-700'
              }`}>
                {area.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => {
            refetchRankings();
            refetchTrends();
          }}
        />
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Service Leaderboard */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="text-lg font-semibold">Barangay Rankings</h4>
              <HelpText
                title="Leaderboard"
                content="Rankings of all barangays for this service area. Click column headers to sort. Top 3 performers are marked with medals."
              />
            </div>
            <ServiceLeaderboard
              rankings={rankings}
              serviceArea={selectedServiceArea}
            />
          </div>

          {/* Funnel and Scatter Plot Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Visualization */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-lg font-semibold">Service Funnel</h4>
                <HelpText
                  title={metricExplanations.funnel.title}
                  content={metricExplanations.funnel.content}
                />
              </div>
              {funnelData ? (
                <FunnelVisualization
                  data={funnelData}
                  serviceArea={selectedServiceArea}
                />
              ) : (
                <EmptyState
                  icon="chart"
                  title="No Data"
                  message="Funnel data not available for this service area."
                />
              )}
            </div>

            {/* Scatter Plot - Satisfaction vs Need-Action */}
            <div className="bg-white rounded-lg border p-6">
              <h4 className="text-lg font-semibold mb-4">Action Grid Analysis</h4>
              <p className="text-sm text-gray-600 mb-4">
                Satisfaction vs Need-Action scores by barangay
              </p>
              {scatterData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="satisfaction"
                      name="Satisfaction"
                      domain={[0, 100]}
                      label={{ value: 'Satisfaction Score', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="need_action"
                      name="Need Action"
                      domain={[0, 100]}
                      label={{ value: 'Need Action Score', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-gray-600">
                                Satisfaction: {data.satisfaction}%
                              </p>
                              <p className="text-sm text-gray-600">
                                Need Action: {data.need_action}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Quadrant divider lines */}
                    <ReferenceLine x={70} stroke="#94a3b8" strokeDasharray="3 3" />
                    <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Scatter data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getQuadrantColor(entry.satisfaction, entry.need_action)}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon="chart"
                  title="No Data"
                  message="No barangay data available for scatter plot."
                />
              )}
              
              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Maintain (High Sat, Low Need)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Fix Now (Low Sat, High Need)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Monitor (Low Sat, Low Need)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span>Low Priority (High Sat, High Need)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Trend Chart */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-semibold mb-4">Historical Satisfaction Trends</h4>
            <ServiceTrendChart
              data={trends}
              serviceArea={selectedServiceArea}
            />
          </div>
        </>
      )}
    </div>
  );
}
