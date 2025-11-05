"use client"

import { useState, useEffect } from "react"
import { Users, TrendingUp, MapPin, GraduationCap, DollarSign, Home } from "lucide-react"

interface DemographicData {
  label: string
  count: number
  percentage: string
}

interface DemographicsResponse {
  totalRespondents: number
  demographics: {
    gender: DemographicData[]
    ageGroups: DemographicData[]
    education: DemographicData[]
    income: DemographicData[]
    purok: DemographicData[]
  }
}

interface DemographicsAnalyticsProps {
  barangayId?: number
  cycleId?: number
}

export function DemographicsAnalytics({ barangayId, cycleId }: DemographicsAnalyticsProps) {
  const [data, setData] = useState<DemographicsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDemographics()
  }, [barangayId, cycleId])

  const fetchDemographics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (barangayId) params.append('barangayId', barangayId.toString())
      if (cycleId) params.append('cycleId', cycleId.toString())

      const response = await fetch(`/api/analytics/demographics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch demographics')

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-red-600">
        Error loading demographics: {error}
      </div>
    )
  }

  const renderDistributionCard = (
    title: string,
    icon: React.ReactNode,
    data: DemographicData[],
    colorClass: string
  ) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">{item.label}</span>
              <span className="text-gray-600">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No data available</p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Respondent Demographics Profile</h2>
            <p className="text-blue-100">
              Comprehensive analysis of survey participant characteristics
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{data.totalRespondents}</div>
            <div className="text-blue-100 text-sm">Total Respondents</div>
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDistributionCard(
          "Gender Distribution",
          <Users className="w-5 h-5 text-purple-600" />,
          data.demographics.gender,
          "bg-purple-600"
        )}

        {renderDistributionCard(
          "Age Groups",
          <TrendingUp className="w-5 h-5 text-blue-600" />,
          data.demographics.ageGroups,
          "bg-blue-600"
        )}
      </div>

      {/* Education and Income */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDistributionCard(
          "Educational Attainment",
          <GraduationCap className="w-5 h-5 text-green-600" />,
          data.demographics.education,
          "bg-green-600"
        )}

        {renderDistributionCard(
          "Monthly Household Income",
          <DollarSign className="w-5 h-5 text-yellow-600" />,
          data.demographics.income,
          "bg-yellow-600"
        )}
      </div>

      {/* Purok Distribution */}
      <div className="grid grid-cols-1 gap-6">
        {renderDistributionCard(
          "Purok/Sitio Distribution",
          <Home className="w-5 h-5 text-indigo-600" />,
          data.demographics.purok,
          "bg-indigo-600"
        )}
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {data.demographics.gender.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-600 mb-1">Most Represented Gender</div>
              <div className="text-lg font-semibold text-gray-900">
                {data.demographics.gender[0].label}
              </div>
              <div className="text-sm text-gray-500">
                {data.demographics.gender[0].percentage}% of respondents
              </div>
            </div>
          )}

          {data.demographics.ageGroups.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-600 mb-1">Largest Age Group</div>
              <div className="text-lg font-semibold text-gray-900">
                {data.demographics.ageGroups[0].label}
              </div>
              <div className="text-sm text-gray-500">
                {data.demographics.ageGroups[0].percentage}% of respondents
              </div>
            </div>
          )}

          {data.demographics.education.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-600 mb-1">Most Common Education</div>
              <div className="text-lg font-semibold text-gray-900">
                {data.demographics.education[0].label}
              </div>
              <div className="text-sm text-gray-500">
                {data.demographics.education[0].percentage}% of respondents
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
