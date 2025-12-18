/**
 * Conditional Insights Chart Component
 * 
 * Displays analytics for unawareness and non-availment reasons
 * with interactive charts and detailed breakdowns.
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, BarChart3, PieChart, TrendingDown, TrendingUp } from 'lucide-react';

interface ConditionalInsightsData {
  summary: {
    totalUnawarenessResponses: number;
    totalNonAvailmentResponses: number;
    serviceStats: Record<string, { unawareness: number; nonAvailment: number }>;
    responseRate: {
      unawareness: number;
      nonAvailment: number;
    };
  };
  unawarenessAnalytics: {
    overallReasons: Record<string, number>;
    byService: Record<string, Record<string, number>>;
    topReasons: Array<{ reason: string; count: number }>;
  };
  nonAvailmentAnalytics: {
    overallReasons: Record<string, number>;
    byService: Record<string, Record<string, number>>;
    topReasons: Array<{ reason: string; count: number }>;
  };
  totalResponses: number;
}

interface ConditionalInsightsChartProps {
  barangayId?: number;
  cycleId?: number;
  serviceArea?: string;
}

export function ConditionalInsightsChart({ 
  barangayId, 
  cycleId, 
  serviceArea 
}: ConditionalInsightsChartProps) {
  const [data, setData] = useState<ConditionalInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConditionalInsights();
  }, [barangayId, cycleId, serviceArea]);

  const fetchConditionalInsights = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (barangayId) params.append('barangayId', barangayId.toString());
      if (cycleId) params.append('cycleId', cycleId.toString());
      if (serviceArea) params.append('serviceArea', serviceArea);

      const response = await fetch(`/api/analytics/conditional-insights?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching conditional insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-gray-500">
            No conditional insights data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold">{data.totalResponses}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unawareness Cases</p>
                <p className="text-2xl font-bold text-red-600">{data.summary.totalUnawarenessResponses}</p>
                <p className="text-xs text-gray-500">
                  {data.summary.responseRate.unawareness.toFixed(1)}% of responses
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Availment Cases</p>
                <p className="text-2xl font-bold text-orange-600">{data.summary.totalNonAvailmentResponses}</p>
                <p className="text-xs text-gray-500">
                  {data.summary.responseRate.nonAvailment.toFixed(1)}% of responses
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Analyzed</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.keys(data.summary.serviceStats).length}
                </p>
              </div>
              <PieChart className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="unawareness" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unawareness">Unawareness Reasons</TabsTrigger>
          <TabsTrigger value="non-availment">Non-Availment Reasons</TabsTrigger>
        </TabsList>

        <TabsContent value="unawareness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Top Reasons for Unawareness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.unawarenessAnalytics.topReasons.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.count} responses</Badge>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(item.count / data.summary.totalUnawarenessResponses) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service-specific breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Unawareness by Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.unawarenessAnalytics.byService).map(([serviceId, reasons]) => (
                  <div key={serviceId} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 capitalize">{serviceId.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div className="space-y-2">
                      {Object.entries(reasons).map(([reason, count]) => (
                        <div key={reason} className="flex justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{reason}</span>
                          <Badge variant="outline" className="text-xs">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="non-availment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Top Reasons for Non-Availment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.nonAvailmentAnalytics.topReasons.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.count} responses</Badge>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(item.count / data.summary.totalNonAvailmentResponses) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Service-specific breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Non-Availment by Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.nonAvailmentAnalytics.byService).map(([serviceId, reasons]) => (
                  <div key={serviceId} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 capitalize">{serviceId.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div className="space-y-2">
                      {Object.entries(reasons).map(([reason, count]) => (
                        <div key={reason} className="flex justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{reason}</span>
                          <Badge variant="outline" className="text-xs">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}