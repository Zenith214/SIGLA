"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Calendar,
  Users,
  TrendingUp,
  Copy,
  ArrowRight,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface HistoricalAwardsViewerProps {
  onCopyAwards?: (sourceCycleId: number, sourceCycleName: string) => void
  className?: string
}

export function HistoricalAwardsViewer({ onCopyAwards, className }: HistoricalAwardsViewerProps) {
  const [historicalCycles, setHistoricalCycles] = useState<HistoricalCycleData[]>([])
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null)
  const [selectedCycleData, setSelectedCycleData] = useState<HistoricalCycleData | null>(null)
  const [awards, setAwards] = useState<BarangayWithAward[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAwards, setLoadingAwards] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  // Load historical cycles on component mount
  useEffect(() => {
    loadHistoricalCycles()
  }, [])

  // Load awards when cycle selection changes
  useEffect(() => {
    if (selectedCycleId) {
      loadCycleAwards(selectedCycleId)
    } else {
      setAwards([])
      setSelectedCycleData(null)
    }
  }, [selectedCycleId])

  const loadHistoricalCycles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cycle-awards/historical')
      if (!response.ok) {
        throw new Error('Failed to fetch historical cycles')
      }

      const data = await response.json()
      setHistoricalCycles(data.data.cycles || [])

      // Auto-select the most recent cycle if available
      if (data.data.cycles && data.data.cycles.length > 0) {
        const mostRecent = data.data.cycles[0] // Assuming they're sorted by date
        setSelectedCycleId(mostRecent.cycle.cycle_id)
      }
    } catch (err) {
      console.error('Error loading historical cycles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load historical cycles')
      setHistoricalCycles([])
    } finally {
      setLoading(false)
    }
  }

  const loadCycleAwards = async (cycleId: number) => {
    try {
      setLoadingAwards(true)

      const [awardsResponse, summaryResponse] = await Promise.all([
        fetch(`/api/cycle-awards/historical?cycle_id=${cycleId}&include_barangays=true`),
        fetch(`/api/cycle-awards/historical?cycle_id=${cycleId}&summary=true`)
      ])

      if (!awardsResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch cycle data')
      }

      const [awardsData, summaryData] = await Promise.all([
        awardsResponse.json(),
        summaryResponse.json()
      ])

      // Transform the data to match our interface
      const transformedAwards: BarangayWithAward[] = (awardsData.data.awards || []).map((award: any) => ({
        barangay_id: award.barangay.barangay_id,
        barangay_name: award.barangay.barangay_name,
        households: award.barangay.households,
        population: award.barangay.population,
        award_status: {
          id: award.id,
          is_awardee: award.is_awardee,
          awarded_date: award.awarded_date,
          notes: award.notes,
          created_at: award.created_at
        }
      }))

      setAwards(transformedAwards)
      
      // Find and set the selected cycle data
      const cycleData = historicalCycles.find(c => c.cycle.cycle_id === cycleId)
      if (cycleData) {
        setSelectedCycleData({
          ...cycleData,
          summary: summaryData.data.summary
        })
      }
    } catch (err) {
      console.error('Error loading cycle awards:', err)
      setAwards([])
      setSelectedCycleData(null)
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Failed to load awards for selected cycle",
        duration: 4000
      })
    } finally {
      setLoadingAwards(false)
    }
  }

  const handleCopyAwards = () => {
    if (selectedCycleData && onCopyAwards) {
      onCopyAwards(selectedCycleData.cycle.cycle_id, selectedCycleData.cycle.name)
    }
  }

  const exportAwards = () => {
    if (!selectedCycleData || awards.length === 0) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "No awards data to export",
        duration: 4000
      })
      return
    }

    // Create CSV content
    const headers = ['Barangay Name', 'Award Status', 'Awarded Date', 'Notes', 'Households', 'Population']
    const csvContent = [
      headers.join(','),
      ...awards.map(barangay => [
        `"${barangay.barangay_name}"`,
        barangay.award_status?.is_awardee ? 'Awardee' : 'Non-Awardee',
        barangay.award_status?.awarded_date ? new Date(barangay.award_status.awarded_date).toLocaleDateString() : 'N/A',
        `"${barangay.award_status?.notes || ''}"`,
        barangay.households || 0,
        barangay.population || 0
      ].join(','))
    ].join('\n')

    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `awards-${selectedCycleData.cycle.name}-${selectedCycleData.cycle.year}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      variant: "success",
      title: "Export Successful",
      description: `Awards data exported for ${selectedCycleData.cycle.name}`,
      duration: 4000
    })
  }

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="p-8 text-center text-gray-500">Loading historical cycles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-red-800">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (historicalCycles.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">No Historical Data</h3>
            <p className="text-gray-500">No historical survey cycles with award data found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cycle Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Historical Award Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Historical Cycle
              </label>
              <Select
                value={selectedCycleId?.toString() || ""}
                onValueChange={(value) => setSelectedCycleId(parseInt(value, 10))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a historical cycle..." />
                </SelectTrigger>
                <SelectContent>
                  {historicalCycles.map((cycleData) => (
                    <SelectItem key={cycleData.cycle.cycle_id} value={cycleData.cycle.cycle_id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{cycleData.cycle.name} ({cycleData.cycle.year})</span>
                        <Badge variant="secondary" className="ml-2">
                          {cycleData.summary.awardeeCount} awardees
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedCycleData && (
              <div className="flex space-x-2">
                {onCopyAwards && (
                  <Button
                    variant="outline"
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                    onClick={handleCopyAwards}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Active
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={exportAwards}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected Cycle Summary */}
      {selectedCycleData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cycle Year</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCycleData.cycle.year}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedCycleData.cycle.name}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Barangays</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCycleData.summary.totalBarangays}</p>
                  <p className="text-xs text-gray-500 mt-1">In this cycle</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Awardees</p>
                  <p className="text-2xl font-bold text-green-600">{selectedCycleData.summary.awardeeCount}</p>
                  <p className="text-xs text-green-600 mt-1">SGLGB recipients</p>
                </div>
                <Award className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Award Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedCycleData.summary.percentage}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${selectedCycleData.summary.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Awards Table */}
      {selectedCycleData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-green-600" />
                <span>Award Details - {selectedCycleData.cycle.name}</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedCycleData.summary.awardeeCount} / {selectedCycleData.summary.totalBarangays} awardees
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAwards ? (
              <div className="p-8 text-center text-gray-500">Loading awards data...</div>
            ) : awards.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No award data found for this cycle</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Barangay Name</TableHead>
                      <TableHead>Award Status</TableHead>
                      <TableHead>Awarded Date</TableHead>
                      <TableHead>Households</TableHead>
                      <TableHead>Population</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {awards.map((barangay) => (
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
                        <TableCell>{barangay.households ?? "-"}</TableCell>
                        <TableCell>{barangay.population ? barangay.population.toLocaleString() : "-"}</TableCell>
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}