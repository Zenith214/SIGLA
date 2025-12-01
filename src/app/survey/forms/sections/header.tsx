"use client"

import Image from "next/image"
import { MapPin, FileText, User, Navigation, AlertCircle, ChevronDown, LogOut, LayoutDashboard } from "lucide-react"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

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
  const router = useRouter()
  const { logout } = useAuth()

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
          <div className="flex items-center space-x-2 text-sm text-yellow-300">
            <Navigation className="w-4 h-4 animate-spin" />
            <span>Getting Location...</span>
          </div>
        )
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-sm text-green-300">
            <MapPin className="w-4 h-4" />
            <span>Location Active</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-sm text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span>Location Error</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>Location Inactive</span>
          </div>
        )
    }
  }

  const handleSignOut = async () => {
    await logout()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-800 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image 
              src="/headerlogo4k.png" 
              alt="PULSE Survey" 
              width={100}
              height={36}
              className="h-8 w-auto"
              priority
            />
            <div className="border-l border-gray-600 pl-3">
              <h1 className="text-base font-semibold text-white">
                Survey Forms
              </h1>
              <p className="text-xs text-gray-300">
                {currentSection || "Community Assessment"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 bg-slate-600 rounded-lg hover:bg-slate-700 text-white">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full bg-blue-100"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-lg">
                <div className="p-4">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={getCurrentLocation} disabled={locationStatus === 'requesting'} className="cursor-pointer">
                  <Navigation className="mr-2 h-4 w-4" />
                  <span>{locationStatus === 'requesting' ? 'Refreshing Location...' : 'Refresh Location'}</span>
                </DropdownMenuItem>
                {location && locationStatus === 'success' && (
                  <DropdownMenuItem className="flex-col items-start text-xs text-gray-500 cursor-default" onSelect={e => e.preventDefault()}>
                    <span className="font-medium">Current Location:</span>
                    <span className="truncate w-full">{location.address}</span>
                    <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {/* Hide Back to Dashboard for interviewers */}
                {user.role?.toLowerCase() !== 'field interviewer' && (
                  <DropdownMenuItem onClick={() => router.push('/survey')} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Back to Survey Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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