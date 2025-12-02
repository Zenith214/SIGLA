'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp, 
  Users, 
  MapPin,
  FileText,
  Calendar
} from 'lucide-react'
import { useActiveCycle } from '@/hooks/useSurveyCycle'
import { CycleDisplay } from '@/components/survey-cycle'
import DetailedResponsesView from './DetailedResponsesView'

interface AnalyticsData {
  summary?: {
    totalResponses: number
    averageProgress: number
    barangayStats: Array<{
      barangayId: number
      barangayName: string
      population: number
      households: number
      responses: number
    }>
    timeSeriesData: Array<{
      date: string
      count: number
    }>
  }
  detailed?: {
    responses: any[]
    count: number
  }
  aggregated?: {
    sections: Record<string, any>
    questions: Record<string, any>
    totalResponses: number
  }
  export?: {
    data: any[]
    count: number
    columns: string[]
  }
}

export default function SurveyAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState<'summary' | 'detailed' | 'aggregated' | 'export'>('summary')
  const [activeSectionTab, setActiveSectionTab] = useState('all')
  const [filters, setFilters] = useState({
    barangayId: '',
    startDate: '',
    endDate: '',
    section: ''
  })
  const { activeCycle, hasActiveCycle, loading: cycleLoading } = useActiveCycle()

  const fetchAnalytics = async (format: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ format })
      
      // Add filters if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/survey-analytics?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setAnalyticsData(prev => ({ ...prev, [format]: data[format] }))
      } else {
        console.error('Analytics API error:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics('summary')
  }, [])

  const handleViewChange = (view: typeof activeView) => {
    setActiveView(view)
    if (!analyticsData[view]) {
      fetchAnalytics(view)
    }
  }

  const exportToCSV = () => {
    if (!hasActiveCycle) {
      console.warn('Cannot export: No active survey cycle')
      return
    }

    if (!analyticsData.export?.data) {
      fetchAnalytics('export').then(() => {
        // CSV export logic would go here
        console.log('Export data ready for CSV download')
      })
      return
    }
    
    // Convert to CSV and download with cycle information in filename
    const csvContent = convertToCSV(analyticsData.export.data)
    const filename = `survey-data-${activeCycle?.name?.replace(/\s+/g, '-')}-${activeCycle?.year}.csv`
    downloadCSV(csvContent, filename)
  }

  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        }).join(',')
      )
    ]
    
    return csvRows.join('\n')
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Survey Analytics</h1>
          <p className="text-gray-600">
            Analyze survey responses and generate insights
            {hasActiveCycle && ` for ${activeCycle?.name} (${activeCycle?.year})`}
          </p>
          <div className="mt-2 flex items-center gap-4">
            {hasActiveCycle && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">Active Cycle:</span>
                <CycleDisplay />
              </div>
            )}
            {!hasActiveCycle && !cycleLoading && (
              <div className="text-sm text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-md">
                ⚠️ No active survey cycle - Contact admin to set up a cycle
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportToCSV} 
            variant="outline"
            disabled={!hasActiveCycle}
            title={!hasActiveCycle ? "No active cycle to export data from" : "Export data from active cycle"}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV {hasActiveCycle && `(${activeCycle?.name})`}
          </Button>
          <Button 
            onClick={() => fetchAnalytics(activeView)} 
            disabled={loading || !hasActiveCycle}
            title={!hasActiveCycle ? "No active cycle to refresh data from" : "Refresh data from active cycle"}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { key: 'summary', label: 'Summary', icon: BarChart3 },
          { key: 'detailed', label: 'Detailed', icon: FileText },
          { key: 'aggregated', label: 'Aggregated', icon: TrendingUp },
          { key: 'export', label: 'Export', icon: Download }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeView === key ? 'default' : 'ghost'}
            onClick={() => handleViewChange(key as typeof activeView)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Summary View */}
      {activeView === 'summary' && analyticsData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.summary.totalResponses}</div>
              <p className="text-xs text-muted-foreground">Unique respondents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.summary.averageProgress?.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Barangays Covered</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.summary.barangayStats?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.summary.timeSeriesData?.slice(-1)[0]?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          {/* Barangay Statistics */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Responses by Barangay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.summary.barangayStats?.map((barangay) => (
                  <div key={barangay.barangayId} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{barangay.barangayName}</div>
                      <div className="text-sm text-gray-500">
                        Population: {barangay.population?.toLocaleString()} | 
                        Households: {barangay.households?.toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="secondary">{barangay.responses} responses</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed View */}
      {activeView === 'detailed' && analyticsData.detailed && (
        <DetailedResponsesView 
          responses={analyticsData.detailed.responses || []}
          totalCount={analyticsData.detailed.count || 0}
        />
      )}

      {/* Aggregated View */}
      {activeView === 'aggregated' && analyticsData.aggregated && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Completion Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.aggregated.sections || {}).map(([key, section]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-gray-500">
                        {section.completedResponses} / {section.totalResponses} completed
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {((section.completedResponses / section.totalResponses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question Response Analysis</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Browse questions by service area
              </p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeSectionTab} onValueChange={setActiveSectionTab}>
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="disaster">Disaster</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="business">Business</TabsTrigger>
                  <TabsTrigger value="environmental">Environment</TabsTrigger>
                </TabsList>

                {['all', 'financial', 'disaster', 'safety', 'social', 'business', 'environmental'].map((section) => {
                  const filteredQuestions = Object.entries(analyticsData.aggregated?.questions || {})
                    .filter(([key]) => section === 'all' || key.startsWith(section + '_'))
                  
                  return (
                    <TabsContent key={section} value={section} className="space-y-4">
                      {filteredQuestions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No questions found for this section
                        </div>
                      ) : (
                        <>
                          {filteredQuestions.map(([key, question]: [string, any]) => (
                            <div key={key} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-medium text-lg">
                                    {question.questionLabel || key}
                                  </div>
                                  {question.sectionName && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {question.sectionName}
                                      {question.questionType && (
                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                          {question.questionType}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {question.description && (
                                    <div className="text-sm text-gray-600 mt-1 italic">
                                      {question.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 mb-2">
                                {question.responses?.length} responses
                              </div>
                              {question.statistics && (
                                <div className="text-sm bg-gray-50 p-3 rounded">
                                  <div className="font-medium mb-1">Statistics:</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>Mean: <span className="font-semibold">{question.statistics.mean?.toFixed(2)}</span></div>
                                    <div>Median: <span className="font-semibold">{question.statistics.median?.toFixed(2)}</span></div>
                                    <div>Min: <span className="font-semibold">{question.statistics.min}</span></div>
                                    <div>Max: <span className="font-semibold">{question.statistics.max}</span></div>
                                  </div>
                                </div>
                              )}
                              {question.valueCount && (
                                <div className="mt-2">
                                  <div className="text-sm font-medium mb-1">Value Distribution:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(question.valueCount)
                                      .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
                                      .map(([value, count]: [string, any]) => (
                                        <Badge key={value} variant="outline" className="text-xs">
                                          {value}: {count}
                                        </Badge>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          <div className="text-sm text-gray-500 text-center py-2">
                            Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                          </div>
                        </>
                      )}
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export View */}
      {activeView === 'export' && (
        <Card>
          <CardHeader>
            <CardTitle>Export Survey Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Export survey data in CSV format for external analysis tools.
                {hasActiveCycle && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <div className="font-medium text-blue-900">Export will include data from:</div>
                    <div className="text-blue-700 mt-1">
                      <CycleDisplay />
                    </div>
                  </div>
                )}
              </div>
              
              {!hasActiveCycle && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <div className="text-sm text-amber-800">
                    <div className="font-medium">⚠️ No Active Survey Cycle</div>
                    <div className="mt-1">
                      Cannot export data without an active survey cycle. Contact your administrator to set up a cycle.
                    </div>
                  </div>
                </div>
              )}
              
              {analyticsData.export && hasActiveCycle && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm">
                    <div>Records available: {analyticsData.export.count}</div>
                    <div>Columns: {analyticsData.export.columns?.length}</div>
                    <div className="mt-2">
                      Sample columns: {analyticsData.export.columns?.slice(0, 5).join(', ')}
                      {analyticsData.export.columns?.length > 5 && '...'}
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={exportToCSV} 
                className="w-full"
                disabled={!hasActiveCycle}
              >
                <Download className="w-4 h-4 mr-2" />
                {hasActiveCycle 
                  ? `Download CSV Export (${activeCycle?.name})` 
                  : 'Download CSV Export (No Active Cycle)'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}