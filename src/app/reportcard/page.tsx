"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Download, Share2, BarChart3, TrendingUp, Users, MapPin, Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { CycleDisplay } from '@/components/survey-cycle';
import { useActiveCycle } from '@/hooks/useSurveyCycle';
import { getCurrentUser, User } from '@/lib/auth';
import { reportCardCache } from '@/utils/reportCardCache';
import './print.css';

function ExecutiveSummarySection({ barangayId, cycleId }: { barangayId: string; cycleId: number }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'bisaya' | 'filipino' | 'english'>('bisaya');
  const [translating, setTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, any>>({
    bisaya: null, // Will be populated with original content
    filipino: null,
    english: null
  });

  useEffect(() => {
    if (barangayId && cycleId) {
      fetchExecutiveSummary();
    }
  }, [barangayId, cycleId]);

  useEffect(() => {
    // When summary is loaded, cache it as Bisaya content
    if (summary && !summary.surveyIncomplete) {
      setTranslationCache(prev => ({
        ...prev,
        bisaya: {
          executiveSummary: summary.executiveSummary,
          keyFindings: summary.keyFindings,
          criticalIssues: summary.criticalIssues
        }
      }));
    }
  }, [summary]);

  useEffect(() => {
    // When language changes, translate if not cached
    if (selectedLanguage !== 'bisaya' && summary && !summary.surveyIncomplete) {
      if (!translationCache[selectedLanguage]) {
        translateContent(selectedLanguage);
      }
    }
  }, [selectedLanguage]);

  const translateContent = async (targetLanguage: 'filipino' | 'english') => {
    if (!summary || translating) return;

    setTranslating(true);
    try {
      // Translate executive summary
      const summaryResponse = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: summary.executiveSummary,
          targetLanguage,
          sourceLanguage: 'bisaya'
        })
      });
      const summaryData = await summaryResponse.json();

      // Translate key findings (one by one)
      const translatedFindings = await Promise.all(
        (summary.keyFindings || []).map(async (finding: string) => {
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: finding,
              targetLanguage,
              sourceLanguage: 'bisaya'
            })
          });
          const data = await response.json();
          return data.translatedText;
        })
      );

      // Translate critical issues
      const translatedIssues = await Promise.all(
        (summary.criticalIssues || []).map(async (issue: any) => {
          const [issueText, impactText, areaText] = await Promise.all([
            fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: issue.issue,
                targetLanguage,
                sourceLanguage: 'bisaya'
              })
            }).then(r => r.json()),
            fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: issue.impact,
                targetLanguage,
                sourceLanguage: 'bisaya'
              })
            }).then(r => r.json()),
            fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: issue.affectedArea,
                targetLanguage,
                sourceLanguage: 'bisaya'
              })
            }).then(r => r.json())
          ]);

          return {
            issue: issueText.translatedText,
            impact: impactText.translatedText,
            affectedArea: areaText.translatedText
          };
        })
      );

      // Cache the translations
      setTranslationCache(prev => ({
        ...prev,
        [targetLanguage]: {
          executiveSummary: summaryData.translatedText,
          keyFindings: translatedFindings,
          criticalIssues: translatedIssues
        }
      }));

    } catch (error) {
      console.error('Translation failed:', error);
      // Fallback to original content if translation fails
    } finally {
      setTranslating(false);
    }
  };

  const fetchExecutiveSummary = async () => {
    try {
      const response = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangayId: parseInt(barangayId),
          cycleId: cycleId,
          forceRefresh: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        // Check if survey is incomplete
        if (result.surveyIncomplete) {
          setSummary({ surveyIncomplete: true, progress: result.progress, message: result.message });
        } else {
          setSummary(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch executive summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateSummary = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangayId: parseInt(barangayId),
          cycleId: cycleId,
          forceRefresh: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSummary(result.data);
      }
    } catch (error) {
      console.error('Failed to regenerate summary:', error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-purple-700">Loading executive summary...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-gray-700 leading-relaxed">
        <p className="mb-4">
          Executive summary is not available yet. This will be automatically generated when the survey is completed.
        </p>
      </div>
    );
  }

  // Handle incomplete survey
  if (summary.surveyIncomplete) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-2">Survey Data Collection In Progress</h4>
            <p className="text-sm text-amber-700 mb-4">
              {summary.message || 'The survey for this barangay is currently ongoing. The AI-generated executive summary and comprehensive analysis will become available once data collection reaches 100% completion.'}
            </p>
            {summary.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 font-medium">Survey Completion Progress</span>
                  <span className="text-amber-900 font-bold">{summary.progress}%</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-3 rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${summary.progress}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  {summary.progress === 0 
                    ? 'Data collection has not yet commenced.' 
                    : `${100 - summary.progress}% remaining to complete data collection.`}
                </p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-amber-200">
              <p className="text-xs text-amber-600">
                <strong>Note:</strong> Once the survey reaches 100% completion, this section will automatically display:
              </p>
              <ul className="text-xs text-amber-600 mt-2 ml-4 list-disc space-y-1">
                <li>AI-generated executive summary</li>
                <li>Key findings and insights</li>
                <li>Critical issues identification</li>
                <li>Strategic recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-blue-900">
            {selectedLanguage === 'bisaya' && 'Ehekutibong Sumaryo'}
            {selectedLanguage === 'filipino' && 'Buod ng Ehekutibo'}
            {selectedLanguage === 'english' && 'Executive Summary'}
          </h4>
          <div className="flex items-center gap-2">
            {/* Language Toggle Buttons */}
            <div className="flex gap-1.5 no-print">
              <button
                onClick={() => setSelectedLanguage('bisaya')}
                disabled={translating}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  selectedLanguage === 'bisaya'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } ${translating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Bisaya
              </button>
              <button
                onClick={() => setSelectedLanguage('filipino')}
                disabled={translating}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  selectedLanguage === 'filipino'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } ${translating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Filipino
                {translating && selectedLanguage === 'filipino' && (
                  <span className="ml-1 inline-block animate-spin">⟳</span>
                )}
              </button>
              <button
                onClick={() => setSelectedLanguage('english')}
                disabled={translating}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  selectedLanguage === 'english'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } ${translating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                English
                {translating && selectedLanguage === 'english' && (
                  <span className="ml-1 inline-block animate-spin">⟳</span>
                )}
              </button>
            </div>
            <Button
              onClick={regenerateSummary}
              disabled={generating}
              variant="outline"
              size="sm"
              className="no-print"
            >
              {generating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          </div>
        </div>
        {translating && (
          <div className="mb-2 text-xs text-purple-600 flex items-center gap-1">
            <span className="animate-spin">⟳</span>
            <span>Translating content...</span>
          </div>
        )}
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {translationCache[selectedLanguage]?.executiveSummary || summary.executiveSummary}
        </p>
      </div>

      {/* Key Findings */}
      {summary.keyFindings && summary.keyFindings.length > 0 && (
        <div>
          <h4 className="font-semibold text-blue-900 mb-2">
            {selectedLanguage === 'bisaya' && 'Importanteng Mga Nakit-an'}
            {selectedLanguage === 'filipino' && 'Pangunahing Natuklasan'}
            {selectedLanguage === 'english' && 'Key Findings'}
          </h4>
          <ul className="space-y-2">
            {(translationCache[selectedLanguage]?.keyFindings || summary.keyFindings).map((finding: string, index: number) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                <span className="text-gray-700">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Critical Issues */}
      {summary.criticalIssues && summary.criticalIssues.length > 0 && (
        <div>
          <h4 className="font-semibold text-red-900 mb-2">
            {selectedLanguage === 'bisaya' && 'Kritikal nga mga Isyu'}
            {selectedLanguage === 'filipino' && 'Kritikal na mga Isyu'}
            {selectedLanguage === 'english' && 'Critical Issues'}
          </h4>
          <div className="space-y-3">
            {(translationCache[selectedLanguage]?.criticalIssues || summary.criticalIssues).slice(0, 3).map((issue: any, index: number) => (
              <div key={index} className="border-l-4 border-red-500 pl-3 py-1">
                <div className="font-medium text-sm text-gray-900">{issue.issue}</div>
                <div className="text-xs text-gray-600 mt-1">
                  <strong>
                    {selectedLanguage === 'bisaya' && 'Epekto:'}
                    {selectedLanguage === 'filipino' && 'Epekto:'}
                    {selectedLanguage === 'english' && 'Impact:'}
                  </strong> {issue.impact} | <strong>
                    {selectedLanguage === 'bisaya' && 'Lugar:'}
                    {selectedLanguage === 'filipino' && 'Lugar:'}
                    {selectedLanguage === 'english' && 'Area:'}
                  </strong> {issue.affectedArea}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action planning has been moved to the CPAP module */}

      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 text-xs text-purple-700">
        Generated by AI on {new Date(summary.generated_at).toLocaleDateString()} at {new Date(summary.generated_at).toLocaleTimeString()}
      </div>
    </div>
  );
}

function ReportCardContent() {
  const searchParams = useSearchParams();
  const [barangayData, setBarangayData] = useState<any>(null);
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [commonNeeds, setCommonNeeds] = useState<any>({});
  const [funnelData, setFunnelData] = useState<any>({});
  const [trendsData, setTrendsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedServiceArea, setSelectedServiceArea] = useState<any>(null);

  // Format percentage to 2 decimal places for display
  const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) return '0.00';
    return Number(value).toFixed(2);
  };
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Fetch current user for role-based display
    getCurrentUser().then(user => {
      setCurrentUser(user);
    });
  }, []);

  const handleForceRefresh = async () => {
    if (!barangayData?.barangayId) return;

    const effectiveCycleId = barangayData.cycleId || activeCycle?.cycle_id;
    if (!effectiveCycleId) return;

    setIsRefreshing(true);
    console.log('🔄 [REPORT CARD] Force refreshing data...');

    // Clear cache for this barangay/cycle
    reportCardCache.clearForBarangay(barangayData.barangayId, effectiveCycleId);

    // Fetch fresh data
    await fetchDetailedAnalytics(barangayData.barangayId, effectiveCycleId, true);

    setIsRefreshing(false);
    console.log('✅ [REPORT CARD] Force refresh complete');
  };

  useEffect(() => {
    // Get data from URL parameters
    const cycleIdParam = searchParams.get('cycleId');
    const data = {
      barangay: searchParams.get('barangay') || '',
      barangayId: searchParams.get('barangayId') || '',
      cycleId: cycleIdParam ? parseInt(cycleIdParam) : null, // Add cycle ID from URL
      logo_url: searchParams.get('logo_url') || '',
      population: parseInt(searchParams.get('population') || '0'),
      households: parseInt(searchParams.get('households') || '0'),
      area: parseFloat(searchParams.get('area') || '0'),
      surveyStatus: searchParams.get('surveyStatus') || '',
      satisfaction: parseInt(searchParams.get('satisfaction') || '65'),
      financial: parseInt(searchParams.get('financial') || '0'),
      financial_need: parseInt(searchParams.get('financial_need') || '0'),
      disaster: parseInt(searchParams.get('disaster') || '0'),
      disaster_need: parseInt(searchParams.get('disaster_need') || '0'),
      safety: parseInt(searchParams.get('safety') || '0'),
      safety_need: parseInt(searchParams.get('safety_need') || '0'),
      social: parseInt(searchParams.get('social') || '0'),
      social_need: parseInt(searchParams.get('social_need') || '0'),
      business: parseInt(searchParams.get('business') || '0'),
      business_need: parseInt(searchParams.get('business_need') || '0'),
      environmental: parseInt(searchParams.get('environmental') || '0'),
      environmental_need: parseInt(searchParams.get('environmental_need') || '0'),
      responses: parseInt(searchParams.get('responses') || '0')
    };

    setBarangayData(data);

    // Determine which cycle to use: URL parameter or active cycle
    const effectiveCycleId = data.cycleId || activeCycle?.cycle_id;

    // Fetch detailed analytics if barangayId and cycle are available
    if (data.barangayId && !cycleLoading && effectiveCycleId) {
      fetchDetailedAnalytics(data.barangayId, effectiveCycleId);
    } else if (data.barangayId && !cycleLoading && !effectiveCycleId) {
      console.warn('⚠️ [REPORT CARD] No cycle available');
      setLoading(false);
    }
  }, [searchParams, activeCycle, cycleLoading]);

  const [communityVoiceData, setCommunityVoiceData] = useState<any>(null);

  const fetchDetailedAnalytics = async (barangayId: string, cycleId: number, forceRefresh: boolean = false) => {
    try {
      console.log(`📊 [REPORT CARD] Fetching analytics for barangay ${barangayId}, cycle ${cycleId}, forceRefresh: ${forceRefresh}`);

      // Check cache for funnel data (skip if force refresh)
      const cachedFunnelData = !forceRefresh ? reportCardCache.get(barangayId, cycleId, 'funnel') : null;
      if (cachedFunnelData && !forceRefresh) {
        console.log('✅ [REPORT CARD] Using cached funnel data');
        console.log('📦 [REPORT CARD] Cached action_grid:', (cachedFunnelData as any).action_grid);
        await processFunnelData(cachedFunnelData, barangayId, cycleId);
      } else {
        if (forceRefresh) {
          console.log('🔄 [REPORT CARD] Force refresh - bypassing cache...');
        } else {
          console.log('🔄 [REPORT CARD] No cache found, fetching from API...');
        }
        // Get ML-enhanced funnel analysis directly from the ML API
        // Add refresh parameter if force refresh is requested
        const apiUrl = forceRefresh
          ? `/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${cycleId}&refresh=true`
          : `/api/ml/funnel-analysis?barangayId=${barangayId}&cycleId=${cycleId}`;

        console.log(`🔄 [REPORT CARD] Fetching from: ${apiUrl}`);
        const funnelResponse = await fetch(apiUrl);
        if (funnelResponse.ok) {
          const funnelData = await funnelResponse.json();
          
          // Check if survey is incomplete
          if (funnelData.surveyIncomplete) {
            console.log(`⏳ [REPORT CARD] Survey incomplete - Progress: ${funnelData.progress}%`);
            // Store incomplete status in funnel data
            setFunnelData({ surveyIncomplete: true, progress: funnelData.progress, message: funnelData.message });
          } else {
            console.log('✅ [REPORT CARD] ML funnel analysis data:', funnelData);
            console.log('📊 [REPORT CARD] Service scores:', funnelData.service_scores);
            console.log('📊 [REPORT CARD] Action grid with trends:', funnelData.action_grid);

            // Cache the funnel data
            reportCardCache.set(barangayId, cycleId, 'funnel', funnelData);

            // Process ML-enhanced funnel data
            await processFunnelData(funnelData, barangayId, cycleId);
          }
        } else {
          console.error('❌ [REPORT CARD] Failed to fetch ML funnel analysis:', await funnelResponse.text());
        }
      }

      // Check cache for community voice data (skip if force refresh)
      const cachedCommunityVoice = !forceRefresh ? reportCardCache.get(barangayId, cycleId, 'community-voice') : null;
      if (cachedCommunityVoice && !forceRefresh) {
        console.log('✅ [REPORT CARD] Using cached community voice data');
        setCommunityVoiceData(cachedCommunityVoice);
      } else {
        // Get community voice analysis
        const communityVoiceResponse = await fetch(`/api/community-voice?barangayId=${barangayId}`);
        if (communityVoiceResponse.ok) {
          const cvData = await communityVoiceResponse.json();
          console.log('Community voice data:', cvData);
          if (cvData.success && cvData.data) {
            // Cache the community voice data
            reportCardCache.set(barangayId, cycleId, 'community-voice', cvData.data);
            setCommunityVoiceData(cvData.data);
          }
        }
      }

      // Check cache for survey analytics (skip if force refresh)
      const cachedAnalytics = !forceRefresh ? reportCardCache.get(barangayId, cycleId, 'analytics') : null;
      if (cachedAnalytics && !forceRefresh) {
        console.log('✅ [REPORT CARD] Using cached analytics data');
        setAnalyticsData(cachedAnalytics);
      } else {
        // Get detailed survey analytics
        const response = await fetch(`/api/survey-analytics?format=detailed&barangayId=${barangayId}`);
        if (response.ok) {
          const data = await response.json();

          // Cache the analytics data
          reportCardCache.set(barangayId, cycleId, 'analytics', data.detailed);
          setAnalyticsData(data.detailed);

          console.log('Survey analytics loaded, funnel data already processed from API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch detailed analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConditionalReasons = async (barangayId: string, cycleId: number, processedFunnel: any) => {
    try {
      console.log(`🔍 [CONDITIONAL REASONS] Starting fetch for barangay ${barangayId} (type: ${typeof barangayId}), cycle ${cycleId}`);
      const targetBarangayId = parseInt(barangayId);
      console.log(`🔍 [CONDITIONAL REASONS] Target barangay ID as number: ${targetBarangayId}`);
      
      if (isNaN(targetBarangayId)) {
        console.error(`❌ [CONDITIONAL REASONS] Invalid barangay ID: ${barangayId}`);
        return;
      }
      
      // Fetch conditional reasons for each service area
      const serviceAreas = ['financial', 'disaster', 'safety', 'social', 'business', 'environmental'];
      
      for (const serviceArea of serviceAreas) {
        if (!processedFunnel[serviceArea]) {
          console.log(`⚠️ [CONDITIONAL REASONS] No funnel data for ${serviceArea}, skipping`);
          continue;
        }
        
        console.log(`🔍 [CONDITIONAL REASONS] Fetching for ${serviceArea}...`);
        const response = await fetch(`/api/analytics/service-area-deep-dive?serviceArea=${serviceArea}&cycleId=${cycleId}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 [CONDITIONAL REASONS] API response for ${serviceArea}:`, data);
          console.log(`📊 [CONDITIONAL REASONS] All barangay IDs in response:`, data.rankings?.map((r: any) => `${r.barangayName} (ID: ${r.barangayId})`));
          
          // Find this barangay's data - STRICT equality check
          const barangayRanking = data.rankings?.find((r: any) => {
            console.log(`🔍 [CONDITIONAL REASONS] Comparing: ${r.barangayId} (${typeof r.barangayId}) === ${targetBarangayId} (${typeof targetBarangayId})`);
            return r.barangayId === targetBarangayId;
          });
          console.log(`🔍 [CONDITIONAL REASONS] Looking for barangay ID ${targetBarangayId} in ${serviceArea}`);
          console.log(`🔍 [CONDITIONAL REASONS] Found barangay ranking:`, barangayRanking);
          
          if (barangayRanking) {
            const hasUnawarenessReasons = barangayRanking.unawarenessReasons && barangayRanking.unawarenessReasons.length > 0;
            const hasNonAvailmentReasons = barangayRanking.nonAvailmentReasons && barangayRanking.nonAvailmentReasons.length > 0;
            
            processedFunnel[serviceArea].conditionalReasons = {
              unawarenessReasons: barangayRanking.unawarenessReasons || [],
              nonAvailmentReasons: barangayRanking.nonAvailmentReasons || []
            };
            console.log(`✅ [CONDITIONAL REASONS] Set for ${serviceArea}:`, {
              unawareness: hasUnawarenessReasons ? `${barangayRanking.unawarenessReasons.length} reasons` : 'none',
              nonAvailment: hasNonAvailmentReasons ? `${barangayRanking.nonAvailmentReasons.length} reasons` : 'none'
            });
          } else {
            console.warn(`⚠️ [CONDITIONAL REASONS] No ranking found for barangay ${targetBarangayId} in ${serviceArea}`);
            console.warn(`⚠️ [CONDITIONAL REASONS] Available barangays:`, data.rankings?.map((r: any) => `${r.barangayName} (${r.barangayId})`));
            // Set empty arrays to indicate no data (not null, which means not fetched)
            processedFunnel[serviceArea].conditionalReasons = {
              unawarenessReasons: [],
              nonAvailmentReasons: []
            };
          }
        } else {
          console.error(`❌ [CONDITIONAL REASONS] Failed to fetch ${serviceArea}:`, response.status);
          // Set empty arrays on error
          processedFunnel[serviceArea].conditionalReasons = {
            unawarenessReasons: [],
            nonAvailmentReasons: []
          };
        }
      }
      console.log(`✅ [CONDITIONAL REASONS] Fetch complete. Final funnel data:`, processedFunnel);
    } catch (error) {
      console.error('❌ [CONDITIONAL REASONS] Failed to fetch:', error);
    }
  };

  const processFunnelData = async (funnelData: any, barangayId?: string, cycleId?: number) => {
    // Process ML-enhanced funnel data
    console.log('🔍 Processing funnel data:', funnelData);
    console.log('🔍 Service scores:', funnelData.service_scores);
    console.log('🔍 Action grid (RAW):', JSON.stringify(funnelData.action_grid, null, 2));

    // Update overall satisfaction and service scores from actual funnel data
    if (funnelData.overall_satisfaction !== undefined && funnelData.overall_satisfaction > 0) {
      console.log(`📊 [SATISFACTION] Updating overall satisfaction to ${funnelData.overall_satisfaction}%`);

      // Also update individual service scores
      const updatedServiceScores: any = {};
      Object.entries(funnelData.service_scores || {}).forEach(([serviceKey, scores]: [string, any]) => {
        updatedServiceScores[serviceKey] = scores.satisfaction || 0;
        console.log(`📊 [SERVICE SCORE] ${serviceKey}: ${scores.satisfaction}%`);
      });

      setBarangayData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          satisfaction: funnelData.overall_satisfaction,
          financial: updatedServiceScores.financial || prev.financial,
          disaster: updatedServiceScores.disaster || prev.disaster,
          safety: updatedServiceScores.safety || prev.safety,
          social: updatedServiceScores.social || prev.social,
          business: updatedServiceScores.business || prev.business,
          environmental: updatedServiceScores.environmental || prev.environmental
        };
      });
    }

    const processedFunnel: any = {};
    const processedTrends: any = {};

    Object.entries(funnelData.service_scores || {}).forEach(([serviceKey, scores]: [string, any]) => {
      console.log(`🔍 Processing ${serviceKey}:`, scores);
      console.log(`  - Concerns:`, scores.concerns);
      console.log(`  - Quotes:`, scores.quotes);
      console.log(`  - Recommendations:`, scores.recommendations);

      // Handle both structured format (with percentage field) and old format
      const awarenessValue = typeof scores.awareness === 'object' && scores.awareness?.percentage !== undefined
        ? scores.awareness.percentage
        : (scores.awareness_score || scores.awareness || 0);
      
      const availmentValue = typeof scores.availment === 'object' && scores.availment?.percentage !== undefined
        ? scores.availment.percentage
        : (scores.availment_score || scores.availment || 0);
      
      const satisfactionValue = typeof scores.satisfaction === 'object' && scores.satisfaction?.percentage !== undefined
        ? scores.satisfaction.percentage
        : (scores.satisfaction_score || scores.satisfaction || 0);

      processedFunnel[serviceKey] = {
        awareness: awarenessValue,
        availment: availmentValue,
        satisfaction: satisfactionValue,
        total: funnelData.total_responses || 100,
        concerns: scores.concerns || [],
        quotes: scores.quotes || {},
        bottleneck: scores.bottleneck || 'satisfaction',
        recommendations: scores.recommendations || {},
        awareness_metrics: scores.awareness_metrics,
        availment_metrics: scores.availment_metrics,
        satisfaction_metrics: scores.satisfaction_metrics,
        conditionalReasons: null // Will be fetched separately
      };

      // Extract trends from action grid
      if (funnelData.action_grid && funnelData.action_grid[serviceKey]) {
        const trend = funnelData.action_grid[serviceKey].trend || { change: 0, direction: 'baseline' };
        console.log(`📈 [TREND UI] Extracted trend for ${serviceKey}:`, trend);
        console.log(`📈 [TREND UI] Full action_grid entry:`, funnelData.action_grid[serviceKey]);

        // Validate trend change - if it's unrealistic (> 100% or < -100%), mark as unavailable
        if (Math.abs(trend.change) > 100) {
          console.warn(`⚠️ [TREND UI] Unrealistic trend change for ${serviceKey}: ${trend.change}%. Marking as baseline.`);
          processedTrends[serviceKey] = {
            ...trend,
            available: false,
            direction: 'baseline',
            change: 0
          };
        } else {
          console.log(`✅ [TREND UI] Trend validated for ${serviceKey}: ${trend.change}% ${trend.direction}`);
          processedTrends[serviceKey] = {
            ...trend,
            available: true
          };
        }
      } else {
        console.warn(`⚠️ [TREND UI] No action_grid data for ${serviceKey}`);
      }
    });

    console.log(`📈 [TREND UI] All processed trends:`, processedTrends);
    
    // Set funnel and trends data first
    setFunnelData(processedFunnel);
    setTrendsData(processedTrends);
    
    // Fetch conditional reasons for each service area (if barangayId and cycleId are provided)
    // This happens after setting state so the UI renders, then updates when reasons are fetched
    if (barangayId && cycleId) {
      console.log(`🔍 [CONDITIONAL REASONS] Starting fetch for barangay ${barangayId}, cycle ${cycleId}`);
      await fetchConditionalReasons(barangayId, cycleId, processedFunnel);
      // Update state again with conditional reasons
      setFunnelData({...processedFunnel});
      console.log(`✅ [CONDITIONAL REASONS] State updated with conditional reasons`);
    }

    // Extract common needs from ML insights
    const processedNeeds: any = {};
    Object.entries(processedFunnel).forEach(([serviceKey, data]: [string, any]) => {
      if (data.concerns && data.concerns.length > 0) {
        processedNeeds[serviceKey] = data.concerns.map((concern: string, index: number) => ({
          text: concern,
          count: 5 - index // Simulate frequency
        }));
      }
    });
    setCommonNeeds(processedNeeds);
  };

  const processBasicFunnelData = (funnelData: any) => {
    // Process basic funnel data (same as ML-enhanced, just without ML flag)
    console.log('Processing basic funnel data');
    processFunnelData(funnelData);
  };

  const extractCommonNeeds = (responses: any[]) => {
    const needsByArea: any = {
      financial: [],
      disaster: [],
      safety: [],
      social: [],
      business: [],
      environmental: []
    };

    responses.forEach(response => {
      response.sections.forEach((section: any) => {
        if (section.data) {
          // Extract suggestions and needs from each section
          Object.keys(section.data).forEach(key => {
            const value = section.data[key];

            // Look for suggestion/comment fields and categorize them
            if (key.toLowerCase().includes('suggestion') ||
              key.toLowerCase().includes('comment') ||
              key.toLowerCase().includes('need') ||
              key.toLowerCase().includes('improvement')) {

              if (typeof value === 'string' && value.trim().length > 0) {
                // Categorize based on section key or content
                if (section.key.includes('financial') || key.includes('financial')) {
                  needsByArea.financial.push(value.trim());
                } else if (section.key.includes('disaster') || key.includes('disaster')) {
                  needsByArea.disaster.push(value.trim());
                } else if (section.key.includes('safety') || key.includes('safety')) {
                  needsByArea.safety.push(value.trim());
                } else if (section.key.includes('social') || key.includes('social')) {
                  needsByArea.social.push(value.trim());
                } else if (section.key.includes('business') || key.includes('business')) {
                  needsByArea.business.push(value.trim());
                } else if (section.key.includes('environmental') || key.includes('environmental')) {
                  needsByArea.environmental.push(value.trim());
                }
              }
            }
          });
        }
      });
    });

    // Get most common needs for each area (top 3)
    const processedNeeds: any = {};
    Object.keys(needsByArea).forEach(area => {
      const needs = needsByArea[area];
      const needCounts: any = {};

      needs.forEach((need: string) => {
        const normalized = need.toLowerCase().trim();
        needCounts[normalized] = (needCounts[normalized] || 0) + 1;
      });

      // Sort by frequency and get top 3
      const sortedNeeds = Object.entries(needCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([need, count]) => ({
          text: need.charAt(0).toUpperCase() + need.slice(1),
          count: count as number
        }));

      processedNeeds[area] = sortedNeeds;
    });

    // If no data found, use sample common needs based on typical barangay issues
    if (Object.values(processedNeeds).every(arr => (arr as any[]).length === 0)) {
      const sampleNeeds = {
        financial: [
          { text: 'Better budget transparency and reporting', count: 5 },
          { text: 'More efficient collection of barangay fees', count: 3 },
          { text: 'Improved financial planning and allocation', count: 2 }
        ],
        disaster: [
          { text: 'Early warning systems for natural disasters', count: 8 },
          { text: 'Emergency evacuation centers and supplies', count: 6 },
          { text: 'Community disaster preparedness training', count: 4 }
        ],
        safety: [
          { text: 'Better street lighting in dark areas', count: 7 },
          { text: 'More visible police/security patrols', count: 5 },
          { text: 'CCTV installation in key locations', count: 3 }
        ],
        social: [
          { text: 'Healthcare services and medical assistance', count: 9 },
          { text: 'Educational support and scholarships', count: 6 },
          { text: 'Senior citizen and PWD support programs', count: 4 }
        ],
        business: [
          { text: 'Simplified business permit processes', count: 6 },
          { text: 'Support for local entrepreneurs and MSMEs', count: 4 },
          { text: 'Better market facilities and infrastructure', count: 3 }
        ],
        environmental: [
          { text: 'Improved waste collection and segregation', count: 8 },
          { text: 'Tree planting and green space development', count: 5 },
          { text: 'Water quality monitoring and improvement', count: 4 }
        ]
      };
      setCommonNeeds(sampleNeeds);
    } else {
      setCommonNeeds(processedNeeds);
    }
  };

  const generateFunnelData = (responses: any[]) => {
    // No longer using hardcoded data - funnel data should come from API
    console.log('No funnel data available from API - service drill-down will show "no data" message');
    setFunnelData({});
  };

  const generateTrendsData = () => {
    // No historical data available yet - this is the baseline survey
    setTrendsData({});
  };

  const handleServiceAreaClick = (category: any) => {
    const funnelInfo = funnelData[category.key] || {};
    const trendInfo = trendsData[category.key] || {};

    console.log('Service Area Clicked:', category.key);
    console.log('Funnel Info:', funnelInfo);
    console.log('Conditional Reasons:', funnelInfo.conditionalReasons);

    setSelectedServiceArea({
      ...category,
      funnel: {
        awareness: funnelInfo.awareness || 0,
        availment: funnelInfo.availment || 0,
        satisfaction: category.score || 0,
        total: funnelInfo.total || 100,
        concerns: funnelInfo.concerns || [],
        quotes: funnelInfo.quotes || {},
        bottleneck: funnelInfo.bottleneck || 'satisfaction',
        recommendations: funnelInfo.recommendations || {},
        awareness_metrics: funnelInfo.awareness_metrics,
        availment_metrics: funnelInfo.availment_metrics,
        satisfaction_metrics: funnelInfo.satisfaction_metrics
      },
      conditionalReasons: funnelInfo.conditionalReasons || null,
      trend: trendInfo
    });
    setShowServiceModal(true);
  };

  const handleDownloadReport = () => {
    // Generate PDF or print functionality
    window.print();
  };

  const handleShareReport = async () => {
    const shareData = {
      title: `${barangayData?.barangay} Satisfaction Score Card`,
      text: `Satisfaction Index Score Card for ${barangayData?.barangay} - Overall Score: ${barangayData?.overall_satisfaction?.toFixed(2)}%`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = 'Score Card URL copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 3000);
      } catch (error) {
        prompt('Copy this URL to share the score card:', window.location.href);
      }
    }
  };

  const handleExportInfographic = () => {
    if (!barangayData) return;

    // Create a shareable infographic view
    const infographicWindow = window.open('', '_blank', 'width=800,height=1200');
    if (!infographicWindow) {
      alert('Please allow popups to view the infographic');
      return;
    }

    const serviceAreas = [
      { key: 'financial', label: 'Financial Administration', score: barangayData.financial },
      { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster },
      { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety },
      { key: 'social', label: 'Social Protection', score: barangayData.social },
      { key: 'business', label: 'Business Friendliness', score: barangayData.business },
      { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental }
    ];

    const infographicHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${barangayData.barangay} - Public Infographic</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            .infographic {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px;
              text-align: center;
            }
            .header h1 {
              font-size: 32px;
              margin-bottom: 10px;
              font-weight: 700;
            }
            .header p {
              font-size: 18px;
              opacity: 0.9;
            }
            .satisfaction-score {
              background: white;
              margin: -30px 40px 0;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              text-align: center;
            }
            .satisfaction-score h2 {
              color: #667eea;
              font-size: 20px;
              margin-bottom: 15px;
            }
            .score-circle {
              width: 150px;
              height: 150px;
              margin: 0 auto 20px;
              border-radius: 50%;
              background: conic-gradient(#667eea ${barangayData.satisfaction * 3.6}deg, #e5e7eb ${barangayData.satisfaction * 3.6}deg);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .score-circle::before {
              content: '';
              width: 120px;
              height: 120px;
              background: white;
              border-radius: 50%;
              position: absolute;
            }
            .score-value {
              font-size: 48px;
              font-weight: 700;
              color: #667eea;
              position: relative;
              z-index: 1;
            }
            .score-label {
              font-size: 16px;
              color: #6b7280;
              font-weight: 500;
            }
            .content {
              padding: 40px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            .stat-card {
              text-align: center;
              padding: 20px;
              background: #f9fafb;
              border-radius: 10px;
            }
            .stat-value {
              font-size: 28px;
              font-weight: 700;
              color: #667eea;
              margin-bottom: 5px;
            }
            .stat-label {
              font-size: 14px;
              color: #6b7280;
            }
            .services-title {
              font-size: 24px;
              font-weight: 700;
              color: #1f2937;
              margin-bottom: 25px;
              text-align: center;
            }
            .service-bars {
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            .service-bar {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .service-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .service-name {
              font-size: 14px;
              font-weight: 600;
              color: #374151;
            }
            .service-score {
              font-size: 16px;
              font-weight: 700;
              color: #667eea;
            }
            .bar-container {
              height: 12px;
              background: #e5e7eb;
              border-radius: 6px;
              overflow: hidden;
            }
            .bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
              border-radius: 6px;
              transition: width 1s ease;
            }
            .footer {
              text-align: center;
              padding: 30px 40px;
              background: #f9fafb;
              color: #6b7280;
              font-size: 14px;
            }
            .footer strong {
              color: #374151;
            }
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(4px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              animation: fadeIn 0.2s ease;
            }
            .modal-content {
              background: white;
              border-radius: 16px;
              padding: 32px;
              max-width: 400px;
              width: 90%;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              animation: slideUp 0.3s ease;
            }
            .modal-icon {
              width: 56px;
              height: 56px;
              margin: 0 auto 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 28px;
            }
            .modal-title {
              font-size: 22px;
              font-weight: 700;
              color: #1f2937;
              text-align: center;
              margin-bottom: 12px;
            }
            .modal-message {
              font-size: 15px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 28px;
              line-height: 1.5;
            }
            .modal-buttons {
              display: flex;
              gap: 12px;
            }
            .modal-button {
              flex: 1;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 15px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .modal-button-primary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .modal-button-primary:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            .modal-button-secondary {
              background: #f3f4f6;
              color: #374151;
            }
            .modal-button-secondary:hover {
              background: #e5e7eb;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(20px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
            @media print {
              body { padding: 0; background: white; }
              .infographic { box-shadow: none; }
              .modal-overlay { display: none; }
            }
          </style>
        </head>
        <body>
          <div id="modal" class="modal-overlay">
            <div class="modal-content">
              <div class="modal-icon">📄</div>
              <h2 class="modal-title">Save as PDF?</h2>
              <p class="modal-message">Would you like to save this infographic as a PDF file? You can print or save it for sharing.</p>
              <div class="modal-buttons">
                <button class="modal-button modal-button-secondary" onclick="closeModal()">Not Now</button>
                <button class="modal-button modal-button-primary" onclick="printInfographic()">Save PDF</button>
              </div>
            </div>
          </div>
          
          <div class="infographic">
            <div class="header">
              <h1>${barangayData.barangay}</h1>
              <p>Satisfaction Index Score Card</p>
            </div>
            
            <div class="satisfaction-score">
              <h2>Overall Satisfaction Score</h2>
              <div class="score-circle">
                <div class="score-value">${barangayData.satisfaction}</div>
              </div>
              <div class="score-label">${barangayData.satisfaction >= 58 ? 'Good Performance' : 'Needs Improvement'}</div>
            </div>
            
            <div class="content">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${barangayData.population.toLocaleString()}</div>
                  <div class="stat-label">Population</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${barangayData.households.toLocaleString()}</div>
                  <div class="stat-label">Households</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${barangayData.responses || 'N/A'}</div>
                  <div class="stat-label">Survey Responses</div>
                </div>
              </div>
              
              <h3 class="services-title">Service Area Performance</h3>
              <div class="service-bars">
                ${serviceAreas.map(service => `
                  <div class="service-bar">
                    <div class="service-header">
                      <span class="service-name">${service.label}</span>
                      <span class="service-score">${service.score}%</span>
                    </div>
                    <div class="bar-container">
                      <div class="bar-fill" style="width: ${service.score}%"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin-top: 10px;">PULSE - Public Understanding & Local Service Evaluation</p>
            </div>
          </div>
          
          <script>
            function closeModal() {
              document.getElementById('modal').style.display = 'none';
            }
            
            function printInfographic() {
              closeModal();
              setTimeout(() => {
                window.print();
              }, 100);
            }
            
            // Show modal after page loads
            setTimeout(() => {
              document.getElementById('modal').style.display = 'flex';
            }, 300);
          </script>
        </body>
      </html>
    `;

    infographicWindow.document.write(infographicHTML);
    infographicWindow.document.close();
  };

  const handleExportCSV = () => {
    if (!barangayData) return;

    const csvData = [
      ['Barangay Score Card Data'],
      [''],
      ['Basic Information'],
      ['Barangay', barangayData.barangay],
      ['Population', barangayData.population],
      ['Households', barangayData.households],
      ['Survey Responses', barangayData.responses || 'N/A'],
      ['Overall Satisfaction', `${barangayData.satisfaction?.toFixed(2)}%`],
      [''],
      ['Service Area Scores'],
      ['Service Area', 'Satisfaction Score', 'Need for Action', 'Action Grid Quadrant'],
    ];

    // Add service area data
    const serviceAreas = [
      { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
      { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
      { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
      { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
      { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
      { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
    ];

    serviceAreas.forEach(service => {
      // Determine quadrant based on satisfaction and need scores
      const satisfaction = Number(service.score || 0);
      const need = Number(service.need || 0);
      let quadrant = 'N/A';

      if (satisfaction >= 60 && need < 60) quadrant = 'MAINTAIN';
      else if (satisfaction >= 60 && need >= 60) quadrant = 'OPPORTUNITIES';
      else if (satisfaction < 60 && need < 60) quadrant = 'MONITOR';
      else if (satisfaction < 60 && need >= 60) quadrant = 'FIX NOW';

      csvData.push([
        service.label,
        `${satisfaction.toFixed(2)}%`,
        `${need.toFixed(2)}%`,
        quadrant
      ]);
    });

    // Convert to CSV string
    const csvContent = csvData.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${barangayData.barangay}_ScoreCard_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportServiceAreaCSV = (serviceArea: any) => {
    if (!serviceArea || !barangayData) return;

    // Use label property instead of name, with fallback
    const serviceAreaName = serviceArea.label || serviceArea.name || 'Unknown Service Area';

    const csvData = [
      [`${serviceAreaName} - Detailed Analysis`],
      [''],
      ['Basic Information'],
      ['Barangay', barangayData.barangay],
      ['Service Area', serviceAreaName],
      ['Survey Cycle', activeCycle?.name || 'N/A'],
      ['Analysis Date', new Date().toLocaleDateString()],
      [''],
      ['Funnel Analysis'],
      ['Metric', 'Percentage', 'Description'],
      ['Awareness', `${Number(serviceArea.funnel?.awareness || 0).toFixed(2)}%`, 'Know about the service'],
      ['Availment', `${Number(serviceArea.funnel?.availment || 0).toFixed(2)}%`, 'Actually used the service'],
      ['Satisfaction', `${Number(serviceArea.score || 0).toFixed(2)}%`, 'Satisfied with service'],
      ['Skipped', `${(100 - (serviceArea.funnel?.awareness || 0)).toFixed(2)}%`, 'No awareness'],
      [''],
      ['Action Grid Classification'],
      ['Quadrant', serviceArea.quadrant || 'N/A'],
      ['Satisfaction Score', `${Number(serviceArea.score || 0).toFixed(2)}%`],
      ['Need for Action Score', `${Number(serviceArea.need || 0).toFixed(2)}%`],
      [''],
      ['Top Citizen Concerns'],
    ];

    // Add concerns if available
    if (serviceArea.funnel?.concerns && serviceArea.funnel.concerns.length > 0) {
      serviceArea.funnel.concerns.forEach((concern: string, index: number) => {
        csvData.push([`${index + 1}`, concern, '']);
      });
    } else {
      csvData.push(['No specific concerns identified', '', '']);
    }

    csvData.push(['']);
    csvData.push(['Note: Action planning is now managed through the CPAP module']);

    // Convert to CSV string
    const csvContent = csvData.map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    // Use safe filename with proper null checking
    const safeFileName = serviceAreaName.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `${barangayData.barangay}_${safeFileName}_Analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareServiceArea = async (serviceArea: any) => {
    if (!serviceArea || !barangayData) return;

    // Use label property instead of name, with fallback
    const serviceAreaName = serviceArea.label || serviceArea.name || 'Unknown Service Area';

    const shareData = {
      title: `${serviceAreaName} Analysis - ${barangayData.barangay}`,
      text: `${serviceAreaName} service analysis for ${barangayData.barangay}: ${Number(serviceArea.score || 0).toFixed(2)}% satisfaction, classified as ${serviceArea.quadrant || 'N/A'} in Action Grid`,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        // Show toast notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = 'Service area analysis copied to clipboard!';
        document.body.appendChild(toast);
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 3000);
      } catch (error) {
        prompt('Copy this service area analysis:', `${shareData.title}\n${shareData.text}\n${shareData.url}`);
      }
    }
  };

  const handlePrintServiceArea = (serviceArea: any) => {
    if (!serviceArea || !barangayData) return;

    // Use label property instead of name, with fallback
    const serviceAreaName = serviceArea.label || serviceArea.name || 'Unknown Service Area';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1>${serviceAreaName} - Detailed Analysis</h1>
          <h2>${barangayData.barangay}</h2>
          <p><strong>Survey Cycle:</strong> ${activeCycle?.name || 'N/A'}</p>
          <p><strong>Analysis Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <h3>Service Funnel Analysis</h3>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0;">
            <div style="text-align: center; padding: 15px; background: #3b82f6; color: white; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold;">${Number(serviceArea.funnel?.awareness || 0).toFixed(2)}%</div>
              <div>Awareness</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #10b981; color: white; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold;">${Number(serviceArea.funnel?.availment || 0).toFixed(2)}%</div>
              <div>Availment</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #8b5cf6; color: white; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold;">${Number(serviceArea.score || 0).toFixed(2)}%</div>
              <div>Satisfaction</div>
            </div>
            <div style="text-align: center; padding: 15px; background: #ef4444; color: white; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold;">${(100 - (serviceArea.funnel?.awareness || 0)).toFixed(2)}%</div>
              <div>Skipped</div>
            </div>
          </div>
          
          <h3>Action Grid Classification</h3>
          <p><strong>Quadrant:</strong> ${serviceArea.quadrant || 'N/A'}</p>
          <p><strong>Satisfaction Score:</strong> ${Number(serviceArea.score || 0).toFixed(2)}%</p>
          <p><strong>Need for Action Score:</strong> ${Number(serviceArea.need || 0).toFixed(2)}%</p>
          
          ${serviceArea.funnel?.concerns && serviceArea.funnel.concerns.length > 0 ? `
            <h3>Top Citizen Concerns</h3>
            <ol>
              ${serviceArea.funnel.concerns.map((concern: string) => `<li>${concern}</li>`).join('')}
            </ol>
          ` : ''}
          
        </div>
      `;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${serviceAreaName} Analysis - ${barangayData.barangay}</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!barangayData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Score Card Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isHighSatisfaction = barangayData.satisfaction >= 58;

  return (
    <div className="min-h-screen print:bg-white print:p-0" style={{ backgroundColor: '#dbeafe' }}>
      {/* Print-only Professional Header */}
      <div className="hidden print:show print:document-header">
        {/* Top Header Row - Logo and Satisfaction Score */}
        <div className="print:header-row">
          {/* Barangay Logo - Upper Left */}
          <div className="print:logo-section">
            <div className="print:logo-container">
              <div className="print:logo-placeholder">
                {barangayData.logo_url ? (
                  <img
                    src={barangayData.logo_url}
                    alt={`${barangayData.barangay} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = 'BLGU LOGO';
                    }}
                  />
                ) : (
                  'BLGU LOGO'
                )}
              </div>
              <div className="print:logo-text">
                Barangay Local Government Unit
              </div>
            </div>
          </div>

          {/* Overall Satisfaction Score - Upper Right */}
          <div className="print:satisfaction-section">
            <div className="print:satisfaction-label">Overall Satisfaction Score</div>
            <div className="print:satisfaction-score">
              {barangayData.satisfaction}/100
            </div>
            <div className="print:satisfaction-status">
              {isHighSatisfaction ? 'Good Performance' : 'Needs Improvement'}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="print:document-title">
          <h1 className="print:main-title">BARANGAY SATISFACTION INDEX SCORE CARD</h1>
          <h2 className="print:barangay-title">{barangayData.barangay} - Performance Analysis</h2>
          <div className="print:generation-date">
            Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="print:ai-insights">
          <div className="print:insights-header">
            <span className="print:insights-icon">🤖</span>
            <span className="print:insights-title">AI-Generated Key Insights</span>
          </div>
          <div className="print:insights-content">
            <p className="print:insights-text">
              Based on feedback from {barangayData.responses} residents, this barangay shows {isHighSatisfaction ? 'strong performance' : 'areas requiring attention'}
              with a {barangayData.satisfaction}% overall satisfaction rating. Key focus areas include service delivery improvements,
              community engagement enhancement, and addressing the most pressing resident concerns identified through survey feedback.
            </p>
            <div className="print:insights-bullets">
              <div className="print:insight-item">
                • Priority should be given to service areas with satisfaction scores below 60%
              </div>
              <div className="print:insight-item">
                • High need-for-action scores indicate urgent community requirements
              </div>
              <div className="print:insight-item">
                • Common resident feedback patterns reveal specific improvement opportunities
              </div>
            </div>
          </div>
        </div>

        {/* Barangay Reference Information */}
        <div className="print:barangay-reference">
          <div className="print:reference-grid">
            <div className="print:reference-item">
              <div className="print:reference-label">Population</div>
              <div className="print:reference-value">{barangayData.population.toLocaleString()}</div>
            </div>
            <div className="print:reference-item">
              <div className="print:reference-label">Households</div>
              <div className="print:reference-value">{barangayData.households.toLocaleString()}</div>
            </div>
            <div className="print:reference-item">
              <div className="print:reference-label">Survey Participants</div>
              <div className="print:reference-value">{barangayData.responses || 'N/A'} residents</div>
            </div>
            {barangayData.area > 0 && (
              <div className="print:reference-item">
                <div className="print:reference-label">Area</div>
                <div className="print:reference-value">{barangayData.area} km²</div>
              </div>
            )}
            <div className="print:reference-item">
              <div className="print:reference-label">Survey Status</div>
              <div className="print:reference-value">{barangayData.surveyStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Web Header */}
      <div className="bg-slate-800 shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="bg-white text-slate-800 hover:bg-gray-100 w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{barangayData.barangay} Score Card</h1>
                <p className="text-sm sm:text-base text-gray-200">Satisfaction Index Score Card</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button
                variant="outline"
                onClick={handleForceRefresh}
                disabled={isRefreshing}
                className="bg-white text-slate-800 hover:bg-gray-100 text-sm"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              <Button variant="outline" onClick={() => setShowResponsesModal(true)} size="sm" className="text-sm">
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">View Participants</span>
              </Button>
              <div className="hidden md:flex items-center gap-2 text-sm text-white">
                {barangayData.cycleId ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      Cycle {barangayData.cycleId}
                    </span>
                    {barangayData.cycleId !== activeCycle?.cycle_id && (
                      <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-300">
                        Historical Data
                      </Badge>
                    )}
                  </div>
                ) : hasActiveCycle ? (
                  <CycleDisplay className="text-white" />
                ) : (
                  <span className="text-amber-300 font-medium">⚠️ No Active Cycle</span>
                )}
              </div>
              <div className="hidden md:block text-gray-400">|</div>
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-200">ML Enhanced</span>
              </div>
              <Button variant="outline" onClick={handleShareReport} size="sm" className="text-sm">
                <Share2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <div className="relative group">
                <Button onClick={handleDownloadReport} size="sm" className="text-sm">
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2">
                    <button 
                      onClick={handleDownloadReport}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Detailed PDF Score Card
                    </button>
                    <button 
                      onClick={handleExportCSV}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Raw Data (CSV)
                    </button>
                    <button 
                      onClick={handleExportInfographic}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Public Infographic
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 print:max-w-none print:px-0 print:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 print:single-column print:gap-0">
          {/* Left Column - Overview (Web Only) */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 print:hidden">
            {/* Barangay Logo */}
            <Card>
              <CardContent className="p-4 sm:p-8">
                <div className="border-2 border-gray-200 rounded-xl p-4 sm:p-8 text-center bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center h-24 sm:h-32">
                  {barangayData.logo_url ? (
                    <img
                      src={barangayData.logo_url}
                      alt={`${barangayData.barangay} logo`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<span class="text-xl font-bold text-gray-700">BLGU LOGO</span>';
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-700">BLGU LOGO</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overall Satisfaction */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  Overall Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl sm:text-4xl font-bold mb-2 ${isHighSatisfaction ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(barangayData.satisfaction)}%
                  </div>
                  <Badge variant={isHighSatisfaction ? 'default' : 'destructive'} className="mb-3 sm:mb-4 text-xs sm:text-sm">
                    {isHighSatisfaction ? 'Good Performance' : 'Needs Improvement'}
                  </Badge>
                  <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                    <div
                      className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${isHighSatisfaction ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${barangayData.satisfaction}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Barangay Information */}
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  Barangay Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Population:</span>
                  <span className="font-medium">{barangayData.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Households:</span>
                  <span className="font-medium">{barangayData.households.toLocaleString()}</span>
                </div>
                {barangayData.area > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{barangayData.area} km²</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Survey Status:</span>
                  <Badge variant="outline" className="text-xs sm:text-sm">{barangayData.surveyStatus}</Badge>
                </div>
                {barangayData.responses > 0 && (
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Survey Participants:</span>
                    <span className="font-medium">{barangayData.responses} residents</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Analysis */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 print:full-width">
            {/* Service Area Performance - Moved to top, always visible */}
            <Card className="print:section">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 print:hidden" />
                  <h2 className="hidden print:show">Service Area Performance Analysis</h2>
                  <span className="print:hidden">Service Area Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 print:metric-grid">
                  {[
                    { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                    { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                    { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                    { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                    { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                    { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                  ].map((category) => (
                    <div
                      key={category.key}
                      className="p-3 sm:p-4 border rounded-lg print:metric-item print:break-inside-avoid cursor-pointer hover:shadow-lg transition-shadow print:cursor-auto print:hover:shadow-none"
                      onClick={() => handleServiceAreaClick(category)}
                    >
                      <div className="mb-2 sm:mb-3 print:metric-label flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{category.label}</span>
                        <div className="flex items-center gap-2 print:hidden flex-wrap">
                          {(() => {
                            const trend = trendsData[category.key];
                            if (trend && trend.available && trend.direction !== 'baseline') {
                              const isUp = trend.direction === 'up';
                              const isDown = trend.direction === 'down';
                              return (
                                <span className={`text-xs px-2 py-1 rounded ${isUp ? 'bg-green-100 text-green-700' :
                                  isDown ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                  {isUp ? '↑' : isDown ? '↓' : '→'} {trend.change > 0 ? '+' : ''}{trend.change}% vs {trend.previousCycle}
                                </span>
                              );
                            }
                            return (
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                📊 Baseline Survey
                              </span>
                            );
                          })()}
                          <span className="text-xs text-gray-400">Click for details</span>
                        </div>
                      </div>

                      {/* Web Layout - Side by side */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0 print:hidden">
                        {/* Donut Chart for Satisfaction */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                            <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 36 36">
                              {/* Background circle */}
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#E5E7EB"
                                strokeWidth="2"
                              />
                              {/* Progress circle */}
                              <path
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={category.score > 57 ? "#10B981" : "#EF4444"}
                                strokeWidth="2"
                                strokeDasharray={`${category.score}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className={`text-xs sm:text-sm font-bold ${category.score > 57 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercentage(category.score)}%
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Satisfaction</span>
                        </div>

                        {/* Badge for Need for Action */}
                        <div className="flex flex-col items-center">
                          <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${category.need < 50
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            }`}>
                            {formatPercentage(category.need)}%
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Need for Action</span>
                        </div>

                        {/* Common Needs */}
                        <div className="flex-1 sm:ml-4 w-full sm:w-auto">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Common Needs:</h4>
                          {commonNeeds[category.key] && commonNeeds[category.key].length > 0 ? (
                            <ul className="text-xs text-gray-600 space-y-1">
                              {commonNeeds[category.key].slice(0, 2).map((need: any, index: number) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span className="line-clamp-2">{need.text}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No specific needs identified</p>
                          )}
                        </div>
                      </div>

                      {/* Print Layout - Stacked */}
                      <div className="hidden print:block print:text-center">
                        <div className="flex justify-center space-x-8 mb-4">
                          <div className="text-center">
                            <div className="print:metric-value text-2xl font-bold mb-1">
                              {formatPercentage(category.score)}%
                            </div>
                            <div className="print:text-sm">Satisfaction</div>
                          </div>
                          <div className="text-center">
                            <div className="print:metric-value text-2xl font-bold mb-1">
                              {formatPercentage(category.need)}%
                            </div>
                            <div className="print:text-sm">Need for Action</div>
                          </div>
                        </div>

                        {/* Common Needs for Print */}
                        {commonNeeds[category.key] && commonNeeds[category.key].length > 0 && (
                          <div className="text-left mt-3 pt-2 border-t border-gray-300">
                            <div className="font-medium text-sm mb-2">Common Needs:</div>
                            <ul className="text-xs space-y-1">
                              {commonNeeds[category.key].slice(0, 3).map((need: any, index: number) => (
                                <li key={index}>• {need.text}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary - Moved after Service Area Performance */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 print:section print:page-break-before">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-purple-900 text-base sm:text-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full print:hidden"></div>
                    <h2 className="hidden print:show">Executive Summary</h2>
                    <span className="print:hidden">📋 Executive Summary</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ExecutiveSummarySection
                  barangayId={barangayData.barangayId}
                  cycleId={barangayData.cycleId || activeCycle?.cycle_id || 0}
                />
              </CardContent>
            </Card>

            {/* Community Voice Section */}
            <Card className="print:section">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h2 className="hidden print:show">Community Voice</h2>
                    <span className="print:hidden">Community Voice</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 print:hidden">
                    {communityVoiceData ? `${communityVoiceData.total_comments} comments analyzed` : 'Loading...'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {funnelData.surveyIncomplete ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-2">Community Feedback Collection In Progress</h4>
                        <p className="text-sm text-amber-700 mb-3">
                          Community voice analysis will be available once survey data collection reaches 100% completion.
                        </p>
                        {funnelData.progress !== undefined && (
                          <div className="text-sm text-amber-600">
                            Current progress: <span className="font-bold">{funnelData.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="text-center py-8 text-gray-500">Loading community insights...</div>
                ) : !communityVoiceData || communityVoiceData.total_comments === 0 ? (
                  <div className="text-center py-8 text-gray-500">No community feedback available yet</div>
                ) : (
                  <div className="space-y-6">
                    {/* Top Insights */}
                    {communityVoiceData.insights && communityVoiceData.insights.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {communityVoiceData.insights.slice(0, 3).map((insight: any, index: number) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${insight.priority === 'high' ? 'bg-red-50 border-red-400' :
                              insight.priority === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                                'bg-blue-50 border-blue-400'
                              }`}
                          >
                            <h4 className={`font-semibold mb-2 ${insight.priority === 'high' ? 'text-red-800' :
                              insight.priority === 'medium' ? 'text-yellow-800' :
                                'text-blue-800'
                              }`}>
                              {insight.title}
                            </h4>
                            <p className={`text-sm mb-2 ${insight.priority === 'high' ? 'text-red-700' :
                              insight.priority === 'medium' ? 'text-yellow-700' :
                                'text-blue-700'
                              }`}>
                              {insight.description}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded ${insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                              {insight.priority} priority
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sentiment Distribution */}
                    {communityVoiceData.categories && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-3xl font-bold text-green-600">
                            {communityVoiceData.categories.percentages?.positive || 0}%
                          </div>
                          <div className="text-sm text-green-700">Positive Feedback</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-3xl font-bold text-gray-600">
                            {communityVoiceData.categories.percentages?.neutral || 0}%
                          </div>
                          <div className="text-sm text-gray-700">Neutral Feedback</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                          <div className="text-3xl font-bold text-red-600">
                            {communityVoiceData.categories.percentages?.negative || 0}%
                          </div>
                          <div className="text-sm text-red-700">Negative Feedback</div>
                        </div>
                      </div>
                    )}

                    {/* Sample Comments */}
                    {communityVoiceData.sample_comments && communityVoiceData.sample_comments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Sample Community Feedback:</h4>
                        <div className="space-y-2">
                          {communityVoiceData.sample_comments.slice(0, 3).map((comment: string, index: number) => {
                            // Replace conditional_skip with N/A
                            const displayComment = comment === 'conditional_skip' || comment === '*conditional_skip*' ? 'N/A' : comment;
                            return (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-2 border-gray-300">
                                <p className="text-sm italic text-gray-700">
                                  {displayComment === 'N/A' ? displayComment : `"${displayComment}"`}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Grid */}
            <Card className="print:section print:page-break-before">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg">
                  <h2 className="hidden print:show">Action Priority Matrix</h2>
                  <span className="print:hidden">Action Priority Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {funnelData.surveyIncomplete ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-2">Action Priority Analysis Pending</h4>
                        <p className="text-sm text-amber-700 mb-3">
                          The action priority matrix will be generated once survey data collection reaches 100% completion.
                        </p>
                        {funnelData.progress !== undefined && (
                          <div className="text-sm text-amber-600">
                            Current progress: <span className="font-bold">{funnelData.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 print:action-matrix">
                  {/* Exceeded Expectations */}
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg sm:rounded-xl p-3 sm:p-4 min-h-24 sm:min-h-32 print:action-quadrant">
                    <div className="text-center mb-2 sm:mb-3 print:quadrant-header">
                      <h3 className="text-green-800 font-bold text-[11px] sm:text-sm mb-1">EXCEEDED EXPECTATIONS</h3>
                      <span className="text-green-600 font-medium text-[9px] sm:text-[10px] print:text-xs">High Satisfaction, Low Need for Action</span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-green-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score >= 70 && cat.need <= 30).map((category) => (
                        <div key={category.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-1.5 sm:p-2 bg-green-50 rounded gap-1">
                          <div className="flex items-center min-w-0">
                            <span className="mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0">★</span>
                            <span className="font-medium truncate">{category.label}</span>
                          </div>
                          {(() => {
                            const trend = trendsData[category.key];
                            if (trend && trend.available && trend.direction !== 'baseline') {
                              const isUp = trend.direction === 'up';
                              const isDown = trend.direction === 'down';
                              return (
                                <span className={`text-[9px] sm:text-xs px-1 py-0.5 rounded print:hidden flex-shrink-0 ${isUp ? 'bg-green-200 text-green-800' :
                                  isDown ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-600'
                                  }`}>
                                  {isUp ? '↑' : isDown ? '↓' : '→'} {trend.change > 0 ? '+' : ''}{trend.change}%
                                </span>
                              );
                            }
                            return (
                              <span className="text-[9px] sm:text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden flex-shrink-0">
                                Baseline
                              </span>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Continued Emphasis */}
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-lg sm:rounded-xl p-3 sm:p-4 min-h-24 sm:min-h-32 print:action-quadrant">
                    <div className="text-center mb-2 sm:mb-3 print:quadrant-header">
                      <h3 className="text-blue-800 font-bold text-[11px] sm:text-sm mb-1">CONTINUED EMPHASIS</h3>
                      <span className="text-blue-600 font-medium text-[9px] sm:text-[10px] print:text-xs">High Satisfaction, High Need for Action</span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-blue-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score >= 70 && cat.need > 30).map((category) => (
                        <div key={category.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-1.5 sm:p-2 bg-blue-50 rounded gap-1">
                          <div className="flex items-center min-w-0">
                            <span className="mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0">★</span>
                            <span className="font-medium truncate">{category.label}</span>
                          </div>
                          {(() => {
                            const trend = trendsData[category.key];
                            if (trend && trend.available && trend.direction !== 'baseline') {
                              const isUp = trend.direction === 'up';
                              const isDown = trend.direction === 'down';
                              return (
                                <span className={`text-[9px] sm:text-xs px-1 py-0.5 rounded print:hidden flex-shrink-0 ${isUp ? 'bg-green-200 text-green-800' :
                                  isDown ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-600'
                                  }`}>
                                  {isUp ? '↑' : isDown ? '↓' : '→'} {trend.change > 0 ? '+' : ''}{trend.change}%
                                </span>
                              );
                            }
                            return (
                              <span className="text-[9px] sm:text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden flex-shrink-0">
                                Baseline
                              </span>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Priority */}
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg sm:rounded-xl p-3 sm:p-4 min-h-24 sm:min-h-32 print:action-quadrant">
                    <div className="text-center mb-2 sm:mb-3 print:quadrant-header">
                      <h3 className="text-yellow-800 font-bold text-[11px] sm:text-sm mb-1">SECONDARY PRIORITY</h3>
                      <span className="text-yellow-600 font-medium text-[9px] sm:text-[10px] print:text-xs">Low Satisfaction, Low Need for Action</span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-yellow-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score < 70 && cat.need <= 30).map((category) => (
                        <div key={category.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-1.5 sm:p-2 bg-yellow-50 rounded gap-1">
                          <div className="flex items-center min-w-0">
                            <span className="mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0">★</span>
                            <span className="font-medium truncate">{category.label}</span>
                          </div>
                          {(() => {
                            const trend = trendsData[category.key];
                            if (trend && trend.available && trend.direction !== 'baseline') {
                              const isUp = trend.direction === 'up';
                              const isDown = trend.direction === 'down';
                              return (
                                <span className={`text-[9px] sm:text-xs px-1 py-0.5 rounded print:hidden flex-shrink-0 ${isUp ? 'bg-green-200 text-green-800' :
                                  isDown ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-600'
                                  }`}>
                                  {isUp ? '↑' : isDown ? '↓' : '→'} {trend.change > 0 ? '+' : ''}{trend.change}%
                                </span>
                              );
                            }
                            return (
                              <span className="text-[9px] sm:text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden flex-shrink-0">
                                Baseline
                              </span>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities for Improvement */}
                  <div className="bg-red-100 border-2 border-red-300 rounded-lg sm:rounded-xl p-3 sm:p-4 min-h-24 sm:min-h-32 print:action-quadrant">
                    <div className="text-center mb-2 sm:mb-3 print:quadrant-header">
                      <h3 className="text-red-800 font-bold text-[10px] sm:text-xs mb-1">OPPORTUNITIES FOR IMPROVEMENT</h3>
                      <span className="text-red-600 font-medium text-[9px] sm:text-[10px] print:text-xs">Low Satisfaction, High Need for Action</span>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs text-red-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score < 70 && cat.need > 30).map((category) => (
                        <div key={category.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-1.5 sm:p-2 bg-red-50 rounded gap-1">
                          <div className="flex items-center min-w-0">
                            <span className="mr-1 sm:mr-2 text-xs sm:text-sm flex-shrink-0">★</span>
                            <span className="font-medium truncate">{category.label}</span>
                          </div>
                          {(() => {
                            const trend = trendsData[category.key];
                            if (trend && trend.available && trend.direction !== 'baseline') {
                              const isUp = trend.direction === 'up';
                              const isDown = trend.direction === 'down';
                              return (
                                <span className={`text-[9px] sm:text-xs px-1 py-0.5 rounded print:hidden flex-shrink-0 ${isUp ? 'bg-green-200 text-green-800' :
                                  isDown ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-600'
                                  }`}>
                                  {isUp ? '↑' : isDown ? '↓' : '→'} {trend.change > 0 ? '+' : ''}{trend.change}%
                                </span>
                              );
                            }
                            return (
                              <span className="text-[9px] sm:text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden flex-shrink-0">
                                Baseline
                              </span>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Survey Responses Modal */}
      <div className="print:hidden">
        <Dialog open={showResponsesModal} onOpenChange={setShowResponsesModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Survey Participants - {barangayData?.barangay}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {analyticsData && analyticsData.responses ? (
                <>
                  {analyticsData.responses.map((response: any) => (
                    <div key={response.responseId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">Survey #{response.surveyNumber}</div>
                          {currentUser && currentUser.role !== 'view' && currentUser.role !== 'officer' && (
                            <div className="text-sm text-gray-500">
                              Interviewer: {response.interviewer?.name || 'Unknown Interviewer'}
                            </div>
                          )}
                        </div>
                        <Badge variant={response.progress === 100 ? 'default' : 'secondary'}>
                          {response.progress}% Complete
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Location: {response.location?.address || 'Not specified'}</div>
                        <div>Completed: {new Date(response.completedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                  {analyticsData.count > analyticsData.responses.length && (
                    <div className="text-center text-gray-500 text-sm">
                      ... and {analyticsData.count - analyticsData.responses.length} more responses
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No survey participants available for this barangay.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Service Area Drill-Down Modal */}
      <div className="print:hidden">
        <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {selectedServiceArea?.label} - Detailed Analysis
                {(() => {
                  const trend = selectedServiceArea?.trend;
                  if (trend && trend.available && trend.direction !== 'baseline') {
                    const isUp = trend.direction === 'up';
                    const isDown = trend.direction === 'down';
                    return (
                      <span className={`text-sm px-2 py-1 rounded ml-2 ${isUp ? 'bg-green-100 text-green-700' :
                        isDown ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                        {isUp ? '↑' : isDown ? '↓' : '→'} {trend.change > 0 ? '+' : ''}{trend.change}% vs {trend.previousCycle}
                      </span>
                    );
                  }
                  return (
                    <span className="text-sm px-2 py-1 rounded ml-2 bg-gray-100 text-gray-700">
                      📊 Baseline Survey Data
                    </span>
                  );
                })()}
              </DialogTitle>
            </DialogHeader>

            {selectedServiceArea && (
              <div className="space-y-6">
                {/* Funnel Visualization */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Service Funnel Analysis</h3>
                  
                  {/* Vertical Stack Layout for Funnel */}
                  <div className="space-y-4">
                    {/* Awareness Card */}
                    <div className="flex items-center gap-4 bg-blue-500 text-white p-4 rounded-lg">
                      <div className="flex-shrink-0 text-center min-w-[120px]">
                        <div className="text-3xl font-bold">{selectedServiceArea.funnel?.awareness || 0}%</div>
                        <div className="text-sm font-medium">Awareness</div>
                      </div>
                      <div className="flex-1 text-sm">
                        {selectedServiceArea.funnel?.awareness_metrics ? (
                          <span>
                            <strong>{selectedServiceArea.funnel.awareness_metrics.count} out of {selectedServiceArea.funnel.awareness_metrics.total}</strong> residents know about the service.
                          </span>
                        ) : (
                          <span>Residents who know about the service.</span>
                        )}
                      </div>
                    </div>

                    {/* Availment Card */}
                    <div className="flex items-center gap-4 bg-green-500 text-white p-4 rounded-lg">
                      <div className="flex-shrink-0 text-center min-w-[120px]">
                        <div className="text-3xl font-bold">{selectedServiceArea.funnel?.availment || 0}%</div>
                        <div className="text-sm font-medium">Availment</div>
                      </div>
                      <div className="flex-1 text-sm">
                        {selectedServiceArea.funnel?.availment_metrics && selectedServiceArea.funnel?.awareness_metrics ? (
                          <span>
                            <strong>{selectedServiceArea.funnel.availment_metrics.count} out of {selectedServiceArea.funnel.awareness_metrics.count}</strong> aware residents actually used the service.
                          </span>
                        ) : (
                          <span>Aware residents who actually used the service.</span>
                        )}
                      </div>
                    </div>

                    {/* Satisfaction Card */}
                    <div className="flex items-center gap-4 bg-purple-500 text-white p-4 rounded-lg">
                      <div className="flex-shrink-0 text-center min-w-[120px]">
                        <div className="text-3xl font-bold">{selectedServiceArea.funnel?.satisfaction || selectedServiceArea.score || 0}%</div>
                        <div className="text-sm font-medium">Satisfaction</div>
                      </div>
                      <div className="flex-1 text-sm">
                        {selectedServiceArea.funnel?.satisfaction_metrics && selectedServiceArea.funnel?.availment_metrics ? (
                          <span>
                            <strong>{selectedServiceArea.funnel.satisfaction_metrics.count} out of {selectedServiceArea.funnel.availment_metrics.count}</strong> users were satisfied with the service.
                          </span>
                        ) : (
                          <span>Users who were satisfied with the service.</span>
                        )}
                      </div>
                    </div>

                    {/* Skipped Card */}
                    <div className="flex items-center gap-4 bg-red-500 text-white p-4 rounded-lg">
                      <div className="flex-shrink-0 text-center min-w-[120px]">
                        <div className="text-3xl font-bold">
                          {(100 - (selectedServiceArea.funnel?.awareness || 0)).toFixed(1)}%
                        </div>
                        <div className="text-sm font-medium">Skipped</div>
                      </div>
                      <div className="flex-1 text-sm">
                        {selectedServiceArea.funnel?.awareness_metrics ? (
                          <span>
                            <strong>{selectedServiceArea.funnel.awareness_metrics.total - selectedServiceArea.funnel.awareness_metrics.count} out of {selectedServiceArea.funnel.awareness_metrics.total}</strong> residents have no awareness of the service.
                          </span>
                        ) : (
                          <span>Residents with no awareness of the service.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottleneck Analysis */}
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <h4 className="font-semibold text-yellow-800">🤖 AI Analysis: Bottleneck Identified</h4>
                    <p className="text-yellow-700 mt-2">
                      {(() => {
                        const bottleneck = selectedServiceArea.funnel?.bottleneck || 'satisfaction';
                        const awarenessMetrics = selectedServiceArea.funnel?.awareness_metrics;
                        const availmentMetrics = selectedServiceArea.funnel?.availment_metrics;
                        const satisfactionMetrics = selectedServiceArea.funnel?.satisfaction_metrics;
                        
                        if (bottleneck === 'awareness' && awarenessMetrics) {
                          const unaware = awarenessMetrics.total - awarenessMetrics.count;
                          return `The main bottleneck is in awareness. Only ${awarenessMetrics.count} out of ${awarenessMetrics.total} residents know about the service, leaving ${unaware} residents unaware. Focus on information campaigns and outreach programs.`;
                        } else if (bottleneck === 'availment' && availmentMetrics && awarenessMetrics) {
                          const notAvailed = awarenessMetrics.count - availmentMetrics.count;
                          return `The main bottleneck is in availment. While ${awarenessMetrics.count} residents are aware, only ${availmentMetrics.count} actually used the service (${notAvailed} aware residents did not avail). Improve service accessibility and reduce barriers to usage.`;
                        } else if (bottleneck === 'satisfaction' && satisfactionMetrics && availmentMetrics) {
                          const dissatisfied = availmentMetrics.count - satisfactionMetrics.count;
                          return `The main bottleneck is in satisfaction. While ${availmentMetrics.count} residents used the service, a significant portion (${dissatisfied} out of ${availmentMetrics.count}) were not satisfied. Enhance service quality and address user concerns.`;
                        } else {
                          // Fallback for when metrics are not available
                          return (
                            <>
                              The main bottleneck is in <strong>{bottleneck}</strong>.
                              {bottleneck === 'awareness' && ' Focus on information campaigns and outreach programs.'}
                              {bottleneck === 'availment' && ' Improve service accessibility and reduce barriers to usage.'}
                              {bottleneck === 'satisfaction' && ' Enhance service quality and address user concerns.'}
                            </>
                          );
                        }
                      })()}
                    </p>
                    <p className="text-xs text-yellow-600 italic mt-3">
                      Note: AI analysis is experimental and may occasionally produce incorrect or misleading insights. Always cross-reference with the raw data.
                    </p>
                  </div>

                  {/* Conditional Reasons - Unawareness & Non-Availment */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Conditional Insights</h4>
                    {selectedServiceArea.conditionalReasons && 
                     (selectedServiceArea.conditionalReasons.unawarenessReasons?.length > 0 || 
                      selectedServiceArea.conditionalReasons.nonAvailmentReasons?.length > 0) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Unawareness Reasons */}
                        <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                            <span>📢</span> Top Unawareness Reasons
                          </h4>
                          <p className="text-xs text-blue-600 mt-1 mb-3">Why residents don't know about this service</p>
                          {selectedServiceArea.conditionalReasons.unawarenessReasons && selectedServiceArea.conditionalReasons.unawarenessReasons.length > 0 ? (
                            <div className="space-y-2">
                              {selectedServiceArea.conditionalReasons.unawarenessReasons.map((item: {reason: string, count: number}, index: number) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded min-w-[24px] text-center">{index + 1}</span>
                                  <div className="flex-1">
                                    <p className="text-sm text-blue-900">{item.reason}</p>
                                    <p className="text-xs text-blue-600 mt-1">{item.count} {item.count === 1 ? 'mention' : 'mentions'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-blue-700 italic">No unawareness reasons reported by residents.</p>
                          )}
                        </div>

                        {/* Non-Availment Reasons */}
                        <div className="p-4 bg-orange-50 border-l-4 border-orange-400">
                          <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                            <span>🚫</span> Top Non-Availment Reasons
                          </h4>
                          <p className="text-xs text-orange-600 mt-1 mb-3">Why aware residents don't use this service</p>
                          {selectedServiceArea.conditionalReasons.nonAvailmentReasons && selectedServiceArea.conditionalReasons.nonAvailmentReasons.length > 0 ? (
                            <div className="space-y-2">
                              {selectedServiceArea.conditionalReasons.nonAvailmentReasons.map((item: {reason: string, count: number}, index: number) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded min-w-[24px] text-center">{index + 1}</span>
                                  <div className="flex-1">
                                    <p className="text-sm text-orange-900">{item.reason}</p>
                                    <p className="text-xs text-orange-600 mt-1">{item.count} {item.count === 1 ? 'mention' : 'mentions'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-orange-700 italic">No non-availment reasons reported by residents.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-600 text-center">
                          <span className="block mb-2">📊</span>
                          No conditional insights data available for this service area. This typically occurs when:
                        </p>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc list-inside">
                          <li>High awareness and availment rates (residents are already engaged)</li>
                          <li>Survey responses did not include detailed reason fields</li>
                          <li>Data is from synthetic/generated sources without conditional modules</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Top Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Top 3 Citizen Concerns</h3>
                    {selectedServiceArea.funnel?.concerns && selectedServiceArea.funnel.concerns.length > 0 ? (
                      <div className="space-y-2">
                        {selectedServiceArea.funnel.concerns.map((concern: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{index + 1}</span>
                            <span className="text-sm">{concern}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded text-center text-gray-500">
                        <p className="text-sm">No citizen concerns data available yet.</p>
                        <p className="text-xs mt-1">Data will appear once survey responses are collected and analyzed.</p>
                      </div>
                    )}
                  </div>

                  {/* Resident Voice */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Resident Voice</h3>
                    {selectedServiceArea.funnel?.quotes && Object.keys(selectedServiceArea.funnel.quotes).length > 0 ? (
                      <div className="space-y-3">
                        {selectedServiceArea.funnel.quotes.awareness && (
                          <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                            <div className="text-xs font-medium text-blue-600 mb-1">AWARENESS STAGE</div>
                            <p className="text-sm italic">"{selectedServiceArea.funnel.quotes.awareness}"</p>
                          </div>
                        )}
                        {selectedServiceArea.funnel.quotes.availment && (
                          <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                            <div className="text-xs font-medium text-green-600 mb-1">AVAILMENT STAGE</div>
                            <p className="text-sm italic">"{selectedServiceArea.funnel.quotes.availment}"</p>
                          </div>
                        )}
                        {selectedServiceArea.funnel.quotes.satisfaction && (
                          <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                            <div className="text-xs font-medium text-purple-600 mb-1">SATISFACTION STAGE</div>
                            <p className="text-sm italic">"{selectedServiceArea.funnel.quotes.satisfaction}"</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded text-center text-gray-500">
                        <p className="text-sm">No resident feedback available yet.</p>
                        <p className="text-xs mt-1">Quotes from survey responses will appear here once data is collected.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export Options */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Export & Share</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintServiceArea(selectedServiceArea)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Detailed PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareServiceArea(selectedServiceArea)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Analysis
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportServiceAreaCSV(selectedServiceArea)}
                      disabled={!selectedServiceArea}
                      title="Export detailed service area analysis as CSV"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Export Data (CSV)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function ScoreCard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ReportCardContent />
    </Suspense>
  );
}