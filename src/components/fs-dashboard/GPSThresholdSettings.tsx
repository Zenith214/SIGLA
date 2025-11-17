"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, CheckCircle } from "lucide-react";
import { formatDistance } from "@/app/survey/forms/utils/gpsVerification";

interface GPSThresholdSettingsProps {
  onThresholdChange?: (threshold: number) => void;
}

export default function GPSThresholdSettings({ onThresholdChange }: GPSThresholdSettingsProps) {
  const [threshold, setThreshold] = useState<number>(200);
  const [originalThreshold, setOriginalThreshold] = useState<number>(200);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchCurrentThreshold();
  }, []);

  const fetchCurrentThreshold = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/settings/gps-threshold");

      if (!response.ok) {
        throw new Error("Failed to fetch GPS threshold setting");
      }

      const data = await response.json();
      const currentThreshold = data.threshold || 200;
      setThreshold(currentThreshold);
      setOriginalThreshold(currentThreshold);
    } catch (err) {
      console.error("Error fetching GPS threshold:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (threshold < 10 || threshold > 5000) {
      setError("Threshold must be between 10 and 5000 meters");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/gps-threshold", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ threshold }),
      });

      if (!response.ok) {
        throw new Error("Failed to save GPS threshold setting");
      }

      setOriginalThreshold(threshold);
      setSuccess(true);
      onThresholdChange?.(threshold);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving GPS threshold:", err);
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setThreshold(originalThreshold);
    setError(null);
    setSuccess(false);
  };

  const hasChanges = threshold !== originalThreshold;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">GPS Verification Settings</h3>
          <p className="text-sm text-gray-600">Configure the distance threshold for GPS verification</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Threshold Input */}
        <div>
          <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
            Distance Threshold (meters)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              id="threshold"
              min="10"
              max="5000"
              step="10"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
              className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-600 font-medium">{formatDistance(threshold)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Interviews conducted beyond this distance from the assigned spot will be flagged for review.
          </p>
        </div>

        {/* Threshold Slider */}
        <div>
          <label htmlFor="threshold-slider" className="block text-sm font-medium text-gray-700 mb-2">
            Quick Adjust
          </label>
          <input
            type="range"
            id="threshold-slider"
            min="10"
            max="1000"
            step="10"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10m</span>
            <span>500m</span>
            <span>1000m</span>
          </div>
        </div>

        {/* Preset Values */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Common Presets</label>
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200, 300, 500].map((preset) => (
              <button
                key={preset}
                onClick={() => setThreshold(preset)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  threshold === preset
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {formatDistance(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">About GPS Verification</p>
              <p className="text-blue-800">
                The GPS verification system compares the actual interview location captured by field interviewers
                with the pre-assigned spot location. Interviews exceeding the threshold distance are automatically
                flagged for supervisor review to ensure data quality and detect potential issues.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">GPS threshold updated successfully!</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
