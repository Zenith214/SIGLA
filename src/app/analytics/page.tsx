'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import SurveyAnalyticsDashboard from '@/components/analytics/SurveyAnalyticsDashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CycleDisplay } from '@/components/survey-cycle'
import { useActiveCycle } from '@/hooks/useSurveyCycle'

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { hasActiveCycle, activeCycle, loading: cycleLoading } = useActiveCycle()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with cycle information */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Survey Analytics</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {hasActiveCycle ? (
                  <div>
                    <span className="font-medium">Active Cycle:</span>
                    <div className="mt-1">
                      <CycleDisplay />
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-600 font-medium bg-amber-50 px-3 py-2 rounded-md">
                    ⚠️ No Active Cycle
                  </div>
                )}
              </div>
              <a
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <SurveyAnalyticsDashboard />
      </div>
    </div>
  )
}