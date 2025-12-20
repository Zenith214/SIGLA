"use client"

import React from "react"
import { Calendar, MapPin, FileText, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"

type Visit = {
  visit_id: number
  questionnaire_id: string
  visit_number: number
  visit_timestamp: string
  outcome: string
  notes: string | null
  location_lat: string | null
  location_lng: string | null
}

type VisitWithQuestionnaire = Visit & {
  questionnaire: {
    questionnaire_id: string
    spot: {
      spot_name: string
    }
    survey_response: {
      respondent_name: string | null
    } | null
  }
}

export function VisitationLogsCard({ barangayId }: { barangayId: number }) {
  const [visits, setVisits] = React.useState<VisitWithQuestionnaire[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchVisits = async () => {
      try {
        const response = await fetch(`/api/barangays/${barangayId}/visits`)
        if (!response.ok) {
          throw new Error('Failed to fetch visitation logs')
        }
        const data = await response.json()
        setVisits(data)
      } catch (error) {
        console.error('Error fetching visitation logs:', error)
        setError(error instanceof Error ? error.message : 'Failed to load visitation logs')
      } finally {
        setLoading(false)
      }
    }
    fetchVisits()
  }, [barangayId])

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Callback_Needed':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'Refused':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'Household_Moved':
        return <AlertCircle className="w-4 h-4 text-gray-600" />
      default:
        return <FileText className="w-4 h-4 text-blue-600" />
    }
  }

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Callback_Needed':
        return 'bg-amber-100 text-amber-800'
      case 'Refused':
        return 'bg-red-100 text-red-800'
      case 'Household_Moved':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatOutcome = (outcome: string) => {
    return outcome.replace(/_/g, ' ')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">Visitation Logs</h3>
        <div className="text-center py-4 text-gray-500">Loading visitation logs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">Visitation Logs</h3>
        <div className="text-center py-4 text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (visits.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">Visitation Logs</h3>
        <div className="text-center py-4 text-gray-500">
          No visitation logs recorded yet.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">
        Visitation Logs ({visits.length})
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-700">Survey ID</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Respondent</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Spot</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Visit #</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Outcome</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Date & Time</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Notes</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr key={visit.visit_id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 text-gray-900 font-mono text-xs">
                  {visit.questionnaire.questionnaire_id}
                </td>
                <td className="py-3 px-2 text-gray-900">
                  {visit.questionnaire.survey_response?.respondent_name || 'Not specified'}
                </td>
                <td className="py-3 px-2 text-gray-600">
                  {visit.questionnaire.spot.spot_name}
                </td>
                <td className="py-3 px-2 text-gray-900 text-center">
                  {visit.visit_number}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    {getOutcomeIcon(visit.outcome)}
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${getOutcomeColor(visit.outcome)}`}
                    >
                      {formatOutcome(visit.outcome)}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(visit.visit_timestamp).toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-gray-600 max-w-xs">
                  {visit.notes ? (
                    <div className="flex items-start space-x-1">
                      <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="text-xs line-clamp-2">{visit.notes}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No notes</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
