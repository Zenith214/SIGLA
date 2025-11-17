/**
 * Unit tests for GPS Verification Module
 * Tests GPS distance calculation and verification logic
 */

import {
  calculateDistance,
  verifyGPSLocation,
  formatDistance,
  validateGPSCoordinates,
  getVerificationStatusText,
  getVerificationStatusColor,
  GPSCoordinates
} from '../gpsVerification';

describe('GPS Verification', () => {
  describe('calculateDistance', () => {
    test('calculates zero distance for same coordinates', () => {
      const coord1: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const coord2: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };

      const distance = calculateDistance(coord1, coord2);

      expect(distance).toBe(0);
    });

    test('calculates correct distance for nearby coordinates', () => {
      // Two points approximately 100m apart in Manila
      const coord1: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const coord2: GPSCoordinates = { lat: 14.6004, lng: 120.9842 };

      const distance = calculateDistance(coord1, coord2);

      // Should be approximately 100 meters (allowing for rounding)
      expect(distance).toBeGreaterThan(90);
      expect(distance).toBeLessThan(110);
    });

    test('calculates correct distance for coordinates ~300m apart', () => {
      const coord1: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const coord2: GPSCoordinates = { lat: 14.6020, lng: 120.9870 };

      const distance = calculateDistance(coord1, coord2);

      // Should be approximately 300-400 meters
      expect(distance).toBeGreaterThan(250);
      expect(distance).toBeLessThan(450);
    });

    test('calculates distance for coordinates in different hemispheres', () => {
      const coord1: GPSCoordinates = { lat: 40.7128, lng: -74.0060 }; // New York
      const coord2: GPSCoordinates = { lat: -33.8688, lng: 151.2093 }; // Sydney

      const distance = calculateDistance(coord1, coord2);

      // Should be approximately 16,000 km
      expect(distance).toBeGreaterThan(15000000);
      expect(distance).toBeLessThan(17000000);
    });

    test('handles coordinates with accuracy and timestamp', () => {
      const coord1: GPSCoordinates = {
        lat: 14.5995,
        lng: 120.9842,
        accuracy: 10,
        timestamp: Date.now()
      };
      const coord2: GPSCoordinates = {
        lat: 14.6004,
        lng: 120.9842,
        accuracy: 15,
        timestamp: Date.now()
      };

      const distance = calculateDistance(coord1, coord2);

      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('verifyGPSLocation', () => {
    test('flags interview beyond default threshold (200m)', () => {
      const assignedSpot: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const actualLocation: GPSCoordinates = { lat: 14.6020, lng: 120.9870 }; // ~300m away

      const result = verifyGPSLocation(assignedSpot, actualLocation);

      expect(result.distanceMeters).toBeGreaterThan(200);
      expect(result.withinThreshold).toBe(false);
      expect(result.flagForReview).toBe(true);
    });

    test('passes interview within default threshold (200m)', () => {
      const assignedSpot: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const actualLocation: GPSCoordinates = { lat: 14.6004, lng: 120.9842 }; // ~100m away

      const result = verifyGPSLocation(assignedSpot, actualLocation);

      expect(result.distanceMeters).toBeLessThanOrEqual(200);
      expect(result.withinThreshold).toBe(true);
      expect(result.flagForReview).toBe(false);
    });

    test('respects custom threshold', () => {
      const assignedSpot: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const actualLocation: GPSCoordinates = { lat: 14.6004, lng: 120.9842 }; // ~100m away

      const result = verifyGPSLocation(assignedSpot, actualLocation, { thresholdMeters: 50 });

      expect(result.distanceMeters).toBeGreaterThan(50);
      expect(result.withinThreshold).toBe(false);
      expect(result.flagForReview).toBe(true);
    });

    test('returns rounded distance in meters', () => {
      const assignedSpot: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const actualLocation: GPSCoordinates = { lat: 14.6004, lng: 120.9842 };

      const result = verifyGPSLocation(assignedSpot, actualLocation);

      expect(Number.isInteger(result.distanceMeters)).toBe(true);
    });

    test('includes both locations in result', () => {
      const assignedSpot: GPSCoordinates = { lat: 14.5995, lng: 120.9842 };
      const actualLocation: GPSCoordinates = { lat: 14.6004, lng: 120.9842 };

      const result = verifyGPSLocation(assignedSpot, actualLocation);

      expect(result.assignedLocation).toEqual(assignedSpot);
      expect(result.actualLocation).toEqual(actualLocation);
    });
  });

  describe('formatDistance', () => {
    test('formats meters for distances under 1km', () => {
      expect(formatDistance(0)).toBe('0m');
      expect(formatDistance(50)).toBe('50m');
      expect(formatDistance(150)).toBe('150m');
      expect(formatDistance(999)).toBe('999m');
    });

    test('formats kilometers for distances 1km and above', () => {
      expect(formatDistance(1000)).toBe('1.00km');
      expect(formatDistance(1500)).toBe('1.50km');
      expect(formatDistance(2345)).toBe('2.35km');
      expect(formatDistance(10000)).toBe('10.00km');
    });

    test('rounds meters to nearest integer', () => {
      expect(formatDistance(150.4)).toBe('150m');
      expect(formatDistance(150.6)).toBe('151m');
    });
  });

  describe('validateGPSCoordinates', () => {
    test('validates correct coordinates', () => {
      expect(validateGPSCoordinates({ lat: 14.5995, lng: 120.9842 })).toBe(true);
      expect(validateGPSCoordinates({ lat: 0, lng: 0 })).toBe(true);
      expect(validateGPSCoordinates({ lat: -33.8688, lng: 151.2093 })).toBe(true);
    });

    test('rejects coordinates with invalid latitude', () => {
      expect(validateGPSCoordinates({ lat: 91, lng: 120.9842 })).toBe(false);
      expect(validateGPSCoordinates({ lat: -91, lng: 120.9842 })).toBe(false);
      expect(validateGPSCoordinates({ lat: 100, lng: 120.9842 })).toBe(false);
    });

    test('rejects coordinates with invalid longitude', () => {
      expect(validateGPSCoordinates({ lat: 14.5995, lng: 181 })).toBe(false);
      expect(validateGPSCoordinates({ lat: 14.5995, lng: -181 })).toBe(false);
      expect(validateGPSCoordinates({ lat: 14.5995, lng: 200 })).toBe(false);
    });

    test('rejects null or undefined coordinates', () => {
      expect(validateGPSCoordinates(null as any)).toBe(false);
      expect(validateGPSCoordinates(undefined as any)).toBe(false);
    });

    test('rejects coordinates with missing lat or lng', () => {
      expect(validateGPSCoordinates({ lat: 14.5995 } as any)).toBe(false);
      expect(validateGPSCoordinates({ lng: 120.9842 } as any)).toBe(false);
      expect(validateGPSCoordinates({} as any)).toBe(false);
    });

    test('rejects coordinates with non-numeric values', () => {
      expect(validateGPSCoordinates({ lat: '14.5995' as any, lng: 120.9842 })).toBe(false);
      expect(validateGPSCoordinates({ lat: 14.5995, lng: '120.9842' as any })).toBe(false);
    });

    test('accepts coordinates with optional accuracy and timestamp', () => {
      expect(validateGPSCoordinates({
        lat: 14.5995,
        lng: 120.9842,
        accuracy: 10,
        timestamp: Date.now()
      })).toBe(true);
    });
  });

  describe('getVerificationStatusText', () => {
    test('returns correct text for within threshold', () => {
      const result = {
        distanceMeters: 100,
        withinThreshold: true,
        flagForReview: false,
        assignedLocation: { lat: 14.5995, lng: 120.9842 },
        actualLocation: { lat: 14.6004, lng: 120.9842 }
      };

      expect(getVerificationStatusText(result)).toBe('Within acceptable range');
    });

    test('returns correct text for beyond threshold', () => {
      const result = {
        distanceMeters: 300,
        withinThreshold: false,
        flagForReview: true,
        assignedLocation: { lat: 14.5995, lng: 120.9842 },
        actualLocation: { lat: 14.6020, lng: 120.9870 }
      };

      expect(getVerificationStatusText(result)).toBe('Exceeds distance threshold - Flagged for review');
    });
  });

  describe('getVerificationStatusColor', () => {
    test('returns green for within threshold', () => {
      const result = {
        distanceMeters: 100,
        withinThreshold: true,
        flagForReview: false,
        assignedLocation: { lat: 14.5995, lng: 120.9842 },
        actualLocation: { lat: 14.6004, lng: 120.9842 }
      };

      expect(getVerificationStatusColor(result)).toBe('green');
    });

    test('returns red for beyond threshold', () => {
      const result = {
        distanceMeters: 300,
        withinThreshold: false,
        flagForReview: true,
        assignedLocation: { lat: 14.5995, lng: 120.9842 },
        actualLocation: { lat: 14.6020, lng: 120.9870 }
      };

      expect(getVerificationStatusColor(result)).toBe('red');
    });
  });
});
