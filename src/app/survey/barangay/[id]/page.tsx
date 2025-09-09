"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Users, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth/AuthProvider"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

type BarangayData = {
  barangay_id: number
  barangay_name: string
  currentStatus: string | null
  description: string | null
  population: number
  households: number
  area: number | null
  captain: string | null
  surveyTargets: {
    target: number
    achieved: number
    percentage: number
    created_at: Date
  }[]
  survey_response: {
    completed_at: Date
    status: string
  }[]
}

function BarangayDetailContent({ params }: { params: { id: string } }) {
  const { id } = params
  const barangayId = Number.parseInt(id)
  const [barangay, setBarangay] = React.useState<BarangayData | null>(null)
  const { user } = useAuth()

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/barangays/${barangayId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch barangay data')
        }
        const data = await response.json()
        setBarangay(data)
      } catch (error) {
        console.error("Error fetching barangay data:", error)
      }
    }
    fetchData()
  }, [barangayId])

  if (!barangay) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  // Calculate survey metrics from database data
  const maxRespondents = barangay.surveyTargets?.[0]?.target || 150
  const completedSurveys = barangay.surveyTargets?.[0]?.achieved || 0
  const progress = barangay.surveyTargets?.[0]?.percentage || 0
  const lastUpdated = barangay.survey_response?.[0]?.completed_at
    ? new Date(barangay.survey_response[0].completed_at).toLocaleDateString()
    : "Not started"

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
      {/* Header */}
      <header className="bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            {/* Back to Dashboard - redirects to survey dashboard for interviewers, main dashboard for others */}
            <Link
              href={user?.role?.toLowerCase() === 'interviewer' ? '/survey' : '/dashboard'}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          {/* Barangay Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">
                  {barangay.barangay_name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-[#6b7280]">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Population: {barangay.population.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{maxRespondents} Max Respondents</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Updated {lastUpdated}</span>
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs sm:text-sm rounded-full font-medium self-start ${barangay.currentStatus === "Completed"
                  ? "bg-green-100 text-green-800"
                  : barangay.currentStatus === "In Progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                  }`}
              >
                {barangay.currentStatus || "Not Started"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[#6b7280]">Survey Progress</span>
                <span className="text-[#111827] font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#16a34a] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#111827] mb-4">Survey Actions</h2>
            <div className="space-y-3 sm:space-y-4">
              {user?.role?.toLowerCase() !== 'admin' && (
                <Link href="/survey/forms" className="block w-full">
                  <button className="w-full bg-[#16a34a] hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                    Continue Survey
                  </button>
                </Link>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button className="bg-[#3b82f6] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                  View Responses
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-[#111827] font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">Survey Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-[#111827]">
                    {completedSurveys}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Respondents</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-[#111827]">
                    {maxRespondents - completedSurveys}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Remaining Surveys</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-[#111827]">{maxRespondents}</div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Total Target</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-[#6b7280] text-xs sm:text-sm leading-relaxed">
                  {barangay.description || `This barangay is part of the SIGLA Survey 2025 initiative to measure satisfaction with governance and
                  local administration. The survey covers various aspects including public services, infrastructure, and
                  community engagement. Each respondent interview takes approximately 15-20 minutes to complete with a
                  target of ${maxRespondents} respondents per barangay.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function BarangayDetail({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null)

  React.useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <BarangayDetailContent params={resolvedParams} />
    </ProtectedRoute>
  )
}
