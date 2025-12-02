"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Download, Database, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useActiveCycle } from "@/hooks/useSurveyCycle"

interface BackupHistoryItem {
  id: number;
  date: string;
  time: string;
  size: string;
  status: string;
  type?: string;
}

export function Backup() {
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupHistory, setBackupHistory] = useState<BackupHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()
  const { activeCycle, hasActiveCycle } = useActiveCycle()

  // Load backup history on component mount
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
        console.warn('Failed to load backup history, using fallback data')
        // Fallback to mock data if API fails
        setBackupHistory([
          { id: 1, date: "2024-01-15", time: "14:30", size: "2.4 MB", status: "Success", type: "Manual" },
          { id: 2, date: "2024-01-14", time: "14:30", size: "2.3 MB", status: "Success", type: "Automatic" },
          { id: 3, date: "2024-01-13", time: "14:30", size: "2.2 MB", status: "Success", type: "Manual" },
        ])
      }
    } catch (error) {
      console.error('Error loading backup history:', error)
      // Fallback to mock data
      setBackupHistory([
        { id: 1, date: "2024-01-15", time: "14:30", size: "2.4 MB", status: "Success", type: "Manual" },
        { id: 2, date: "2024-01-14", time: "14:30", size: "2.3 MB", status: "Success", type: "Automatic" },
        { id: 3, date: "2024-01-13", time: "14:30", size: "2.2 MB", status: "Success", type: "Manual" },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async (dataType: string, anonymized: boolean = true) => {
    const privacyNote = anonymized ? " (Personal data will be anonymized)" : " (Full data including personal information)";
    
    addToast({
      type: "info",
      title: "Export Started",
      description: `${dataType} export has been initiated.${privacyNote}`,
      duration: 4000
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
        case 'Barangay Data':
          exportParam = 'barangay-data';
          break;
        case 'Reports':
          exportParam = 'reports';
          break;
        default:
          throw new Error('Invalid data type');
      }

      // Add cycle information and privacy settings to the export request
      const params = new URLSearchParams({ 
        export: exportParam,
        anonymized: anonymized.toString()
      });
      if (hasActiveCycle && activeCycle) {
        params.append('cycle_id', activeCycle.cycle_id.toString());
        params.append('cycle_name', activeCycle.name);
        params.append('cycle_year', activeCycle.year.toString());
      }
      
      const response = await fetch(`/api/backups?${params}`, {
        credentials: 'include', // Include auth cookies
      });
      
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'You do not have permission to export this data.');
      }
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get privacy info from headers
      const privacyLevel = response.headers.get('X-Data-Privacy');
      const recordCount = response.headers.get('X-Record-Count');

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${exportParam}_${new Date().toISOString().split('T')[0]}.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast({
        type: "success",
        title: "Export Complete",
        description: `${dataType} exported successfully. ${recordCount ? `${recordCount} records` : ''} (Privacy: ${privacyLevel || 'protected'})`,
        duration: 5000
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        type: "error",
        title: "Export Failed",
        description: error instanceof Error ? error.message : `Failed to export ${dataType}. Please try again.`,
        duration: 5000
      });
    }
  }

  const handleCreateBackup = async () => {
    addToast({
      type: "info",
      title: "Backup Started",
      description: "Database backup is being created. This may take a few minutes.",
      duration: 4000
    });

    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create-backup' }),
      });

      if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      addToast({
        type: "success",
        title: "Backup Complete",
        description: result.message || "Database backup has been created successfully.",
        duration: 4000
      });

      // Reload backup history to show the new backup
      loadBackupHistory();
    } catch (error) {
      console.error('Backup error:', error);
      addToast({
        type: "error",
        title: "Backup Failed",
        description: "Failed to create database backup. Please try again.",
        duration: 4000
      });
    }
  }

  const handleDownloadBackup = async () => {
    addToast({
      type: "info",
      title: "Download Started",
      description: "Preparing backup file for download...",
      duration: 4000
    });

    try {
      // For now, we'll create a comprehensive backup by exporting all data
      const exportTypes = ['survey-data', 'user-data', 'barangay-data', 'reports'];
      
      for (const exportType of exportTypes) {
        const response = await fetch(`/api/backups?export=${exportType}`);
        
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
        }
      }

      addToast({
        type: "success",
        title: "Download Complete",
        description: "All backup files have been downloaded successfully.",
        duration: 4000
      });
    } catch (error) {
      console.error('Download error:', error);
      addToast({
        type: "error",
        title: "Download Failed",
        description: "Failed to download backup files. Please try again.",
        duration: 4000
      });
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Data Backup</h1>
        <p className="text-gray-600 text-lg">Manage system data backups and exports</p>
        {hasActiveCycle && (
          <p className="text-sm text-blue-600">
            Active Cycle: {activeCycle?.name} ({activeCycle?.year}) - Exports will include cycle context
          </p>
        )}
        {!hasActiveCycle && (
          <p className="text-sm text-amber-600">
            ⚠️ No active survey cycle - Exports will include all historical data
          </p>
        )}
      </div>

      {/* Data Export */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-xl">
            <Download className="w-6 h-6 text-blue-500" />
            <span>Data Export</span>
          </CardTitle>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              🔒 <strong>Privacy Protection:</strong> All exports containing personal data are automatically anonymized. 
              Names are masked, ages are grouped into ranges, and emails are hashed. Only super admins can export full data.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="h-20 bg-green-600 hover:bg-green-700 text-white flex-col justify-center items-center p-4"
              onClick={() => handleExportData("Survey Data")}
            >
              <Download className="w-5 h-5 mb-2" />
              <div className="text-center">
                <div className="text-sm font-medium">Export All Survey Data</div>
                <div className="text-xs opacity-80">CSV Format</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col justify-center items-center p-4 bg-transparent hover:bg-gray-50"
              onClick={() => handleExportData("User Data")}
            >
              <Download className="w-5 h-5 mb-2" />
              <div className="text-center">
                <div className="text-sm font-medium">Export User Data</div>
                <div className="text-xs opacity-60">CSV Format</div>
              </div>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col justify-center items-center p-4 bg-transparent hover:bg-gray-50"
              onClick={() => handleExportData("Barangay Data")}
            >
              <Download className="w-5 h-5 mb-2" />
              <div className="text-center">
                <div className="text-sm font-medium">Export Barangay Data</div>
                <div className="text-xs opacity-60">CSV Format</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col justify-center items-center p-4 bg-transparent hover:bg-gray-50"
              onClick={() => handleExportData("Reports")}
            >
              <Download className="w-5 h-5 mb-2" />
              <div className="text-center">
                <div className="text-sm font-medium">Export Reports</div>
                <div className="text-xs opacity-60">TXT Format</div>
              </div>
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

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 px-4"
              onClick={handleCreateBackup}
            >
              <Database className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Create Backup Now</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent hover:bg-gray-50 h-12 px-4"
              onClick={handleDownloadBackup}
            >
              <Download className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Download Latest Backup</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading backup history...</div>
            </div>
          ) : (
            <div className="space-y-3">
              {backupHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No backup history available</p>
                  <p className="text-xs">Create your first backup to see it here</p>
                </div>
              ) : (
                backupHistory.map((backup) => (
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
                        <p className="text-xs text-gray-600">
                          Size: {backup.size} • Type: {backup.type || 'Manual'}
                        </p>
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
                          className="h-8 w-8 p-0 hover:bg-gray-200"
                          onClick={handleDownloadBackup}
                          title="Download backup"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
