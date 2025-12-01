export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  address?: string
  barangay?: string
  municipality?: string
  province?: string
}

export interface GeotaggingOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  requireAddress?: boolean
}

export class GeotaggingService {
  private static instance: GeotaggingService
  private locationCache: LocationData | null = null
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): GeotaggingService {
    if (!GeotaggingService.instance) {
      GeotaggingService.instance = new GeotaggingService()
    }
    return GeotaggingService.instance
  }

  // Check if geolocation is supported
  isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false
    }
    return 'geolocation' in navigator
  }

  // Get current location with caching
  async getCurrentLocation(options: GeotaggingOptions = {}): Promise<LocationData> {
    const {
      enableHighAccuracy = true,
      timeout = 30000, // Increased default to 30 seconds
      maximumAge = 60000,
      requireAddress = true
    } = options

    // Check if we have a valid cached location (only if maximumAge allows it)
    if (maximumAge > 0 && this.locationCache && this.isCacheValid()) {
      return this.locationCache
    }

    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Location request timed out. Please ensure GPS is enabled and you have a clear view of the sky.'))
      }, timeout)

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId)
          
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          // Get address if required
          if (requireAddress) {
            try {
              const addressData = await this.reverseGeocode(locationData.latitude, locationData.longitude)
              Object.assign(locationData, addressData)
            } catch (error) {
              console.warn('Reverse geocoding failed:', error)
            }
          }

          // Cache the location
          this.locationCache = locationData
          resolve(locationData)
        },
        (error) => {
          clearTimeout(timeoutId)
          let errorMessage = 'Unknown error occurred'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your GPS settings and try again.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please ensure GPS is enabled and you have a clear view of the sky.'
              break
          }
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      )
    })
  }

  // Reverse geocoding to get address
  private async reverseGeocode(lat: number, lng: number): Promise<Partial<LocationData>> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      const data = await response.json()
      
      if (data.display_name) {
        const addressParts = data.display_name.split(', ')
        return {
          address: data.display_name,
          barangay: this.extractBarangay(addressParts),
          municipality: this.extractMunicipality(addressParts),
          province: this.extractProvince(addressParts)
        }
      }
      return {}
    } catch (error) {
      throw new Error('Reverse geocoding failed')
    }
  }

  // Extract barangay from address parts
  private extractBarangay(addressParts: string[]): string | undefined {
    for (const part of addressParts) {
      if (part.toLowerCase().includes('barangay') || part.toLowerCase().includes('brgy')) {
        return part
      }
    }
    return undefined
  }

  // Extract municipality from address parts
  private extractMunicipality(addressParts: string[]): string | undefined {
    for (const part of addressParts) {
      if (part.toLowerCase().includes('city') || part.toLowerCase().includes('municipality')) {
        return part
      }
    }
    return undefined
  }

  // Extract province from address parts
  private extractProvince(addressParts: string[]): string | undefined {
    const provinces = ['Metro Manila', 'Cebu', 'Davao', 'Batangas', 'Laguna', 'Cavite', 'Rizal', 'Quezon']
    for (const part of addressParts) {
      if (provinces.some(province => part.toLowerCase().includes(province.toLowerCase()))) {
        return part
      }
    }
    return undefined
  }

  // Check if cached location is still valid
  private isCacheValid(): boolean {
    if (!this.locationCache) return false
    return Date.now() - this.locationCache.timestamp < this.cacheTimeout
  }

  // Clear location cache
  clearCache(): void {
    this.locationCache = null
  }

  // Get distance between two points in meters
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  // Check if location is within a certain radius of a point
  static isWithinRadius(
    centerLat: number,
    centerLon: number,
    checkLat: number,
    checkLon: number,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(centerLat, centerLon, checkLat, checkLon)
    return distance <= radiusMeters
  }

  // Format location for display
  static formatLocation(location: LocationData): string {
    const coords = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
    if (location.address) {
      return `${coords} • ${location.address}`
    }
    return coords
  }

  // Validate location data
  static validateLocation(location: LocationData): boolean {
    return (
      location.latitude >= -90 && location.latitude <= 90 &&
      location.longitude >= -180 && location.longitude <= 180 &&
      location.accuracy > 0 &&
      location.timestamp > 0
    )
  }
}

// Export a singleton instance
export const geotaggingService = GeotaggingService.getInstance() 