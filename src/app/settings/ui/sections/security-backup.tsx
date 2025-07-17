"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Download, Database, AlertTriangle, CheckCircle } from "lucide-react"

const backupHistory = [
  { id: 1, date: "2024-01-15", time: "14:30", size: "2.4 MB", status: "Success" },
  { id: 2, date: "2024-01-14", time: "14:30", size: "2.3 MB", status: "Success" },
  { id: 3, date: "2024-01-13", time: "14:30", size: "2.2 MB", status: "Success" },
  { id: 4, date: "2024-01-12", time: "14:30", size: "2.1 MB", status: "Failed" },
]

export function SecurityBackup() {
  const [surveyAccess, setSurveyAccess] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [dataEncryption, setDataEncryption] = useState(true)
  const [auditLogging, setAuditLogging] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security & Backup</h1>
        <p className="text-gray-600">Manage system security settings and data backups</p>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="survey-access" className="text-sm font-medium">
                Enable Survey Access
              </Label>
              <p className="text-xs text-gray-500 mt-1">Allow users to access and submit survey responses</p>
            </div>
            <Switch id="survey-access" checked={surveyAccess} onCheckedChange={setSurveyAccess} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="data-encryption" className="text-sm font-medium">
                Data Encryption
              </Label>
              <p className="text-xs text-gray-500 mt-1">Encrypt sensitive survey data at rest</p>
            </div>
            <Switch id="data-encryption" checked={dataEncryption} onCheckedChange={setDataEncryption} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="audit-logging" className="text-sm font-medium">
                Audit Logging
              </Label>
              <p className="text-xs text-gray-500 mt-1">Log all user actions and system changes</p>
            </div>
            <Switch id="audit-logging" checked={auditLogging} onCheckedChange={setAuditLogging} />
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Last security scan completed on January 15, 2024. No vulnerabilities detected.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-blue-500" />
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
            <Button variant="outline" className="h-16 flex-col bg-transparent">
              <Download className="w-5 h-5 mb-1" />
              <span>Export User Data</span>
              <span className="text-xs opacity-60">CSV Format</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-16 flex-col bg-transparent">
              <Download className="w-5 h-5 mb-1" />
              <span>Export Reports</span>
              <span className="text-xs opacity-60">PDF Format</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col bg-transparent">
              <Download className="w-5 h-5 mb-1" />
              <span>Export Audit Logs</span>
              <span className="text-xs opacity-60">TXT Format</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-500" />
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
              Trigger Backup Now
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
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
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backupHistory.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
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
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
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
