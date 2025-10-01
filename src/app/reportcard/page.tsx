"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Download, Share2, BarChart3, TrendingUp, Users, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';
import './print.css';

function AIInsightsSection({ barangayId }: { barangayId: string }) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (barangayId) {
      fetchMLInsights(barangayId);
    }
  }, [barangayId]);

  const fetchMLInsights = async (id: string) => {
    try {
      const response = await fetch(`/api/ml/insights?barangayId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch ML insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-blue-700">Generating AI insights...</span>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-gray-700 leading-relaxed">
        <p className="mb-4">
          AI-powered analysis is currently unavailable. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="text-gray-700 leading-relaxed">
      <div className="mb-4">
        <h4 className="font-semibold text-blue-900 mb-2">Executive Summary</h4>
        <p className="text-sm">{insights.executive_summary}</p>
      </div>

      {insights.key_insights && insights.key_insights.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
          <div className="space-y-2">
            {insights.key_insights.map((insight: any, index: number) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${insight.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                insight.type === 'success' ? 'bg-green-50 border-green-400' :
                  insight.type === 'urgent' ? 'bg-red-50 border-red-400' :
                    'bg-blue-50 border-blue-400'
                }`}>
                <div className="font-medium text-sm">{insight.title}</div>
                <div className="text-xs mt-1">{insight.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/60 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">
            ML Confidence: {insights.ml_confidence?.toUpperCase() || 'MEDIUM'}
          </span>
          <span className="text-xs text-blue-600">
            Based on {insights.overall_assessment?.total_responses || 0} responses
          </span>
        </div>
        <div className="text-xs text-blue-700">
          Analysis generated on {new Date(insights.timestamp).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function ReportCardContent() {
  const searchParams = useSearchParams();
  const [barangayData, setBarangayData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [commonNeeds, setCommonNeeds] = useState<any>({});
  const [funnelData, setFunnelData] = useState<any>({});
  const [trendsData, setTrendsData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedServiceArea, setSelectedServiceArea] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  useEffect(() => {
    // Get data from URL parameters
    const data = {
      barangay: searchParams.get('barangay') || '',
      barangayId: searchParams.get('barangayId') || '',
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

    // Fetch detailed analytics if barangayId is available
    if (data.barangayId) {
      fetchDetailedAnalytics(data.barangayId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchDetailedAnalytics = async (barangayId: string) => {
    try {
      // First try to get ML-enhanced funnel analysis
      const funnelResponse = await fetch(`/api/funnel-analysis?barangayId=${barangayId}&useML=true`);
      if (funnelResponse.ok) {
        const funnelData = await funnelResponse.json();
        console.log('Funnel analysis data:', funnelData);

        // Process ML-enhanced funnel data
        if (funnelData.ml_enhanced) {
          console.log('Using ML-enhanced funnel analysis');
          processFunnelData(funnelData);
        } else {
          console.log('Using basic funnel analysis');
          processBasicFunnelData(funnelData);
        }
      }

      // Get detailed survey analytics
      const response = await fetch(`/api/survey-analytics?format=detailed&barangayId=${barangayId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.detailed);

        // Extract common needs from survey responses if not already processed by ML
        if (data.detailed.responses && Object.keys(funnelData || {}).length === 0) {
          extractCommonNeeds(data.detailed.responses);
          generateFunnelData(data.detailed.responses);
          generateTrendsData();
        }
      }
    } catch (error) {
      console.error('Failed to fetch detailed analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processFunnelData = (funnelData: any) => {
    // Process ML-enhanced funnel data
    const processedFunnel: any = {};
    const processedTrends: any = {};

    Object.entries(funnelData.service_scores || {}).forEach(([serviceKey, scores]: [string, any]) => {
      processedFunnel[serviceKey] = {
        awareness: scores.awareness || 0,
        availment: scores.availment || 0,
        satisfaction: scores.satisfaction || 0,
        total: funnelData.total_responses || 100,
        concerns: scores.concerns || [],
        quotes: scores.quotes || {},
        bottleneck: scores.bottleneck || 'satisfaction',
        recommendations: scores.recommendations || {}
      };

      // Extract trends from action grid
      if (funnelData.action_grid && funnelData.action_grid[serviceKey]) {
        processedTrends[serviceKey] = funnelData.action_grid[serviceKey].trend || { change: 0, direction: 'up' };
      }
    });

    setFunnelData(processedFunnel);
    setTrendsData(processedTrends);

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
    // Process basic funnel data (fallback)
    console.log('Processing basic funnel data as fallback');
    generateTrendsData();
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
    const funnelByArea: any = {
      financial: { awareness: 0, availment: 0, satisfaction: 0, total: 0 },
      disaster: { awareness: 0, availment: 0, satisfaction: 0, total: 0 },
      safety: { awareness: 0, availment: 0, satisfaction: 0, total: 0 },
      social: { awareness: 0, availment: 0, satisfaction: 0, total: 0 },
      business: { awareness: 0, availment: 0, satisfaction: 0, total: 0 },
      environmental: { awareness: 0, availment: 0, satisfaction: 0, total: 0 }
    };

    // Sample funnel data based on typical patterns
    const sampleFunnelData = {
      financial: {
        awareness: 85, availment: 45, satisfaction: 72, total: responses.length || 100,
        concerns: [
          'Budget transparency needs improvement',
          'Slow processing of financial assistance',
          'Limited information about available programs'
        ],
        quotes: {
          awareness: "I didn't know about the financial assistance programs available.",
          availment: "The application process is too complicated and takes too long.",
          satisfaction: "Good service, but more funding is needed for programs."
        },
        bottleneck: 'availment',
        recommendations: {
          shortTerm: ['Create information campaigns', 'Simplify application forms'],
          mediumTerm: ['Train staff on customer service', 'Digitize application process'],
          longTerm: ['Increase budget allocation', 'Establish satellite offices']
        }
      },
      disaster: {
        awareness: 78, availment: 35, satisfaction: 64, total: responses.length || 100,
        concerns: [
          'Need early warning systems',
          'Insufficient evacuation centers',
          'Lack of emergency supplies'
        ],
        quotes: {
          awareness: "We need more information about disaster preparedness programs.",
          availment: "Emergency response is slow and not well-coordinated.",
          satisfaction: "Response was good but we need better equipment."
        },
        bottleneck: 'availment',
        recommendations: {
          shortTerm: ['Install warning sirens', 'Conduct evacuation drills'],
          mediumTerm: ['Build evacuation centers', 'Train emergency responders'],
          longTerm: ['Establish disaster risk reduction office', 'Upgrade communication systems']
        }
      },
      safety: {
        awareness: 92, availment: 68, satisfaction: 59, total: responses.length || 100,
        concerns: [
          'Poor street lighting',
          'Need more police patrols',
          'Install CCTV cameras'
        ],
        quotes: {
          awareness: "Everyone knows about the safety programs.",
          availment: "Police response is usually quick when called.",
          satisfaction: "Security is okay but needs improvement in some areas."
        },
        bottleneck: 'satisfaction',
        recommendations: {
          shortTerm: ['Increase patrol frequency', 'Fix broken streetlights'],
          mediumTerm: ['Install CCTV systems', 'Establish neighborhood watch'],
          longTerm: ['Build police outpost', 'Upgrade security infrastructure']
        }
      },
      social: {
        awareness: 88, availment: 52, satisfaction: 71, total: responses.length || 100,
        concerns: [
          'Need more healthcare services',
          'Educational support programs',
          'Senior citizen assistance'
        ],
        quotes: {
          awareness: "Most people know about social services available.",
          availment: "Services are available but sometimes hard to access.",
          satisfaction: "Good programs but need more resources and staff."
        },
        bottleneck: 'availment',
        recommendations: {
          shortTerm: ['Extend service hours', 'Add mobile health services'],
          mediumTerm: ['Hire additional staff', 'Expand program coverage'],
          longTerm: ['Build health center', 'Establish scholarship fund']
        }
      },
      business: {
        awareness: 65, availment: 28, satisfaction: 47, total: responses.length || 100,
        concerns: [
          'Complicated permit processes',
          'High fees and requirements',
          'Lack of business support programs'
        ],
        quotes: {
          awareness: "Many don't know about business support programs.",
          availment: "Permit process is too slow and expensive.",
          satisfaction: "Service needs major improvement to help local businesses."
        },
        bottleneck: 'awareness',
        recommendations: {
          shortTerm: ['Launch business awareness campaign', 'Simplify permit forms'],
          mediumTerm: ['Establish one-stop shop', 'Reduce processing time'],
          longTerm: ['Create business incubation center', 'Develop MSME support programs']
        }
      },
      environmental: {
        awareness: 82, availment: 41, satisfaction: 58, total: responses.length || 100,
        concerns: [
          'Poor waste collection',
          'Need more recycling programs',
          'Water quality issues'
        ],
        quotes: {
          awareness: "People know about environmental programs but participation is low.",
          availment: "Waste collection is irregular and unreliable.",
          satisfaction: "Environmental services exist but need better implementation."
        },
        bottleneck: 'availment',
        recommendations: {
          shortTerm: ['Improve waste collection schedule', 'Launch recycling campaign'],
          mediumTerm: ['Add collection vehicles', 'Establish recycling center'],
          longTerm: ['Build waste treatment facility', 'Implement comprehensive environmental program']
        }
      }
    };

    setFunnelData(sampleFunnelData);
  };

  const generateTrendsData = () => {
    // No historical data available yet - this is the baseline survey
    setTrendsData({});
  };

  const handleServiceAreaClick = (category: any) => {
    const funnelInfo = funnelData[category.key] || {};
    const trendInfo = trendsData[category.key] || {};

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
        recommendations: funnelInfo.recommendations || {}
      },
      trend: trendInfo
    });
    setShowServiceModal(true);
  };

  const handleDownloadReport = () => {
    // Generate PDF or print functionality
    window.print();
  };

  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `${barangayData?.barangay} Satisfaction Report`,
        text: `Satisfaction Index Report for ${barangayData?.barangay}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Report URL copied to clipboard!');
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
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
          {/* BLGU Logo - Upper Left */}
          <div className="print:logo-section">
            <div className="print:logo-container">
              <div className="print:logo-placeholder">
                BLGU LOGO
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
          <h1 className="print:main-title">BARANGAY SATISFACTION INDEX REPORT</h1>
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
              Based on the satisfaction data analysis, this barangay shows {isHighSatisfaction ? 'strong performance' : 'areas requiring attention'}
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
              <div className="print:reference-label">Survey Responses</div>
              <div className="print:reference-value">{barangayData.responses || 'N/A'}</div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="bg-white text-slate-800 hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">{barangayData.barangay} Report Card</h1>
                <p className="text-gray-200">Satisfaction Index Analysis Report</p>
              </div>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={() => setShowResponsesModal(true)}>
                <Eye className="w-4 h-4 mr-2" />
                View Responses
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-200">ML Enhanced</span>
              </div>
              <Button variant="outline" onClick={handleShareReport}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <div className="relative group">
                <Button onClick={handleDownloadReport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Detailed PDF Report
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Raw Data (CSV)
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded flex items-center gap-2">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:max-w-none print:px-0 print:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:single-column print:gap-0">
          {/* Left Column - Overview (Web Only) */}
          <div className="lg:col-span-1 space-y-6 print:hidden">
            {/* BLGU Logo */}
            <Card>
              <CardContent className="p-8">
                <div className="border-2 border-gray-200 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-gray-50">
                  <span className="text-xl font-bold text-gray-700">BLGU LOGO</span>
                </div>
              </CardContent>
            </Card>

            {/* Overall Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Overall Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${isHighSatisfaction ? 'text-green-600' : 'text-red-600'}`}>
                    {barangayData.satisfaction}%
                  </div>
                  <Badge variant={isHighSatisfaction ? 'default' : 'destructive'} className="mb-4">
                    {isHighSatisfaction ? 'Good Performance' : 'Needs Improvement'}
                  </Badge>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${isHighSatisfaction ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${barangayData.satisfaction}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Barangay Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Barangay Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Population:</span>
                  <span className="font-medium">{barangayData.population.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Households:</span>
                  <span className="font-medium">{barangayData.households.toLocaleString()}</span>
                </div>
                {barangayData.area > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium">{barangayData.area} km²</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Survey Status:</span>
                  <Badge variant="outline">{barangayData.surveyStatus}</Badge>
                </div>
                {barangayData.responses > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Survey Responses:</span>
                    <span className="font-medium">{barangayData.responses}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Analysis */}
          <div className="lg:col-span-2 space-y-6 print:full-width">
            {/* AI Generative Insight */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 print:section">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <div className="w-2 h-2 bg-blue-500 rounded-full print:hidden"></div>
                  <h2 className="hidden print:show">Key Insights and Recommendations</h2>
                  <span className="print:hidden">🤖 AI-Generated Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <AIInsightsSection barangayId={barangayData.barangayId} />
              </CardContent>
            </Card>

            {/* Service Area Performance */}
            <Card className="print:section print:page-break-before">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 print:hidden" />
                  <h2 className="hidden print:show">Service Area Performance Analysis</h2>
                  <span className="print:hidden">Service Area Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:metric-grid">
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
                      className="p-4 border rounded-lg print:metric-item print:break-inside-avoid cursor-pointer hover:shadow-lg transition-shadow print:cursor-auto print:hover:shadow-none"
                      onClick={() => handleServiceAreaClick(category)}
                    >
                      <div className="mb-3 print:metric-label flex items-center justify-between">
                        <span className="font-medium text-gray-900">{category.label}</span>
                        <div className="flex items-center gap-2 print:hidden">
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                            📊 Baseline Survey
                          </span>
                          <span className="text-xs text-gray-400">Click for details</span>
                        </div>
                      </div>

                      {/* Web Layout - Side by side */}
                      <div className="flex items-start justify-between print:hidden">
                        {/* Donut Chart for Satisfaction */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
                              <span className={`text-sm font-bold ${category.score > 57 ? 'text-green-600' : 'text-red-600'}`}>
                                {category.score}%
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Satisfaction</span>
                        </div>

                        {/* Badge for Need for Action */}
                        <div className="flex flex-col items-center">
                          <div className={`px-3 py-2 rounded-full text-sm font-bold ${category.need < 50
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            }`}>
                            {category.need}%
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Need for Action</span>
                        </div>

                        {/* Common Needs */}
                        <div className="flex-1 ml-4">
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
                              {category.score}%
                            </div>
                            <div className="print:text-sm">Satisfaction</div>
                          </div>
                          <div className="text-center">
                            <div className="print:metric-value text-2xl font-bold mb-1">
                              {category.need}%
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

            {/* Community Voice Section */}
            <Card className="print:section">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h2 className="hidden print:show">Community Voice</h2>
                    <span className="print:hidden">Community Voice</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 print:hidden">
                    📊 Baseline Survey - No Historical Comparison Available
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-800 mb-2">Awareness Issues</h4>
                    <p className="text-sm italic text-blue-700 mb-2">
                      "I didn't know this program exists in our barangay."
                    </p>
                    <p className="text-xs text-blue-600">
                      Common among business and environmental services
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-800 mb-2">Access Challenges</h4>
                    <p className="text-sm italic text-green-700 mb-2">
                      "The application process is too complicated and takes too long."
                    </p>
                    <p className="text-xs text-green-600">
                      Frequent feedback across multiple service areas
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                    <h4 className="font-semibold text-purple-800 mb-2">Service Quality</h4>
                    <p className="text-sm italic text-purple-700 mb-2">
                      "Good service, but it needs more resources and better facilities."
                    </p>
                    <p className="text-xs text-purple-600">
                      Most common satisfaction-related feedback
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Grid */}
            <Card className="print:section print:page-break-before">
              <CardHeader>
                <CardTitle>
                  <h2 className="hidden print:show">Action Priority Matrix</h2>
                  <span className="print:hidden">Action Priority Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 min-h-80 print:action-matrix">
                  {/* Maintain */}
                  <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 min-h-32 print:action-quadrant">
                    <div className="text-center mb-3 print:quadrant-header">
                      <h3 className="text-green-800 font-bold text-base mb-1">MAINTAIN</h3>
                      <span className="text-green-600 font-medium text-xs print:text-sm">High Satisfaction, Low Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-green-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score >= 70 && cat.need <= 30).map((category) => (
                        <div key={category.key} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span className="font-medium">{category.label}</span>
                          </div>
                          <span className="text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden">
                            Baseline
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 min-h-32 print:action-quadrant">
                    <div className="text-center mb-3 print:quadrant-header">
                      <h3 className="text-blue-800 font-bold text-base mb-1">OPPORTUNITIES</h3>
                      <span className="text-blue-600 font-medium text-xs print:text-sm">High Satisfaction, High Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-blue-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score >= 70 && cat.need > 30).map((category) => (
                        <div key={category.key} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span className="font-medium">{category.label}</span>
                          </div>
                          <span className="text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden">
                            Baseline
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monitor */}
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 min-h-32 print:action-quadrant">
                    <div className="text-center mb-3 print:quadrant-header">
                      <h3 className="text-yellow-800 font-bold text-base mb-1">MONITOR</h3>
                      <span className="text-yellow-600 font-medium text-xs print:text-sm">Low Satisfaction, Low Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-yellow-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score < 70 && cat.need <= 30).map((category) => (
                        <div key={category.key} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span className="font-medium">{category.label}</span>
                          </div>
                          <span className="text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden">
                            Baseline
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fix Now */}
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 min-h-32 print:action-quadrant">
                    <div className="text-center mb-3 print:quadrant-header">
                      <h3 className="text-red-800 font-bold text-base mb-1">FIX NOW</h3>
                      <span className="text-red-600 font-medium text-xs print:text-sm">Low Satisfaction, High Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-red-800">
                      {[
                        { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                        { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                        { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                        { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                        { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                        { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                      ].filter(cat => cat.score < 70 && cat.need > 30).map((category) => (
                        <div key={category.key} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span className="font-medium">{category.label}</span>
                          </div>
                          <span className="text-xs px-1 py-0.5 rounded bg-gray-200 text-gray-600 print:hidden">
                            Baseline
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                Survey Responses - {barangayData?.barangay}
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
                          <div className="text-sm text-gray-500">
                            Interviewer: {response.interviewer?.name || 'Unknown Interviewer'}
                          </div>
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
                  No survey responses available for this barangay.
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
                <span className="text-sm px-2 py-1 rounded ml-2 bg-gray-100 text-gray-700">
                  📊 Baseline Survey Data
                </span>
              </DialogTitle>
            </DialogHeader>

            {selectedServiceArea && (
              <div className="space-y-6">
                {/* Funnel Visualization */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Service Funnel Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="bg-blue-500 text-white p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold">{selectedServiceArea.funnel?.awareness || 0}%</div>
                        <div className="text-sm">Awareness</div>
                      </div>
                      <div className="text-xs text-gray-600">Know about the service</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-500 text-white p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold">{selectedServiceArea.funnel?.availment || 0}%</div>
                        <div className="text-sm">Availment</div>
                      </div>
                      <div className="text-xs text-gray-600">Actually used the service</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-500 text-white p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold">{selectedServiceArea.score || 0}%</div>
                        <div className="text-sm">Satisfaction</div>
                      </div>
                      <div className="text-xs text-gray-600">Satisfied with service</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-red-500 text-white p-4 rounded-lg mb-2">
                        <div className="text-2xl font-bold">
                          {100 - (selectedServiceArea.funnel?.awareness || 0)}%
                        </div>
                        <div className="text-sm">Skipped</div>
                      </div>
                      <div className="text-xs text-gray-600">No awareness</div>
                    </div>
                  </div>

                  {/* Bottleneck Analysis */}
                  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <h4 className="font-semibold text-yellow-800">🤖 AI Analysis: Bottleneck Identified</h4>
                    <p className="text-yellow-700 mt-1">
                      The main bottleneck is in <strong>{selectedServiceArea.funnel?.bottleneck}</strong>.
                      {selectedServiceArea.funnel?.bottleneck === 'awareness' && ' Focus on information campaigns and outreach programs.'}
                      {selectedServiceArea.funnel?.bottleneck === 'availment' && ' Improve service accessibility and reduce barriers to usage.'}
                      {selectedServiceArea.funnel?.bottleneck === 'satisfaction' && ' Enhance service quality and address user concerns.'}
                    </p>
                  </div>
                </div>

                {/* Top Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Top 3 Citizen Concerns</h3>
                    <div className="space-y-2">
                      {selectedServiceArea.funnel?.concerns?.map((concern: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{index + 1}</span>
                          <span className="text-sm">{concern}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resident Voice */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Resident Voice</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                        <div className="text-xs font-medium text-blue-600 mb-1">AWARENESS STAGE</div>
                        <p className="text-sm italic">"{selectedServiceArea.funnel?.quotes?.awareness}"</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <div className="text-xs font-medium text-green-600 mb-1">AVAILMENT STAGE</div>
                        <p className="text-sm italic">"{selectedServiceArea.funnel?.quotes?.availment}"</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                        <div className="text-xs font-medium text-purple-600 mb-1">SATISFACTION STAGE</div>
                        <p className="text-sm italic">"{selectedServiceArea.funnel?.quotes?.satisfaction}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">🎯 AI-Generated Action Roadmap</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Short-term (0-3 months)</h4>
                      <ul className="space-y-1 text-sm">
                        {selectedServiceArea.funnel?.recommendations?.shortTerm?.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-semibold text-yellow-800 mb-2">Medium-term (6-12 months)</h4>
                      <ul className="space-y-1 text-sm">
                        {selectedServiceArea.funnel?.recommendations?.mediumTerm?.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Long-term (1+ year)</h4>
                      <ul className="space-y-1 text-sm">
                        {selectedServiceArea.funnel?.recommendations?.longTerm?.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Export Options */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Export & Share</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Detailed PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Infographic
                    </Button>
                    <Button variant="outline" size="sm">
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

export default function ReportCard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ReportCardContent />
    </Suspense>
  );
}