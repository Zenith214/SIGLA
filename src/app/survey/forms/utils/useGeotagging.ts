import { useState, useEffect, useCallback } from 'react'
import { geotaggingService, LocationData, GeotaggingOptions } from './geotagging'

export interface UseGeotaggingReturn {
  location: LocationData | null
  loading: boolean
  error: string | null
  getLocation: (options?: GeotaggingOptions) => Promise<LocationData>
  clearLocation: () => void
  isSupported: boolean
}

export function useGeotagging(autoGetLocation = true): UseGeotaggingReturn {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
    setIsSupported(geotaggingService.isSupported())
  }, [])

  const getLocation = useCallback(async (options?: GeotaggingOptions): Promise<LocationData> => {
    if (!isClient) {
      throw new Error('Geotagging is not available during server-side rendering')
    }

    setLoading(true)
    setError(null)

    try {
      const locationData = await geotaggingService.getCurrentLocation(options)
      setLocation(locationData)
      return locationData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [isClient])

  const clearLocation = useCallback(() => {
    setLocation(null)
    setError(null)
    geotaggingService.clearCache()
  }, [])

  // Auto-get location on mount if enabled
  useEffect(() => {
    if (autoGetLocation && isSupported && isClient) {
      getLocation().catch(() => {
        // Error is already handled in getLocation
      })
    }
  }, [autoGetLocation, isSupported, isClient, getLocation])

  return {
    location,
    loading,
    error,
    getLocation,
    clearLocation,
    isSupported: isSupported && isClient
  }
} 