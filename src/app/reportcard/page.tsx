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

function ReportCardContent() {
  const searchParams = useSearchParams();
  const [barangayData, setBarangayData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showResponsesModal, setShowResponsesModal] = useState(false);

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
      const response = await fetch(`/api/survey-analytics?format=detailed&barangayId=${barangayId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.detailed);
      }
    } catch (error) {
      console.error('Failed to fetch detailed analytics:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Header */}
      <div className="bg-slate-800 shadow-sm border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
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
              <Button variant="outline" onClick={handleShareReport}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Overview */}
          <div className="lg:col-span-1 space-y-6">
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
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isHighSatisfaction ? 'bg-green-500' : 'bg-red-500'
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
          <div className="lg:col-span-2 space-y-6">
            {/* AI Generative Insight */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  AI Generative Insight
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-gray-700 leading-relaxed">
                  <p className="mb-4">
                    This section will display AI-generated insights and recommendations based on the barangay data, powered by Gemini AI.
                  </p>
                  <div className="bg-white/60 rounded-lg p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 italic">
                      🤖 AI-powered analysis and recommendations will appear here once the integration is complete.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Area Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Service Area Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'financial', label: 'Financial Administration', score: barangayData.financial, need: barangayData.financial_need },
                    { key: 'disaster', label: 'Disaster Preparedness', score: barangayData.disaster, need: barangayData.disaster_need },
                    { key: 'safety', label: 'Safety & Peace Order', score: barangayData.safety, need: barangayData.safety_need },
                    { key: 'social', label: 'Social Protection', score: barangayData.social, need: barangayData.social_need },
                    { key: 'business', label: 'Business Friendliness', score: barangayData.business, need: barangayData.business_need },
                    { key: 'environmental', label: 'Environmental Management', score: barangayData.environmental, need: barangayData.environmental_need }
                  ].map((category) => (
                    <div key={category.key} className="p-4 border rounded-lg">
                      <div className="mb-3">
                        <span className="font-medium text-gray-900">{category.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
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
                          <div className={`px-3 py-2 rounded-full text-sm font-bold ${
                            category.need < 50
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          }`}>
                            {category.need}%
                          </div>
                          <span className="text-xs text-gray-500 mt-1">Need for Action</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Action Priority Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 min-h-80">
                  {/* Maintain */}
                  <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 min-h-32">
                    <div className="text-center mb-3">
                      <h3 className="text-green-800 font-bold text-base mb-1">MAINTAIN</h3>
                      <span className="text-green-600 font-medium text-xs">High Satisfaction, Low Need for Action</span>
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 min-h-32">
                    <div className="text-center mb-3">
                      <h3 className="text-blue-800 font-bold text-base mb-1">OPPORTUNITIES</h3>
                      <span className="text-blue-600 font-medium text-xs">High Satisfaction, High Need for Action</span>
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monitor */}
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 min-h-32">
                    <div className="text-center mb-3">
                      <h3 className="text-yellow-800 font-bold text-base mb-1">MONITOR</h3>
                      <span className="text-yellow-600 font-medium text-xs">Low Satisfaction, Low Need for Action</span>
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fix Now */}
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 min-h-32">
                    <div className="text-center mb-3">
                      <h3 className="text-red-800 font-bold text-base mb-1">FIX NOW</h3>
                      <span className="text-red-600 font-medium text-xs">Low Satisfaction, High Need for Action</span>
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
                          {response.interviewer?.name || 'Unknown Interviewer'} | {response.respondent?.name || 'Anonymous'}
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