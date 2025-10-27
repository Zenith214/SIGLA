"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Database, Trash2, Settings, BarChart3, HelpCircle, Terminal } from "lucide-react";
import { useEffect } from "react";
import { CycleDisplay } from "@/components/survey-cycle";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { reportCardCache } from "@/utils/reportCardCache";

interface GenerationResult {
  success: boolean;
  message: string;
  data?: any;
}

interface Barangay {
  id: number;
  name: string;
  households: number;
  population: number;
  area: number;
  status: string;
  seal: boolean;
  description: string;
  isActive: boolean;
  target?: number;
  achieved?: number;
  percentage?: number;
}

export default function ToolsPage() {
  const [barangayId, setBarangayId] = useState(""); // Will be set when barangays load
  const [responseCount, setResponseCount] = useState("50");
  const [profile, setProfile] = useState("balanced");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [funnelAnalysis, setFunnelAnalysis] = useState<any>(null);
  const [barangayInfo, setBarangayInfo] = useState<any>(null);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loadingBarangays, setLoadingBarangays] = useState(true);
  const [databaseStatus, setDatabaseStatus] = useState<any>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [communityVoiceResults, setCommunityVoiceResults] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isInvalidatingCache, setIsInvalidatingCache] = useState(false);
  const [trendsDebug, setTrendsDebug] = useState<any>(null);
  const { activeCycle, hasActiveCycle, loading: cycleLoading } = useActiveCycle();

  // Fetch barangays from database on component mount
  useEffect(() => {
    fetchBarangays();
  }, []);

  const fetchBarangays = async () => {
    try {
      setLoadingBarangays(true);
      // Fetch barangays that have survey targets for the active cycle
      const response = await fetch('/api/survey-targets');
      if (response.ok) {
        const surveyTargets = await response.json();
        
        // Transform survey targets to barangay format for the dropdown
        const barangaysData = surveyTargets.map((target: any) => ({
          id: target.barangay_id,
          name: target.barangay_name,
          households: target.households || 0,
          population: target.population || 0,
          area: 0,
          status: 'Active',
          seal: true,
          description: `Survey Target: ${target.target} responses`,
          isActive: true,
          target: target.target,
          achieved: target.achieved || 0,
          percentage: target.percentage || 0
        }));
        
        setBarangays(barangaysData);
        
        // Set default barangay to first one if none selected
        if (barangaysData.length > 0 && !barangayId) {
          setBarangayId(barangaysData[0].id.toString());
        }
      } else {
        console.error('Failed to fetch survey targets');
        setBarangays([]);
      }
    } catch (error) {
      console.error('Failed to fetch barangays with survey targets:', error);
      setBarangays([]);
    } finally {
      setLoadingBarangays(false);
    }
  };

  const addResult = (result: GenerationResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const generateMockData = async () => {
    const selectedBarangay = barangays.find(b => b.id.toString() === barangayId);
    
    // Check if target is already reached
    if (selectedBarangay && selectedBarangay.target && selectedBarangay.achieved) {
      if (selectedBarangay.achieved >= selectedBarangay.target) {
        addResult({
          success: false,
          message: `❌ Cannot generate: ${selectedBarangay.name} has already reached its target (${selectedBarangay.achieved}/${selectedBarangay.target})`
        });
        return;
      }
      
      // Check if new responses would exceed target
      const newTotal = selectedBarangay.achieved + parseInt(responseCount);
      if (newTotal > selectedBarangay.target) {
        const remaining = selectedBarangay.target - selectedBarangay.achieved;
        addResult({
          success: false,
          message: `⚠️ Cannot generate ${responseCount} responses: Would exceed target. Only ${remaining} responses remaining for ${selectedBarangay.name}`
        });
        return;
      }
    }
    
    console.log('Generating mock data for:', {
      selectedBarangayId: barangayId,
      selectedBarangay: selectedBarangay,
      responseCount: responseCount,
      profile: profile
    });

    setIsGenerating(true);
    setProgress(0);
    setResults([]);
    setFunnelAnalysis(null);
    setCurrentAction("Initializing mock data generation...");

    // Simulate progress updates during generation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 95) {
          return prev + Math.random() * 5; // Gradual progress increase
        }
        return prev;
      });
    }, 500);

    try {
      const response = await fetch('/api/tools/generate-mock-survey-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangayId: parseInt(barangayId),
          responseCount: parseInt(responseCount),
          profile: profile
        })
      });

      const data = await response.json();

      // Clear the progress interval
      clearInterval(progressInterval);

      if (response.ok) {
        const selectedBarangay = barangays.find(b => b.id.toString() === barangayId);
        const barangayName = selectedBarangay ? selectedBarangay.name : `ID ${barangayId}`;
        
        setProgress(100);
        setCurrentAction("Generation completed successfully!");
        
        addResult({
          success: true,
          message: `Successfully generated ${responseCount} mock responses for ${barangayName} (Barangay ${barangayId})`,
          data: data
        });

        // Add progress milestone results to terminal
        addResult({
          success: true,
          message: `✅ 20% - Generated ${Math.round(parseInt(responseCount) * 0.2)} responses`
        });
        addResult({
          success: true,
          message: `✅ 40% - Generated ${Math.round(parseInt(responseCount) * 0.4)} responses`
        });
        addResult({
          success: true,
          message: `✅ 60% - Generated ${Math.round(parseInt(responseCount) * 0.6)} responses`
        });
        addResult({
          success: true,
          message: `✅ 80% - Generated ${Math.round(parseInt(responseCount) * 0.8)} responses`
        });
        addResult({
          success: true,
          message: `🎉 Done - All ${responseCount} responses completed!`
        });

        // Fetch updated funnel analysis and barangay info
        await fetchFunnelAnalysis();
        await fetchBarangayInfo();
      } else {
        setProgress(0);
        setCurrentAction("Generation failed");
        addResult({
          success: false,
          message: data.error || 'Failed to generate mock data'
        });
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      setCurrentAction("Generation failed");
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        setCurrentAction("");
      }, 2000);
    }
  };

  const deleteMockData = async () => {
    const selectedBarangay = barangays.find(b => b.id.toString() === barangayId);
    const barangayName = selectedBarangay ? selectedBarangay.name : `ID ${barangayId}`;
    
    if (!confirm(`Are you sure you want to delete MOCK DATA ONLY for ${barangayName} (Barangay ${barangayId})? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setProgress(0);
    setCurrentAction("Deleting mock data...");

    try {
      const response = await fetch(`/api/tools/delete-mock-data?barangayId=${barangayId}&confirmWord=DELETE`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        addResult({
          success: true,
          message: `Successfully deleted ${data.deletedCount || 0} mock responses for ${barangayName} (Barangay ${barangayId})`,
          data: data
        });

        // Fetch updated funnel analysis and barangay info
        await fetchFunnelAnalysis();
        await fetchBarangayInfo();
      } else {
        addResult({
          success: false,
          message: data.error || 'Failed to delete mock data'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsDeleting(false);
      setProgress(100);
    }
  };

  const deleteAllResponses = async () => {
    if (!activeCycle) {
      addResult({
        success: false,
        message: 'No active cycle found. Cannot delete responses.'
      });
      return;
    }
    
    if (!confirm(`⚠️ DANGER: Delete ALL responses across ALL barangays in ${activeCycle.name}?\n\nThis will permanently delete ALL survey data (mock and real) for EVERY barangay in the active cycle.\n\nThis action cannot be undone!`)) {
      return;
    }

    // Double confirmation for safety
    if (!confirm(`Final confirmation: Type "DELETE ALL" to confirm you want to delete ALL responses in ${activeCycle.name}`)) {
      return;
    }

    setIsDeleting(true);
    setProgress(0);
    setCurrentAction(`Deleting ALL responses in ${activeCycle.name}...`);

    try {
      const response = await fetch(`/api/survey-responses/delete-by-cycle?cycleId=${activeCycle.cycle_id}&confirmWord=DELETE`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        addResult({
          success: true,
          message: `Successfully deleted ${data.deletedCount || 0} responses across ${data.barangaysAffected || 0} barangays in ${activeCycle.name}`,
          data: data
        });

        // Refresh barangays list to update counts
        await fetchBarangays();
        
        // Fetch updated funnel analysis and barangay info
        await fetchFunnelAnalysis();
        await fetchBarangayInfo();
      } else {
        addResult({
          success: false,
          message: data.error || 'Failed to delete survey responses'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsDeleting(false);
      setProgress(100);
    }
  };

  const fetchFunnelAnalysis = async () => {
    try {
      const response = await fetch(`/api/funnel-analysis?barangayId=${barangayId}`);
      if (response.ok) {
        const data = await response.json();
        setFunnelAnalysis(data);
      }
    } catch (error) {
      console.error('Failed to fetch funnel analysis:', error);
    }
  };

  const fetchBarangayInfo = async () => {
    try {
      const response = await fetch(`/api/tools/barangay-info?barangayId=${barangayId}`);
      if (response.ok) {
        const data = await response.json();
        setBarangayInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch barangay info:', error);
    }
  };

  const testFunnelAnalysis = async () => {
    setCurrentAction("Testing funnel analysis...");
    await fetchFunnelAnalysis();
    addResult({
      success: true,
      message: "Funnel analysis test completed"
    });
  };

  const checkDatabase = async () => {
    setCurrentAction("Checking database status...");
    try {
      const response = await fetch('/api/tools/check-database');
      if (response.ok) {
        const data = await response.json();
        setDatabaseStatus(data.database_status);
        addResult({
          success: true,
          message: `Database check completed. Found ${data.database_status.total_counts.total_responses} total responses.`
        });
      } else {
        const errorData = await response.json();
        addResult({
          success: false,
          message: errorData.error || 'Failed to check database'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const checkSurveyTargets = async () => {
    setCurrentAction("Checking survey targets...");
    try {
      const response = await fetch('/api/barangays-with-assignments');
      if (response.ok) {
        const data = await response.json();
        const progressInfo = data.map((b: any) => ({
          name: b.name,
          id: b.id,
          progress: b.progress,
          status: b.status,
          assignment_status: b.assignment?.status
        }));
        
        addResult({
          success: true,
          message: `Survey targets check completed. Found ${data.length} targets.`,
          data: { targets: progressInfo }
        });
      } else {
        addResult({
          success: false,
          message: 'Failed to check survey targets'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const checkBarangayIds = async () => {
    setCurrentAction("Checking barangay IDs...");
    try {
      const response = await fetch('/api/tools/check-barangay-ids');
      if (response.ok) {
        const data = await response.json();
        addResult({
          success: true,
          message: `Found ${data.total_barangays} barangays (${data.active_barangays} active)`,
          data: data
        });
      } else {
        addResult({
          success: false,
          message: 'Failed to check barangay IDs'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const analyzeCommunityVoice = async () => {
    setCurrentAction("Analyzing community voice...");
    setCommunityVoiceResults(null);
    
    try {
      const url = barangayId && barangayId !== "" ? `/api/community-voice?barangayId=${barangayId}` : '/api/community-voice';
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        setCommunityVoiceResults(data.data);
        
        const selectedBarangay = barangayId && barangayId !== "" ? barangays.find(b => b.id.toString() === barangayId) : null;
        const barangayName = selectedBarangay ? selectedBarangay.name : 'All Barangays';
        
        addResult({
          success: true,
          message: `Community voice analysis completed for ${barangayName}. Analyzed ${data.data.total_comments} comments.`,
          data: data.data
        });
      } else {
        const errorData = await response.json();
        addResult({
          success: false,
          message: errorData.error || 'Failed to analyze community voice'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const fetchCacheStats = async () => {
    setCurrentAction("Fetching cache statistics...");
    try {
      const response = await fetch('/api/tools/invalidate-ml-cache');
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data);
        addResult({
          success: true,
          message: `Cache stats: ${data.totalEntries} entries (${data.freshEntries} fresh, ${data.staleEntries} stale)`
        });
      } else {
        addResult({
          success: false,
          message: 'Failed to fetch cache statistics'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const invalidateAllCache = async () => {
    if (!confirm('Are you sure you want to clear ALL ML cache entries? This will force recalculation of all analytics.')) {
      return;
    }

    setIsInvalidatingCache(true);
    setCurrentAction("Invalidating all ML cache...");
    
    try {
      const response = await fetch('/api/tools/invalidate-ml-cache', {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Also clear client-side report card cache
        reportCardCache.clear();
        
        addResult({
          success: true,
          message: `Successfully cleared ${data.entriesDeleted} server cache entries + client-side report card cache`
        });
        // Refresh stats
        await fetchCacheStats();
      } else {
        const errorData = await response.json();
        addResult({
          success: false,
          message: errorData.error || 'Failed to invalidate cache'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsInvalidatingCache(false);
    }
  };

  const invalidateBarangayCache = async () => {
    if (!barangayId) {
      addResult({
        success: false,
        message: 'Please select a barangay first'
      });
      return;
    }

    const selectedBarangay = barangays.find(b => b.id.toString() === barangayId);
    const barangayName = selectedBarangay ? selectedBarangay.name : `ID ${barangayId}`;

    if (!confirm(`Clear cache for ${barangayName}?`)) {
      return;
    }

    setIsInvalidatingCache(true);
    setCurrentAction(`Invalidating cache for ${barangayName}...`);
    
    try {
      const response = await fetch('/api/tools/invalidate-ml-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barangayId: parseInt(barangayId) })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Also clear client-side report card cache for this barangay
        // Clear for all cycles since we don't know which cycle the user is viewing
        if (activeCycle) {
          reportCardCache.clearForBarangay(parseInt(barangayId), activeCycle.cycle_id);
        }
        
        addResult({
          success: true,
          message: `Cleared ${data.entriesDeleted} server cache entries + client-side report card cache for ${barangayName}`
        });
        // Refresh stats
        await fetchCacheStats();
      } else {
        const errorData = await response.json();
        addResult({
          success: false,
          message: errorData.error || 'Failed to invalidate cache'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsInvalidatingCache(false);
    }
  };

  const debugTrends = async () => {
    if (!barangayId || !activeCycle) {
      addResult({
        success: false,
        message: 'Please select a barangay and ensure active cycle is set'
      });
      return;
    }

    setCurrentAction("Debugging trends calculation...");
    setTrendsDebug(null);
    
    try {
      const response = await fetch(`/api/debug/trends?barangayId=${barangayId}&cycleId=${activeCycle.cycle_id}`);
      
      if (response.ok) {
        const data = await response.json();
        setTrendsDebug(data);
        
        const selectedBarangay = barangays.find(b => b.id.toString() === barangayId);
        const barangayName = selectedBarangay ? selectedBarangay.name : `ID ${barangayId}`;
        
        addResult({
          success: true,
          message: `Trends debug completed for ${barangayName}. Check results below.`,
          data: data
        });
      } else {
        const errorData = await response.json();
        addResult({
          success: false,
          message: errorData.error || 'Failed to debug trends'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ Development Tools</h1>
          <p className="text-gray-600">Mock data generation and testing utilities</p>
          <div className="mt-4 flex justify-center items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
              <span className="font-medium">Active Cycle:</span>
              <CycleDisplay />
            </div>
            {hasActiveCycle && !cycleLoading && (
              <Badge variant="outline" className="text-sm">
                Working with {activeCycle?.name} targets
              </Badge>
            )}
          </div>
          {!hasActiveCycle && !cycleLoading && (
            <div className="mt-2 text-amber-600 text-sm">
              ⚠️ No active survey cycle set. Please set an active cycle in settings.
            </div>
          )}
        </div>

        {/* Tabbed Tools Interface */}
        <Tabs defaultValue="mock-data" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mock-data">Mock Data</TabsTrigger>
            <TabsTrigger value="cache">ML Cache</TabsTrigger>
            <TabsTrigger value="community">Community Voice</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          {/* Mock Data Tab */}
          <TabsContent value="mock-data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Mock Survey Data Generator
                </CardTitle>
                <CardDescription>
                  Generate realistic survey responses for testing funnel analysis and Action Grid calculations. 
                  {barangays.length > 0 ? `Works with ${barangays.length} barangays that have survey targets` : 'Loading survey targets'} for the active cycle.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="barangayId">Barangay</Label>
                    <Select value={barangayId} onValueChange={(value) => {
                      setBarangayId(value);
                      setBarangayInfo(null);
                      setFunnelAnalysis(null);
                    }} disabled={loadingBarangays}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBarangays ? "Loading barangays..." : "Select a barangay"} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(barangays) ? barangays.map((barangay) => (
                          <SelectItem key={barangay.id} value={barangay.id.toString()}>
                            {barangay.name} - Target: {barangay.target || 0} ({barangay.achieved || 0}/{barangay.target || 0} completed)
                          </SelectItem>
                        )) : null}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="responseCount">Response Count</Label>
                    <Select value={responseCount} onValueChange={setResponseCount}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Response (Quick Test)</SelectItem>
                        <SelectItem value="25">25 Responses</SelectItem>
                        <SelectItem value="50">50 Responses</SelectItem>
                        <SelectItem value="75">75 Responses (Half Target)</SelectItem>
                        <SelectItem value="100">100 Responses</SelectItem>
                        <SelectItem value="150">150 Responses (Full Target)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="profile">Response Profile</Label>
                    <Select value={profile} onValueChange={setProfile}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced (All Quadrants)</SelectItem>
                        <SelectItem value="high-performer">High Performer (MAINTAIN)</SelectItem>
                        <SelectItem value="needs-improvement">Needs Improvement (FIX NOW)</SelectItem>
                        <SelectItem value="mixed">Mixed Responses (Realistic)</SelectItem>
                        <SelectItem value="extreme-mixed">Extreme Mixed (Edge Cases)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Barangay Info Display */}
                {barangayInfo && (
                  <div className={`p-3 rounded-lg border ${
                    barangayInfo.currentData.target && 
                    barangayInfo.currentData.target.achieved >= barangayInfo.currentData.target.target
                      ? 'bg-green-50 border-green-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className={`font-semibold ${
                          barangayInfo.currentData.target && 
                          barangayInfo.currentData.target.achieved >= barangayInfo.currentData.target.target
                            ? 'text-green-900'
                            : 'text-blue-900'
                        }`}>
                          {barangayInfo.barangayInfo.name} (Barangay {barangayInfo.barangayId})
                          {barangayInfo.currentData.target && 
                           barangayInfo.currentData.target.achieved >= barangayInfo.currentData.target.target && (
                            <Badge className="ml-2" variant="default">✓ Target Reached</Badge>
                          )}
                        </h4>
                        <p className={`text-sm ${
                          barangayInfo.currentData.target && 
                          barangayInfo.currentData.target.achieved >= barangayInfo.currentData.target.target
                            ? 'text-green-700'
                            : 'text-blue-700'
                        }`}>
                          Population: {barangayInfo.barangayInfo.population.toLocaleString()} | 
                          Households: {barangayInfo.barangayInfo.households.toLocaleString()} | 
                          Area: {barangayInfo.barangayInfo.area} km²
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          barangayInfo.currentData.target && 
                          barangayInfo.currentData.target.achieved >= barangayInfo.currentData.target.target
                            ? 'text-green-900'
                            : 'text-blue-900'
                        }`}>
                          {barangayInfo.currentData.responseCount} responses
                        </div>
                        {barangayInfo.currentData.target && (
                          <div className={`text-sm ${
                            barangayInfo.currentData.target.achieved >= barangayInfo.currentData.target.target
                              ? 'text-green-700'
                              : 'text-blue-700'
                          }`}>
                            Target: {barangayInfo.currentData.target.target} ({barangayInfo.currentData.target.percentage}%)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Target Warning */}
                {barangayId && barangays.find(b => b.id.toString() === barangayId) && (
                  <>
                    {(() => {
                      const selected = barangays.find(b => b.id.toString() === barangayId);
                      const achieved = selected?.achieved || 0;
                      const target = selected?.target || 0;
                      const remaining = target - achieved;
                      const requestedCount = parseInt(responseCount);

                      if (achieved >= target) {
                        return (
                          <Alert className="border-green-500 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              <strong>Target Reached!</strong> {selected?.name} has completed its survey target ({achieved}/{target}). 
                              Delete existing responses to generate new ones.
                            </AlertDescription>
                          </Alert>
                        );
                      } else if (requestedCount > remaining) {
                        return (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Warning:</strong> Generating {requestedCount} responses would exceed the target. 
                              Only {remaining} responses remaining for {selected?.name}. 
                              Adjust the response count to {remaining} or less.
                            </AlertDescription>
                          </Alert>
                        );
                      } else if (remaining <= 10 && remaining > 0) {
                        return (
                          <Alert className="border-yellow-500 bg-yellow-50">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                              <strong>Almost There!</strong> Only {remaining} responses remaining to reach target for {selected?.name}.
                            </AlertDescription>
                          </Alert>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={generateMockData}
                    disabled={
                      isGenerating || 
                      isDeleting || 
                      loadingBarangays || 
                      !barangayId ||
                      (barangays.find(b => b.id.toString() === barangayId)?.achieved || 0) >= 
                      (barangays.find(b => b.id.toString() === barangayId)?.target || Infinity)
                    }
                    className="flex-1 min-w-[200px]"
                  >
                    {isGenerating ? 'Generating...' : 
                     (barangays.find(b => b.id.toString() === barangayId)?.achieved || 0) >= 
                     (barangays.find(b => b.id.toString() === barangayId)?.target || Infinity)
                       ? 'Target Reached' 
                       : 'Generate Mock Data'}
                  </Button>
                  <Button
                    onClick={deleteMockData}
                    disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                    variant="outline"
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Mock Data'}
                  </Button>
                  <Button
                    onClick={deleteAllResponses}
                    disabled={isGenerating || isDeleting || !hasActiveCycle}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete All Cycle Data'}
                  </Button>
                  <Button
                    onClick={fetchBarangayInfo}
                    disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Check Status
                  </Button>
                  <Button
                    onClick={testFunnelAnalysis}
                    disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                    variant="outline"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Test Analysis
                  </Button>
                </div>

                {/* Progress Bar */}
                {(isGenerating || isDeleting) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{currentAction}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    {isGenerating && (
                      <div className="text-xs text-gray-500 text-center">
                        {progress < 20 ? "Starting generation..." :
                         progress < 40 ? "20% complete - Creating survey responses..." :
                         progress < 60 ? "40% complete - Processing data..." :
                         progress < 80 ? "60% complete - Saving to database..." :
                         progress < 95 ? "80% complete - Finalizing..." :
                         "Almost done..."}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Funnel Analysis Results */}
            {funnelAnalysis && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Funnel Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Real-time analysis of generated survey data for Barangay {barangayId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Service Scores</h4>
                      {Object.entries(funnelAnalysis.service_scores || {}).map(([service, scores]: [string, any]) => (
                        <div key={service} className="mb-3 p-3 bg-gray-50 rounded">
                          <div className="font-medium capitalize mb-1">
                            {service === 'financial' ? 'Financial Administration' :
                             service === 'disaster' ? 'Disaster Preparedness' :
                             service === 'safety' ? 'Safety & Peace Order' :
                             service === 'social' ? 'Social Protection' :
                             service === 'business' ? 'Business Friendliness' :
                             service === 'environmental' ? 'Environmental Management' :
                             service.replace('_', ' ')}
                          </div>
                          <div className="text-sm space-y-1">
                            <div>Awareness: {scores.awareness_score}%</div>
                            <div>Availment: {scores.availment_score}%</div>
                            <div>Satisfaction: {scores.satisfaction_score}%</div>
                            <div>Need Action: {scores.need_action_score}%</div>
                            <div className="text-xs text-gray-500">Sample: {scores.sample_size} responses</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Action Grid</h4>
                      {Object.entries(funnelAnalysis.action_grid || {}).map(([service, grid]: [string, any]) => (
                        <div key={service} className="mb-3 p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">
                              {service === 'financial' ? 'Financial Administration' :
                               service === 'disaster' ? 'Disaster Preparedness' :
                               service === 'safety' ? 'Safety & Peace Order' :
                               service === 'social' ? 'Social Protection' :
                               service === 'business' ? 'Business Friendliness' :
                               service === 'environmental' ? 'Environmental Management' :
                               service.replace('_', ' ')}
                            </span>
                            <Badge variant={
                              grid.quadrant === 'MAINTAIN' ? 'default' :
                              grid.quadrant === 'OPPORTUNITIES' ? 'secondary' :
                              grid.quadrant === 'MONITOR' ? 'outline' :
                              'destructive'
                            }>
                              {grid.quadrant}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Satisfaction: {grid.satisfaction_score}% | Need: {grid.need_action_score}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ML Cache Tab */}
          <TabsContent value="cache">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Community Voice Analysis
            </CardTitle>
            <CardDescription>
              Analyze survey comments to extract community insights and themes from feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voiceBarangayId">Barangay (Optional)</Label>
                <Select value={barangayId || "all"} onValueChange={(value) => setBarangayId(value === "all" ? "" : value)} disabled={loadingBarangays}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBarangays ? "Loading barangays..." : "All barangays"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Barangays</SelectItem>
                    {Array.isArray(barangays) ? barangays.map((barangay) => (
                      <SelectItem key={barangay.id} value={barangay.id.toString()}>
                        {barangay.name}
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={analyzeCommunityVoice}
                  disabled={isGenerating || isDeleting || loadingBarangays}
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze Community Voice
                </Button>
              </div>
            </div>

            {/* Community Voice Results */}
            {communityVoiceResults && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Community Voice Insights</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-blue-700 mb-2">
                      <strong>Comments Analyzed:</strong> {communityVoiceResults.total_comments} total, {communityVoiceResults.processed_comments} processed
                    </div>
                    
                    {communityVoiceResults.themes && (
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">Top Themes:</h5>
                        <div className="space-y-1">
                          {communityVoiceResults.themes.top_themes?.slice(0, 3).map(([theme, percentage]: [string, number]) => (
                            <div key={theme} className="flex justify-between text-sm">
                              <span className="capitalize">{theme.replace('_', ' ')}</span>
                              <span className="font-mono">{percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    {communityVoiceResults.categories && (
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">Sentiment Distribution:</h5>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600">Positive</span>
                            <span className="font-mono">{communityVoiceResults.categories.percentages?.positive}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-red-600">Negative</span>
                            <span className="font-mono">{communityVoiceResults.categories.percentages?.negative}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Neutral</span>
                            <span className="font-mono">{communityVoiceResults.categories.percentages?.neutral}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {communityVoiceResults.insights && communityVoiceResults.insights.length > 0 && (
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">Key Insights:</h5>
                    <div className="space-y-2">
                      {communityVoiceResults.insights.map((insight: any, index: number) => (
                        <div key={index} className="p-2 bg-white rounded border border-blue-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{insight.title}</span>
                            <Badge variant={
                              insight.priority === 'high' ? 'destructive' :
                              insight.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {communityVoiceResults.sample_comments && communityVoiceResults.sample_comments.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-blue-800 mb-2">Sample Comments:</h5>
                    <div className="space-y-1">
                      {communityVoiceResults.sample_comments.slice(0, 3).map((comment: string, index: number) => (
                        <div key={index} className="text-sm text-gray-600 italic p-2 bg-white rounded border border-blue-100">
                          "{comment}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ML Cache Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              ML Cache Management
            </CardTitle>
            <CardDescription>
              Manage and invalidate ML analytics cache. Clear cache after deploying calculation changes or when testing with fresh data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-end">
                <Button
                  onClick={fetchCacheStats}
                  disabled={isInvalidatingCache || isGenerating || isDeleting}
                  variant="outline"
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Get Cache Statistics
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={invalidateBarangayCache}
                  disabled={isInvalidatingCache || isGenerating || isDeleting || !barangayId}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Barangay Cache
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={debugTrends}
                  disabled={isGenerating || isDeleting || !barangayId || !hasActiveCycle}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Debug Trends
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={invalidateAllCache}
                disabled={isInvalidatingCache || isGenerating || isDeleting}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isInvalidatingCache ? 'Clearing...' : 'Clear All Cache'}
              </Button>
            </div>

            {/* Cache Statistics Display */}
            {cacheStats && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Cache Statistics</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-blue-700">Total Entries</div>
                    <div className="text-2xl font-bold text-blue-900">{cacheStats.totalEntries}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700">Fresh</div>
                    <div className="text-2xl font-bold text-green-900">{cacheStats.freshEntries}</div>
                  </div>
                  <div>
                    <div className="text-sm text-orange-700">Stale</div>
                    <div className="text-2xl font-bold text-orange-900">{cacheStats.staleEntries}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700">Total Hits</div>
                    <div className="text-2xl font-bold text-blue-900">{cacheStats.totalHits}</div>
                  </div>
                </div>

                {cacheStats.byEndpoint && Object.keys(cacheStats.byEndpoint).length > 0 && (
                  <div>
                    <h5 className="font-medium text-blue-800 mb-2">By Endpoint:</h5>
                    <div className="space-y-1">
                      {Object.entries(cacheStats.byEndpoint).map(([endpoint, data]: [string, any]) => (
                        <div key={endpoint} className="flex justify-between text-sm p-2 bg-white rounded border border-blue-100">
                          <span className="font-mono text-xs">{endpoint}</span>
                          <div className="flex gap-4">
                            <span>{data.count} entries</span>
                            <span className="text-gray-500">{data.hits} hits</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cacheStats.totalEntries === 0 && (
                  <div className="text-center text-blue-700 py-4">
                    ✅ Cache is empty
                  </div>
                )}
              </div>
            )}

            {/* Trends Debug Display */}
            {trendsDebug && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3">Trends Debug Information</h4>
                
                <div className="space-y-4">
                  {/* Cycle Information */}
                  <div>
                    <h5 className="font-medium text-purple-800 mb-2">Cycle Information</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-2 bg-white rounded border border-purple-100">
                        <div className="font-medium">Current Cycle</div>
                        <div>{trendsDebug.currentCycle?.name} (ID: {trendsDebug.currentCycle?.cycle_id})</div>
                        <div className="text-xs text-gray-600">
                          {trendsDebug.currentResponseCount} responses
                        </div>
                      </div>
                      <div className="p-2 bg-white rounded border border-purple-100">
                        <div className="font-medium">Previous Cycle</div>
                        {trendsDebug.previousCycle ? (
                          <>
                            <div>{trendsDebug.previousCycle.name} (ID: {trendsDebug.previousCycle.cycle_id})</div>
                            <div className="text-xs text-gray-600">
                              {trendsDebug.previousResponseCount} responses
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500">No previous cycle found</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Comparison */}
                  {trendsDebug.serviceComparison && (
                    <div>
                      <h5 className="font-medium text-purple-800 mb-2">Service Area Trends</h5>
                      <div className="space-y-2">
                        {Object.entries(trendsDebug.serviceComparison).map(([service, data]: [string, any]) => (
                          <div key={service} className="p-3 bg-white rounded border border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{service}</span>
                              <Badge variant={
                                data.direction === 'up' ? 'default' :
                                data.direction === 'down' ? 'destructive' : 'outline'
                              }>
                                {data.direction === 'up' ? '↑' : data.direction === 'down' ? '↓' : '→'} {data.change}%
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="text-gray-600">Current Satisfaction</div>
                                <div className="font-mono">{data.currentScores?.satisfaction?.toFixed(2) || 'N/A'}%</div>
                                <div className="text-gray-500">({data.currentResponseCount} responses)</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Previous Satisfaction</div>
                                <div className="font-mono">{data.previousScores?.satisfaction?.toFixed(2) || 'N/A'}%</div>
                                <div className="text-gray-500">({data.previousResponseCount} responses)</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {trendsDebug.message && (
                    <div className="text-center text-purple-700 py-2">
                      {trendsDebug.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Clearing cache will force recalculation of analytics on next request. 
                Use after deploying new funnel calculation methodology or fixing calculation bugs.
                Use "Debug Trends" to see how trends are being calculated.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

          </TabsContent>

          {/* Community Voice Tab */}
          <TabsContent value="community">
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Mock Survey Data Generator
            </CardTitle>
            <CardDescription>
              Generate realistic survey responses for testing funnel analysis and Action Grid calculations. 
              {barangays.length > 0 ? `Works with ${barangays.length} barangays that have survey targets` : 'Loading survey targets'} for the active cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="barangayId">Barangay</Label>
                <Select value={barangayId} onValueChange={(value) => {
                  setBarangayId(value);
                  setBarangayInfo(null);
                  setFunnelAnalysis(null);
                }} disabled={loadingBarangays}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBarangays ? "Loading barangays..." : "Select a barangay"} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(barangays) ? barangays.map((barangay) => (
                      <SelectItem key={barangay.id} value={barangay.id.toString()}>
                        {barangay.name} - Target: {barangay.target || 0} ({barangay.achieved || 0}/{barangay.target || 0} completed)
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responseCount">Response Count</Label>
                <Select value={responseCount} onValueChange={setResponseCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Response (Quick Test)</SelectItem>
                    <SelectItem value="25">25 Responses</SelectItem>
                    <SelectItem value="50">50 Responses</SelectItem>
                    <SelectItem value="75">75 Responses (Half Target)</SelectItem>
                    <SelectItem value="100">100 Responses</SelectItem>
                    <SelectItem value="150">150 Responses (Full Target)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="profile">Response Profile</Label>
                <Select value={profile} onValueChange={setProfile}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced (All Quadrants)</SelectItem>
                    <SelectItem value="high-performer">High Performer (MAINTAIN)</SelectItem>
                    <SelectItem value="needs-improvement">Needs Improvement (FIX NOW)</SelectItem>
                    <SelectItem value="mixed">Mixed Responses (Realistic)</SelectItem>
                    <SelectItem value="extreme-mixed">Extreme Mixed (Edge Cases)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Barangay Info Display */}
            {barangayInfo && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">
                      {barangayInfo.barangayInfo.name} (Barangay {barangayInfo.barangayId})
                    </h4>
                    <p className="text-sm text-blue-700">
                      Population: {barangayInfo.barangayInfo.population.toLocaleString()} | 
                      Households: {barangayInfo.barangayInfo.households.toLocaleString()} | 
                      Area: {barangayInfo.barangayInfo.area} km²
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-900">
                      {barangayInfo.currentData.responseCount} responses
                    </div>
                    {barangayInfo.currentData.target && (
                      <div className="text-sm text-blue-700">
                        Target: {barangayInfo.currentData.target.target} ({barangayInfo.currentData.target.percentage}%)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={generateMockData}
                disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                className="flex-1 min-w-[200px]"
              >
                {isGenerating ? 'Generating...' : 'Generate Mock Data'}
              </Button>
              <Button
                onClick={deleteMockData}
                disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                variant="outline"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Mock Data'}
              </Button>
              <Button
                onClick={deleteAllResponses}
                disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete All Responses'}
              </Button>
              <Button
                onClick={fetchBarangayInfo}
                disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Check Status
              </Button>
              <Button
                onClick={testFunnelAnalysis}
                disabled={isGenerating || isDeleting || loadingBarangays || !barangayId}
                variant="outline"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Test Analysis
              </Button>
            </div>

            {/* Progress Bar */}
            {(isGenerating || isDeleting) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{currentAction}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                {isGenerating && (
                  <div className="text-xs text-gray-500 text-center">
                    {progress < 20 ? "Starting generation..." :
                     progress < 40 ? "20% complete - Creating survey responses..." :
                     progress < 60 ? "40% complete - Processing data..." :
                     progress < 80 ? "60% complete - Saving to database..." :
                     progress < 95 ? "80% complete - Finalizing..." :
                     "Almost done..."}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Status */}
        {databaseStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Status
              </CardTitle>
              <CardDescription>
                Current state of survey responses in Supabase database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div>Total Responses: <span className="font-mono">{databaseStatus.total_counts.total_responses}</span></div>
                    <div>Total Sections: <span className="font-mono">{databaseStatus.total_counts.total_sections}</span></div>
                    <div>Active Barangays: <span className="font-mono">{databaseStatus.total_counts.total_barangays}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Responses by Barangay</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
                    {databaseStatus.responses_by_barangay.map((item: any) => (
                      <div key={item.barangay_id} className="flex justify-between">
                        <span>Barangay {item.barangay_id}:</span>
                        <span className="font-mono">{item.response_count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {databaseStatus.sample_section_data.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Sample JSON Data</h4>
                  <div className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <pre>{JSON.stringify(databaseStatus.sample_section_data[0], null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database">
            {/* Database Status */}
            {databaseStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Status
                  </CardTitle>
                  <CardDescription>
                    Current state of survey responses in Supabase database
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div>Total Responses: <span className="font-mono">{databaseStatus.total_counts.total_responses}</span></div>
                        <div>Total Sections: <span className="font-mono">{databaseStatus.total_counts.total_sections}</span></div>
                        <div>Active Barangays: <span className="font-mono">{databaseStatus.total_counts.total_barangays}</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Responses by Barangay</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
                        {databaseStatus.responses_by_barangay.map((item: any) => (
                          <div key={item.barangay_id} className="flex justify-between">
                            <span>Barangay {item.barangay_id}:</span>
                            <span className="font-mono">{item.response_count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {databaseStatus.sample_section_data.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Sample JSON Data</h4>
                      <div className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                        <pre>{JSON.stringify(databaseStatus.sample_section_data[0], null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Database Tools</CardTitle>
                <CardDescription>Check database status and survey targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={checkDatabase}
                    disabled={isGenerating || isDeleting}
                    variant="outline"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Check Database
                  </Button>
                  <Button
                    onClick={checkSurveyTargets}
                    disabled={isGenerating || isDeleting}
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Check Survey Targets
                  </Button>
                  <Button
                    onClick={checkBarangayIds}
                    disabled={isGenerating || isDeleting}
                    variant="outline"
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Check Barangay IDs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Terminal Output - Always Visible */}
        <Card className="bg-black border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-green-400 font-mono text-sm">
              <Terminal className="w-4 h-4" />
              PULSE Tools Terminal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black p-4 rounded font-mono text-sm h-64 overflow-y-auto">
              <div className="text-green-400">
                <div className="mb-2">PULSE Survey Tools v1.0.0</div>
                <div className="mb-2">Ready for operations...</div>
                <div className="mb-4">{'>'} _</div>
              </div>
              
              {currentAction && (
                <div className="text-yellow-400 mb-2">
                  {'>'} {currentAction}
                </div>
              )}
              
              {results.map((result, index) => (
                <div key={index} className={`mb-1 ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {'>'} {result.success ? 
                    (result.message.includes('20%') || result.message.includes('40%') || 
                     result.message.includes('60%') || result.message.includes('80%') || 
                     result.message.includes('Done') ? '[PROGRESS]' : '[SUCCESS]') 
                    : '[ERROR]'} {result.message}
                </div>
              ))}
              
              {results.length === 0 && !currentAction && (
                <div className="text-gray-500">
                  {'>'} Waiting for operations...
                </div>
              )}
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Floating Help Button */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white z-50"
            size="icon"
          >
            <HelpCircle className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📖 Usage Instructions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Response Profiles:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li><strong>Balanced:</strong> Equal distribution across all Action Grid quadrants</li>
                <li><strong>High Performer:</strong> Mostly MAINTAIN quadrant services</li>
                <li><strong>Needs Improvement:</strong> Mostly FIX NOW quadrant services</li>
                <li><strong>Mixed:</strong> Varied responses for realistic testing</li>
                <li><strong>Extreme Mixed:</strong> Highly varied responses for edge case testing</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Delete Options:</h4>
              <ul className="text-sm space-y-1 ml-4">
                <li><strong>Delete Mock Data:</strong> Removes only generated test data (safer option)</li>
                <li><strong>Delete All Responses:</strong> Removes ALL survey data including real responses (use with caution)</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Action Grid Quadrants:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge>MAINTAIN</Badge>
                  <span>High satisfaction, low need for action</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">OPPORTUNITIES</Badge>
                  <span>High satisfaction, high need for action</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">MONITOR</Badge>
                  <span>Low satisfaction, low need for action</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">FIX NOW</Badge>
                  <span>Low satisfaction, high need for action</span>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Terminal Commands:</h4>
              <ul className="text-sm space-y-1 ml-4 font-mono">
                <li><strong>Generate Mock Data:</strong> Creates test survey responses for selected barangay</li>
                <li><strong>Check Survey Targets:</strong> Validates survey targets and progress</li>
                <li><strong>Delete Operations:</strong> Removes mock or all survey data</li>
                <li><strong>Database Status:</strong> Shows current database health and statistics</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}