"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type ApiBarangayData } from "@/utils/barangayUtils";

interface BarangaySatisfactionIndexProps {
  barangay: ApiBarangayData;
  isOpen: boolean;
  onClose: () => void;
}

export default function BarangaySatisfactionIndex({
  barangay,
  isOpen,
  onClose,
}: BarangaySatisfactionIndexProps) {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      console.log('📊 Loading funnel analysis data for:', barangay.name);
      // Only fetch data if barangay has an ID (not a "No data" placeholder)
      if (barangay.id > 0) {
        fetchFunnelAnalysis();
      } else {
        // Set "No data" state immediately
        setNoDataState();
      }
    }
  }, [isOpen, barangay?.id]);

  const fetchFunnelAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/funnel-analysis?barangayId=${barangay.id}`);
      if (response.ok) {
        const data = await response.json();

        // Transform funnel analysis data to match component expectations
        const transformedData = transformFunnelData(data);
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

    // Transform each service score
    Object.entries(funnelData.service_scores || {}).forEach(([serviceKey, scores]: [string, any]) => {
      const displayName = sectionNames[serviceKey] || serviceKey;
      const quadrant = funnelData.action_grid?.[serviceKey]?.quadrant || 'insufficient_data';

      categories[serviceKey] = {
        satisfaction: scores.satisfaction_score || 0,
        needForAction: scores.need_action_score || 0,
        category: quadrant.toLowerCase()
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
    // Navigate to report card page with comprehensive barangay data
    const params = new URLSearchParams({
      barangay: barangay.name,
      barangayId: barangay.id.toString(),
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
              {/* Barangay Logo */}
              <div className="border-2 border-gray-200 rounded-xl p-6 h-40 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm">
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
                  {barangay.id === 0 ? (
                    <span className="text-xl font-bold text-gray-500">No data</span>
                  ) : (
                    <span className={`text-xl font-bold ${isHighSatisfaction ? 'text-green-600' : 'text-red-600'}`}>
                      {satisfactionData.overall}%
                    </span>
                  )}
                  {loading && <span className="text-sm text-gray-500">(Loading...)</span>}
                </div>
              </div>

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

              {/* Action Grid */}
              <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-blue-50 shadow-sm mb-4">
                <div className="flex flex-col">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Action Grid</h2>
                  </div>

                  {/* Show "No data" message for barangays with no data */}
                  {barangay.id === 0 ? (
                    <div className="flex items-center justify-center min-h-80 bg-gray-100 rounded-xl border-2 border-gray-300">
                      <div className="text-center">
                        <div className="text-2xl text-gray-400 mb-2">📊</div>
                        <div className="text-lg font-semibold text-gray-600 mb-1">No Data Available</div>
                        <div className="text-sm text-gray-500">Survey data not available for this barangay</div>
                      </div>
                    </div>
                  ) : (
                    /* 2x2 Grid */
                    <div className="grid grid-cols-2 gap-4 min-h-80">
                    {/* Top Left - Maintain */}
                    <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 flex flex-col min-h-32">
                      <div className="text-center mb-3">
                        <h3 className="text-green-800 font-bold text-base mb-1">MAINTAIN</h3>
                        <span className="text-green-600 font-medium text-xs">High Satisfaction, Low Need for Action</span>
                      </div>
                      <div className="space-y-2 text-xs text-green-800">
                        {Object.entries(satisfactionData.categories).map(([key, data]: [string, any]) =>
                          data.category === 'maintain' && (
                            <Tooltip key={key}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between cursor-help">
                                  <div className="flex items-center">
                                    <span className="mr-2">★</span>
                                    <span>
                                      {key === 'financial' ? 'Financial Administration' :
                                       key === 'disaster' ? 'Disaster Preparedness' :
                                       key === 'safety' ? 'Safety & Peace Order' :
                                       key === 'social' ? 'Social Protection' :
                                       key === 'business' ? 'Business Friendliness' :
                                       key === 'environmental' ? 'Environmental Management' :
                                       key.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-semibold">Satisfaction: {data.satisfaction}%</div>
                                  <div className="text-xs">Need for Action: {data.needForAction}%</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        )}
                        {Object.values(satisfactionData.categories).every((cat: any) => cat.category !== 'maintain') && (
                          <div className="text-center text-green-600 italic">No services in this category</div>
                        )}
                      </div>
                    </div>

                    {/* Top Right - Opportunities */}
                    <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 flex flex-col min-h-32">
                      <div className="text-center mb-3">
                        <h3 className="text-blue-800 font-bold text-base mb-1">OPPORTUNITIES</h3>
                        <span className="text-blue-600 font-medium text-xs">High Satisfaction, High Need for Action</span>
                      </div>
                      <div className="space-y-2 text-xs text-blue-800">
                        {Object.entries(satisfactionData.categories).map(([key, data]: [string, any]) =>
                          data.category === 'opportunities' && (
                            <Tooltip key={key}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between cursor-help">
                                  <div className="flex items-center">
                                    <span className="mr-2">★</span>
                                    <span>
                                      {key === 'financial' ? 'Financial Administration' :
                                       key === 'disaster' ? 'Disaster Preparedness' :
                                       key === 'safety' ? 'Safety & Peace Order' :
                                       key === 'social' ? 'Social Protection' :
                                       key === 'business' ? 'Business Friendliness' :
                                       key === 'environmental' ? 'Environmental Management' :
                                       key.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-semibold">Satisfaction: {data.satisfaction}%</div>
                                  <div className="text-xs">Need for Action: {data.needForAction}%</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        )}
                        {Object.values(satisfactionData.categories).every((cat: any) => cat.category !== 'opportunities') && (
                          <div className="text-center text-blue-600 italic">No services in this category</div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Left - Monitor */}
                    <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 flex flex-col min-h-32">
                      <div className="text-center mb-3">
                        <h3 className="text-yellow-800 font-bold text-base mb-1">MONITOR</h3>
                        <span className="text-yellow-600 font-medium text-xs">Low Satisfaction, Low Need for Action</span>
                      </div>
                      <div className="space-y-2 text-xs text-yellow-800">
                        {Object.entries(satisfactionData.categories).map(([key, data]: [string, any]) =>
                          data.category === 'monitor' && (
                            <Tooltip key={key}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between cursor-help">
                                  <div className="flex items-center">
                                    <span className="mr-2">★</span>
                                    <span>
                                      {key === 'financial' ? 'Financial Administration' :
                                       key === 'disaster' ? 'Disaster Preparedness' :
                                       key === 'safety' ? 'Safety & Peace Order' :
                                       key === 'social' ? 'Social Protection' :
                                       key === 'business' ? 'Business Friendliness' :
                                       key === 'environmental' ? 'Environmental Management' :
                                       key.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-semibold">Satisfaction: {data.satisfaction}%</div>
                                  <div className="text-xs">Need for Action: {data.needForAction}%</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        )}
                        {Object.values(satisfactionData.categories).every((cat: any) => cat.category !== 'monitor') && (
                          <div className="text-center text-yellow-600 italic">No services in this category</div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Right - Fix Now */}
                    <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 flex flex-col min-h-32">
                      <div className="text-center mb-3">
                        <h3 className="text-red-800 font-bold text-base mb-1">FIX NOW</h3>
                        <span className="text-red-600 font-medium text-xs">Low Satisfaction, High Need for Action</span>
                      </div>
                      <div className="space-y-2 text-xs text-red-800">
                        {Object.entries(satisfactionData.categories).map(([key, data]: [string, any]) =>
                          data.category === 'fix_now' && (
                            <Tooltip key={key}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center justify-between cursor-help">
                                  <div className="flex items-center">
                                    <span className="mr-2">★</span>
                                    <span>
                                      {key === 'financial' ? 'Financial Administration' :
                                       key === 'disaster' ? 'Disaster Preparedness' :
                                       key === 'safety' ? 'Safety & Peace Order' :
                                       key === 'social' ? 'Social Protection' :
                                       key === 'business' ? 'Business Friendliness' :
                                       key === 'environmental' ? 'Environmental Management' :
                                       key.replace('_', ' ')}
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-center">
                                  <div className="font-semibold">Satisfaction: {data.satisfaction}%</div>
                                  <div className="text-xs">Need for Action: {data.needForAction}%</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        )}
                        {Object.values(satisfactionData.categories).every((cat: any) => cat.category !== 'fix_now') && (
                          <div className="text-center text-red-600 italic">No services in this category</div>
                        )}
                      </div>
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