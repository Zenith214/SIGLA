"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share2, BarChart3, TrendingUp, Users, MapPin } from 'lucide-react';
import Link from 'next/link';

function ReportCardContent() {
  const searchParams = useSearchParams();
  const [barangayData, setBarangayData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      governance: parseInt(searchParams.get('governance') || '0'),
      infrastructure: parseInt(searchParams.get('infrastructure') || '0'),
      social_services: parseInt(searchParams.get('social_services') || '0'),
      economic: parseInt(searchParams.get('economic') || '0'),
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
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
                <h1 className="text-2xl font-bold text-gray-900">{barangayData.barangay} Report Card</h1>
                <p className="text-gray-600">Satisfaction Index Analysis Report</p>
              </div>
            </div>
            <div className="flex gap-2">
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

            {/* BLGU Logo Placeholder */}
            <Card>
              <CardContent className="p-8">
                <div className="border-2 border-gray-200 rounded-xl p-8 text-center bg-gradient-to-br from-blue-50 to-gray-50">
                  <span className="text-xl font-bold text-gray-700">BLGU LOGO</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Category Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'governance', label: 'Governance', score: barangayData.governance },
                    { key: 'infrastructure', label: 'Infrastructure', score: barangayData.infrastructure },
                    { key: 'social_services', label: 'Social Services', score: barangayData.social_services },
                    { key: 'economic', label: 'Economic Development', score: barangayData.economic }
                  ].map((category) => (
                    <div key={category.key} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{category.label}</span>
                        <span className={`font-bold ${category.score >= 58 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            category.score >= 58 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${category.score}%` }}
                        ></div>
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
                <div className="grid grid-cols-2 gap-4 h-80">
                  {/* Maintain */}
                  <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h3 className="text-green-800 font-bold text-base mb-1">MAINTAIN</h3>
                      <span className="text-green-600 font-medium text-xs">High Satisfaction, Low Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-green-800">
                      {[
                        { key: 'governance', label: 'Governance', score: barangayData.governance },
                        { key: 'infrastructure', label: 'Infrastructure', score: barangayData.infrastructure },
                        { key: 'social_services', label: 'Social Services', score: barangayData.social_services },
                        { key: 'economic', label: 'Economic Development', score: barangayData.economic }
                      ].filter(cat => cat.score >= 70).map((category) => (
                        <div key={category.key} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span>{category.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-green-50">
                            {category.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h3 className="text-blue-800 font-bold text-base mb-1">OPPORTUNITIES</h3>
                      <span className="text-blue-600 font-medium text-xs">High Satisfaction, High Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-blue-800">
                      {[
                        { key: 'governance', label: 'Governance', score: barangayData.governance },
                        { key: 'infrastructure', label: 'Infrastructure', score: barangayData.infrastructure },
                        { key: 'social_services', label: 'Social Services', score: barangayData.social_services },
                        { key: 'economic', label: 'Economic Development', score: barangayData.economic }
                      ].filter(cat => cat.score >= 58 && cat.score < 70).map((category) => (
                        <div key={category.key} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span>{category.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-blue-50">
                            {category.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monitor */}
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h3 className="text-yellow-800 font-bold text-base mb-1">MONITOR</h3>
                      <span className="text-yellow-600 font-medium text-xs">Low Satisfaction, Low Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-yellow-800">
                      {[
                        { key: 'governance', label: 'Governance', score: barangayData.governance },
                        { key: 'infrastructure', label: 'Infrastructure', score: barangayData.infrastructure },
                        { key: 'social_services', label: 'Social Services', score: barangayData.social_services },
                        { key: 'economic', label: 'Economic Development', score: barangayData.economic }
                      ].filter(cat => cat.score >= 40 && cat.score < 58).map((category) => (
                        <div key={category.key} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span>{category.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-yellow-50">
                            {category.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fix Now */}
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4">
                    <div className="text-center mb-3">
                      <h3 className="text-red-800 font-bold text-base mb-1">FIX NOW</h3>
                      <span className="text-red-600 font-medium text-xs">Low Satisfaction, High Need for Action</span>
                    </div>
                    <div className="space-y-2 text-xs text-red-800">
                      {[
                        { key: 'governance', label: 'Governance', score: barangayData.governance },
                        { key: 'infrastructure', label: 'Infrastructure', score: barangayData.infrastructure },
                        { key: 'social_services', label: 'Social Services', score: barangayData.social_services },
                        { key: 'economic', label: 'Economic Development', score: barangayData.economic }
                      ].filter(cat => cat.score < 40).map((category) => (
                        <div key={category.key} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2">★</span>
                            <span>{category.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs bg-red-50">
                            {category.score}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Survey Responses Summary */}
            {analyticsData && analyticsData.responses && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Survey Responses ({analyticsData.count})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.responses.slice(0, 5).map((response: any) => (
                      <div key={response.responseId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">Survey #{response.surveyNumber}</div>
                            <div className="text-sm text-gray-500">
                              {response.interviewer.name} | {response.respondent.name}
                            </div>
                          </div>
                          <Badge variant={response.progress === 100 ? 'default' : 'secondary'}>
                            {response.progress}% Complete
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Location: {response.location.address}</div>
                          <div>Completed: {new Date(response.completedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                    {analyticsData.count > 5 && (
                      <div className="text-center text-gray-500 text-sm">
                        ... and {analyticsData.count - 5} more responses
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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