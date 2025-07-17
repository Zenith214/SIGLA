"use client"

import { useState } from "react"
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
} from "@/components/ui/dialog"
import { MapPin, Plus, Edit, Trash2, Award, History } from "lucide-react"

const barangays = [
  {
    id: 1,
    name: "Barangay San Jose",
    households: 245,
    population: 1230,
    currentStatus: "Awardee",
    captain: "Maria Santos",
    history: [
      { year: "2024", status: "Awardee" },
      { year: "2023", status: "Awardee" },
      { year: "2022", status: "Non-Awardee" },
      { year: "2021", status: "Awardee" },
    ],
  },
  {
    id: 2,
    name: "Barangay Santa Maria",
    households: 189,
    population: 945,
    currentStatus: "Non-Awardee",
    captain: "Juan Dela Cruz",
    history: [
      { year: "2024", status: "Non-Awardee" },
      { year: "2023", status: "Non-Awardee" },
      { year: "2022", status: "Awardee" },
      { year: "2021", status: "Awardee" },
    ],
  },
  {
    id: 3,
    name: "Barangay San Pedro",
    households: 312,
    population: 1560,
    currentStatus: "Awardee",
    captain: "Ana Rodriguez",
    history: [
      { year: "2024", status: "Awardee" },
      { year: "2023", status: "Awardee" },
      { year: "2022", status: "Awardee" },
      { year: "2021", status: "Non-Awardee" },
    ],
  },
  {
    id: 4,
    name: "Barangay Nueva Vida",
    households: 156,
    population: 780,
    currentStatus: "Pending",
    captain: "Pedro Martinez",
    history: [
      { year: "2024", status: "Pending" },
      { year: "2023", status: "Non-Awardee" },
      { year: "2022", status: "Non-Awardee" },
      { year: "2021", status: "Non-Awardee" },
    ],
  },
  {
    id: 5,
    name: "Barangay Maligaya",
    households: 203,
    population: 1015,
    currentStatus: "Awardee",
    captain: "Lisa Garcia",
    history: [
      { year: "2024", status: "Awardee" },
      { year: "2023", status: "Awardee" },
      { year: "2022", status: "Pending" },
      { year: "2021", status: "Non-Awardee" },
    ],
  },
]

export function Barangays() {
  const [selectedBarangay, setSelectedBarangay] = useState<(typeof barangays)[0] | null>(null)

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Barangay Management</h1>
          <p className="text-gray-600 text-lg">Manage barangays and their SGLGB award information</p>
        </div>
      </div>

      {/* SGLGB Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Barangays</p>
                <p className="text-2xl font-bold text-gray-900">{barangays.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Awardees</p>
                <p className="text-2xl font-bold text-green-600">
                  {barangays.filter((b) => b.currentStatus === "Awardee").length}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non-Awardees</p>
                <p className="text-2xl font-bold text-red-600">
                  {barangays.filter((b) => b.currentStatus === "Non-Awardee").length}
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {barangays.filter((b) => b.currentStatus === "Pending").length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barangays Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <MapPin className="w-6 h-6 text-blue-500" />
            <span>Barangays List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Barangay Name</TableHead>
                  <TableHead className="font-medium">Households</TableHead>
                  <TableHead className="font-medium">Population</TableHead>
                  <TableHead className="font-medium">Captain</TableHead>
                  <TableHead className="font-medium">Current Awardee Status</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barangays.map((barangay) => (
                  <TableRow key={barangay.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{barangay.name}</TableCell>
                    <TableCell>{barangay.households}</TableCell>
                    <TableCell>{barangay.population.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-600">{barangay.captain}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          barangay.currentStatus === "Awardee"
                            ? "default"
                            : barangay.currentStatus === "Non-Awardee"
                              ? "destructive"
                              : "secondary"
                        }
                        className={cn(
                          "text-xs",
                          barangay.currentStatus === "Awardee" && "bg-green-100 text-green-800 hover:bg-green-200",
                          barangay.currentStatus === "Non-Awardee" && "bg-red-100 text-red-800 hover:bg-red-200",
                          barangay.currentStatus === "Pending" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
                        )}
                      >
                        {barangay.currentStatus === "Awardee" && <Award className="w-3 h-3 mr-1" />}
                        {barangay.currentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                              onClick={() => setSelectedBarangay(barangay)}
                            >
                              <History className="w-3 h-3 text-blue-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <History className="w-5 h-5 text-blue-600" />
                                <span>Award History</span>
                              </DialogTitle>
                              <DialogDescription>SGLGB award history for {selectedBarangay?.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 mt-4">
                              {selectedBarangay?.history.map((record) => (
                                <div
                                  key={record.year}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <span className="font-medium text-gray-900">{record.year}</span>
                                  <Badge
                                    variant={
                                      record.status === "Awardee"
                                        ? "default"
                                        : record.status === "Non-Awardee"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                    className={cn(
                                      "text-xs",
                                      record.status === "Awardee" && "bg-green-100 text-green-800",
                                      record.status === "Non-Awardee" && "bg-red-100 text-red-800",
                                      record.status === "Pending" && "bg-yellow-100 text-yellow-800",
                                    )}
                                  >
                                    {record.status === "Awardee" && <Award className="w-3 h-3 mr-1" />}
                                    {record.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
