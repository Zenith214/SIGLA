/**
 * GPS Verification Module
 * Implements GPS distance calculation and verification for quality control
 * Based on DILG CSIS Digital Methodology (v4.0)
 */

// TypeScript interfaces
export interface GPSCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GPSVerificationResult {
  distanceMeters: number;
  withinThreshold: boolean;
  flagForReview: boolean;
  assignedLocation: GPSCoordinates;
  actualLocation: GPSCoordinates;
}

export interface GPSVerificationConfig {
  thresholdMeters: number;  // Default: 200
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 * 
 * @param coord1 - First GPS coordinate
 * @param coord2 - Second GPS coordinate
 * @returns Distance in meters
 */
export function calculateDistance(
  coord1: GPSCoordinates,
  coord2: GPSCoordinates
): number {
  // Earth radius in meters
  const R = 6371e3;

  // Convert degrees to radians
  const φ1 = coord1.lat * Math.PI / 180;
  const φ2 = coord2.lat * Math.PI / 180;
  const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
  const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

  // Haversine formula
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  // Distance in meters
  return R * c;
}

/**
 * Verify GPS location against assigned spot
 * Compares actual interview location with pre-assigned spot location
 * Flags interviews that exceed the distance threshold
 * 
 * @param assignedSpot - Pre-assigned spot location (can be null for non-spot surveys)
 * @param actualLocation - Actual interview location captured by FI
 * @param config - Configuration with threshold in meters (default: 200m)
 * @returns GPSVerificationResult with distance and flag status
 * @throws GPSVerificationError if coordinates are invalid
 */
export function verifyGPSLocation(
  assignedSpot: GPSCoordinates | null | undefined,
  actualLocation: GPSCoordinates | null | undefined,
  config: GPSVerificationConfig = { thresholdMeters: 200 }
): GPSVerificationResult {
  try {
    // Handle missing assigned spot (non-spot-based surveys)
    if (!assignedSpot) {
      console.warn('No assigned spot data available for GPS verification');
      
      // If we have actual location, validate it
      if (actualLocation) {
        validateGPSCoordinatesStrict(actualLocation, 'Actual location');
      }
      
      // Return result indicating no verification possible
      return {
        distanceMeters: -1,
        withinThreshold: false,
        flagForReview: true,
        assignedLocation: { lat: 0, lng: 0 },
        actualLocation: actualLocation || { lat: 0, lng: 0 }
      };
    }

    // Handle missing actual location
    if (!actualLocation) {
      console.warn('No actual GPS location captured - interview will be flagged');
      
      return {
        distanceMeters: -1,
        withinThreshold: false,
        flagForReview: true,
        assignedLocation: assignedSpot,
        actualLocation: { lat: 0, lng: 0 }
      };
    }

    // Validate both coordinates
    validateGPSCoordinatesStrict(assignedSpot, 'Assigned spot');
    validateGPSCoordinatesStrict(actualLocation, 'Actual location');

    // Calculate distance between locations
    const distanceMeters = calculateDistance(assignedSpot, actualLocation);
    
    // Check if within threshold
    const withinThreshold = distanceMeters <= config.thresholdMeters;

    return {
      distanceMeters: Math.round(distanceMeters),
      withinThreshold,
      flagForReview: !withinThreshold,
      assignedLocation: assignedSpot,
      actualLocation
    };
  } catch (error) {
    // Re-throw GPSVerificationError as-is
    if (error instanceof GPSVerificationError) {
      throw error;
    }

    // Wrap unexpected errors
    throw new GPSVerificationError(
      'VERIFICATION_FAILED',
      `GPS verification failed: ${error instanceof Error ? error.message : String(error)}`,
      { originalError: error }
    );
  }
}

/**
 * Format distance for display
 * Converts meters to appropriate unit (meters or kilometers)
 * 
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "150m" or "1.5km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Custom error class for GPS verification errors
 */
export class GPSVerificationError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GPSVerificationError';
  }
}

/**
 * Validate GPS coordinates
 * Checks if coordinates are within valid ranges
 * 
 * @param coords - GPS coordinates to validate
 * @returns true if valid, false otherwise
 */
export function validateGPSCoordinates(coords: GPSCoordinates): boolean {
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return false;
  }

  // Latitude must be between -90 and 90
  if (coords.lat < -90 || coords.lat > 90) {
    return false;
  }

  // Longitude must be between -180 and 180
  if (coords.lng < -180 || coords.lng > 180) {
    return false;
  }

  return true;
}

/**
 * Validate GPS coordinates with detailed error reporting
 * @param coords - GPS coordinates to validate
 * @throws GPSVerificationError if invalid
 */
export function validateGPSCoordinatesStrict(coords: GPSCoordinates, label: string = 'GPS coordinates'): void {
  if (!coords) {
    throw new GPSVerificationError(
      'MISSING_GPS_DATA',
      `${label} are missing or null`,
      { provided: coords }
    );
  }

  if (typeof coords.lat !== 'number' || isNaN(coords.lat)) {
    throw new GPSVerificationError(
      'INVALID_LATITUDE',
      `${label} have invalid latitude`,
      { provided: coords.lat, expected: 'number between -90 and 90' }
    );
  }

  if (typeof coords.lng !== 'number' || isNaN(coords.lng)) {
    throw new GPSVerificationError(
      'INVALID_LONGITUDE',
      `${label} have invalid longitude`,
      { provided: coords.lng, expected: 'number between -180 and 180' }
    );
  }

  if (coords.lat < -90 || coords.lat > 90) {
    throw new GPSVerificationError(
      'LATITUDE_OUT_OF_RANGE',
      `${label} latitude is out of valid range (-90 to 90)`,
      { provided: coords.lat, validRange: '-90 to 90' }
    );
  }

  if (coords.lng < -180 || coords.lng > 180) {
    throw new GPSVerificationError(
      'LONGITUDE_OUT_OF_RANGE',
      `${label} longitude is out of valid range (-180 to 180)`,
      { provided: coords.lng, validRange: '-180 to 180' }
    );
  }
}

/**
 * Get verification status text
 * Returns human-readable status based on verification result
 * 
 * @param result - GPS verification result
 * @returns Status text
 */
export function getVerificationStatusText(result: GPSVerificationResult): string {
  if (result.withinThreshold) {
    return 'Within acceptable range';
  }
  return 'Exceeds distance threshold - Flagged for review';
}

/**
 * Get verification status color
 * Returns color code for UI display
 * 
 * @param result - GPS verification result
 * @returns Color code ('green', 'yellow', 'red')
 */
export function getVerificationStatusColor(result: GPSVerificationResult): 'green' | 'yellow' | 'red' {
  if (result.withinThreshold) {
    return 'green';
  }
  
  // Could add yellow for "close but over" threshold
  if (result.distanceMeters <= result.assignedLocation.accuracy! + 50) {
    return 'yellow';
  }
  
  return 'red';
}

/**
 * GPS capture error types
 */
export enum GPSCaptureErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Parse GeolocationPositionError into our error type
 * @param error - The GeolocationPositionError from browser API
 * @returns GPSCaptureErrorType
 */
export function parseGPSCaptureError(error: any): GPSCaptureErrorType {
  if (!error) return GPSCaptureErrorType.UNKNOWN;

  // GeolocationPositionError codes
  if (error.code === 1 || error.message?.includes('permission')) {
    return GPSCaptureErrorType.PERMISSION_DENIED;
  }
  if (error.code === 2 || error.message?.includes('unavailable')) {
    return GPSCaptureErrorType.POSITION_UNAVAILABLE;
  }
  if (error.code === 3 || error.message?.includes('timeout')) {
    return GPSCaptureErrorType.TIMEOUT;
  }

  return GPSCaptureErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message for GPS capture errors
 * @param errorType - The GPS capture error type
 * @returns User-friendly error message
 */
export function getGPSCaptureErrorMessage(errorType: GPSCaptureErrorType): string {
  switch (errorType) {
    case GPSCaptureErrorType.PERMISSION_DENIED:
      return 'Location permission was denied. Please enable location access in your device settings and try again.';
    
    case GPSCaptureErrorType.POSITION_UNAVAILABLE:
      return 'Unable to determine your location. Please ensure GPS is enabled and you have a clear view of the sky.';
    
    case GPSCaptureErrorType.TIMEOUT:
      return 'Location request timed out. Please try again. If the problem persists, try moving to an area with better GPS signal.';
    
    case GPSCaptureErrorType.UNKNOWN:
    default:
      return 'An error occurred while capturing GPS location. Please try again.';
  }
}

/**
 * Get user-friendly error message for GPS verification errors
 * @param error - The GPSVerificationError or Error object
 * @returns User-friendly error message
 */
export function getGPSVerificationErrorMessage(error: Error | GPSVerificationError): string {
  if (error instanceof GPSVerificationError) {
    switch (error.code) {
      case 'MISSING_GPS_DATA':
        return 'GPS data is missing. Please capture your location before proceeding.';
      
      case 'INVALID_LATITUDE':
      case 'INVALID_LONGITUDE':
      case 'LATITUDE_OUT_OF_RANGE':
      case 'LONGITUDE_OUT_OF_RANGE':
        return 'Invalid GPS coordinates detected. Please try capturing your location again.';
      
      case 'VERIFICATION_FAILED':
        return 'GPS verification failed. The interview will be flagged for manual review.';
      
      default:
        return 'An error occurred during GPS verification.';
    }
  }

  return error.message || 'An error occurred during GPS verification.';
}

/**
 * Check if GPS capture error is retryable
 * @param errorType - The GPS capture error type
 * @returns true if the operation can be retried
 */
export function isGPSCaptureErrorRetryable(errorType: GPSCaptureErrorType): boolean {
  switch (errorType) {
    case GPSCaptureErrorType.TIMEOUT:
    case GPSCaptureErrorType.POSITION_UNAVAILABLE:
    case GPSCaptureErrorType.UNKNOWN:
      return true; // These might succeed on retry
    
    case GPSCaptureErrorType.PERMISSION_DENIED:
      return false; // Requires user to change settings
    
    default:
      return true;
  }
}
