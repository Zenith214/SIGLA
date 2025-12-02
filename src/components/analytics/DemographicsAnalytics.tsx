'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useActiveCycle } from '@/hooks/useSurveyCycle'
import { fetchWithCache } from '@/utils/analyticsCache'
import { dualAxisChartOptions, pieChartOptions, colorPalettes, getChartAriaLabel } from '@/utils/chartConfig'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DemographicData {
  ageDistribution: Array<{ ageGroup: string, count: number, satisfaction: number }>
  genderDistribution: Array<{ gender: string, count: number, satisfaction: number }>
  incomeDistribution: Array<{ incomeRange: string, count: number, satisfaction: number }>
  educationDistribution: Array<{ education: string, count: number, satisfaction: number }>
  purokDistribution: Array<{ purok: string, count: number, satisfaction: number }>
  totalRespondents: number
}

export default function DemographicsAnalytics() {
  const { activeCycle, hasActiveCycle } = useActiveCycle()
  const [data, setData] = useState<DemographicData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (hasActiveCycle) {
      fetchDemographicsData()
    }
  }, [hasActiveCycle, activeCycle])

  const fetchDemographicsData = async () => {
    setLoading(true)
    try {
      const result = await fetchWithCache<DemographicData>(
        '/api/analytics/demographics',
        { cycleId: activeCycle?.cycle_id },
        { ttl: 5 * 60 * 1000 } // 5 minutes
      )
      setData(result)
    } catch (error) {
      console.error('Failed to fetch demographics data:', error)
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
        No demographic data available
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Respondents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalRespondents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Age Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.ageDistribution.length}</div>
            <p className="text-xs text-gray-500">Different age ranges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.genderDistribution.length}</div>
            <p className="text-xs text-gray-500">Gender categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Income Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.incomeDistribution.length}</div>
            <p className="text-xs text-gray-500">Income brackets</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Age and Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution & Satisfaction</CardTitle>
            <p className="text-sm text-gray-500">Respondent count and average satisfaction by age group</p>
          </CardHeader>
          <CardContent>
            <div 
              role="img" 
              aria-label={getChartAriaLabel('Bar', 'age distribution and satisfaction levels across different age groups')}
            >
              <Bar
                data={{
                  labels: data.ageDistribution.map(d => d.ageGroup),
                  datasets: [
                    {
                      label: 'Respondents',
                      data: data.ageDistribution.map(d => d.count),
                      backgroundColor: colorPalettes.primary[0],
                      yAxisID: 'y'
                    },
                    {
                      label: 'Satisfaction %',
                      data: data.ageDistribution.map(d => d.satisfaction),
                      backgroundColor: colorPalettes.primary[3],
                      yAxisID: 'y1'
                    }
                  ]
                }}
                options={dualAxisChartOptions as any}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <p className="text-sm text-gray-500">Respondent breakdown by gender identity</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div 
                role="img" 
                aria-label={getChartAriaLabel('Pie', 'gender distribution showing respondent breakdown by gender identity')}
              >
                <Pie
                  data={{
                    labels: data.genderDistribution.map(d => d.gender),
                    datasets: [{
                      data: data.genderDistribution.map(d => d.count),
                      backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                      ]
                    }]
                  }}
                  options={pieChartOptions as any}
                />
              </div>
              <div className="flex flex-col justify-center space-y-2">
                {data.genderDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{item.gender}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold">{item.count}</div>
                      <div className="text-xs text-gray-500">{item.satisfaction.toFixed(1)}% sat.</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Income and Education */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Household Income Distribution</CardTitle>
            <p className="text-sm text-gray-500">Respondents by income bracket with satisfaction levels</p>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: data.incomeDistribution.map(d => d.incomeRange),
                datasets: [
                  {
                    label: 'Respondents',
                    data: data.incomeDistribution.map(d => d.count),
                    backgroundColor: 'rgba(249, 115, 22, 0.8)',
                    yAxisID: 'y'
                  },
                  {
                    label: 'Satisfaction %',
                    data: data.incomeDistribution.map(d => d.satisfaction),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    yAxisID: 'y1'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Respondents' }
                  },
                  y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Satisfaction %' },
                    max: 100,
                    grid: { drawOnChartArea: false }
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Education Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Educational Attainment</CardTitle>
            <p className="text-sm text-gray-500">Respondents by education level with satisfaction</p>
          </CardHeader>
          <CardContent>
            <Bar
              data={{
                labels: data.educationDistribution.map(d => d.education),
                datasets: [
                  {
                    label: 'Respondents',
                    data: data.educationDistribution.map(d => d.count),
                    backgroundColor: 'rgba(168, 85, 247, 0.8)',
                    yAxisID: 'y'
                  },
                  {
                    label: 'Satisfaction %',
                    data: data.educationDistribution.map(d => d.satisfaction),
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    yAxisID: 'y1'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                  y: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'Respondents' }
                  },
                  y1: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'Satisfaction %' },
                    max: 100,
                    grid: { drawOnChartArea: false }
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Purok/Sitio Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Purok/Sitio Distribution</CardTitle>
          <p className="text-sm text-gray-500">Respondent distribution across puroks/sitios with satisfaction levels</p>
        </CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: data.purokDistribution.map(d => d.purok),
              datasets: [
                {
                  label: 'Respondents',
                  data: data.purokDistribution.map(d => d.count),
                  backgroundColor: 'rgba(14, 165, 233, 0.8)',
                  yAxisID: 'y'
                },
                {
                  label: 'Satisfaction %',
                  data: data.purokDistribution.map(d => d.satisfaction),
                  backgroundColor: 'rgba(34, 197, 94, 0.8)',
                  yAxisID: 'y1'
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                y: {
                  type: 'linear',
                  position: 'left',
                  title: { display: true, text: 'Respondents' }
                },
                y1: {
                  type: 'linear',
                  position: 'right',
                  title: { display: true, text: 'Satisfaction %' },
                  max: 100,
                  grid: { drawOnChartArea: false }
                }
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-blue-900 mb-2">Highest Satisfaction</div>
              <div className="text-sm text-blue-700">
                {data.ageDistribution.length > 0 && (
                  <div>Age: {data.ageDistribution.reduce((max, item) => item.satisfaction > max.satisfaction ? item : max).ageGroup} ({data.ageDistribution.reduce((max, item) => item.satisfaction > max.satisfaction ? item : max).satisfaction.toFixed(1)}%)</div>
                )}
                {data.genderDistribution.length > 0 && (
                  <div>Gender: {data.genderDistribution.reduce((max, item) => item.satisfaction > max.satisfaction ? item : max).gender} ({data.genderDistribution.reduce((max, item) => item.satisfaction > max.satisfaction ? item : max).satisfaction.toFixed(1)}%)</div>
                )}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="font-semibold text-red-900 mb-2">Needs Attention</div>
              <div className="text-sm text-red-700">
                {data.ageDistribution.length > 0 && (
                  <div>Age: {data.ageDistribution.reduce((min, item) => item.satisfaction < min.satisfaction ? item : min).ageGroup} ({data.ageDistribution.reduce((min, item) => item.satisfaction < min.satisfaction ? item : min).satisfaction.toFixed(1)}%)</div>
                )}
                {data.genderDistribution.length > 0 && (
                  <div>Gender: {data.genderDistribution.reduce((min, item) => item.satisfaction < min.satisfaction ? item : min).gender} ({data.genderDistribution.reduce((min, item) => item.satisfaction < min.satisfaction ? item : min).satisfaction.toFixed(1)}%)</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
