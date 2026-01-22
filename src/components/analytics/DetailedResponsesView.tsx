'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  User,
  Calendar,
  BarChart3,
  Maximize2,
  ArrowUpDown
} from 'lucide-react'
import { getQuestionLabel } from '@/utils/questionLabels'
import { formatAnswerValue, isSkipReasonField } from '@/utils/answerFormatter'
import { useAuth } from '@/components/auth/AuthProvider'

interface DetailedResponse {
  responseId: number
  surveyNumber: string
  barangay: { name: string; id: number }
  interviewer: { name: string }
  respondent: { name: string; age: number }
  location: { address: string; lat: number; lng: number }
  progress: number
  status: string
  completedAt: string
  sections?: Array<{ key: string; name: string; data: any }>
  gpsVerificationStatus?: string
  gpsDistanceMeters?: number
}

interface DetailedResponsesViewProps {
  responses: DetailedResponse[]
  totalCount: number
}

export default function DetailedResponsesView({ responses, totalCount }: DetailedResponsesViewProps) {
  const { user } = useAuth()
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'developer'
  
  // Debug logging
  console.log('DetailedResponsesView - User role:', user?.role, 'isAdmin:', isAdmin)
  
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'barangay' | 'satisfaction' | 'completion'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [selectedResponses, setSelectedResponses] = useState<Set<number>>(new Set())
  const [expandedResponse, setExpandedResponse] = useState<number | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<DetailedResponse | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Get unique barangays
  const barangays = useMemo(() => {
    const unique = new Map()
    responses.forEach(r => {
      if (!unique.has(r.barangay.id)) {
        unique.set(r.barangay.id, r.barangay.name)
      }
    })
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [responses])

  // Calculate satisfaction score
  const getSatisfactionScore = (response: DetailedResponse): number => {
    const overallSection = response.sections?.find(s => s.key === 'overall')
    if (!overallSection?.data?.overallSatisfaction) return 0
    const satValue = parseInt(String(overallSection.data.overallSatisfaction).charAt(0))
    return isNaN(satValue) ? 0 : (satValue / 5) * 100
  }

  // Filter and sort responses
  const filteredAndSortedResponses = useMemo(() => {
    let filtered = responses.filter(response => {
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || 
        response.surveyNumber.toLowerCase().includes(searchLower) ||
        response.respondent.name.toLowerCase().includes(searchLower) ||
        response.barangay.name.toLowerCase().includes(searchLower)

      // Barangay filter
      const matchesBarangay = selectedBarangay === 'all' || 
        response.barangay.id.toString() === selectedBarangay

      // Status filter
      const matchesStatus = selectedStatus === 'all' || 
        response.status.toLowerCase() === selectedStatus.toLowerCase()

      return matchesSearch && matchesBarangay && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
          break
        case 'barangay':
          comparison = a.barangay.name.localeCompare(b.barangay.name)
          break
        case 'satisfaction':
          comparison = getSatisfactionScore(a) - getSatisfactionScore(b)
          break
        case 'completion':
          comparison = a.progress - b.progress
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [responses, searchTerm, selectedBarangay, selectedStatus, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedResponses.length / itemsPerPage)
  const paginatedResponses = filteredAndSortedResponses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Quick stats
  const stats = useMemo(() => {
    const avgSatisfaction = filteredAndSortedResponses.reduce((sum, r) => 
      sum + getSatisfactionScore(r), 0) / (filteredAndSortedResponses.length || 1)
    
    const avgCompletion = filteredAndSortedResponses.reduce((sum, r) => 
      sum + r.progress, 0) / (filteredAndSortedResponses.length || 1)
    
    const completedCount = filteredAndSortedResponses.filter(r => r.progress === 100).length
    
    return {
      total: filteredAndSortedResponses.length,
      avgSatisfaction: avgSatisfaction.toFixed(1),
      avgCompletion: avgCompletion.toFixed(1),
      completedCount,
      completionRate: ((completedCount / (filteredAndSortedResponses.length || 1)) * 100).toFixed(1)
    }
  }, [filteredAndSortedResponses])

  // Selection handlers
  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedResponses)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedResponses(newSelected)
  }

  const selectAll = () => {
    if (selectedResponses.size === paginatedResponses.length) {
      setSelectedResponses(new Set())
    } else {
      setSelectedResponses(new Set(paginatedResponses.map(r => r.responseId)))
    }
  }

  // Export handlers
  const exportSelected = () => {
    const selected = responses.filter(r => selectedResponses.has(r.responseId))
    exportToCSV(selected)
  }

  const exportFiltered = () => {
    exportToCSV(filteredAndSortedResponses)
  }

  const exportToCSV = (data: DetailedResponse[]) => {
    // Implementation would go here
    console.log('Exporting', data.length, 'responses')
    alert(`Exporting ${data.length} responses to CSV`)
  }

  // Status icon
  const getStatusIcon = (response: DetailedResponse) => {
    if (response.progress === 100) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    } else if (response.progress > 0) {
      return <Clock className="w-4 h-4 text-yellow-600" />
    } else {
      return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  // Satisfaction badge color
  const getSatisfactionColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    if (score >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500">Total Responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.avgSatisfaction}%</div>
            <p className="text-xs text-gray-500">Avg Satisfaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
            <p className="text-xs text-gray-500">Avg Completion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.completedCount}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-gray-500">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Survey Responses ({stats.total})</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              {selectedResponses.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportSelected}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected ({selectedResponses.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedResponses(new Set())}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={exportFiltered}
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, survey #..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Barangay</label>
                <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Barangays</SelectItem>
                    {barangays.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="barangay">Barangay</SelectItem>
                      <SelectItem value="satisfaction">Satisfaction</SelectItem>
                      <SelectItem value="completion">Completion</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedResponses.size === paginatedResponses.length && paginatedResponses.length > 0}
                onCheckedChange={selectAll}
              />
              <span className="text-sm text-gray-600">
                Select All ({paginatedResponses.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => {
                setItemsPerPage(parseInt(v))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Response List */}
          <div className="space-y-3">
            {paginatedResponses.map((response) => {
              const satisfaction = getSatisfactionScore(response)
              const isExpanded = expandedResponse === response.responseId
              
              // Count unawareness and non-availment reasons
              let unawarenessCount = 0
              let nonAvailmentCount = 0
              response.sections?.forEach(section => {
                if (section.data && typeof section.data === 'object') {
                  Object.keys(section.data).forEach(key => {
                    if (key.includes('unawareness_reason')) unawarenessCount++
                    if (key.includes('non_availment_reason')) nonAvailmentCount++
                  })
                }
              })
              
              return (
                <div key={response.responseId} className="border rounded-lg">
                  {/* Response Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedResponses.has(response.responseId)}
                        onCheckedChange={() => toggleSelection(response.responseId)}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {getStatusIcon(response)}
                              <span className="font-semibold">Survey #{response.surveyNumber}</span>
                              <Badge variant="outline" className="text-xs">
                                {response.progress}% Complete
                              </Badge>
                              {satisfaction > 0 && (
                                <Badge className={`text-xs ${getSatisfactionColor(satisfaction)}`}>
                                  {satisfaction.toFixed(0)}% Satisfied
                                </Badge>
                              )}
                              {unawarenessCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  {unawarenessCount} Unawareness
                                </Badge>
                              )}
                              {nonAvailmentCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                                  {nonAvailmentCount} Non-Availment
                                </Badge>
                              )}
                              {response.gpsVerificationStatus === 'flagged' && (
                                <Badge variant="destructive" className="text-xs">
                                  GPS Flagged
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {response.respondent.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {response.barangay.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(response.completedAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {response.sections?.length || 0} sections
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedResponseDetail(response)
                                setDetailModalOpen(true)
                              }}
                            >
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedResponse(isExpanded ? null : response.responseId)}
                            >
                              {isExpanded ? 'Collapse' : 'Expand'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && response.sections && (
                      <div className="mt-4 pl-8 space-y-2">
                        {response.sections.map((section, idx) => {
                          // Extract unawareness and non-availment reasons
                          const unawarenessReasons: Array<{key: string, value: any}> = []
                          const nonAvailmentReasons: Array<{key: string, value: any}> = []
                          const regularData: Array<{key: string, value: any}> = []

                          if (section.data && typeof section.data === 'object') {
                            Object.entries(section.data).forEach(([key, value]) => {
                              // Hide corruption-related questions from non-admins
                              const fullKey = `${section.key}_${key}`
                              const label = getQuestionLabel(fullKey)
                              const isCorruptionQuestion = 
                                key.toLowerCase().includes('corruption') ||
                                key.toLowerCase().includes('korapsyon') ||
                                label.toLowerCase().includes('corruption') ||
                                label.toLowerCase().includes('korapsyon')
                              
                              if (!isAdmin && isCorruptionQuestion) {
                                return // Skip this question
                              }

                              if (key.includes('unawareness_reason')) {
                                unawarenessReasons.push({key, value})
                              } else if (key.includes('non_availment_reason')) {
                                nonAvailmentReasons.push({key, value})
                              } else {
                                regularData.push({key, value})
                              }
                            })
                          }

                          return (
                            <details key={idx} className="border rounded-lg">
                              <summary className="p-3 cursor-pointer hover:bg-gray-50 font-medium text-sm flex items-center justify-between">
                                {section.name}
                                <div className="flex items-center gap-2">
                                  {unawarenessReasons.length > 0 && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      {unawarenessReasons.length} Unawareness
                                    </Badge>
                                  )}
                                  {nonAvailmentReasons.length > 0 && (
                                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                      {nonAvailmentReasons.length} Non-Availment
                                    </Badge>
                                  )}
                                  <ChevronDown className="w-4 h-4" />
                                </div>
                              </summary>
                              <div className="p-3 space-y-3 text-sm bg-gray-50">
                                {/* Regular Questions */}
                                {regularData.length > 0 && (
                                  <div className="space-y-2">
                                    {regularData.map(({key, value}) => (
                                      <div key={key} className="flex justify-between py-1 border-b">
                                        <span className="text-gray-600">
                                          {getQuestionLabel(`${section.key}_${key}`) || key}:
                                        </span>
                                        <span className="font-medium">{formatAnswerValue(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Unawareness Reasons */}
                                {unawarenessReasons.length > 0 && (
                                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertCircle className="w-4 h-4 text-blue-600" />
                                      <span className="font-semibold text-blue-800 text-sm">
                                        Unawareness Reasons
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      {unawarenessReasons.map(({key, value}) => (
                                        <div key={key} className="text-sm text-blue-700">
                                          <span className="font-medium">
                                            {getQuestionLabel(`${section.key}_${key}`) || key}:
                                          </span>{' '}
                                          {formatAnswerValue(value)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Non-Availment Reasons */}
                                {nonAvailmentReasons.length > 0 && (
                                  <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                      <AlertCircle className="w-4 h-4 text-orange-600" />
                                      <span className="font-semibold text-orange-800 text-sm">
                                        Non-Availment Reasons
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      {nonAvailmentReasons.map(({key, value}) => (
                                        <div key={key} className="text-sm text-orange-700">
                                          <span className="font-medium">
                                            {getQuestionLabel(`${section.key}_${key}`) || key}:
                                          </span>{' '}
                                          {formatAnswerValue(value)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </details>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stats.total)} of {stats.total} responses
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Survey #{selectedResponseDetail?.surveyNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedResponseDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Respondent</div>
                  <div className="font-medium">{selectedResponseDetail.respondent.name}</div>
                  <div className="text-sm text-gray-500">Age: {selectedResponseDetail.respondent.age}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Barangay</div>
                  <div className="font-medium">{selectedResponseDetail.barangay.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Interviewer</div>
                  <div className="font-medium">{selectedResponseDetail.interviewer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="font-medium">
                    {new Date(selectedResponseDetail.completedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-medium text-sm">{selectedResponseDetail.location.address}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Progress</div>
                  <div className="font-medium">{selectedResponseDetail.progress}%</div>
                </div>
              </div>

              {selectedResponseDetail.sections && (
                <div className="space-y-2">
                  {selectedResponseDetail.sections.map((section, idx) => {
                    // Extract unawareness and non-availment reasons
                    const unawarenessReasons: Array<{key: string, value: any}> = []
                    const nonAvailmentReasons: Array<{key: string, value: any}> = []
                    const regularData: Array<{key: string, value: any}> = []

                    if (section.data && typeof section.data === 'object') {
                      Object.entries(section.data).forEach(([key, value]) => {
                        // Hide corruption-related questions from non-admins
                        const fullKey = `${section.key}_${key}`
                        const label = getQuestionLabel(fullKey)
                        const isCorruptionQuestion = 
                          key.toLowerCase().includes('corruption') ||
                          key.toLowerCase().includes('korapsyon') ||
                          label.toLowerCase().includes('corruption') ||
                          label.toLowerCase().includes('korapsyon')
                        
                        if (!isAdmin && isCorruptionQuestion) {
                          return // Skip this question
                        }

                        if (key.includes('unawareness_reason')) {
                          unawarenessReasons.push({key, value})
                        } else if (key.includes('non_availment_reason')) {
                          nonAvailmentReasons.push({key, value})
                        } else {
                          regularData.push({key, value})
                        }
                      })
                    }

                    return (
                      <details key={idx} className="border rounded-lg" open>
                        <summary className="p-3 cursor-pointer hover:bg-gray-50 font-medium flex items-center justify-between">
                          {section.name}
                          <div className="flex items-center gap-2">
                            {unawarenessReasons.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {unawarenessReasons.length} Unawareness
                              </Badge>
                            )}
                            {nonAvailmentReasons.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                {nonAvailmentReasons.length} Non-Availment
                              </Badge>
                            )}
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </summary>
                        <div className="p-3 space-y-3 bg-gray-50">
                          {/* Regular Questions */}
                          {regularData.length > 0 && (
                            <div className="space-y-2">
                              {regularData.map(({key, value}) => (
                                <div key={key} className="p-3 bg-white rounded">
                                  <div className="text-sm text-gray-600 mb-1">
                                    {getQuestionLabel(`${section.key}_${key}`) || key}
                                  </div>
                                  <div className="font-medium">{formatAnswerValue(value)}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Unawareness Reasons */}
                          {unawarenessReasons.length > 0 && (
                            <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-blue-800">
                                  Unawareness Reasons
                                </span>
                              </div>
                              <div className="space-y-2">
                                {unawarenessReasons.map(({key, value}) => (
                                  <div key={key} className="p-2 bg-white rounded">
                                    <div className="text-sm text-gray-600 mb-1">
                                      {getQuestionLabel(`${section.key}_${key}`) || key}
                                    </div>
                                    <div className="font-medium text-blue-700">{formatAnswerValue(value)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Non-Availment Reasons */}
                          {nonAvailmentReasons.length > 0 && (
                            <div className="p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-orange-800">
                                  Non-Availment Reasons
                                </span>
                              </div>
                              <div className="space-y-2">
                                {nonAvailmentReasons.map(({key, value}) => (
                                  <div key={key} className="p-2 bg-white rounded">
                                    <div className="text-sm text-gray-600 mb-1">
                                      {getQuestionLabel(`${section.key}_${key}`) || key}
                                    </div>
                                    <div className="font-medium text-orange-700">{formatAnswerValue(value)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </details>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
