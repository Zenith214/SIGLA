"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Download, RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CacheIndicator } from '@/components/ml/CacheIndicator'

interface ExecutiveSummaryProps {
  barangayId: number
  cycleId: number
  barangayName: string
}

export function ExecutiveSummaryGenerator({ barangayId, cycleId, barangayName }: ExecutiveSummaryProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [cache, setCache] = useState<any>(null)
  const { toast } = useToast()

  const generateSummary = async (forceRefresh = false) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/executive-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barangayId,
          cycleId,
          forceRefresh
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const result = await response.json()
      setSummary(result.data)
      setCache(result._cache)

      toast({
        title: 'Summary Generated',
        description: result._cache?.cached 
          ? 'Retrieved from cache' 
          : 'AI analysis completed successfully',
        variant: 'success',
        duration: 3000
      })
    } catch (error) {
      console.error('Error generating summary:', error)
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate executive summary. Please try again.',
        variant: 'destructive',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadSummary = () => {
    if (!summary) return

    const content = `
EXECUTIVE SUMMARY - ${barangayName}
Generated: ${new Date(summary.generated_at).toLocaleString()}

${summary.executiveSummary}

KEY FINDINGS:
${summary.keyFindings?.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

CRITICAL ISSUES:
${summary.criticalIssues?.map((issue: any, i: number) => `
${i + 1}. ${issue.issue}
   Impact: ${issue.impact}
   Affected Area: ${issue.affectedArea}
   Recommendation: ${issue.recommendation}
`).join('\n')}

ACTION PLAN:

IMMEDIATE ACTIONS (1-3 months):
${summary.actionPlan?.immediate?.map((action: any, i: number) => `
${i + 1}. ${action.action}
   Priority: ${action.priority}
   Resources: ${action.resources}
   Expected Outcome: ${action.expectedOutcome}
`).join('\n')}

SHORT-TERM ACTIONS (3-6 months):
${summary.actionPlan?.shortTerm?.map((action: any, i: number) => `
${i + 1}. ${action.action}
   Priority: ${action.priority}
   Resources: ${action.resources}
   Expected Outcome: ${action.expectedOutcome}
`).join('\n')}

LONG-TERM ACTIONS (6-12 months):
${summary.actionPlan?.longTerm?.map((action: any, i: number) => `
${i + 1}. ${action.action}
   Priority: ${action.priority}
   Resources: ${action.resources}
   Expected Outcome: ${action.expectedOutcome}
`).join('\n')}

RECOMMENDATIONS:

Governance:
${summary.recommendations?.governance?.map((r: string) => `- ${r}`).join('\n')}

Service Delivery:
${summary.recommendations?.serviceDelivery?.map((r: string) => `- ${r}`).join('\n')}

Community Engagement:
${summary.recommendations?.communityEngagement?.map((r: string) => `- ${r}`).join('\n')}

SUCCESS METRICS:
${summary.successMetrics?.map((m: any, i: number) => `
${i + 1}. ${m.metric}
   Target: ${m.target}
   Timeline: ${m.timeline}
`).join('\n')}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Executive-Summary-${barangayName}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Downloaded',
      description: 'Executive summary downloaded successfully',
      variant: 'success',
      duration: 3000
    })
  }

  if (!summary) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Executive Summary
              </CardTitle>
              <CardDescription>
                Generate a comprehensive analysis and action plan using AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Click the button below to generate an AI-powered executive summary that includes:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Comprehensive analysis of survey data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Key findings and critical issues</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Prioritized action plan (immediate, short-term, long-term)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Specific recommendations and success metrics</span>
              </li>
            </ul>
            <Button
              onClick={() => generateSummary(false)}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Summary...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Executive Summary
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              This uses AI to analyze your survey data. Results are cached for 7 days.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <CardTitle>AI Executive Summary</CardTitle>
                <CardDescription>
                  Generated {new Date(summary.generated_at).toLocaleString()}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CacheIndicator cache={cache} />
              <Button
                onClick={() => generateSummary(true)}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button
                onClick={downloadSummary}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {summary.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Key Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {summary.keyFindings?.map((finding: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5">{index + 1}</Badge>
                <span className="text-gray-700">{finding}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {summary.criticalIssues && summary.criticalIssues.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.criticalIssues.map((issue: any, index: number) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{issue.issue}</h4>
                    <Badge variant={issue.impact === 'High' ? 'destructive' : 'outline'}>
                      {issue.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Affected Area:</strong> {issue.affectedArea}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Recommendation:</strong> {issue.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Action Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Immediate Actions */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Immediate Actions (1-3 months)
              </h3>
              <div className="space-y-3">
                {summary.actionPlan?.immediate?.map((action: any, index: number) => (
                  <ActionCard key={index} action={action} index={index} color="red" />
                ))}
              </div>
            </div>

            {/* Short-term Actions */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Short-term Actions (3-6 months)
              </h3>
              <div className="space-y-3">
                {summary.actionPlan?.shortTerm?.map((action: any, index: number) => (
                  <ActionCard key={index} action={action} index={index} color="orange" />
                ))}
              </div>
            </div>

            {/* Long-term Actions */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Long-term Actions (6-12 months)
              </h3>
              <div className="space-y-3">
                {summary.actionPlan?.longTerm?.map((action: any, index: number) => (
                  <ActionCard key={index} action={action} index={index} color="blue" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Governance</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {summary.recommendations?.governance?.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Service Delivery</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {summary.recommendations?.serviceDelivery?.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Community Engagement</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {summary.recommendations?.communityEngagement?.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Success Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.successMetrics?.map((metric: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{metric.metric}</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Target:</strong> {metric.target}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Timeline:</strong> {metric.timeline}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ActionCard({ action, index, color }: { action: any; index: number; color: string }) {
  const colorClasses = {
    red: 'border-red-200 bg-red-50',
    orange: 'border-orange-200 bg-orange-50',
    blue: 'border-blue-200 bg-blue-50'
  }

  const priorityColors = {
    High: 'destructive',
    Medium: 'default',
    Low: 'outline'
  }

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{action.action}</h4>
        <Badge variant={priorityColors[action.priority as keyof typeof priorityColors] as any}>
          {action.priority}
        </Badge>
      </div>
      <div className="space-y-1 text-sm text-gray-700">
        <p><strong>Timeline:</strong> {action.timeline}</p>
        <p><strong>Resources:</strong> {action.resources}</p>
        <p><strong>Expected Outcome:</strong> {action.expectedOutcome}</p>
      </div>
    </div>
  )
}
