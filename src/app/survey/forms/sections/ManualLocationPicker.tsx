"use client"

import { useState, useEffect } from "react"
import { MapPin, X, Check } from "lucide-react"

interface GPSCoordinates {
  lat: number
  lng: number
  accuracy?: number
  timestamp?: number
}

interface ManualLocationPickerProps {
  onLocationSelected: (location: GPSCoordinates) => void
  onCancel: () => void
  initialLocation?: GPSCoordinates
}

// Lazy-loaded map component
function MapView({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Dynamically import Leaflet and React-Leaflet
    import('leaflet').then((L) => {
      // Fix for default marker icon in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: '/marker-icon.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })
      
      // Load Leaflet CSS
      if (typeof window !== 'undefined') {
        require('leaflet/dist/leaflet.css')
      }
      setIsLoaded(true)
    })
  }, [])

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-full"><p className="text-gray-500">Loading map...</p></div>
  }

  // Import React-Leaflet components dynamically
  const { customIcon } = require('@/lib/leafletConfig') // Fix marker icons
  const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet')
  
  function LocationMarker() {
    useMapEvents({
      click(e: any) {
        setPosition([e.latlng.lat, e.latlng.lng])
      },
    })
    return position ? <Marker position={position} icon={customIcon} /> : null
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  )
}

export function ManualLocationPicker({ onLocationSelected, onCancel, initialLocation }: ManualLocationPickerProps) {
  // Default to Philippines center if no initial location
  const [position, setPosition] = useState<[number, number]>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : [12.8797, 121.7740]
  )
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleConfirm = () => {
    const location: GPSCoordinates = {
      lat: position[0],
      lng: position[1],
      accuracy: 0, // Manual selection has no accuracy
      timestamp: Date.now()
    }
    onLocationSelected(location)
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select Location Manually</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-gray-700">
            <strong>Instructions:</strong> Click on the map to pin your current location. 
            The marker will show where you are conducting the interview.
          </p>
        </div>

        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: '400px' }}>
          {isClient && (
            <MapView position={position} setPosition={setPosition} />
          )}
        </div>

        {/* Coordinates Display */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p><strong>Selected Coordinates:</strong></p>
              <p>Latitude: {position[0].toFixed(6)}</p>
              <p>Longitude: {position[1].toFixed(6)}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
