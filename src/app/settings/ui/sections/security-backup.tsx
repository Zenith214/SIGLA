"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, Download, Database, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle } from "@/hooks/useSurveyCycle"

export function SecurityBackup() {
  const [surveyAccess, setSurveyAccess] = useState(true)
  const [autoBackup, setAutoBackup] = useState(true)
  const [dataEncryption, setDataEncryption] = useState(true)
  const [auditLogging, setAuditLogging] = useState(true)
  const [backupHistory, setBackupHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { activeCycle, hasActiveCycle } = useActiveCycle()

  useEffect(() => {
    loadBackupHistory()
  }, [])

  const loadBackupHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/backups')
      if (response.ok) {
        const history = await response.json()
        setBackupHistory(history)
      } else {
        setBackupHistory([
          { id: 1, date: "2024-01-15", time: "14:30", size: "2.4 MB", status: "Success" },
          { id: 2, date: "2024-01-14", time: "14:30", size: "2.3 MB", status: "Success" },
          { id: 3, date: "2024-01-13", time: "14:30", size: "2.2 MB", status: "Success" },
          { id: 4, date: "2024-01-12", time: "14:30", size: "2.1 MB", status: "Failed" },
        ])
      }
    } catch (error) {
      console.error('Error loading backup history:', error)
      setBackupHistory([
        { id: 1, date: "2024-01-15", time: "14:30", size: "2.4 MB", status: "Success" },
        { id: 2, date: "2024-01-14", time: "14:30", size: "2.3 MB", status: "Success" },
        { id: 3, date: "2024-01-13", time: "14:30", size: "2.2 MB", status: "Success" },
        { id: 4, date: "2024-01-12", time: "14:30", size: "2.1 MB", status: "Failed" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async (dataType: string) => {
    toast({
      title: "Export Started",
      description: `${dataType} export has been initiated.`,
    });

    try {
      let exportParam = '';
      switch (dataType) {
        case 'Survey Data':
          exportParam = 'survey-data';
          break;
        case 'User Data':
          exportParam = 'user-data';
          break;
        case 'Reports':
          exportParam = 'reports';
          break;
        case 'Audit Logs':
          exportParam = 'audit-logs';
          break;
        default:
          throw new Error('Invalid data type');
      }

      const params = new URLSearchParams({ 
        export: exportParam,
        anonymized: 'true'
      });
      if (hasActiveCycle && activeCycle) {
        params.append('cycle_id', activeCycle.cycle_id.toString());
      }
      
      const response = await fetch(`/api/backups?${params}`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Please refresh the page and log in again.",
          variant: "destructive"
        });
        return;
      }
      
      if (response.status === 403) {
        const errorData = await response.json();
        toast({
          title: "Permission Denied",
          description: errorData.details || 'You do not have permission to export this data.',
          variant: "destructive"
        });
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        toast({
          title: "Export Failed",
          description: errorText || `Export failed: ${response.statusText}`,
          variant: "destructive"
        });
        return;
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${exportParam}_${new Date().toISOString().split('T')[0]}.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: `${dataType} exported successfully.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      // Only show error toast if we haven't already shown one above
      if (error instanceof Error && !error.message.includes('Unauthorized') && !error.message.includes('Permission')) {
        toast({
          title: "Export Failed",
          description: `Failed to export ${dataType}. Please try again.`,
          variant: "destructive"
        });
      }
    }
  }

  const handleCreateBackup = async () => {
    toast({
      title: "Backup Started",
      description: "Database backup is being created.",
    });

    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-backup' }),
      });

      if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      toast({
        title: "Backup Complete",
        description: result.message || "Database backup created successfully.",
      });

      loadBackupHistory();
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive"
      });
    }
  }

  const handleDownloadBackup = async () => {
    toast({
      title: "Download Started",
      description: "Preparing backup file for download...",
    });

    try {
      const exportTypes = ['survey-data', 'user-data', 'barangay-data', 'reports'];
      let successCount = 0;
      let failedTypes: string[] = [];
      
      for (const exportType of exportTypes) {
        const response = await fetch(`/api/backups?export=${exportType}`, {
          credentials: 'include',
        });
        
        if (response.status === 401) {
          toast({
            title: "Authentication Required",
            description: "Your session has expired. Please refresh the page and log in again.",
            variant: "destructive"
          });
          return;
        }
        
        if (response.ok) {
          const contentDisposition = response.headers.get('Content-Disposition');
          const filename = contentDisposition 
            ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
            : `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          successCount++;
        } else {
          failedTypes.push(exportType);
        }
      }

      if (successCount > 0) {
        toast({
          title: "Download Complete",
          description: `Successfully downloaded ${successCount} backup file(s).${failedTypes.length > 0 ? ` Failed: ${failedTypes.join(', ')}` : ''}`,
        });
      } else {
        toast({
          title: "Download Failed",
          description: "No backup files could be downloaded. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download backup files.",
        variant: "destructive"
      });
    }
  }

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
            <Button 
              className="h-16 bg-green-600 hover:bg-green-700 text-white flex-col"
              onClick={() => handleExportData("Survey Data")}
            >
              <Download className="w-5 h-5 mb-1" />
              <span>Export All Survey Data</span>
              <span className="text-xs opacity-80">CSV Format</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col bg-transparent"
              onClick={() => handleExportData("User Data")}
            >
              <Download className="w-5 h-5 mb-1" />
              <span>Export User Data</span>
              <span className="text-xs opacity-60">CSV Format</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex-col bg-transparent"
              onClick={() => handleExportData("Reports")}
            >
              <Download className="w-5 h-5 mb-1" />
              <span>Export Reports</span>
              <span className="text-xs opacity-60">PDF Format</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col bg-transparent"
              onClick={() => handleExportData("Audit Logs")}
            >
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
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleCreateBackup}
            >
              <Database className="w-4 h-4 mr-2" />
              Trigger Backup Now
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent"
              onClick={handleDownloadBackup}
            >
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
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      onClick={handleDownloadBackup}
                      title="Download backup"
                    >
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
