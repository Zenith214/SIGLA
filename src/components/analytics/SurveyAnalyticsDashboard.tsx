'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  const [filters, setFilters] = useState({
    barangayId: '',
    startDate: '',
    endDate: '',
    section: ''
  })

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
    if (!analyticsData.export?.data) {
      fetchAnalytics('export').then(() => {
        // CSV export logic would go here
        console.log('Export data ready for CSV download')
      })
      return
    }
    
    // Convert to CSV and download
    const csvContent = convertToCSV(analyticsData.export.data)
    downloadCSV(csvContent, 'survey-data.csv')
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
          <p className="text-gray-600">Analyze survey responses and generate insights</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => fetchAnalytics(activeView)} disabled={loading}>
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
        <Card>
          <CardHeader>
            <CardTitle>Detailed Survey Responses ({analyticsData.detailed.count})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.detailed.responses?.slice(0, 10).map((response) => (
                <div key={response.responseId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">Survey #{response.surveyNumber}</div>
                      <div className="text-sm text-gray-500">
                        {response.barangay.name} | {response.interviewer.name}
                      </div>
                    </div>
                    <Badge variant={response.progress === 100 ? 'default' : 'secondary'}>
                      {response.progress}% Complete
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <div>Respondent: {response.respondent.name}</div>
                    <div>Location: {response.location.address}</div>
                    <div>Completed: {new Date(response.completedAt).toLocaleDateString()}</div>
                    <div>Sections: {response.sections?.map((s: any) => s.key).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.aggregated.questions || {}).slice(0, 5).map(([key, question]: [string, any]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="font-medium mb-2">{key}</div>
                    <div className="text-sm text-gray-500 mb-2">
                      {question.responses?.length} responses
                    </div>
                    {question.statistics && (
                      <div className="text-sm">
                        <div>Mean: {question.statistics.mean?.toFixed(2)}</div>
                        <div>Range: {question.statistics.min} - {question.statistics.max}</div>
                      </div>
                    )}
                    {question.valueCount && (
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">Value Distribution:</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(question.valueCount).slice(0, 5).map(([value, count]: [string, any]) => (
                            <Badge key={value} variant="outline" className="text-xs">
                              {value}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
              </div>
              
              {analyticsData.export && (
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
              
              <Button onClick={exportToCSV} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}