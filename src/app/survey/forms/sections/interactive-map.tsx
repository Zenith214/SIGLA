"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, X, CheckCircle } from "lucide-react"
import { LocationData } from "../utils/geotagging"

interface InteractiveMapProps {
  location: { lat: number; lng: number; address: string }
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  onClose: () => void
}

declare global {
  interface Window {
    L: any
  }
}

export function InteractiveMap({ location, onLocationSelect, onClose }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

  // Load Leaflet CSS and JS
  useEffect(() => {
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

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return

    const L = window.L

    // Check if map already exists and remove it
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }

    // Initialize map
    const map = L.map(mapRef.current).setView([location.lat || 14.5995, location.lng || 120.9842], 13)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map)

    // Add current location marker if available
    if (location.lat && location.lng) {
      const marker = L.marker([location.lat, location.lng]).addTo(map)
      marker.bindPopup('Current Location').openPopup()
      markerRef.current = marker
    }

    // Add click handler for new location selection
    map.on('click', async (e: any) => {
      const { lat, lng } = e.latlng

      // Remove previous marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Add new marker
      const newMarker = L.marker([lat, lng]).addTo(map)
      markerRef.current = newMarker

      // Get address for the selected location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

        newMarker.bindPopup(`Selected: ${address}`).openPopup()

        setSelectedLocation({ lat, lng, address })
      } catch (error) {
        const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        newMarker.bindPopup(`Selected: ${address}`).openPopup()
        setSelectedLocation({ lat, lng, address })
      }
    })

    mapInstanceRef.current = map
    setIsLoading(false)
  }

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
      onClose()
    }
  }

  const handleUseCurrentLocation = () => {
    if (location.lat && location.lng) {
      onLocationSelect(location)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Select Location on Map</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading map...</span>
              </div>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {location.lat && location.lng && (
                <button
                  onClick={handleUseCurrentLocation}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Use Current Location</span>
                </button>
              )}
              {selectedLocation && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Selected:</span> {selectedLocation.address}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 