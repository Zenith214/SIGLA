"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp } from "lucide-react"

const barangays = [
  { id: 1, name: "Barangay San Jose", households: 245 },
  { id: 2, name: "Barangay Santa Maria", households: 189 },
  { id: 3, name: "Barangay San Pedro", households: 312 },
  { id: 4, name: "Barangay Nueva Vida", households: 156 },
]

const targets = [
  { id: 1, barangay: "Barangay San Jose", target: 200, achieved: 156, percentage: 78 },
  { id: 2, barangay: "Barangay Santa Maria", target: 150, achieved: 142, percentage: 95 },
  { id: 3, barangay: "Barangay San Pedro", target: 250, achieved: 189, percentage: 76 },
  { id: 4, barangay: "Barangay Nueva Vida", target: 120, achieved: 98, percentage: 82 },
]

export function SurveyTargets() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Survey Targets</h1>
        <p className="text-gray-600 text-lg">Set and monitor survey response targets by barangay</p>
      </div>

      {/* Set New Target */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Target className="w-6 h-6 text-blue-500" />
            <span>Set Survey Target</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="target-barangay" className="text-sm font-medium">
                Select Barangay
              </Label>
              <Select>
                <SelectTrigger className="bg-white border-gray-300 rounded">
                  <SelectValue placeholder="Choose barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((barangay) => (
                    <SelectItem key={barangay.id} value={barangay.name}>
                      {barangay.name} ({barangay.households} households)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected-responses" className="text-sm font-medium">
                Target Responses
              </Label>
              <Input
                id="expected-responses"
                type="number"
                placeholder="0"
                className="bg-white border-gray-300 rounded"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium opacity-0">Action</Label>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Set Target</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Progress */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <span>Target Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {targets.map((target) => (
              <div key={target.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 text-lg">{target.barangay}</h3>
                    <p className="text-sm text-gray-600">
                      {target.achieved} of {target.target} responses ({target.percentage}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-gray-900">{target.percentage}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                <Progress value={target.percentage} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
