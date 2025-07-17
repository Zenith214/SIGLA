"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Database, AlertTriangle, CheckCircle } from "lucide-react"

const backupHistory = [
  { id: 1, date: "2024-01-15", time: "14:30", size: "2.4 MB", status: "Success" },
  { id: 2, date: "2024-01-14", time: "14:30", size: "2.3 MB", status: "Success" },
  { id: 3, date: "2024-01-13", time: "14:30", size: "2.2 MB", status: "Success" },
  { id: 4, date: "2024-01-12", time: "14:30", size: "2.1 MB", status: "Failed" },
  { id: 5, date: "2024-01-11", time: "14:30", size: "2.0 MB", status: "Success" },
]

export function Backup() {
  const [autoBackup, setAutoBackup] = useState(true)

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Data Backup</h1>
        <p className="text-gray-600 text-lg">Manage system data backups and exports</p>
      </div>

      {/* Data Export */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Download className="w-6 h-6 text-blue-500" />
            <span>Data Export</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="h-16 bg-green-600 hover:bg-green-700 text-white flex-col">
              <Download className="w-5 h-5 mb-1" />
              <span>Export All Survey Data</span>
              <span className="text-xs opacity-80">CSV Format</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col bg-transparent hover:bg-gray-50">
              <Download className="w-5 h-5 mb-1" />
              <span>Export User Data</span>
              <span className="text-xs opacity-60">CSV Format</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-16 flex-col bg-transparent hover:bg-gray-50">
              <Download className="w-5 h-5 mb-1" />
              <span>Export Barangay Data</span>
              <span className="text-xs opacity-60">CSV Format</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col bg-transparent hover:bg-gray-50">
              <Download className="w-5 h-5 mb-1" />
              <span>Export Reports</span>
              <span className="text-xs opacity-60">PDF Format</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Management */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Database className="w-6 h-6 text-blue-500" />
            <span>Backup Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-backup" className="text-sm font-medium">
                Automatic Daily Backup
              </Label>
              <p className="text-xs text-gray-500 mt-1">Automatically backup data every day at 2:30 PM</p>
            </div>
            <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>

          <div className="flex space-x-4">
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
              <Database className="w-4 h-4 mr-2" />
              Create Backup Now
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Download Latest Backup
            </Button>
          </div>

          {/* Backup Progress (if backup is running) */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Backup in Progress</span>
              <span className="text-sm text-blue-600">75%</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-blue-600 mt-2">Estimated time remaining: 2 minutes</p>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {backup.status === "Success" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      {backup.date} at {backup.time}
                    </p>
                    <p className="text-xs text-gray-600">Size: {backup.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={backup.status === "Success" ? "default" : "destructive"} className="text-xs">
                    {backup.status}
                  </Badge>
                  {backup.status === "Success" && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-200">
                      <Download className="w-3 h-3" />
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
