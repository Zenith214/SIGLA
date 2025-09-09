'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, 
  Database, 
  RefreshCw, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin
} from 'lucide-react';

interface DataStats {
  statistics: {
    total_surveys: string;
    barangays_with_data: string;
    earliest_survey: string;
    latest_survey: string;
  };
  barangayBreakdown: Array<{
    barangay_name: string;
    barangay_id: number;
    survey_count: string;
    target: number;
    achieved: number;
    percentage: number;
  }>;
}

export default function DevToolsPage() {
  const [stats, setStats] = useState<DataStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dev/clear-data');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const generateMockData = async (count: number) => {
    setGenerating(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/dev/generate-surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Generated ${result.generated} mock surveys successfully!` });
        await fetchStats();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to generate mock data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate mock data' });
    } finally {
      setGenerating(false);
    }
  };

  const clearData = async (type: string, options: any = {}) => {
    setClearing(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/dev/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...options })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Cleared ${result.deletedCount} survey records successfully!` 
        });
        await fetchStats();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to clear data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear data' });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Development Tools</h1>
          <p className="text-muted-foreground">Manage mock survey data and system utilities</p>
        </div>
        <Button 
          onClick={fetchStats} 
          variant="outline" 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="generate">Generate Data</TabsTrigger>
          <TabsTrigger value="clear">Clear Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Assignment Logic</CardTitle>
              <CardDescription>How survey sections are assigned based on survey numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-blue-900 mb-2">ODD Survey Numbers (1, 3, 5, ...)</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Financial Administration</li>
                    <li>• Safety & Peace Order</li>
                    <li>• Environmental Management</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-900 mb-2">EVEN Survey Numbers (2, 4, 6, ...)</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Disaster Preparedness</li>
                    <li>• Social Protection</li>
                    <li>• Business Friendliness</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.statistics.total_surveys}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Barangays</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.statistics.barangays_with_data}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Earliest Survey</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {stats.statistics.earliest_survey 
                        ? new Date(stats.statistics.earliest_survey).toLocaleDateString()
                        : 'No data'
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Latest Survey</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {stats.statistics.latest_survey 
                        ? new Date(stats.statistics.latest_survey).toLocaleDateString()
                        : 'No data'
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Barangay Survey Progress</CardTitle>
                  <CardDescription>Survey completion status by barangay</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.barangayBreakdown.map((barangay) => (
                      <div key={barangay.barangay_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{barangay.barangay_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {barangay.survey_count} surveys • Target: {barangay.target || 150}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={barangay.percentage >= 100 ? 'default' : 'secondary'}>
                            {barangay.percentage}%
                          </Badge>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(barangay.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Mock Survey Data</CardTitle>
              <CardDescription>
                Create realistic mock survey responses for testing and development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => generateMockData(25)}
                    disabled={generating}
                    className="flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Generate 25 Surveys
                  </Button>
                  
                  <Button 
                    onClick={() => generateMockData(75)}
                    disabled={generating}
                    className="flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Generate 75 Surveys
                  </Button>
                  
                  <Button 
                    onClick={() => generateMockData(150)}
                    disabled={generating}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <Database className="h-4 w-4" />
                    Generate 150 Surveys
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                  <strong>Note:</strong> Mock surveys use numbers starting from 90000 to avoid conflicts with real surveys.
                  Each barangay has a target of 150 surveys. Odd numbers get Financial/Safety/Environmental sections, even numbers get Disaster/Social/Business sections.
                </div>
              </div>
              
              {generating && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating mock survey data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clear" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Clear Survey Data
              </CardTitle>
              <CardDescription>
                Permanently remove survey data from the database. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Warning: These operations will permanently delete survey data. Make sure you have backups if needed.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => clearData('all', { createBackup: true })}
                  disabled={clearing}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data (with backup)
                </Button>
                
                <Button 
                  onClick={() => clearData('all')}
                  disabled={clearing}
                  variant="outline"
                  className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data (no backup)
                </Button>
              </div>
              
              {clearing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Clearing survey data...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}