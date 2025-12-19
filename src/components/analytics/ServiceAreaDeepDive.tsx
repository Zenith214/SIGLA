'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useActiveCycle } from '@/hooks/useSurveyCycle'
import { TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react'

interface ServiceAreaData {
  barangayId: number
  barangayName: string
  awareness: number
  availment: number
  satisfaction: number
  needForAction: number
  responseCount: number
  trend: 'up' | 'down' | 'stable'
  unawarenessReasons?: Array<{ reason: string; count: number }>
  nonAvailmentReasons?: Array<{ reason: string; count: number }>
}

const SERVICE_AREAS = [
  { key: 'financial', label: 'Financial Administration' },
  { key: 'disaster', label: 'Disaster Preparedness' },
  { key: 'safety', label: 'Safety & Peace Order' },
  { key: 'social', label: 'Social Protection' },
  { key: 'business', label: 'Business Friendliness' },
  { key: 'environmental', label: 'Environmental Management' }
]

export default function ServiceAreaDeepDive() {
  const { activeCycle, hasActiveCycle } = useActiveCycle()
  const [selectedServiceArea, setSelectedServiceArea] = useState('financial')
  const [data, setData] = useState<ServiceAreaData[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (hasActiveCycle && selectedServiceArea) {
      fetchServiceAreaData()
    }
  }, [hasActiveCycle, selectedServiceArea])

  const fetchServiceAreaData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        serviceArea: selectedServiceArea,
        cycleId: activeCycle?.cycle_id?.toString() || ''
      })

      const response = await fetch(`/api/analytics/service-area-deep-dive?${params}`)
      if (response.ok) {
        const result = await response.json()
        console.log('[ServiceAreaDeepDive] API Response:', result)
        console.log('[ServiceAreaDeepDive] First barangay data:', result.rankings?.[0])
        setData(result.rankings || [])
      }
    } catch (error) {
      console.error('Failed to fetch service area data:', error)
    } finally {
      setLoading(false)
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50'
    if (score >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // Aggregate all unawareness reasons across barangays
  const aggregateUnawarenessReasons = () => {
    const reasonCounts: Record<string, number> = {}
    data.forEach(barangay => {
      barangay.unawarenessReasons?.forEach(item => {
        reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + item.count
      })
    })
    return Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }))
  }

  // Aggregate all non-availment reasons across barangays
  const aggregateNonAvailmentReasons = () => {
    const reasonCounts: Record<string, number> = {}
    data.forEach(barangay => {
      barangay.nonAvailmentReasons?.forEach(item => {
        reasonCounts[item.reason] = (reasonCounts[item.reason] || 0) + item.count
      })
    })
    return Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }))
  }

  return (
    <div className="space-y-6">
      {/* Service Area Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Service Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SERVICE_AREAS.map((area) => (
              <Button
                key={area.key}
                variant={selectedServiceArea === area.key ? 'default' : 'outline'}
                onClick={() => setSelectedServiceArea(area.key)}
                className="justify-start"
              >
                {area.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Barangay Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {SERVICE_AREAS.find(a => a.key === selectedServiceArea)?.label} - Barangay Rankings
          </CardTitle>
          <p className="text-sm text-gray-500">
            Ranked by satisfaction score
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No data available for this service area
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Barangay</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Awareness %</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Availment %</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Satisfaction %</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Need for Action %</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Responses</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((barangay, index) => (
                    <tr key={barangay.barangayId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{barangay.barangayName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-medium ${getScoreColor(barangay.awareness)}`}>
                          {barangay.awareness.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-medium ${getScoreColor(barangay.availment)}`}>
                          {barangay.availment.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-medium ${getScoreColor(barangay.satisfaction)}`}>
                          {barangay.satisfaction.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full font-medium ${
                          barangay.needForAction >= 70 ? 'text-red-600 bg-red-50' :
                          barangay.needForAction >= 50 ? 'text-yellow-600 bg-yellow-50' :
                          'text-green-600 bg-green-50'
                        }`}>
                          {barangay.needForAction.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600">
                        {barangay.responseCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getTrendIcon(barangay.trend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conditional Insights Cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unawareness Reasons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Top Unawareness Reasons</CardTitle>
              <p className="text-sm text-gray-500">
                Why residents are unaware of this service
              </p>
            </CardHeader>
            <CardContent>
              {aggregateUnawarenessReasons().length > 0 ? (
                <div className="space-y-3">
                  {aggregateUnawarenessReasons().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium">{item.reason}</span>
                      </div>
                      <Badge variant="secondary">{item.count} responses</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No unawareness data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Non-Availment Reasons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Top Non-Availment Reasons</CardTitle>
              <p className="text-sm text-gray-500">
                Why residents didn't avail of this service
              </p>
            </CardHeader>
            <CardContent>
              {aggregateNonAvailmentReasons().length > 0 ? (
                <div className="space-y-3">
                  {aggregateNonAvailmentReasons().map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 rounded-full font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium">{item.reason}</span>
                      </div>
                      <Badge variant="secondary">{item.count} responses</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No non-availment data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Grid Visualization */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Action Grid - Priority Matrix</CardTitle>
            <p className="text-sm text-gray-500">
              Barangays plotted by Satisfaction vs Need for Action
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-96 border border-gray-300 rounded-lg bg-gradient-to-br from-red-50 via-yellow-50 to-green-50">
              {/* Grid quadrants */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                <div className="border-r border-b border-gray-300 flex items-center justify-center text-xs text-gray-500 font-medium">
                  Monitor
                </div>
                <div className="border-b border-gray-300 flex items-center justify-center text-xs text-green-700 font-medium">
                  Maintain
                </div>
                <div className="border-r border-gray-300 flex items-center justify-center text-xs text-red-700 font-medium">
                  Fix Now
                </div>
                <div className="flex items-center justify-center text-xs text-yellow-700 font-medium">
                  Opportunities
                </div>
              </div>

              {/* Plot barangays */}
              {data.map((barangay) => {
                const x = barangay.satisfaction
                const y = 100 - barangay.needForAction
                return (
                  <div
                    key={barangay.barangayId}
                    className="absolute w-3 h-3 bg-blue-600 rounded-full cursor-pointer hover:scale-150 transition-transform"
                    style={{
                      left: `${x}%`,
                      bottom: `${y}%`,
                      transform: 'translate(-50%, 50%)'
                    }}
                    title={`${barangay.barangayName}: ${barangay.satisfaction.toFixed(1)}% satisfaction, ${barangay.needForAction.toFixed(1)}% need action`}
                  />
                )
              })}

              {/* Axis labels */}
              <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-gray-600 pb-1">
                Satisfaction % →
              </div>
              <div className="absolute top-0 bottom-0 left-0 flex items-center text-xs text-gray-600 pl-1" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                ← Need for Action %
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
