"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Hash, Navigation, AlertCircle, CheckCircle, Globe } from "lucide-react"
import type { SurveyData } from "../page"
import { useGeotagging } from "../utils/useGeotagging"
import { InteractiveMap } from "./interactive-map"
import { getAssignmentDescription } from "../utils/sectionAssignment"

interface SurveyInitializationProps {
   data: SurveyData
   onUpdate: (section: keyof SurveyData, data: any) => void
   onNext: () => void
   preselectedBarangayId?: number
 }

export function SurveyInitialization({ data, onUpdate, onNext, preselectedBarangayId }: SurveyInitializationProps) {
  const [surveyNumber, setSurveyNumber] = useState(data.surveyNumber || "")
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false)
  const [location, setLocation] = useState(data.location || { lat: 0, lng: 0, address: "" })
  const [locationStatus, setLocationStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle')
  const [locationError, setLocationError] = useState('')
  const [wasAutoCaptured, setWasAutoCaptured] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [preselectedBarangayName, setPreselectedBarangayName] = useState<string>('')
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Use geotagging hook
  const { getLocation, isSupported } = useGeotagging(false)

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-capture location when component mounts (if supported and no location exists)
  useEffect(() => {
    if (isClient && isSupported && location.lat === 0 && location.lng === 0 && locationStatus === 'idle') {
      // Add a small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleLocationCapture(true) // Pass true to indicate automatic capture
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isClient, isSupported, location.lat, location.lng, locationStatus])

  // Fetch barangay name when preselectedBarangayId is provided
  useEffect(() => {
    if (preselectedBarangayId && isClient) {
      const fetchBarangayName = async () => {
        try {
          const response = await fetch(`/api/barangays/${preselectedBarangayId}`)
          if (response.ok) {
            const barangayData = await response.json()
            setPreselectedBarangayName(barangayData.barangay_name)
          }
        } catch (error) {
          console.error('Failed to fetch barangay name:', error)
        }
      }
      fetchBarangayName()
    }
  }, [preselectedBarangayId, isClient])

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

  const handleLocationCapture = async (isAutomatic = false) => {
    setLocationStatus('capturing')
    setLocationError('')
    setWasAutoCaptured(false)

    try {
      const locationData = await getLocation({
        enableHighAccuracy: true,
        timeout: isAutomatic ? 10000 : 15000, // Shorter timeout for automatic capture
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
      setWasAutoCaptured(isAutomatic)
      
      // Auto-save to survey data
      onUpdate("location", newLocation)
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Failed to get location'
      
      // Provide more user-friendly error messages
      if (errorMessage.includes('denied')) {
        errorMessage = 'Location access was denied. Please enable location permissions and try again.'
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Location request timed out. Please check your GPS signal and try again.'
      } else if (errorMessage.includes('unavailable')) {
        errorMessage = 'Location services are not available on this device.'
      }
      
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

  const generateQuestionnaireNumber = async () => {
    setIsGeneratingNumber(true)
    try {
      // Get barangayId
      const barangayIdToUse = preselectedBarangayId || data.barangayId
      
      if (!barangayIdToUse) {
        alert('Please select a barangay first.')
        return null
      }

      // Generate the actual questionnaire number NOW
      const response = await fetch('/api/questionnaire-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barangayId: barangayIdToUse })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questionnaire number')
      }

      const responseData = await response.json()
      const surveyNumber = responseData.surveyNumber // Full format: BB-YYYY-NNNN
      const questionnaireNumber = responseData.questionnaireNumber // Just the number
      const type = questionnaireNumber % 2 === 1 ? 'odd' : 'even'
      
      console.log(`✅ Generated survey number: ${surveyNumber} (Questionnaire #${questionnaireNumber}, ${type})`)
      
      return { surveyNumber, questionnaireNumber, type }
      
    } catch (error) {
      console.error('Error generating questionnaire number:', error)
      alert('Failed to generate questionnaire number. Please try again.')
      return null
    } finally {
      setIsGeneratingNumber(false)
    }
  }

  const handleNext = async () => {
    if (!location.address.trim()) {
      alert("Please wait for location to be captured or select a location manually.")
      return
    }

    // Validate location coordinates
    if (location.lat === 0 && location.lng === 0) {
      alert("Please capture a valid location with coordinates.")
      return
    }

    // Check if we already have a survey number (from localStorage after refresh)
    if (data.surveyNumber && data.surveyNumber !== "PENDING") {
      console.log(`📋 Using existing survey number from localStorage: ${data.surveyNumber}`)
      onUpdate("location", location)
      onNext()
      return
    }

    // Generate questionnaire number NOW (will be saved to localStorage)
    const result = await generateQuestionnaireNumber()
    if (!result) {
      return // Failed to generate
    }

    // Store the number and type
    onUpdate("surveyNumber", result.surveyNumber)
    onUpdate("questionnaireType", result.type)
    onUpdate("location", location)
    onNext()
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
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading location services...</p>
            <p className="text-xs text-gray-400 mt-1">Your location will be automatically detected</p>
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
        {/* Questionnaire Number Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Hash className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">Questionnaire Assignment</h4>
          </div>
          <p className="text-sm text-blue-700">
            When you continue, a unique questionnaire number will be assigned and you'll see which sections to complete.
          </p>
          {isGeneratingNumber && (
            <div className="flex items-center space-x-2 mt-3 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Generating questionnaire number...</span>
            </div>
          )}
        </div>

        {/* Pre-selected Barangay Indicator */}
        {preselectedBarangayId && preselectedBarangayName && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Barangay Pre-selected:</strong> {preselectedBarangayName} (ID: {preselectedBarangayId})
              </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              This survey is assigned to the selected barangay. Location capture is still required for GPS coordinates.
            </p>
          </div>
        )}

        {/* Location Capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Respondent Location (Spot Map) *
          </label>
          

          
          {/* Location Error */}
          {locationStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center space-x-2 text-sm text-red-600 mb-3">
                <AlertCircle className="w-4 h-4" />
                <span>{locationError}</span>
              </div>
              <div className="text-sm text-red-700 mb-3">
                Automatic location capture failed. Please use the "Select on Map" button below to manually select your location.
              </div>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Globe className="w-4 h-4" />
                <span>Select on Map</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Auto-capture info */}
            {locationStatus === 'idle' && location.lat === 0 && location.lng === 0 && isSupported && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Navigation className="w-4 h-4 animate-pulse" />
                  <span>Attempting to automatically capture your location...</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Please wait while we detect your current position.
                </p>
              </div>
            )}

            {/* Location not supported warning */}
            {!isSupported && location.lat === 0 && location.lng === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <div className="flex items-center space-x-2 text-sm text-yellow-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>Location services are not available on this device.</span>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowMap(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Select on Map</span>
                  </button>
                </div>
              </div>
            )}

            {/* Location capture success message */}
            {locationStatus === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {wasAutoCaptured ? 'Location automatically captured!' : 'Location captured successfully'}
                  </span>
                </div>
              </div>
            )}

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
                        : 'Location will be automatically detected or you can select manually if needed'}
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
          disabled={isGeneratingNumber || !location.address.trim() || (location.lat === 0 && location.lng === 0)}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingNumber ? 'Generating Number...' : 'Continue to Survey →'}
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
