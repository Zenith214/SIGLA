"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Key, 
  BarChart3, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  TrendingUp,
  Calendar,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function GeminiSettings() {
  const [apiKey, setApiKey] = useState("")
  const [tokensLimit, setTokensLimit] = useState("1000000")
  const [settings, setSettings] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [recentUsage, setRecentUsage] = useState<any[]>([])
  const [usageByEndpoint, setUsageByEndpoint] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/gemini')
      if (response.ok) {
        const result = await response.json()
        setSettings(result.data.settings)
        setStats(result.data.stats)
        setRecentUsage(result.data.recentUsage)
        setUsageByEndpoint(result.data.usageByEndpoint)
        
        if (result.data.settings) {
          setTokensLimit(result.data.settings.tokens_limit.toString())
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!apiKey && !tokensLimit) {
      toast({
        title: "No Changes",
        description: "Please enter an API key or update the token limit",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/settings/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey || undefined,
          tokensLimit: tokensLimit || undefined
        })
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Gemini API settings updated successfully",
          variant: "success"
        })
        setApiKey("")
        await fetchSettings()
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestKey = async () => {
    if (!apiKey) {
      toast({
        title: "No API Key",
        description: "Please enter an API key to test",
        variant: "destructive"
      })
      return
    }

    setTesting(true)
    try {
      const response = await fetch('/api/settings/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_key',
          apiKey
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "API Key Valid",
          description: "The API key is working correctly",
          variant: "success"
        })
      } else {
        toast({
          title: "API Key Invalid",
          description: result.message || "The API key is not valid",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to test API key",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  const handleResetTokens = async () => {
    if (!confirm('Are you sure you want to reset the token counter? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/settings/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_tokens' })
      })

      if (response.ok) {
        toast({
          title: "Counter Reset",
          description: "Token counter has been reset to zero",
          variant: "success"
        })
        await fetchSettings()
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset token counter",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading Gemini settings...</span>
      </div>
    )
  }

  const usagePercentage = stats?.usage_percentage || 0
  const isNearLimit = usagePercentage > 80
  const isAtLimit = usagePercentage >= 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Gemini AI Settings
        </h2>
        <p className="text-gray-600 mt-1">
          Manage your Google Gemini API key and monitor token usage
        </p>
      </div>

      {/* Token Usage Overview */}
      {stats && (
        <Card className={`border-2 ${isAtLimit ? 'border-red-300 bg-red-50' : isNearLimit ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Token Usage
              </span>
              {isAtLimit ? (
                <Badge variant="destructive">Limit Reached</Badge>
              ) : isNearLimit ? (
                <Badge variant="default" className="bg-yellow-600">Near Limit</Badge>
              ) : (
                <Badge variant="default" className="bg-green-600">Healthy</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    {stats.total_tokens_used?.toLocaleString()} / {stats.tokens_limit?.toLocaleString()} tokens
                  </span>
                  <span className="font-bold">{usagePercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-300 ${
                      isAtLimit ? 'bg-red-600' : isNearLimit ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.tokens_remaining?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Tokens Remaining</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.daily_average?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">Daily Average</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.monthly_usage?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">This Month</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-600 mb-1">Last Reset</div>
                  <div className="text-sm font-medium">
                    {new Date(stats.last_reset_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Warning Messages */}
              {isAtLimit && (
                <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <strong>Token limit reached!</strong> You need to reset the counter or increase the limit to continue using AI features.
                  </div>
                </div>
              )}

              {isNearLimit && !isAtLimit && (
                <div className="flex items-start gap-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Approaching token limit!</strong> Consider resetting the counter or increasing the limit soon.
                  </div>
                </div>
              )}

              <Button
                onClick={handleResetTokens}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Token Counter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Key Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Configuration
          </CardTitle>
          <CardDescription>
            Update your Google Gemini API key and token limit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          {settings && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <div className="text-sm font-medium">Current API Key</div>
                <div className="text-xs text-gray-600 font-mono">{settings.api_key}</div>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Active
              </Badge>
            </div>
          )}

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">New API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Get your API key from{" "}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Token Limit */}
          <div className="space-y-2">
            <Label htmlFor="tokensLimit">Monthly Token Limit</Label>
            <Input
              id="tokensLimit"
              type="number"
              placeholder="1000000"
              value={tokensLimit}
              onChange={(e) => setTokensLimit(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Free tier: 1,000,000 tokens/month | Paid tier: Adjust based on your plan
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleTestKey}
              disabled={!apiKey || testing}
              variant="outline"
              className="flex-1"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Test API Key
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage by Endpoint */}
      {Object.keys(usageByEndpoint).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Usage by Feature
            </CardTitle>
            <CardDescription>Token usage breakdown by AI feature (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(usageByEndpoint).map(([endpoint, data]: [string, any]) => (
                <div key={endpoint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{endpoint}</div>
                    <div className="text-xs text-gray-600">{data.count} requests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-purple-600">{data.tokens.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">tokens</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Usage */}
      {recentUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 10 AI generation requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentUsage.slice(0, 10).map((usage) => (
                <div key={usage.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{usage.endpoint}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(usage.created_at).toLocaleString()}
                      {usage.barangay_id && ` • Barangay ID: ${usage.barangay_id}`}
                    </div>
                  </div>
                  <Badge variant="outline">{usage.tokens_used} tokens</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
