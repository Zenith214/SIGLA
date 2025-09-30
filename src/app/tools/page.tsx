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
import { AlertTriangle, CheckCircle, Database, Trash2, Settings, BarChart3 } from "lucide-react";

interface GenerationResult {
  success: boolean;
  message: string;
  data?: any;
}

export default function ToolsPage() {
  const [barangayId, setBarangayId] = useState("17");
  const [responseCount, setResponseCount] = useState("50");
  const [profile, setProfile] = useState("balanced");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState("");
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [funnelAnalysis, setFunnelAnalysis] = useState<any>(null);

  const addResult = (result: GenerationResult) => {
    setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const generateMockData = async () => {
    setIsGenerating(true);
    setProgress(0);
    setResults([]);
    setFunnelAnalysis(null);

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

      if (response.ok) {
        addResult({
          success: true,
          message: `Successfully generated ${responseCount} mock responses for Barangay ${barangayId}`,
          data: data
        });

        // Fetch updated funnel analysis
        await fetchFunnelAnalysis();
      } else {
        addResult({
          success: false,
          message: data.error || 'Failed to generate mock data'
        });
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsGenerating(false);
      setProgress(100);
    }
  };

  const deleteAllResponses = async () => {
    if (!confirm(`Are you sure you want to delete ALL survey responses for Barangay ${barangayId}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setProgress(0);
    setCurrentAction("Deleting responses...");

    try {
      const response = await fetch(`/api/survey-responses?barangayId=${barangayId}&deleteAll=true&confirmWord=DELETE`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        addResult({
          success: true,
          message: `Successfully deleted ${data.deletedCount || 0} responses for Barangay ${barangayId}`,
          data: data
        });

        // Fetch updated funnel analysis
        await fetchFunnelAnalysis();
      } else {
        addResult({
          success: false,
          message: data.error || 'Failed to delete responses'
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

  const testFunnelAnalysis = async () => {
    setCurrentAction("Testing funnel analysis...");
    await fetchFunnelAnalysis();
    addResult({
      success: true,
      message: "Funnel analysis test completed"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ Development Tools</h1>
          <p className="text-gray-600">Mock data generation and testing utilities</p>
        </div>

        {/* Mock Data Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Mock Survey Data Generator
            </CardTitle>
            <CardDescription>
              Generate realistic survey responses for testing funnel analysis and Action Grid calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="barangayId">Barangay ID</Label>
                <Input
                  id="barangayId"
                  type="number"
                  value={barangayId}
                  onChange={(e) => setBarangayId(e.target.value)}
                  placeholder="17"
                />
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

            <div className="flex gap-2">
              <Button
                onClick={generateMockData}
                disabled={isGenerating || isDeleting}
                className="flex-1"
              >
                {isGenerating ? 'Generating...' : 'Generate Mock Data'}
              </Button>
              <Button
                onClick={deleteAllResponses}
                disabled={isGenerating || isDeleting}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
              <Button
                onClick={testFunnelAnalysis}
                disabled={isGenerating || isDeleting}
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
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Funnel Analysis Results */}
        {funnelAnalysis && (
          <Card>
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

        {/* Results Log */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Operation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((result, index) => (
                  <Alert key={index} className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <AlertDescription className="flex-1">
                        {result.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>📖 Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}