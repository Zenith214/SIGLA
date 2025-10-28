'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useActiveCycle } from '@/hooks/useSurveyCycle'

export default function AnalyticsTestPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { activeCycle, hasActiveCycle } = useActiveCycle()
  const [rankingsData, setRankingsData] = useState<any>(null)
  const [trendsData, setTrendsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  const testServiceRankings = async () => {
    if (!activeCycle) {
      setError('No active cycle')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/analytics/service-area-rankings?service_area=financial&cycle_id=${activeCycle.cycle_id}`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setRankingsData(data)
      console.log('Rankings data:', data)
    } catch (err: any) {
      setError(`Rankings error: ${err.message}`)
      console.error('Rankings error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testServiceTrends = async () => {
    if (!activeCycle) {
      setError('No active cycle')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `/api/analytics/service-trends?service_area=financial&barangay_id=17`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setTrendsData(data)
      console.log('Trends data:', data)
    } catch (err: any) {
      setError(`Trends error: ${err.message}`)
      console.error('Trends error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics API Test</h1>
        
        {/* Active Cycle Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Active Cycle</h2>
          {hasActiveCycle && activeCycle ? (
            <div>
              <p><strong>Name:</strong> {activeCycle.name}</p>
              <p><strong>Year:</strong> {activeCycle.year}</p>
              <p><strong>ID:</strong> {activeCycle.cycle_id}</p>
            </div>
          ) : (
            <p className="text-amber-600">No active cycle set</p>
          )}
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
          <div className="flex gap-4">
            <button
              onClick={testServiceRankings}
              disabled={loading || !hasActiveCycle}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Service Rankings
            </button>
            <button
              onClick={testServiceTrends}
              disabled={loading || !hasActiveCycle}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Test Service Trends
            </button>
          </div>
          {loading && <p className="mt-4 text-gray-600">Loading...</p>}
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        {/* Rankings Results */}
        {rankingsData && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Service Rankings Results</h2>
            <div className="overflow-x-auto">
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(rankingsData, null, 2)}
              </pre>
            </div>
            {rankingsData.rankings && rankingsData.rankings.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Top 3 Barangays:</h3>
                <ul className="list-disc list-inside">
                  {rankingsData.rankings.slice(0, 3).map((r: any) => (
                    <li key={r.barangay_id}>
                      {r.name}: {r.satisfaction}% satisfaction
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Trends Results */}
        {trendsData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Service Trends Results</h2>
            <div className="overflow-x-auto">
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(trendsData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
