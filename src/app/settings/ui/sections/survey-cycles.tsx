"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Edit, Trash2 } from "lucide-react"

const surveyCycles = [
  { id: 1, year: "2024", status: "Active", startDate: "2024-01-15", endDate: "2024-12-15", responses: 1247 },
  { id: 2, year: "2023", status: "Completed", startDate: "2023-01-15", endDate: "2023-12-15", responses: 2156 },
  { id: 3, year: "2022", status: "Archived", startDate: "2022-01-15", endDate: "2022-12-15", responses: 1893 },
]

export function SurveyCycles() {
  const [selectedYear, setSelectedYear] = useState("2024")
  const [archivePrevious, setArchivePrevious] = useState(false)

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Survey Cycles</h1>
        <p className="text-gray-600 text-lg">Manage survey cycles and their schedules</p>
      </div>

      {/* Active Survey Cycle */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span>Active Survey Cycle</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="survey-year" className="text-sm font-medium">
              Active Survey Year
            </Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-white border-gray-300 rounded max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <Input id="start-date" type="date" className="bg-white border-gray-300 rounded" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </Label>
              <Input id="end-date" type="date" className="bg-white border-gray-300 rounded" />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="archive-toggle" className="text-sm font-medium">
              Archive Previous Cycle
            </Label>
            <Switch id="archive-toggle" checked={archivePrevious} onCheckedChange={setArchivePrevious} />
          </div>

          <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create New Survey Cycle
          </Button>
        </CardContent>
      </Card>

      {/* Survey Cycle History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Survey Cycle History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surveyCycles.map((cycle) => (
              <div
                key={cycle.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{cycle.year}</h3>
                    <Badge
                      variant={
                        cycle.status === "Active" ? "default" : cycle.status === "Completed" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {cycle.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {cycle.startDate} to {cycle.endDate}
                  </p>
                  <p className="text-sm text-gray-500">{cycle.responses.toLocaleString()} responses collected</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {cycle.status !== "Active" && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
