'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import SurveyAnalyticsDashboard from '@/components/analytics/SurveyAnalyticsDashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
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
      <div className="container mx-auto px-4 py-8">
        <SurveyAnalyticsDashboard />
      </div>
    </div>
  )
}