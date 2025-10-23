"use client"

import { useState, useEffect } from "react"
import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Award,
  History,
  Download,
  Upload,
  CheckSquare,
  Square,
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Copy,
  Clock,
  ArrowRight,
  Edit
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle } from "@/hooks/useSurveyCycle"
import { CycleDisplay } from "@/components/survey-cycle"

interface BarangayWithAward {
  barangay_id: number
  barangay_name: string
  households: number | null
  population: number | null
  award_status?: {
    id: number
    is_awardee: boolean
    awarded_date: string | null
    notes: string | null
    created_at: string
  }
}

interface AwardHistory {
  cycleId: number
  cycleName: string
  year: number
  isAwardee: boolean
  awardedDate: string | null
  notes: string | null
  createdAt: string
}

interface AwardsSummary {
  totalBarangays: number
  awardeeCount: number
  nonAwardeeCount: number
  percentage: number
}

interface SurveyCycle {
  cycle_id: number
  name: string
  year: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

interface HistoricalCycleData {
  cycle: SurveyCycle
  summary: AwardsSummary
}

interface CopyAwardsDialog {
  open: boolean
  sourceCycleId?: number
  sourceCycleName?: string
  targetCycleId?: number
  overwrite: boolean
}

export function AwardManagement() {
  const [barangays, setBarangays] = useState<BarangayWithAward[]>([])
  const [selectedBarangays, setSelectedBarangays] = useState<Set<number>>(new Set())
  const [selectedBarangayHistory, setSelectedBarangayHistory] = useState<BarangayWithAward | null>(null)
  const [awardHistory, setAwardHistory] = useState<AwardHistory[]>([])
  const [summary, setSummary] = useState<AwardsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateTime, setDateTime] = useState("")

  // Cycle transition management states
  const [historicalCycles, setHistoricalCycles] = useState<HistoricalCycleData[]>([])
  const [selectedHistoricalCycle, setSelectedHistoricalCycle] = useState<number | null>(null)
  const [historicalAwards, setHistoricalAwards] = useState<BarangayWithAward[]>([])
  const [historicalSummary, setHistoricalSummary] = useState<AwardsSummary | null>(null)
  const [loadingHistorical, setLoadingHistorical] = useState(false)
  const [copyAwardsDialog, setCopyAwardsDialog] = useState<CopyAwardsDialog>({
    open: false,
    overwrite: false
  })

  // Edit award modal states
  const [editAwardModal, setEditAwardModal] = useState<{
    open: boolean
    barangay?: BarangayWithAward
  }>({
    open: false
  })

  // Confirmation dialog states
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean
    type: 'single' | 'bulk'
    action: 'grant' | 'remove'
    barangayId?: number
    barangayName?: string
    count?: number
  }>({
    open: false,
    type: 'single',
    action: 'grant'
  })
  const { toast } = useToast()
  const { activeCycle, hasActiveCycle } = useActiveCycle()

  useEffect(() => {
    const update = () => setDateTime(new Date().toLocaleString())
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load barangays and awards data
  useEffect(() => {
    if (hasActiveCycle) {
      // Debounce the data loading to prevent dropdown interruption
      const timeoutId = setTimeout(() => {
        loadAwardsData()
        loadHistoricalCycles()
      }, 100) // Small delay to allow UI interactions to complete

      return () => clearTimeout(timeoutId)
    } else {
      setLoading(false)
      setError("No active survey cycle found. Please activate a cycle to manage awards.")
    }
  }, [hasActiveCycle, activeCycle?.cycle_id]) // Only depend on cycle_id, not the entire activeCycle object

  const loadAwardsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load barangays with award status using the existing barangays API
      const barangaysResponse = await fetch(`/api/barangays/all?include_awards=true&cycle_id=${activeCycle?.cycle_id}`)
      if (!barangaysResponse.ok) {
        throw new Error('Failed to fetch barangays with awards')
      }
      const barangaysData = await barangaysResponse.json()

      // Load summary statistics
      const summaryResponse = await fetch(`/api/cycle-awards?summary=true&cycle_id=${activeCycle?.cycle_id}`)
      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch awards summary')
      }
      const summaryData = await summaryResponse.json()

      // Handle both old array format and new object format for barangays
      const barangaysArray = Array.isArray(barangaysData) ? barangaysData : barangaysData.data || [];

      // Transform the data to match our interface
      const transformedBarangays: BarangayWithAward[] = barangaysArray.map((barangay: any) => ({
        barangay_id: barangay.barangay_id || barangay.id,
        barangay_name: barangay.barangay_name || barangay.name,
        households: barangay.households,
        population: barangay.population,
        award_status: barangay.awardStatus ? {
          id: barangay.awardStatus.awardId,
          is_awardee: barangay.awardStatus.isAwardee,
          awarded_date: barangay.awardStatus.awardedDate,
          notes: barangay.awardStatus.notes,
          created_at: new Date().toISOString() // Placeholder since we don't have this in the API response
        } : {
          id: null,
          is_awardee: false,
          awarded_date: null,
          notes: null,
          created_at: new Date().toISOString()
        }
      }))

      setBarangays(transformedBarangays)
      // Handle both old and new summary format
      setSummary(summaryData.data || summaryData)
    } catch (err) {
      console.error('Error loading awards data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load awards data'

      // Provide more specific error messages
      if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
        setError('Authentication required. Please log in to access award management.')
      } else if (errorMessage.includes('403') || errorMessage.includes('Admin access required')) {
        setError('Admin access required. Please contact an administrator.')
      } else if (errorMessage.includes('Failed to fetch barangays')) {
        setError('Unable to load barangay data. Please check your connection and try again.')
      } else if (errorMessage.includes('Failed to fetch awards summary')) {
        setError('Unable to load awards summary. The awards system may not be properly configured.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle individual award status change with confirmation
  const handleAwardStatusChangeRequest = (barangayId: number, isAwardee: boolean, barangayName: string) => {
    setConfirmationDialog({
      open: true,
      type: 'single',
      action: isAwardee ? 'grant' : 'remove',
      barangayId,
      barangayName
    })
  }

  // Execute individual award status change
  const executeAwardStatusChange = async (barangayId: number, isAwardee: boolean) => {
    try {
      setUpdating(true)

      const response = await fetch('/api/cycle-awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangay_id: barangayId,
          cycle_id: activeCycle?.cycle_id,
          is_awardee: isAwardee
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update award status')
      }

      // Update local state instead of reloading all data to prevent dropdown interruption
      setBarangays(prevBarangays =>
        prevBarangays.map(barangay =>
          barangay.barangay_id === barangayId
            ? {
              ...barangay,
              award_status: {
                ...barangay.award_status,
                id: barangay.award_status?.id || Date.now(), // Use timestamp as temporary ID
                is_awardee: isAwardee,
                awarded_date: isAwardee ? new Date().toISOString() : null,
                notes: barangay.award_status?.notes || null,
                created_at: barangay.award_status?.created_at || new Date().toISOString()
              }
            }
            : barangay
        )
      )

      // Update summary statistics
      if (summary) {
        setSummary(prevSummary => {
          if (!prevSummary) return prevSummary;
          const change = isAwardee ? 1 : -1;
          const newAwardeeCount = Math.max(0, prevSummary.awardeeCount + change);
          const newNonAwardeeCount = prevSummary.totalBarangays - newAwardeeCount;
          const newPercentage = prevSummary.totalBarangays > 0
            ? Math.round((newAwardeeCount / prevSummary.totalBarangays) * 100)
            : 0;

          return {
            ...prevSummary,
            awardeeCount: newAwardeeCount,
            nonAwardeeCount: newNonAwardeeCount,
            percentage: newPercentage
          };
        });
      }

      toast({
        variant: "success",
        title: "Award Status Updated",
        description: `Barangay award status has been ${isAwardee ? 'granted' : 'removed'} successfully.`,
        duration: 4000
      })
    } catch (err) {
      console.error('Error updating award status:', err)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? err.message : 'Failed to update award status',
        duration: 6000
      })
    } finally {
      setUpdating(false)
      setConfirmationDialog({ open: false, type: 'single', action: 'grant' })
    }
  }

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedBarangays.size === barangays.length) {
      setSelectedBarangays(new Set())
    } else {
      setSelectedBarangays(new Set(barangays.map(b => b.barangay_id)))
    }
  }

  const handleSelectBarangay = (barangayId: number) => {
    const newSelected = new Set(selectedBarangays)
    if (newSelected.has(barangayId)) {
      newSelected.delete(barangayId)
    } else {
      newSelected.add(barangayId)
    }
    setSelectedBarangays(newSelected)
  }

  // Handle bulk award operations with confirmation
  const handleBulkAwardOperationRequest = (isAwardee: boolean) => {
    if (selectedBarangays.size === 0) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select barangays to update.",
        duration: 4000
      })
      return
    }

    setConfirmationDialog({
      open: true,
      type: 'bulk',
      action: isAwardee ? 'grant' : 'remove',
      count: selectedBarangays.size
    })
  }

  // Execute bulk award operations
  const executeBulkAwardOperation = async (isAwardee: boolean) => {
    try {
      setUpdating(true)

      const awards = Array.from(selectedBarangays).map(barangayId => ({
        barangayId,
        isAwardee
      }))

      const response = await fetch('/api/cycle-awards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'update',
          cycle_id: activeCycle?.cycle_id,
          awards
        })
      })

      if (!response.ok) {
        throw new Error('Failed to perform bulk update')
      }

      // Update local state instead of reloading all data
      const count = selectedBarangays.size
      const selectedIds = Array.from(selectedBarangays)

      setBarangays(prevBarangays =>
        prevBarangays.map(barangay =>
          selectedIds.includes(barangay.barangay_id)
            ? {
              ...barangay,
              award_status: {
                ...barangay.award_status,
                id: barangay.award_status?.id || Date.now() + barangay.barangay_id, // Use timestamp + ID as temporary ID
                is_awardee: isAwardee,
                awarded_date: isAwardee ? new Date().toISOString() : null,
                notes: barangay.award_status?.notes || null,
                created_at: barangay.award_status?.created_at || new Date().toISOString()
              }
            }
            : barangay
        )
      )

      // Update summary statistics
      if (summary) {
        setSummary(prevSummary => {
          if (!prevSummary) return prevSummary;
          const change = isAwardee ? count : -count;
          const newAwardeeCount = Math.max(0, Math.min(prevSummary.totalBarangays, prevSummary.awardeeCount + change));
          const newNonAwardeeCount = prevSummary.totalBarangays - newAwardeeCount;
          const newPercentage = prevSummary.totalBarangays > 0
            ? Math.round((newAwardeeCount / prevSummary.totalBarangays) * 100)
            : 0;

          return {
            ...prevSummary,
            awardeeCount: newAwardeeCount,
            nonAwardeeCount: newNonAwardeeCount,
            percentage: newPercentage
          };
        });
      }

      setSelectedBarangays(new Set())

      toast({
        variant: "success",
        title: "Bulk Update Completed",
        description: `${count} barangays have been ${isAwardee ? 'granted' : 'removed from'} award status.`,
        duration: 4000
      })
    } catch (err) {
      console.error('Error performing bulk update:', err)
      toast({
        variant: "destructive",
        title: "Bulk Update Failed",
        description: err instanceof Error ? err.message : 'Failed to perform bulk update',
        duration: 6000
      })
    } finally {
      setUpdating(false)
      setConfirmationDialog({ open: false, type: 'bulk', action: 'grant' })
    }
  }

  // Load award history for a specific barangay
  const loadAwardHistory = async (barangayId: number) => {
    try {
      const response = await fetch(`/api/cycle-awards/history/${barangayId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch award history')
      }
      const data = await response.json()
      setAwardHistory(data.data || [])
    } catch (err) {
      console.error('Error loading award history:', err)
      setAwardHistory([])
      toast({
        variant: "destructive",
        title: "History Load Failed",
        description: "Failed to load award history",
        duration: 4000
      })
    }
  }

  // Load historical cycles with award summaries
  const loadHistoricalCycles = async () => {
    try {
      const response = await fetch('/api/cycle-awards/historical')
      if (!response.ok) {
        throw new Error('Failed to fetch historical cycles')
      }
      const data = await response.json()
      // Handle both old and new response formats
      const cycles = data.data?.cycles || data.cycles || []
      setHistoricalCycles(cycles)
    } catch (err) {
      console.error('Error loading historical cycles:', err)
      setHistoricalCycles([])
    }
  }

  // Load awards for a specific historical cycle
  const loadHistoricalCycleAwards = async (cycleId: number) => {
    try {
      setLoadingHistorical(true)

      const [awardsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/cycle-awards/historical?cycle_id=${cycleId}&include_barangays=true`),
        fetch(`/api/cycle-awards/historical?cycle_id=${cycleId}&summary=true`)
      ])

      if (!awardsResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch historical cycle data')
      }

      const [awardsData, summaryData] = await Promise.all([
        awardsResponse.json(),
        summaryResponse.json()
      ])

      // Transform the data to match our interface
      const awards = awardsData.data?.awards || awardsData.awards || []
      const transformedAwards: BarangayWithAward[] = awards.map((award: any) => ({
        barangay_id: award.barangay?.barangay_id || award.barangay_id,
        barangay_name: award.barangay?.barangay_name || award.barangay_name,
        households: award.barangay?.households || award.households,
        population: award.barangay?.population || award.population,
        award_status: {
          id: award.id,
          is_awardee: award.is_awardee,
          awarded_date: award.awarded_date,
          notes: award.notes,
          created_at: award.created_at
        }
      }))

      setHistoricalAwards(transformedAwards)
      // Handle both old and new summary format
      setHistoricalSummary(summaryData.data?.summary || summaryData.summary || summaryData.data)
    } catch (err) {
      console.error('Error loading historical cycle awards:', err)
      setHistoricalAwards([])
      setHistoricalSummary(null)

      const errorMessage = err instanceof Error ? err.message : 'Failed to load historical cycle awards'
      let description = "Failed to load historical cycle awards"

      if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
        description = 'Authentication required to access historical data.'
      } else if (errorMessage.includes('403')) {
        description = 'Admin access required to view historical awards.'
      }

      toast({
        variant: "destructive",
        title: "Historical Data Load Failed",
        description,
        duration: 4000
      })
    } finally {
      setLoadingHistorical(false)
    }
  }

  // Copy awards from one cycle to another
  const copyAwardsBetweenCycles = async (sourceCycleId: number, targetCycleId?: number, overwrite: boolean = false) => {
    try {
      setUpdating(true)

      const response = await fetch('/api/cycle-awards/copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_cycle_id: sourceCycleId,
          target_cycle_id: targetCycleId,
          overwrite
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to copy awards')
      }

      const data = await response.json()

      // Reload current cycle data if copying to active cycle
      if (!targetCycleId || targetCycleId === activeCycle?.cycle_id) {
        await loadAwardsData()
      }

      toast({
        variant: "success",
        title: "Awards Copied Successfully",
        description: data.message,
        duration: 6000
      })

      return data
    } catch (err) {
      console.error('Error copying awards:', err)
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: err instanceof Error ? err.message : 'Failed to copy awards between cycles',
        duration: 6000
      })
      throw err
    } finally {
      setUpdating(false)
    }
  }

  // Handle copy awards dialog
  const handleCopyAwardsRequest = (sourceCycleId: number, sourceCycleName: string) => {
    setCopyAwardsDialog({
      open: true,
      sourceCycleId,
      sourceCycleName,
      targetCycleId: activeCycle?.cycle_id,
      overwrite: false
    })
  }

  // Execute copy awards operation
  const executeCopyAwards = async () => {
    if (!copyAwardsDialog.sourceCycleId) return

    try {
      await copyAwardsBetweenCycles(
        copyAwardsDialog.sourceCycleId,
        copyAwardsDialog.targetCycleId,
        copyAwardsDialog.overwrite
      )
      setCopyAwardsDialog({ open: false, overwrite: false })
    } catch (err) {
      // Error handling is done in copyAwardsBetweenCycles
    }
  }

  if (!hasActiveCycle) {
    return (
      <div className="space-y-8 max-w-7xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Award Management</h1>
              <p className="text-gray-600 text-lg">Manage SGLGB awards for barangays by survey cycle</p>
            </div>
            <span className="text-xs md:text-sm font-mono bg-gray-200 rounded px-2 py-1 self-end">{dateTime}</span>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800">No Active Survey Cycle</h3>
                <p className="text-amber-700">
                  Please activate a survey cycle in the Survey Cycles section to manage awards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show setup instructions if there are database issues
  if (error && (error.includes('authentication') || error.includes('permission') || error.includes('awards system'))) {
    return (
      <div className="space-y-8 max-w-7xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Award Management</h1>
              <p className="text-gray-600 text-lg">Manage SGLGB awards for barangays by survey cycle</p>
            </div>
            <span className="text-xs md:text-sm font-mono bg-gray-200 rounded px-2 py-1 self-end">{dateTime}</span>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Award System Setup Required</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-red-200">
              <h4 className="font-medium text-gray-900 mb-3">Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Open your Supabase dashboard</li>
                <li>Go to the SQL Editor</li>
                <li>Run the SQL script located at: <code className="bg-gray-100 px-1 rounded">database/fix-cycle-awards-rls.sql</code></li>
                <li>Refresh this page after running the script</li>
              </ol>

              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This will create the cycle_awards table and set up proper permissions for award management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }



  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Award Management</h1>
            <p className="text-gray-600 text-lg">Manage SGLGB awards for barangays by survey cycle</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Active Cycle:</span>
              <CycleDisplay className="font-medium text-blue-600" />
            </div>
          </div>
          <span className="text-xs md:text-sm font-mono bg-gray-200 rounded px-2 py-1 self-end">{dateTime}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
            disabled={selectedBarangays.size === 0 || updating}
            onClick={() => handleBulkAwardOperationRequest(true)}
          >
            <Award className="w-4 h-4 mr-2" />
            Grant Awards ({selectedBarangays.size})
          </Button>
          <Button
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
            disabled={selectedBarangays.size === 0 || updating}
            onClick={() => handleBulkAwardOperationRequest(false)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Remove Awards ({selectedBarangays.size})
          </Button>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Awards
          </Button>
          <Button
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Awards
          </Button>
        </div>

        {/* Cycle Transition Management */}
        {historicalCycles.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>Cycle Transition Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    >
                      <History className="w-4 h-4 mr-2" />
                      View Historical Awards
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <History className="w-5 h-5 text-orange-600" />
                        <span>Historical Award Data</span>
                      </DialogTitle>
                      <DialogDescription>
                        View award data from previous survey cycles
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Historical Cycles Selector */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Select Historical Cycle</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {historicalCycles.map((cycleData) => (
                            <Card
                              key={cycleData.cycle.cycle_id}
                              className={cn(
                                "cursor-pointer transition-all hover:shadow-md",
                                selectedHistoricalCycle === cycleData.cycle.cycle_id
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                              onClick={() => {
                                setSelectedHistoricalCycle(cycleData.cycle.cycle_id)
                                loadHistoricalCycleAwards(cycleData.cycle.cycle_id)
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-gray-900">{cycleData.cycle.name}</h5>
                                    <p className="text-sm text-gray-600">Year {cycleData.cycle.year}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-green-600">
                                      {cycleData.summary.awardeeCount} awardees
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {cycleData.summary.percentage}% rate
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleCopyAwardsRequest(cycleData.cycle.cycle_id, cycleData.cycle.name)
                                    }}
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy to Active
                                  </Button>
                                  <span className="text-xs text-gray-400">
                                    {new Date(cycleData.cycle.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Historical Awards Display */}
                      {selectedHistoricalCycle && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              Awards for {historicalCycles.find(c => c.cycle.cycle_id === selectedHistoricalCycle)?.cycle.name}
                            </h4>
                            {historicalSummary && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {historicalSummary.awardeeCount} / {historicalSummary.totalBarangays} awardees
                              </Badge>
                            )}
                          </div>

                          {loadingHistorical ? (
                            <div className="p-8 text-center text-gray-500">Loading historical data...</div>
                          ) : historicalAwards.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No award data found for this cycle</div>
                          ) : (
                            <div className="max-h-96 overflow-y-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Barangay Name</TableHead>
                                    <TableHead>Award Status</TableHead>
                                    <TableHead>Awarded Date</TableHead>
                                    <TableHead>Notes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {historicalAwards.map((barangay) => (
                                    <TableRow key={barangay.barangay_id}>
                                      <TableCell className="font-medium">{barangay.barangay_name}</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          {barangay.award_status?.is_awardee ? (
                                            <>
                                              <Award className="w-4 h-4 text-green-600" />
                                              <span className="text-green-600 font-medium">Awardee</span>
                                            </>
                                          ) : (
                                            <>
                                              <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                                                <span className="text-red-600 text-xs font-bold">×</span>
                                              </div>
                                              <span className="text-red-600">Non-Awardee</span>
                                            </>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {barangay.award_status?.awarded_date ? (
                                          <span className="text-xs text-gray-600">
                                            {new Date(barangay.award_status.awarded_date).toLocaleDateString()}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400 text-xs">N/A</span>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {barangay.award_status?.notes ? (
                                          <span className="text-xs text-gray-600 italic">
                                            {barangay.award_status.notes}
                                          </span>
                                        ) : (
                                          <span className="text-gray-400 text-xs">No notes</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="text-sm text-orange-700">
                <strong>{historicalCycles.length}</strong> historical cycles available for review and award copying
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Award Summary Banner */}
      {summary && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Award Summary for {activeCycle?.name}</span>
                </div>
                <div className="text-sm text-blue-700">
                  <strong>{summary.awardeeCount}</strong> out of <strong>{summary.totalBarangays}</strong> barangays
                  are SGLGB awardees ({summary.percentage}% award rate)
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedBarangays.size > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {selectedBarangays.size} selected
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Awardee</span>
                  <div className="w-2 h-2 bg-gray-400 rounded-full ml-2"></div>
                  <span>Non-Awardee</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Award Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Barangays</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalBarangays}</p>
                  <p className="text-xs text-gray-500 mt-1">Active barangays in system</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">SGLGB Awardees</p>
                  <p className="text-2xl font-bold text-green-600">{summary.awardeeCount}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {summary.awardeeCount} out of {summary.totalBarangays} barangays
                  </p>
                </div>
                <div className="relative">
                  <Award className="w-8 h-8 text-green-500" />
                  {summary.awardeeCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Non-Awardees</p>
                  <p className="text-2xl font-bold text-red-600">{summary.nonAwardeeCount}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Eligible for award consideration
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">×</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Award Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.percentage}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${summary.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">of total</span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Barangays Award Management Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl">
            <div className="flex items-center space-x-2">
              <Award className="w-6 h-6 text-blue-500" />
              <span>Barangay Award Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-sm"
              >
                {selectedBarangays.size === barangays.length ? (
                  <CheckSquare className="w-4 h-4 mr-1" />
                ) : (
                  <Square className="w-4 h-4 mr-1" />
                )}
                Select All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading award data...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="p-0 h-auto"
                      >
                        {selectedBarangays.size === barangays.length ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="font-medium">Barangay Name</TableHead>
                    <TableHead className="font-medium">Households</TableHead>
                    <TableHead className="font-medium">Population</TableHead>
                    <TableHead className="font-medium">Award Status</TableHead>
                    <TableHead className="font-medium">Awarded Date</TableHead>
                    <TableHead className="font-medium">Status Indicator</TableHead>
                    <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barangays.map((barangay) => (
                    <TableRow key={barangay.barangay_id} className="hover:bg-gray-50">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectBarangay(barangay.barangay_id)}
                          className="p-0 h-auto"
                        >
                          {selectedBarangays.has(barangay.barangay_id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{barangay.barangay_name}</TableCell>
                      <TableCell>{barangay.households ?? "-"}</TableCell>
                      <TableCell>{barangay.population ? barangay.population.toLocaleString() : "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={barangay.award_status?.is_awardee ? "default" : "secondary"}
                          className={cn(
                            "text-xs",
                            barangay.award_status?.is_awardee
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          )}
                        >
                          {barangay.award_status?.is_awardee ? (
                            <>
                              <Award className="w-3 h-3 mr-1" />
                              Awardee
                            </>
                          ) : (
                            <>
                              <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                              Non-Awardee
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {barangay.award_status?.is_awardee && barangay.award_status?.awarded_date ? (
                          <span className="text-xs text-green-600">
                            {new Date(barangay.award_status.awarded_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {barangay.award_status?.is_awardee ? (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-600 font-medium">Active Awardee</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              <span className="text-xs text-gray-500">Non-Awardee</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-green-50"
                            onClick={() => {
                              setEditAwardModal({
                                open: true,
                                barangay: barangay
                              })
                            }}
                            disabled={updating}
                          >
                            <Edit className="w-3 h-3 text-green-600" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedBarangayHistory(barangay)
                                  loadAwardHistory(barangay.barangay_id)
                                }}
                              >
                                <History className="w-3 h-3 text-blue-600" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <History className="w-5 h-5 text-blue-600" />
                                  <span>Award History</span>
                                </DialogTitle>
                                <DialogDescription>
                                  SGLGB award history for <strong>{selectedBarangayHistory?.barangay_name}</strong> across all survey cycles
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4 max-h-96 overflow-y-auto">
                                {awardHistory.length === 0 ? (
                                  <div className="text-center text-gray-500 py-8">
                                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm">No award history available</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      This barangay has no recorded award history across survey cycles.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                    {awardHistory.map((record, index) => (
                                      <div key={record.cycleId} className="relative flex items-start gap-4 pb-6">
                                        {/* Timeline dot */}
                                        <div className={cn(
                                          "relative z-10 w-3 h-3 rounded-full border-2 bg-white",
                                          record.isAwardee ? "border-green-500" : "border-red-500"
                                        )}>
                                          {record.isAwardee && (
                                            <div className="absolute inset-0.5 bg-green-500 rounded-full"></div>
                                          )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-2">
                                            <div>
                                              <h4 className="font-medium text-gray-900">{record.cycleName}</h4>
                                              <p className="text-sm text-gray-600">Year {record.year}</p>
                                            </div>
                                            <Badge
                                              variant={record.isAwardee ? "default" : "destructive"}
                                              className={cn(
                                                "text-xs",
                                                record.isAwardee && "bg-green-100 text-green-800",
                                                !record.isAwardee && "bg-red-100 text-red-800",
                                              )}
                                            >
                                              {record.isAwardee && <Award className="w-3 h-3 mr-1" />}
                                              {record.isAwardee ? "Awardee" : "Non-Awardee"}
                                            </Badge>
                                          </div>

                                          {record.awardedDate && (
                                            <p className="text-xs text-gray-500">
                                              Awarded: {new Date(record.awardedDate).toLocaleDateString()}
                                            </p>
                                          )}

                                          {record.notes && (
                                            <p className="text-xs text-gray-600 mt-1 italic">
                                              "{record.notes}"
                                            </p>
                                          )}

                                          <p className="text-xs text-gray-400 mt-1">
                                            Updated: {new Date(record.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Award Change Confirmation Dialog */}
      <Dialog open={confirmationDialog.open} onOpenChange={(open) =>
        setConfirmationDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {confirmationDialog.action === 'grant' ? (
                <Award className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span>
                {confirmationDialog.action === 'grant' ? 'Grant Award' : 'Remove Award'}
              </span>
            </DialogTitle>
            <DialogDescription>
              {confirmationDialog.type === 'single' ? (
                <>
                  Are you sure you want to {confirmationDialog.action === 'grant' ? 'grant SGLGB award status to' : 'remove SGLGB award status from'}{' '}
                  <strong>{confirmationDialog.barangayName}</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to {confirmationDialog.action === 'grant' ? 'grant SGLGB award status to' : 'remove SGLGB award status from'}{' '}
                  <strong>{confirmationDialog.count} selected barangays</strong>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className={cn(
            "p-4 rounded-lg border",
            confirmationDialog.action === 'grant' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <div className="flex items-center gap-2 text-sm">
              {confirmationDialog.action === 'grant' ? (
                <>
                  <Award className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">
                    This will mark the barangay{confirmationDialog.type === 'bulk' ? 's' : ''} as SGLGB awardee{confirmationDialog.type === 'bulk' ? 's' : ''} for the current cycle.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-red-800">
                    This will remove SGLGB award status from the barangay{confirmationDialog.type === 'bulk' ? 's' : ''} for the current cycle.
                  </span>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmationDialog(prev => ({ ...prev, open: false }))}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant={confirmationDialog.action === 'grant' ? "default" : "destructive"}
              onClick={() => {
                if (confirmationDialog.type === 'single' && confirmationDialog.barangayId) {
                  executeAwardStatusChange(
                    confirmationDialog.barangayId,
                    confirmationDialog.action === 'grant'
                  )
                } else if (confirmationDialog.type === 'bulk') {
                  executeBulkAwardOperation(confirmationDialog.action === 'grant')
                }
              }}
              disabled={updating}
              className={cn(
                confirmationDialog.action === 'grant' && "bg-green-600 hover:bg-green-700",
                confirmationDialog.action === 'remove' && "bg-red-600 hover:bg-red-700"
              )}
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {confirmationDialog.action === 'grant' ? 'Granting...' : 'Removing...'}
                </>
              ) : (
                <>
                  {confirmationDialog.action === 'grant' ? (
                    <Award className="w-4 h-4 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mr-2" />
                  )}
                  {confirmationDialog.action === 'grant' ? 'Grant Award' : 'Remove Award'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Awards Confirmation Dialog */}
      <Dialog open={copyAwardsDialog.open} onOpenChange={(open) =>
        setCopyAwardsDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Copy className="w-5 h-5 text-orange-600" />
              <span>Copy Awards Between Cycles</span>
            </DialogTitle>
            <DialogDescription>
              Copy award data from <strong>{copyAwardsDialog.sourceCycleName}</strong> to the active cycle
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
              <div className="flex items-center gap-2 text-sm">
                <ArrowRight className="w-4 h-4 text-orange-600" />
                <span className="text-orange-800">
                  This will copy all award assignments from the selected historical cycle to the current active cycle.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="overwrite-awards"
                  checked={copyAwardsDialog.overwrite}
                  onChange={(e) => setCopyAwardsDialog(prev => ({
                    ...prev,
                    overwrite: e.target.checked
                  }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="overwrite-awards" className="text-sm text-gray-700">
                  Overwrite existing awards in active cycle
                </label>
              </div>

              {copyAwardsDialog.overwrite && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50">
                  <div className="flex items-center gap-2 text-sm text-red-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      Warning: This will replace all existing award data in the active cycle.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCopyAwardsDialog(prev => ({ ...prev, open: false }))}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={executeCopyAwards}
              disabled={updating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Awards
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Award Modal */}
      <Dialog open={editAwardModal.open} onOpenChange={(open) => setEditAwardModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-green-600" />
              <span>Edit Award Status</span>
            </DialogTitle>
            <DialogDescription>
              Update the SGLGB award status for <strong>{editAwardModal.barangay?.barangay_name}</strong>
            </DialogDescription>
          </DialogHeader>

          {editAwardModal.barangay && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Barangay Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {editAwardModal.barangay.barangay_name}</p>
                  <p><strong>Population:</strong> {editAwardModal.barangay.population?.toLocaleString() || 'N/A'}</p>
                  <p><strong>Households:</strong> {editAwardModal.barangay.households?.toLocaleString() || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Award Status</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                    <input
                      type="radio"
                      name="awardStatus"
                      value="true"
                      defaultChecked={editAwardModal.barangay.award_status?.is_awardee}
                      className="text-green-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Grant Award</span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="awardStatus"
                      value="false"
                      defaultChecked={!editAwardModal.barangay.award_status?.is_awardee}
                      className="text-gray-600"
                    />
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <span className="font-medium text-gray-800">Remove Award</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This change will apply to the current active survey cycle: {activeCycle?.name} ({activeCycle?.year})
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setEditAwardModal({ open: false })}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editAwardModal.barangay) {
                  const radioButtons = document.querySelectorAll('input[name="awardStatus"]:checked') as NodeListOf<HTMLInputElement>;
                  const isAwardee = radioButtons[0]?.value === 'true';
                  handleAwardStatusChangeRequest(
                    editAwardModal.barangay.barangay_id,
                    isAwardee,
                    editAwardModal.barangay.barangay_name
                  );
                  setEditAwardModal({ open: false });
                }
              }}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              {updating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}