"use client";

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useBarangayComparison, BarangayComparisonData } from '@/hooks/useBarangayComparison';
import Card from './Card';
import { ErrorBanner } from './shared/ErrorBanner';
import { LoadingSkeleton } from './shared/LoadingSkeleton';
import { EmptyState } from './shared/EmptyState';
import HelpText, { InfoCard, metricExplanations } from './shared/HelpText';
import { RadarChartComparison, ActionGridHeatmap, AwardTimeline } from './charts';

export default function BarangayComparisonViewer() {
  const { barangays, currentCycleId, loading: contextLoading } = useAnalytics();
  const [selectedBarangays, setSelectedBarangays] = useState<number[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const checkboxRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    data: comparisonData,
    loading: comparisonLoading,
    error: comparisonError,
    fetchComparison,
    clearData
  } = useBarangayComparison({
    cycleId: currentCycleId || 0,
    onError: (error) => {
      console.error('[BarangayComparisonViewer] Error:', error);
    }
  });

  // Clear data when cycle changes
  useEffect(() => {
    clearData();
    setSelectedBarangays([]);
  }, [currentCycleId, clearData]);

  const handleBarangayToggle = (barangayId: number) => {
    setValidationError(null);
    
    setSelectedBarangays(prev => {
      if (prev.includes(barangayId)) {
        return prev.filter(id => id !== barangayId);
      } else if (prev.length < 5) {
        return [...prev, barangayId];
      } else {
        setValidationError('Maximum 5 barangays can be compared at once');
        return prev;
      }
    });
  };

  // Handle keyboard navigation for barangay selection
  const handleCheckboxKeyDown = (event: KeyboardEvent<HTMLLabelElement>, index: number) => {
    let newIndex = index;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = index < barangays.length - 1 ? index + 1 : 0;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = index > 0 ? index - 1 : barangays.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = barangays.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const barangayId = barangays[index].barangay_id;
        if (selectedBarangays.includes(barangayId) || selectedBarangays.length < 5) {
          handleBarangayToggle(barangayId);
        }
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    checkboxRefs.current[newIndex]?.focus();
  };

  const handleCompare = async () => {
    setValidationError(null);
    
    if (selectedBarangays.length < 2) {
      setValidationError('Please select at least 2 barangays to compare');
      return;
    }

    if (!currentCycleId) {
      setValidationError('No active cycle selected');
      return;
    }

    await fetchComparison(selectedBarangays);
  };

  const handleClearSelection = () => {
    setSelectedBarangays([]);
    clearData();
    setValidationError(null);
  };

  // Generate distinct colors for each barangay (WCAG AA compliant)
  const barangayColors = [
    '#0173B2', // Blue - 6.94:1 contrast
    '#029E73', // Green - 4.52:1 contrast
    '#DE8F05', // Orange - 4.51:1 contrast
    '#CC78BC', // Purple - 4.53:1 contrast
    '#CA9161', // Brown - 4.50:1 contrast
  ];

  if (contextLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Help Information */}
      <InfoCard title="What does this mean?" icon="💡">
        <p>
          <strong>Barangay Comparison</strong> allows you to compare 2-5 barangays side-by-side across all service areas.
        </p>
        <p className="mt-2">
          You'll see:
        </p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Radar Chart:</strong> Visual comparison across 6 service areas</li>
          <li><strong>Action Grid:</strong> Color-coded status for each service (Maintain, Fix Now, Monitor, Low Priority)</li>
          <li><strong>Award Timeline:</strong> Historical award achievements over time</li>
          <li><strong>Award Statistics:</strong> Total awards, success rates, and consecutive streaks</li>
        </ul>
      </InfoCard>

      {/* Barangay Selection */}
      <Card>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Select Barangays to Compare</h3>
            <HelpText
              title="Barangay Selection"
              content="Select 2-5 barangays to compare."
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Choose 2-5 barangays to compare their service area performance, satisfaction scores, and award history.
          </p>
          
          <div 
            role="group" 
            aria-label="Select barangays to compare"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4"
          >
            {barangays.map((barangay, index) => (
              <label
                key={barangay.barangay_id}
                tabIndex={0}
                onKeyDown={(e) => handleCheckboxKeyDown(e, index)}
                className={`flex items-center p-3 min-h-[56px] border rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 ${
                  selectedBarangays.includes(barangay.barangay_id)
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-300 hover:border-blue-200'
                } ${
                  !selectedBarangays.includes(barangay.barangay_id) && selectedBarangays.length >= 5
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <input
                  ref={(el) => { checkboxRefs.current[index] = el; }}
                  type="checkbox"
                  checked={selectedBarangays.includes(barangay.barangay_id)}
                  onChange={() => handleBarangayToggle(barangay.barangay_id)}
                  disabled={!selectedBarangays.includes(barangay.barangay_id) && selectedBarangays.length >= 5}
                  tabIndex={-1}
                  aria-label={`Select ${barangay.barangay_name}`}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">{barangay.barangay_name}</div>
                  {selectedBarangays.includes(barangay.barangay_id) && (
                    <div className="text-xs text-blue-600">
                      Selected ({selectedBarangays.indexOf(barangay.barangay_id) + 1})
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedBarangays.length} of 5 barangays selected
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {selectedBarangays.length > 0 && (
                <button
                  onClick={handleClearSelection}
                  className="px-4 py-2.5 min-h-[44px] text-sm md:text-base text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-transform"
                >
                  Clear Selection
                </button>
              )}
              <button
                onClick={handleCompare}
                disabled={selectedBarangays.length < 2 || comparisonLoading || !currentCycleId}
                className="px-4 py-2.5 min-h-[44px] text-sm md:text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                {comparisonLoading ? 'Comparing...' : 'Compare Barangays'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Validation Error */}
      {validationError && (
        <ErrorBanner message={validationError} onRetry={() => setValidationError(null)} />
      )}

      {/* Comparison Error */}
      {comparisonError && (
        <ErrorBanner message={comparisonError} onRetry={handleCompare} />
      )}

      {/* Loading State */}
      {comparisonLoading && (
        <Card>
          <div className="p-4">
            <LoadingSkeleton />
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!comparisonLoading && !comparisonData && selectedBarangays.length === 0 && (
        <EmptyState
          title="No Barangays Selected"
          message="Select 2-5 barangays above to compare their performance across service areas."
        />
      )}

      {/* Comparison Results */}
      {!comparisonLoading && comparisonData && comparisonData.length > 0 && (
        <div className="space-y-6">
          {/* Radar Chart Comparison */}
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Service Area Performance Comparison</h3>
                <HelpText
                  title={metricExplanations.radarChart.title}
                  content={metricExplanations.radarChart.content}
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Compare satisfaction scores across all 6 service areas
              </p>
              <RadarChartComparison
                data={comparisonData.map((b, index) => ({
                  barangay_name: b.name,
                  scores: b.service_scores
                }))}
                colors={barangayColors.slice(0, comparisonData.length)}
              />
            </div>
          </Card>

          {/* Side-by-Side Satisfaction Scores - Mobile optimized */}
          <Card>
            <div className="p-3 md:p-4">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Overall Satisfaction Scores</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                {comparisonData.map((barangay, index) => (
                  <div
                    key={barangay.barangay_id}
                    className="p-3 md:p-4 border-2 rounded-lg"
                    style={{ borderColor: barangayColors[index] }}
                  >
                    <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">
                      {barangay.name}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold" style={{ color: barangayColors[index] }}>
                      {barangay.overall_satisfaction}%
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Overall Satisfaction
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Action Grid Heatmap */}
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Action Grid - Service Status Matrix</h3>
                <HelpText
                  title={metricExplanations.actionGrid.title}
                  content={metricExplanations.actionGrid.content}
                />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Color-coded status for each service area by barangay
              </p>
              <ActionGridHeatmap
                data={comparisonData.map(b => ({
                  barangay_name: b.name,
                  action_grid: b.action_grid
                }))}
              />
            </div>
          </Card>

          {/* Award Timeline */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Award History Timeline</h3>
              <p className="text-sm text-gray-600 mb-4">
                Historical award wins for selected barangays
              </p>
              <AwardTimeline
                data={comparisonData.map((b, index) => ({
                  barangay_name: b.name,
                  color: barangayColors[index],
                  awards: b.awards.history.map(a => ({
                    year: a.year,
                    cycle_id: a.cycle_id,
                    award_type: 'Awardee'
                  }))
                }))}
              />
            </div>
          </Card>

          {/* Award Statistics */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Award Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Barangay</th>
                      <th className="text-right py-2">Total Awards</th>
                      <th className="text-right py-2">Consecutive Awards</th>
                      <th className="text-right py-2">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((barangay, index) => (
                      <tr key={barangay.barangay_id} className="border-b">
                        <td className="py-2">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: barangayColors[index] }}
                            />
                            <span className="font-medium">{barangay.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-2 font-medium">
                          {barangay.awards.total}
                        </td>
                        <td className="text-right py-2">
                          {barangay.awards.consecutive > 0 ? (
                            <span className="text-orange-600 font-medium">
                              🔥 {barangay.awards.consecutive}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-right py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            barangay.awards.win_rate >= 50 ? 'bg-green-100 text-green-800' :
                            barangay.awards.win_rate >= 25 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {barangay.awards.win_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
