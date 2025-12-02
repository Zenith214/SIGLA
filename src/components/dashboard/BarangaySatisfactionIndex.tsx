"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type ApiBarangayData } from "@/utils/barangayUtils";
import { useActiveCycle, useSurveyCycle } from "@/hooks/useSurveyCycle";

interface BarangaySatisfactionIndexProps {
  barangay: ApiBarangayData;
  isOpen: boolean;
  onClose: () => void;
  selectedCycleId?: number | null;
}

export default function BarangaySatisfactionIndex({
  barangay,
  isOpen,
  onClose,
  selectedCycleId,
}: BarangaySatisfactionIndexProps) {
  const router = useRouter();
  const { activeCycle } = useActiveCycle();
  const { allCycles } = useSurveyCycle();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Determine which cycle we're viewing
  const effectiveCycleId = selectedCycleId || activeCycle?.cycle_id;
  const viewingCycle = allCycles.find(c => c.cycle_id === effectiveCycleId) || activeCycle;
  const isHistorical = viewingCycle && activeCycle && viewingCycle.cycle_id !== activeCycle.cycle_id;

  // Format percentage to 2 decimal places for display
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return '0.00';
    return Number(value).toFixed(2);
  };
  const [satisfactionData, setSatisfactionData] = useState<{
    overall: number;
    categories: { [key: string]: any };
    dataQuality?: {
      categoriesWithData: number;
      totalCategories: number;
      confidence: string;
    };
  }>({
    overall: 65,
    categories: {
      financial: { satisfaction: 72, needForAction: 45, category: 'maintain' },
      disaster: { satisfaction: 58, needForAction: 78, category: 'opportunities' },
      safety: { satisfaction: 45, needForAction: 35, category: 'monitor' },
      social: { satisfaction: 38, needForAction: 85, category: 'fix_now' },
      business: { satisfaction: 52, needForAction: 62, category: 'opportunities' },
      environmental: { satisfaction: 48, needForAction: 55, category: 'monitor' }
    }
  });

  // Reset satisfaction data when barangay changes - start with empty categories
  useEffect(() => {
    if (barangay) {
      setSatisfactionData({
        overall: 0,
        categories: {
          // Start with empty categories - will be populated by API
        }
      });
    }
  }, [barangay?.id]);

  // Fetch funnel analysis data for this barangay
  useEffect(() => {
    if (isOpen && barangay) {
      console.log('📊 Loading funnel analysis data for:', barangay.name, 'Cycle:', effectiveCycleId);
      // Only fetch data if barangay has an ID (not a "No data" placeholder)
      if (barangay.id > 0) {
        fetchFunnelAnalysis();
      } else {
        // Set "No data" state immediately
        setNoDataState();
      }
    }
  }, [isOpen, barangay?.id, effectiveCycleId]); // Added effectiveCycleId to dependencies

  const fetchFunnelAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the effective cycle ID (selected cycle or active cycle)
      const cycleId = effectiveCycleId;

      if (!cycleId) {
        console.error('No cycle ID available');
        setError('No survey cycle available');
        setFallbackData();
        return;
      }

      console.log('📊 Using cycle ID:', cycleId, 'for barangay:', barangay.id);

      // Fetch ML-enhanced funnel analysis with cycle ID
      const url = `/api/ml/funnel-analysis?barangayId=${barangay.id}&cycleId=${cycleId}`;
      
      console.log('📊 Fetching funnel analysis from:', url);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Received funnel data:', data);
        console.log('📊 Service scores from API:', data.service_scores);

        // Transform funnel analysis data to match component expectations
        const transformedData = transformFunnelData(data);
        console.log('📊 Transformed data for Action Grid:', transformedData);
        console.log('📊 Categories:', Object.keys(transformedData.categories).length, 'services');
        Object.entries(transformedData.categories).forEach(([key, cat]: [string, any]) => {
          console.log(`  - ${key}: ${cat.satisfaction}% satisfaction, ${cat.needForAction}% need action → ${cat.category}`);
        });
        setSatisfactionData(transformedData);
        setAnalyticsData({
          totalResponses: data.total_responses,
          completionRate: data.total_responses > 0 ? 100 : 0,
          averageRating: 3.5,
          lastUpdated: new Date().toISOString()
        });
      } else {
        console.warn('Funnel analysis API returned non-OK status:', response.status);
        setError(`API returned status ${response.status}`);
        setFallbackData();
      }
    } catch (fetchError) {
      console.error('Failed to fetch funnel analysis:', fetchError);
      setError('Unable to load survey data. Showing sample data.');
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const transformFunnelData = (funnelData: any) => {
    // Transform funnel analysis data to match component expectations
    const categories: { [key: string]: any } = {};

    // Map service sections to display names
    const sectionNames: { [key: string]: string } = {
      financial: 'Financial Administration',
      disaster: 'Disaster Preparedness',
      safety: 'Safety & Peace Order',
      social: 'Social Protection',
      business: 'Business Friendliness',
      environmental: 'Environmental Management'
    };

    // Transform each service score and recalculate category based on Score Card thresholds
    Object.entries(funnelData.service_scores || {}).forEach(([serviceKey, scores]: [string, any]) => {
      const displayName = sectionNames[serviceKey] || serviceKey;
      console.log(`🔍 Processing ${serviceKey}:`, scores);
      // API returns 'satisfaction' and 'need_action', not 'satisfaction_score' and 'need_action_score'
      const satisfaction = scores.satisfaction || 0;
      const needForAction = scores.need_action || 0;
      console.log(`  → satisfaction: ${satisfaction}, needForAction: ${needForAction}`);

      // Use Score Card thresholds: 70% satisfaction, 30% need-for-action
      let category = 'monitor';
      if (satisfaction >= 70 && needForAction <= 30) {
        category = 'maintain';
      } else if (satisfaction >= 70 && needForAction > 30) {
        category = 'opportunities';
      } else if (satisfaction < 70 && needForAction <= 30) {
        category = 'monitor';
      } else if (satisfaction < 70 && needForAction > 30) {
        category = 'fix_now';
      }

      categories[serviceKey] = {
        satisfaction: satisfaction,
        needForAction: needForAction,
        category: category
      };
    });

    return {
      overall: funnelData.overall_satisfaction || 0,
      categories: categories
    };
  };

  const setFallbackData = () => {
    // Provide fallback satisfaction data when API is unavailable - empty categories
    const fallbackSatisfaction = {
      overall: 0,
      categories: {
        // Empty categories - will show "No services in this category"
      }
    };

    setSatisfactionData(fallbackSatisfaction);

    // Set fallback analytics data
    setAnalyticsData({
      totalResponses: 0,
      completionRate: 0,
      averageRating: 3.5,
      lastUpdated: new Date().toISOString()
    });
  };

  const setNoDataState = () => {
    // Set explicit "No data" state for barangays with no information
    setLoading(false);
    setError(null);
    
    const noDataSatisfaction = {
      overall: 0,
      categories: {
        // Empty categories - will show "No services in this category"
      }
    };

    setSatisfactionData(noDataSatisfaction);

    // Set no data analytics
    setAnalyticsData({
      totalResponses: 0,
      completionRate: 0,
      averageRating: 0,
      lastUpdated: new Date().toISOString()
    });
  };

  const calculateSatisfactionScores = (questions: any) => {
    const categories: { [key: string]: any[] } = {
      governance: [],
      infrastructure: [],
      social_services: [],
      economic: []
    };

    // Group questions by category
    Object.entries(questions).forEach(([key, question]: [string, any]) => {
      if (key.includes('governance')) categories.governance.push(question);
      else if (key.includes('infrastructure')) categories.infrastructure.push(question);
      else if (key.includes('social_services')) categories.social_services.push(question);
      else if (key.includes('economic')) categories.economic.push(question);
    });

    // Calculate average satisfaction for each category using proper NULL handling
    const categoryScores: { [key: string]: any } = {};
    Object.entries(categories).forEach(([category, questionList]) => {
      if (questionList.length > 0) {
        // Only include questions with actual responses (not NULL/undefined)
        const validQuestions = questionList.filter((q: any) =>
          q.statistics?.mean !== null &&
          q.statistics?.mean !== undefined &&
          q.statistics?.count > 0
        );

        if (validQuestions.length > 0) {
          // Calculate satisfaction only from users who actually used services
          const avgSatisfaction = validQuestions.reduce((sum: number, q: any) => {
            return sum + q.statistics.mean;
          }, 0) / validQuestions.length;

          const satisfaction = Math.round((avgSatisfaction / 5) * 100); // Convert 1-5 scale to percentage

          // Calculate need for action from the same valid responses
          const needForAction = validQuestions.reduce((sum: number, q: any) => {
            // Assume higher satisfaction means lower need for action
            return sum + (100 - ((q.statistics.mean / 5) * 100));
          }, 0) / validQuestions.length;

          let categoryType = 'monitor';
          if (satisfaction >= 58 && needForAction < 50) categoryType = 'maintain';
          else if (satisfaction >= 58 && needForAction >= 50) categoryType = 'opportunities';
          else if (satisfaction < 58 && needForAction >= 50) categoryType = 'fix_now';

          categoryScores[category] = {
            satisfaction,
            needForAction: Math.round(needForAction),
            category: categoryType,
            sampleSize: validQuestions.reduce((sum: number, q: any) => sum + q.statistics.count, 0),
            confidence: validQuestions.length >= 3 ? 'high' : validQuestions.length >= 2 ? 'medium' : 'low'
          };
        } else {
          // No valid responses for this category
          categoryScores[category] = {
            satisfaction: null,
            needForAction: null,
            category: 'insufficient_data',
            sampleSize: 0,
            confidence: 'none'
          };
        }
      }
    });

    // Calculate overall satisfaction only from categories with data
    const validCategories = Object.values(categoryScores).filter((cat: any) => cat.satisfaction !== null);
    const overallSatisfaction = validCategories.length > 0
      ? Math.round(validCategories.reduce((sum: number, cat: any) => sum + cat.satisfaction, 0) / validCategories.length)
      : 0; // Default to 0 instead of null

    return {
      overall: overallSatisfaction,
      categories: categoryScores,
      dataQuality: {
        categoriesWithData: validCategories.length,
        totalCategories: Object.keys(categoryScores).length,
        confidence: validCategories.length >= 3 ? 'high' : validCategories.length >= 2 ? 'medium' : 'low'
      }
    };
  };

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

  const isHighSatisfaction = satisfactionData.overall >= 58;

  const handleViewReportCard = () => {
    // Navigate to score card page with comprehensive barangay data
    const params = new URLSearchParams({
      barangay: barangay.name,
      barangayId: barangay.id.toString(),
      cycleId: effectiveCycleId?.toString() || '', // Add cycle ID
      population: barangay.population.toString(),
      households: barangay.households.toString(),
      area: (barangay.area || 0).toString(),
      surveyStatus: barangay.status,
      satisfaction: satisfactionData.overall.toString(),
      // Add category satisfaction scores
      financial: satisfactionData.categories.financial?.satisfaction?.toString() || '0',
      disaster: satisfactionData.categories.disaster?.satisfaction?.toString() || '0',
      safety: satisfactionData.categories.safety?.satisfaction?.toString() || '0',
      social: satisfactionData.categories.social?.satisfaction?.toString() || '0',
      business: satisfactionData.categories.business?.satisfaction?.toString() || '0',
      environmental: satisfactionData.categories.environmental?.satisfaction?.toString() || '0',
      // Add category need for action scores
      financial_need: satisfactionData.categories.financial?.needForAction?.toString() || '0',
      disaster_need: satisfactionData.categories.disaster?.needForAction?.toString() || '0',
      safety_need: satisfactionData.categories.safety?.needForAction?.toString() || '0',
      social_need: satisfactionData.categories.social?.needForAction?.toString() || '0',
      business_need: satisfactionData.categories.business?.needForAction?.toString() || '0',
      environmental_need: satisfactionData.categories.environmental?.needForAction?.toString() || '0',
      // Add survey response count
      responses: analyticsData?.totalResponses?.toString() || '0',
      // Add logo URL
      logo_url: barangay.logo_url || ''
    });

    router.push(`/reportcard?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop - 30% opacity */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-auto border border-gray-200">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
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
          {/* Currently Viewing Indicator */}
          {viewingCycle && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-blue-900">
                Currently viewing: <span className="font-semibold">{viewingCycle.name} ({viewingCycle.year})</span>
              </span>
              {isHistorical && (
                <Badge variant="outline" className="text-xs bg-white">
                  Historical Data
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="p-6">
          <div className="grid grid-cols-5 gap-6">
            {/* Left Column - 2/5 width */}
            <div className="col-span-2 space-y-4">
              {/* Barangay Logo */}
              <div className="border-2 border-gray-200 rounded-xl p-6 h-40 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm">
                {(() => {
                  console.log('[BarangaySatisfactionIndex] Barangay logo_url:', barangay.logo_url);
                  console.log('[BarangaySatisfactionIndex] Full barangay data:', barangay);
                  return null;
                })()}
                {barangay.logo_url ? (
                  <img 
                    src={barangay.logo_url} 
                    alt={`${barangay.name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<span class="text-xl font-bold text-gray-700 tracking-wide">BLGU LOGO</span>';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-700 tracking-wide">BLGU LOGO</span>
                )}
              </div>

              {/* View Score Card Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={handleViewReportCard}
              >
                View Score Card
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

                  {/* Survey Progress */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Survey Progress</h4>
                    <p>Displays the percentage of completed surveys for this barangay.</p>
                  </div>

                  {/* Score Card */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Score Card</h4>
                    <p>Click "View Score Card" to see detailed service area breakdowns, satisfaction scores, and actionable recommendations for improvement.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 3/5 width */}
            <div className="col-span-3 flex flex-col space-y-4 h-full">
              {/* Survey Progress Bar */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">Survey Progress</span>
                  <span className="font-bold text-gray-900">
                    {barangay.id === 0 ? 'No data' : `${barangay.progress}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      barangay.id === 0 ? 'bg-gray-300' :
                      barangay.progress === 100 ? 'bg-green-500' :
                      barangay.progress >= 75 ? 'bg-blue-600' :
                      barangay.progress >= 50 ? 'bg-blue-500' :
                      barangay.progress >= 25 ? 'bg-blue-400' :
                      barangay.progress > 0 ? 'bg-orange-500' : 'bg-gray-400'
                    }`}
                    style={{ width: barangay.id === 0 ? '100%' : `${barangay.progress}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {barangay.id === 0 ? 'No survey data available' :
                   barangay.progress === 100 ? 'Survey Complete' :
                   barangay.progress > 0 ? `${barangay.progress}% of target completed` :
                   'No surveys completed yet'}
                </div>
              </div>

              {/* Two Card Layout - Satisfaction and Need for Action */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* Overall Satisfaction Card */}
                <div className="border-2 border-gray-300 rounded-3xl p-6 bg-white shadow-sm flex flex-col items-center justify-center h-full">
                  {barangay.id === 0 ? (
                    <div className="text-center">
                      <div className="text-4xl mb-3">😐</div>
                      <div className="text-sm font-semibold text-gray-600 mb-2">Overall Satisfaction</div>
                      <div className="text-2xl font-bold text-gray-500">No data</div>
                    </div>
                  ) : barangay.progress < 100 ? (
                    <div className="text-center">
                      <div className="text-6xl mb-3">📊</div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Overall Satisfaction</div>
                      <div className="text-lg font-semibold text-blue-600 mb-2">Survey Ongoing</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {barangay.progress}% completed
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      {/* Icon based on satisfaction level */}
                      <div className="text-6xl mb-3">
                        {satisfactionData.overall >= 70 ? '😊' : 
                         satisfactionData.overall >= 58 ? '🙂' : 
                         satisfactionData.overall >= 40 ? '😐' : '😞'}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Overall Satisfaction</div>
                      <div className={`text-4xl font-bold ${isHighSatisfaction ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(satisfactionData.overall)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {satisfactionData.overall >= 70 ? 'Excellent' :
                         satisfactionData.overall >= 58 ? 'Good' :
                         satisfactionData.overall >= 40 ? 'Fair' : 'Needs Improvement'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Overall Need for Action Card */}
                <div className="border-2 border-gray-300 rounded-3xl p-6 bg-white shadow-sm flex flex-col items-center justify-center h-full">
                  {barangay.id === 0 ? (
                    <div className="text-center">
                      <div className="text-4xl mb-3">⚠️</div>
                      <div className="text-sm font-semibold text-gray-600 mb-2">Need for Action</div>
                      <div className="text-2xl font-bold text-gray-500">No data</div>
                    </div>
                  ) : loading ? (
                    <div className="text-center">
                      <div className="text-4xl mb-3">⏳</div>
                      <div className="text-sm font-semibold text-gray-600 mb-2">Need for Action</div>
                      <div className="text-lg text-gray-500">Loading...</div>
                    </div>
                  ) : barangay.progress < 100 ? (
                    <div className="text-center">
                      <div className="text-6xl mb-3">📋</div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Need for Action</div>
                      <div className="text-lg font-semibold text-blue-600 mb-2">Survey Ongoing</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Analysis available at 100%
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      {/* Icon based on need for action level - inverse of satisfaction */}
                      <div className="text-6xl mb-3">
                        {(() => {
                          // Calculate need for action from categories
                          const categories = Object.values(satisfactionData.categories);
                          const validCategories = categories.filter((cat: any) => cat.needForAction !== null && cat.needForAction !== undefined);
                          const avgNeedForAction = validCategories.length > 0
                            ? validCategories.reduce((sum: number, cat: any) => sum + cat.needForAction, 0) / validCategories.length
                            : 0;
                          
                          if (avgNeedForAction >= 70) return '🚨'; // Urgent
                          if (avgNeedForAction >= 50) return '⚠️'; // Moderate
                          if (avgNeedForAction >= 30) return '📋'; // Low
                          return '✅'; // Very Low
                        })()}
                      </div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Need for Action</div>
                      <div className={`text-4xl font-bold ${
                        (() => {
                          const categories = Object.values(satisfactionData.categories);
                          const validCategories = categories.filter((cat: any) => cat.needForAction !== null && cat.needForAction !== undefined);
                          const avgNeedForAction = validCategories.length > 0
                            ? validCategories.reduce((sum: number, cat: any) => sum + cat.needForAction, 0) / validCategories.length
                            : 0;
                          
                          if (avgNeedForAction >= 70) return 'text-red-600';
                          if (avgNeedForAction >= 50) return 'text-yellow-600';
                          if (avgNeedForAction >= 30) return 'text-blue-600';
                          return 'text-green-600';
                        })()
                      }`}>
                        {(() => {
                          const categories = Object.values(satisfactionData.categories);
                          const validCategories = categories.filter((cat: any) => cat.needForAction !== null && cat.needForAction !== undefined);
                          const avgNeedForAction = validCategories.length > 0
                            ? validCategories.reduce((sum: number, cat: any) => sum + cat.needForAction, 0) / validCategories.length
                            : 0;
                          return formatPercentage(avgNeedForAction);
                        })()}%
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {(() => {
                          const categories = Object.values(satisfactionData.categories);
                          const validCategories = categories.filter((cat: any) => cat.needForAction !== null && cat.needForAction !== undefined);
                          const avgNeedForAction = validCategories.length > 0
                            ? validCategories.reduce((sum: number, cat: any) => sum + cat.needForAction, 0) / validCategories.length
                            : 0;
                          
                          if (avgNeedForAction >= 70) return 'Urgent';
                          if (avgNeedForAction >= 50) return 'Moderate';
                          if (avgNeedForAction >= 30) return 'Low Priority';
                          return 'Minimal';
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}