"use client"

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { customIcon } from '@/lib/leafletConfig' // Fix marker icons
import L from 'leaflet'

// Fix for default marker icon in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

interface MapComponentProps {
  position: [number, number]
  setPosition: (pos: [number, number]) => void
}

// Component to handle map clicks
function LocationMarker({ position, setPosition }: MapComponentProps) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })

  return position ? <Marker position={position} icon={customIcon} /> : null
}

export default function MapComponent({ position, setPosition }: MapComponentProps) {
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
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  )
}
