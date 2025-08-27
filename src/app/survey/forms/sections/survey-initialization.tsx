"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Hash, Navigation, AlertCircle, CheckCircle, Globe } from "lucide-react"
import type { SurveyData } from "../page"
import { useGeotagging } from "../utils/useGeotagging"
import { geotaggingService } from "../utils/geotagging"
import { InteractiveMap } from "./interactive-map"

interface SurveyInitializationProps {
  data: SurveyData
  onUpdate: (section: keyof SurveyData, data: any) => void
  onNext: () => void
}

export function SurveyInitialization({ data, onUpdate, onNext }: SurveyInitializationProps) {
  const [surveyNumber, setSurveyNumber] = useState(data.surveyNumber || "")
  const [surveyNumberError, setSurveyNumberError] = useState('')
  const [location, setLocation] = useState(data.location || { lat: 0, lng: 0, address: "" })
  const [locationStatus, setLocationStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Use geotagging hook
  const { getLocation, isSupported } = useGeotagging(false)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load Leaflet when location is captured and modal is not open
  useEffect(() => {
    if (location.lat !== 0 && location.lng !== 0 && !mapLoaded && !showMap) {
      loadLeafletMap()
    }
  }, [location.lat, location.lng, mapLoaded, showMap])

  // Clean up map when modal opens
  useEffect(() => {
    if (showMap && mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
      setMapLoaded(false)
    }
  }, [showMap])

  const loadLeafletMap = () => {
    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.onload = initializeMap
    document.head.appendChild(script)

    setMapLoaded(true)
  }

  const initializeMap = () => {
    if (!mapRef.current || !window.L || !location.lat || !location.lng) return

    const L = window.L

    // Check if map already exists and remove it
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }

    // Initialize map centered on the captured location
    const map = L.map(mapRef.current).setView([location.lat, location.lng], 15)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Add marker for the captured location
    const marker = L.marker([location.lat, location.lng]).addTo(map)
    marker.bindPopup(`Captured Location: ${location.address}`).openPopup()
    markerRef.current = marker

    mapInstanceRef.current = map
  }

  const handleLocationCapture = async () => {
    setLocationStatus('capturing')
    setLocationError('')

    try {
      const locationData = await getLocation({
        enableHighAccuracy: true,
        timeout: 15000,
        requireAddress: true
      })

      const newLocation = {
        lat: locationData.latitude,
        lng: locationData.longitude,
        address: locationData.address || `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp,
        barangay: locationData.barangay,
        municipality: locationData.municipality,
        province: locationData.province
      }

      setLocation(newLocation)
      setLocationStatus('success')
      
      // Auto-save to survey data
      onUpdate("location", newLocation)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location'
      setLocationError(errorMessage)
      setLocationStatus('error')
    }
  }

  const handleManualLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation((prev) => ({ ...prev, address: e.target.value }))
  }

  const handleMapLocationSelect = (selectedLocation: { lat: number; lng: number; address: string }) => {
    setLocation(selectedLocation)
    setLocationStatus('success')
    onUpdate("location", selectedLocation)
    setShowMap(false) // Close the modal after selection
  }

  const validateSurveyNumber = (value: string) => {
    setSurveyNumberError('')
    
    if (!value.trim()) {
      setSurveyNumberError('Survey number is required')
      return false
    }
    
    if (!/^\d+$/.test(value)) {
      setSurveyNumberError('Survey number must contain only numbers')
      return false
    }
    
    const num = parseInt(value)
    if (num < 1 || num > 150) {
      setSurveyNumberError('Survey number must be between 1 and 150')
      return false
    }
    
    return true
  }

  const handleSurveyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Clear error when user starts typing
    if (surveyNumberError) {
      setSurveyNumberError('')
    }
    
    // Only allow positive integers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setSurveyNumber(value)
    } else {
      // Show error for invalid input
      setSurveyNumberError('Only whole numbers are allowed')
    }
  }

  const handleNext = () => {
    // Validate survey number
    if (!validateSurveyNumber(surveyNumber)) {
      return
    }

    if (!location.address.trim()) {
      alert("Please capture or enter a location.")
      return
    }

    // Validate location coordinates
    if (location.lat === 0 && location.lng === 0) {
      alert("Please capture a valid location with coordinates.")
      return
    }

    onUpdate("surveyNumber", surveyNumber)
    onUpdate("location", location)
    onNext()
  }

  const getLocationStatusDisplay = () => {
    switch (locationStatus) {
      case 'capturing':
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Navigation className="w-4 h-4 animate-spin" />
            <span>Capturing location...</span>
          </div>
        )
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Location captured successfully</span>
          </div>
        )
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>Location capture failed</span>
          </div>
        )
      default:
        return null
    }
  }

  // Don't render buttons until client-side
  if (!isClient) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Hash className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Initialize Survey</h2>
        </div>
        <div className="space-y-6">
          {/* Survey Number */}
          <div>
            <label htmlFor="surveyNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Survey Questionnaire Number *
            </label>
            <input
              type="text"
              id="surveyNumber"
              value={surveyNumber}
              onChange={(e) => setSurveyNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter survey number (1-150)"
              required
            />
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading location services...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Hash className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Initialize Survey</h2>
      </div>

      <div className="space-y-6">
        {/* Survey Number */}
        <div>
          <label htmlFor="surveyNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Survey Questionnaire Number *
          </label>
          <input
            type="number"
            id="surveyNumber"
            min="1"
            max="150"
            step="1"
            value={surveyNumber}
            onChange={handleSurveyNumberChange}
            onBlur={() => validateSurveyNumber(surveyNumber)}
            onKeyDown={(e) => {
              // Prevent decimal point, minus sign, and 'e' (scientific notation)
              if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault();
              }
            }}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
              surveyNumberError 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            placeholder="Enter survey number (1-150)"
            required
          />
          
          {/* Error Message */}
          {surveyNumberError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{surveyNumberError}</span>
              </div>
            </div>
          )}
          
          {/* Help Text */}
          {!surveyNumberError && (
            <p className="mt-1 text-xs text-gray-500">
              Enter a whole number between 1 and 150. No decimals or letters allowed.
            </p>
          )}
        </div>

        {/* Location Capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Respondent Location (Spot Map) *
          </label>
          
          {/* Location Status */}
          {getLocationStatusDisplay()}
          
          {/* Location Error */}
          {locationStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{locationError}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Location Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLocationCapture}
                disabled={locationStatus === 'capturing' || !isSupported}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {locationStatus === 'capturing' ? 'Capturing...' : 'Capture Current Location'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>Select on Map</span>
              </button>
            </div>

            {/* Interactive Map Area */}
            <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
              {location.lat !== 0 && location.lng !== 0 && !showMap ? (
                <div ref={mapRef} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Interactive Map Integration</p>
                    <p className="text-sm text-gray-500">
                      {location.address && location.lat !== 0 && location.lng !== 0
                        ? `Location captured: ${location.address}`
                        : 'Click "Capture Current Location" or "Select on Map" to mark position'}
                    </p>
                    {location.lat !== 0 && location.lng !== 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <input
              type="text"
              value={location.address}
              onChange={handleManualLocationInput}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Or enter address manually"
            />

            {/* Location Details */}
            {location.lat !== 0 && location.lng !== 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Location Details</h4>
                <div className="space-y-1 text-xs text-blue-800">
                  <div><strong>Coordinates:</strong> {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>
                  {location.accuracy && (
                    <div><strong>Accuracy:</strong> ±{Math.round(location.accuracy)} meters</div>
                  )}
                  {location.barangay && (
                    <div><strong>Barangay:</strong> {location.barangay}</div>
                  )}
                  {location.municipality && (
                    <div><strong>Municipality:</strong> {location.municipality}</div>
                  )}
                  {location.province && (
                    <div><strong>Province:</strong> {location.province}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={!surveyNumber.trim() || !!surveyNumberError || !location.address.trim() || (location.lat === 0 && location.lng === 0)}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Survey →
        </button>
      </div>

      {/* Interactive Map Modal */}
      {showMap && (
        <InteractiveMap
          location={location}
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMap(false)}
        />
      )}
    </div>
  )
}
