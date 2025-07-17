"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCheck, MapPin, Users, Edit, Trash2 } from "lucide-react"

const barangays = [
  { id: 1, name: "Barangay San Jose", households: 245 },
  { id: 2, name: "Barangay Santa Maria", households: 189 },
  { id: 3, name: "Barangay San Pedro", households: 312 },
  { id: 4, name: "Barangay Nueva Vida", households: 156 },
]

const interviewers = [
  { id: 1, name: "Juan Dela Cruz", email: "juan@sigla.gov" },
  { id: 2, name: "Ana Rodriguez", email: "ana@sigla.gov" },
  { id: 3, name: "Carlos Mendoza", email: "carlos@sigla.gov" },
  { id: 4, name: "Lisa Garcia", email: "lisa@sigla.gov" },
]

const assignments = [
  { id: 1, barangay: "Barangay San Jose", interviewer: "Juan Dela Cruz", status: "Active", progress: 78 },
  { id: 2, barangay: "Barangay Santa Maria", interviewer: "Ana Rodriguez", status: "Active", progress: 95 },
  { id: 3, barangay: "Barangay San Pedro", interviewer: "Carlos Mendoza", status: "Active", progress: 45 },
  { id: 4, barangay: "Barangay Nueva Vida", interviewer: "Lisa Garcia", status: "Pending", progress: 0 },
]

export function Assignments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interviewer Assignments</h1>
        <p className="text-gray-600">Assign interviewers to barangays and monitor progress</p>
      </div>

      {/* New Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            <span>Create New Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Barangay</label>
              <Select>
                <SelectTrigger className="bg-white border-gray-300 rounded">
                  <SelectValue placeholder="Choose barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((barangay) => (
                    <SelectItem key={barangay.id} value={barangay.name}>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {barangay.name} ({barangay.households} households)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Interviewer</label>
              <Select>
                <SelectTrigger className="bg-white border-gray-300 rounded">
                  <SelectValue placeholder="Choose interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {interviewers.map((interviewer) => (
                    <SelectItem key={interviewer.id} value={interviewer.name}>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{interviewer.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Confirm Assignment</Button>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Current Assignments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Barangay</TableHead>
                <TableHead className="font-medium">Interviewer</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Progress</TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.barangay}</TableCell>
                  <TableCell className="text-gray-600">{assignment.interviewer}</TableCell>
                  <TableCell>
                    <Badge variant={assignment.status === "Active" ? "default" : "secondary"} className="text-xs">
                      {assignment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${assignment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{assignment.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4</div>
              <div className="text-sm text-gray-600">Total Assignments</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">55%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
