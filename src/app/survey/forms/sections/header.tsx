"use client"

import { MapPin, FileText, User, Navigation, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface HeaderProps {
  user: {
    name: string
    role: string
    id: string
    avatar: string
  }
  currentSection?: string
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
}

export function Header({ user, currentSection }: HeaderProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState<string>('')

  // Get current location
  const getCurrentLocation = () => {
    setLocationStatus('requesting')
    setLocationError('')

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser')
      setLocationStatus('error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        }
        setLocation(locationData)
        setLocationStatus('success')
        
        // Reverse geocode to get address
        reverseGeocode(locationData.latitude, locationData.longitude)
      },
      (error) => {
        let errorMessage = 'Unknown error occurred'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setLocationError(errorMessage)
        setLocationStatus('error')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Reverse geocoding to get address
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      
      if (data.display_name) {
        setLocation(prev => prev ? {
          ...prev,
          address: data.display_name
        } : null)
      }
    } catch (error) {
      console.log('Reverse geocoding failed:', error)
    }
  }

  // Auto-get location on mount
  useEffect(() => {
    getCurrentLocation()
  }, [])

  // Get location status display
  const getLocationStatusDisplay = () => {
    switch (locationStatus) {
      case 'requesting':
        return (
          <div className="flex items-center space-x-2 text-sm text-yellow-600">
            <Navigation className="w-4 h-4 animate-spin" />
            <span>Getting Location...</span>
          </div>
        )
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <MapPin className="w-4 h-4" />
            <span>Location Active</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>Location Error</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Location Inactive</span>
          </div>
        )
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Satisfaction Index for Governance and Local Administration
              </h1>
              <p className="text-sm text-gray-600">
                {currentSection ? `${currentSection} • Community Assessment Survey Tool` : "Community Assessment Survey Tool"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Location Status */}
            <div className="hidden md:flex items-center space-x-2">
              {getLocationStatusDisplay()}
            </div>

            {/* Location Details (if available) */}
            {location && locationStatus === 'success' && (
              <div className="hidden lg:flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                {location.address && (
                  <span className="max-w-32 truncate" title={location.address}>
                    • {location.address.split(',')[0]}
                  </span>
                )}
              </div>
            )}

            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-8 h-8 rounded-full bg-blue-100"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">
                  {user.role} • {user.id}
                </p>
              </div>
              <User className="w-4 h-4 text-gray-400 sm:hidden" />
            </div>

            {/* Refresh Location Button */}
            <button
              onClick={getCurrentLocation}
              disabled={locationStatus === 'requesting'}
              className="hidden md:flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Location Error Toast */}
      {locationStatus === 'error' && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{locationError}</span>
            <button
              onClick={getCurrentLocation}
              className="text-red-700 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
