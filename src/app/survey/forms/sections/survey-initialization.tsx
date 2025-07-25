"use client"

import { useState } from "react"
import { MapPin, Hash } from "lucide-react"
import type { SurveyData } from "../page"

interface SurveyInitializationProps {
  data: SurveyData
  onUpdate: (section: keyof SurveyData, data: any) => void
  onNext: () => void
}

export function SurveyInitialization({ data, onUpdate, onNext }: SurveyInitializationProps) {
  const [surveyNumber, setSurveyNumber] = useState(data.surveyNumber || "")
  const [location, setLocation] = useState(data.location || { lat: 0, lng: 0, address: "" })

  const handleLocationCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          }
          setLocation(newLocation)
          onUpdate("location", newLocation)
        },
        (error) => {
          alert("Unable to get location. Please enter manually.")
        },
      )
    }
  }

  const handleNext = () => {
    if (!surveyNumber || !location.address) {
      alert("Please complete all required fields.")
      return
    }

    onUpdate("surveyNumber", surveyNumber)
    onUpdate("location", location)
    onNext()
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
            type="text"
            id="surveyNumber"
            value={surveyNumber}
            onChange={(e) => setSurveyNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter survey number (e.g., SIGLA-2024-001)"
            required
          />
        </div>

        {/* Location Capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Respondent Location (Spot Map) *</label>
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleLocationCapture}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Capture Current Location</span>
            </button>

            {/* Interactive Map Area */}
            <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Interactive Map Integration</p>
                <p className="text-sm text-gray-500">
                  {location.address
                    ? `Location captured: ${location.address}`
                    : 'Click "Capture Current Location" to mark position'}
                </p>
              </div>
            </div>

            <input
              type="text"
              value={location.address}
              onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Or enter address manually"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue to Survey →
        </button>
      </div>
    </div>
  )
}
