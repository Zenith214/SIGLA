"use client"

import React from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Users, Calendar, Search, Eye, X, Trash2, AlertTriangle, Check, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

type SurveyResponse = {
  response_id: number
  survey_number: string
  respondent_name: string | null
  respondent_age: number | null
  respondent_gender: string | null
  respondent_educational_attainment: string | null
  respondent_household_income: string | null
  submitted_at: string
  status: string
  survey_section: {
    section_name: string
    data: string // JSON string
  }[]
}

function BarangayDetailContent({ params }: { params: { id: string } }) {
  const { id } = params
  const barangayId = Number.parseInt(id)
  const [barangay, setBarangay] = React.useState<BarangayData | null>(null)
  const [responses, setResponses] = React.useState<SurveyResponse[]>([])
  const [filteredResponses, setFilteredResponses] = React.useState<SurveyResponse[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedResponse, setSelectedResponse] = React.useState<SurveyResponse | null>(null)
  const [isLoadingResponses, setIsLoadingResponses] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showConfirmWord, setShowConfirmWord] = React.useState(false)
  const [deleteType, setDeleteType] = React.useState<'single' | 'all' | null>(null)
  const [confirmWord, setConfirmWord] = React.useState('')
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [showErrorModal, setShowErrorModal] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')
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

  // Filter responses based on search term
  React.useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResponses(responses)
    } else {
      const filtered = responses.filter(response =>
        response.survey_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (response.respondent_name && response.respondent_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredResponses(filtered)
    }
  }, [responses, searchTerm])

  const handleViewResponses = async () => {
    setIsLoadingResponses(true)
    try {
      const response = await fetch(`/api/survey-responses?barangayId=${barangayId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch responses')
      }
      const data = await response.json()
      setResponses(data)
      setFilteredResponses(data)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Error fetching responses:", error)
      alert("Failed to load responses. Please try again.")
    } finally {
      setIsLoadingResponses(false)
    }
  }

  const handleResponseClick = (response: SurveyResponse) => {
    setSelectedResponse(response)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedResponse(null)
    setSearchTerm("")
    setShowDeleteConfirm(false)
    setShowConfirmWord(false)
    setShowSuccessModal(false)
    setShowErrorModal(false)
    setDeleteType(null)
    setConfirmWord("")
    setSuccessMessage("")
    setErrorMessage("")
  }

  const handleDeleteClick = (type: 'single' | 'all', response?: SurveyResponse) => {
    setDeleteType(type)
    if (type === 'single' && response) {
      setSelectedResponse(response)
    }
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false)
    setShowConfirmWord(true)
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
    setShowConfirmWord(false)
    setDeleteType(null)
    setConfirmWord("")
  }

  const handleDeleteSubmit = async () => {
    if (confirmWord.trim().toUpperCase() !== 'DELETE') {
      alert("Please type 'DELETE' to confirm")
      return
    }

    setIsDeleting(true)
    try {
      const params = new URLSearchParams()
      if (deleteType === 'single' && selectedResponse) {
        params.append('responseId', selectedResponse.response_id.toString())
      } else if (deleteType === 'all') {
        params.append('barangayId', barangayId.toString())
        params.append('deleteAll', 'true')
      }
      params.append('confirmWord', confirmWord.trim().toUpperCase())

      const response = await fetch(`/api/survey-responses?${params}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }

      const result = await response.json()
      setSuccessMessage(result.message)
      setShowSuccessModal(true)

      // Refresh the responses list
      if (deleteType === 'all') {
        setResponses([])
        setFilteredResponses([])
        setSelectedResponse(null)
      } else {
        // Remove the deleted response from the list
        const updatedResponses = responses.filter(r => r.response_id !== selectedResponse?.response_id)
        setResponses(updatedResponses)
        setFilteredResponses(updatedResponses.filter(r =>
          r.survey_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.respondent_name && r.respondent_name.toLowerCase().includes(searchTerm.toLowerCase()))
        ))
        setSelectedResponse(null)
      }

      handleDeleteCancel()

    } catch (error) {
      console.error("Error deleting response:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to delete response")
      setShowErrorModal(true)
    } finally {
      setIsDeleting(false)
    }
  }

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
            {/* Back to Survey Dashboard - all users accessing barangay details should return to survey dashboard */}
            <Link
              href="/survey"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back to Survey Dashboard</span>
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
                <Link href={`/survey/forms?barangayId=${barangayId}`} className="block w-full">
                  <button className="w-full bg-[#16a34a] hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                    {progress === 0 ? "Start Survey" : "Continue Survey"}
                  </button>
                </Link>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={handleViewResponses}
                  disabled={isLoadingResponses}
                  className="bg-[#3b82f6] hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  {isLoadingResponses ? "Loading..." : "View Responses"}
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
                  {barangay.description || `This barangay is part of the PULSE Survey 2025 initiative to measure satisfaction with governance and
                  local administration. The survey covers various aspects including public services, infrastructure, and
                  community engagement. Each respondent interview takes approximately 15-20 minutes to complete with a
                  target of ${maxRespondents} respondents per barangay.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* View Responses Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                Survey Responses - {barangay?.barangay_name}
              </DialogTitle>
              {responses.length > 0 && user?.role?.toLowerCase() === 'admin' && (
                <button
                  onClick={() => handleDeleteClick('all')}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors mr-10"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete All</span>
                </button>
              )}
            </div>
          </DialogHeader>

          <div className="flex h-[calc(80vh-80px)]">
            {/* Responses List */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by survey number or respondent name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Responses List */}
              <div className="flex-1 overflow-y-auto">
                {filteredResponses.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {responses.length === 0 ? "No responses found for this barangay." : "No responses match your search."}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredResponses.map((response) => (
                      <div
                        key={response.response_id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          selectedResponse?.response_id === response.response_id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            onClick={() => handleResponseClick(response)}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium text-gray-900">
                              {response.respondent_name || 'Anonymous Respondent'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Survey #{response.survey_number}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Submitted: {new Date(response.submitted_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleResponseClick(response)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {user?.role?.toLowerCase() === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteClick('single', response)
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete response"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Response Details */}
            <div className="w-1/2 flex flex-col">
              {selectedResponse ? (
                <>
                  {/* Response Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">
                      Survey #{selectedResponse.survey_number}
                    </h3>
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="ml-2 text-gray-900">{selectedResponse.respondent_name || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Age:</span>
                          <span className="ml-2 text-gray-900">{selectedResponse.respondent_age || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Gender:</span>
                          <span className="ml-2 text-gray-900">{selectedResponse.respondent_gender || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Education:</span>
                          <span className="ml-2 text-gray-900">{selectedResponse.respondent_educational_attainment || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Household Income:</span>
                        <span className="ml-2 text-gray-900">{selectedResponse.respondent_household_income || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Response Content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-6">
                      {selectedResponse.survey_section.map((section, index) => {
                        const sectionData = JSON.parse(section.data)
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">{section.section_name}</h4>
                            <div className="space-y-2">
                              {Object.entries(sectionData)
                                .filter(([key]) => !key.endsWith('_skipReason')) // Exclude skip reasons
                                .map(([key, value]) => (
                                  <div key={key} className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                    </span>
                                    <span className="text-sm text-gray-900 ml-2 text-right">
                                      {value === null || value === undefined || value === '' ? 'Skipped' :
                                       Array.isArray(value) ? value.join(', ') : String(value)}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a response from the list to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={handleDeleteCancel}>
            <DialogContent className="sm:max-w-md max-w-[95vw]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {deleteType === 'all' ? 'ALL responses' : 'this response'}?
                </DialogDescription>
              </DialogHeader>
              <div className="mb-6">
                <p className="text-red-600 font-semibold bg-red-50 p-3 rounded-lg border border-red-200">
                  ⚠️ This action <strong>cannot be undone</strong> and will permanently delete the data.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Confirmation Word Dialog */}
          <Dialog open={showConfirmWord} onOpenChange={handleDeleteCancel}>
            <DialogContent className="sm:max-w-md max-w-[95vw]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                  Final Confirmation
                </DialogTitle>
                <DialogDescription>
                  Type <strong className="text-red-600">DELETE</strong> to confirm this irreversible action.
                </DialogDescription>
              </DialogHeader>
              <div className="mb-6">
                <input
                  type="text"
                  value={confirmWord}
                  onChange={(e) => setConfirmWord(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  This action cannot be undone and will permanently delete the data.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting || confirmWord.trim().toUpperCase() !== 'DELETE'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Success Modal */}
          <Dialog open={showSuccessModal} onOpenChange={() => setShowSuccessModal(false)}>
            <DialogContent className="sm:max-w-md max-w-[95vw]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  Success
                </DialogTitle>
                <DialogDescription>
                  {successMessage}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Error Modal */}
          <Dialog open={showErrorModal} onOpenChange={() => setShowErrorModal(false)}>
            <DialogContent className="sm:max-w-md max-w-[95vw]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  Error
                </DialogTitle>
                <DialogDescription>
                  {errorMessage}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  OK
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
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
