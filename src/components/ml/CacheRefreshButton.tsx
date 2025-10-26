"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CacheRefreshButtonProps {
  onRefresh: () => Promise<void>
  label?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
  className?: string
}

export function CacheRefreshButton({
  onRefresh,
  label = 'Refresh Data',
  size = 'default',
  variant = 'outline',
  className = ''
}: CacheRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
      toast({
        title: 'Data Refreshed',
        description: 'Latest data has been loaded successfully.',
        variant: 'success',
        duration: 3000
      })
    } catch (error) {
      console.error('Refresh error:', error)
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh data. Please try again.',
        variant: 'destructive',
        duration: 4000
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      size={size}
      variant={variant}
      className={className}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : label}
    </Button>
  )
}
