"use client"

import { Clock, Database, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CacheMetadata {
  cached: boolean
  stale: boolean
  computedAt: Date | string
  expiresAt: Date | string
}

interface CacheIndicatorProps {
  cache?: CacheMetadata
  className?: string
}

export function CacheIndicator({ cache, className = '' }: CacheIndicatorProps) {
  if (!cache) return null

  const computedDate = new Date(cache.computedAt)
  const expiresDate = new Date(cache.expiresAt)
  const now = new Date()

  const timeAgo = getTimeAgo(computedDate)
  const timeUntilExpiry = getTimeUntil(expiresDate)

  const isExpired = expiresDate < now

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-2 ${className}`}>
            {cache.cached ? (
              <>
                {cache.stale || isExpired ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Updating...
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <Database className="w-3 h-3 mr-1" />
                    Cached
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                <Clock className="w-3 h-3 mr-1" />
                Fresh
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p><strong>Status:</strong> {cache.cached ? (cache.stale ? 'Stale (updating in background)' : 'Fresh from cache') : 'Newly computed'}</p>
            <p><strong>Computed:</strong> {timeAgo}</p>
            {!isExpired && <p><strong>Expires:</strong> {timeUntilExpiry}</p>}
            {isExpired && <p className="text-amber-600"><strong>Expired</strong> - Will refresh on next access</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds} seconds ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

function getTimeUntil(date: Date): string {
  const seconds = Math.floor((date.getTime() - new Date().getTime()) / 1000)

  if (seconds < 0) return 'expired'
  if (seconds < 60) return `in ${seconds} seconds`
  if (seconds < 3600) return `in ${Math.floor(seconds / 60)} minutes`
  if (seconds < 86400) return `in ${Math.floor(seconds / 3600)} hours`
  return `in ${Math.floor(seconds / 86400)} days`
}
