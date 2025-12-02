'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Users, Target, MapPin, Award } from 'lucide-react'
import { useActiveCycle } from '@/hooks/useSurveyCycle'
import { fetchWithCache } from '@/utils/analyticsCache'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DashboardSummaryData {
  kpis: {
    overallSatisfaction: number
    overallNeedForAction: number
    totalResponses: number
    targetResponses: number
    barangaysCovered: number
    totalBarangays: number
  }
  leaderboard: {
    top5: Array<{
      barangayId: number
      barangayName: string
      satisfaction: number
      trend: 'up' | 'down' | 'stable'
    }>
    bottom5: Array<{
      barangayId: number
      barangayName: string
      satisfaction: number
      trend: 'up' | 'down' | 'stable'
    }>
  }
  trendData: Array<{
    cycleName: string
    cycleYear: number
    avgSatisfaction: number
  }>
  serviceAreaPerformance: Array<{
    serviceArea: string
    avgSatisfaction: number
  }>
}

export default function DashboardSummaryView() {
  const { activeCycle, hasActiveCycle } = useActiveCycle()
  const [data, setData] = useState<DashboardSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasActiveCycle) {
      fetchDashboardSummary()
    }
  }, [hasActiveCycle, activeCycle])

  const fetchDashboardSummary = async () => {
    setLoading(true)
    try {
      // Use cached fetch with 5-minute TTL
      const result = await fetchWithCache<DashboardSummaryData>(
        '/api/analytics/dashboard-summary',
        { cycleId: activeCycle?.cycle_id },
        { ttl: 5 * 60 * 1000 } // 5 minutes
      )
      console.log('[Dashboard Summary] Received data:', result)
      setData(result)
    } catch (error) {
      console.error('[Dashboard Summary] Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data available. Please ensure surveys have been completed.
      </div>
    )
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Satisfaction</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {data.kpis.overallSatisfaction.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              System-wide average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need for Action</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {data.kpis.overallNeedForAction.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responses vs Target</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.kpis.totalResponses} / {data.kpis.targetResponses}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((data.kpis.totalResponses / data.kpis.targetResponses) * 100, 100)}%`
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barangays Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.kpis.barangaysCovered} / {data.kpis.totalBarangays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((data.kpis.barangaysCovered / data.kpis.totalBarangays) * 100).toFixed(0)}% coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barangay Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Barangay Leaderboard</CardTitle>
          <p className="text-sm text-gray-500">Top 5 and Bottom 5 performing barangays by Overall Satisfaction</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 */}
            <div>
              <h3 className="text-sm font-semibold text-green-700 mb-3">Top 5 Performers</h3>
              <div className="space-y-2">
                {data.leaderboard.top5.map((barangay, index) => (
                  <div
                    key={`top-${barangay.barangayId}-${index}`}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{barangay.barangayName}</div>
                        <div className="text-sm text-gray-600">{barangay.satisfaction.toFixed(1)}% satisfaction</div>
                      </div>
                    </div>
                    {getTrendIcon(barangay.trend)}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom 5 */}
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-3">Bottom 5 Performers</h3>
              <div className="space-y-2">
                {data.leaderboard.bottom5.map((barangay, index) => (
                  <div
                    key={`bottom-${barangay.barangayId}-${index}`}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-600 text-white rounded-full font-bold text-sm">
                        {data.kpis.totalBarangays - 4 + index}
                      </div>
                      <div>
                        <div className="font-medium">{barangay.barangayName}</div>
                        <div className="text-sm text-gray-600">{barangay.satisfaction.toFixed(1)}% satisfaction</div>
                      </div>
                    </div>
                    {getTrendIcon(barangay.trend)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System-Wide Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>System-Wide Satisfaction Trend</CardTitle>
            <p className="text-sm text-gray-500">Average satisfaction across all survey cycles</p>
          </CardHeader>
          <CardContent>
            {data.trendData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-2">📊</p>
                  <p>No historical data available</p>
                  <p className="text-sm">Complete surveys to see trends</p>
                </div>
              </div>
            ) : (
              <Line
                data={{
                  labels: data.trendData.map(d => `${d.cycleName} (${d.cycleYear})`),
                  datasets: [
                    {
                      label: 'Overall Satisfaction %',
                      data: data.trendData.map(d => d.avgSatisfaction),
                      borderColor: 'rgb(59, 130, 246)',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      fill: true,
                      tension: 0.4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`
                      }
                    }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Service Area Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Service Area Performance</CardTitle>
            <p className="text-sm text-gray-500">Average satisfaction by service area</p>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: data.serviceAreaPerformance.map(s => s.serviceArea),
                datasets: [
                  {
                    label: 'Satisfaction %',
                    data: data.serviceAreaPerformance.map(s => s.avgSatisfaction),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
