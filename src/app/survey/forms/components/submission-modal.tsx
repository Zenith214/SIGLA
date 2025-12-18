"use client"

import { X, CheckCircle, AlertCircle, RotateCcw } from "lucide-react"

interface SubmissionModalProps {
  isOpen: boolean
  type: 'success' | 'duplicate' | 'error'
  message: string
  onClose: () => void
  onRetry?: () => void
  onRedirect?: () => void
}

export function SubmissionModal({ isOpen, type, message, onClose, onRetry, onRedirect }: SubmissionModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />
      case 'duplicate':
        return <AlertCircle className="w-12 h-12 text-orange-600" />
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Survey Submitted Successfully!'
      case 'duplicate':
        return 'Duplicate Survey Number'
      case 'error':
        return 'Submission Failed'
    }
  }

  const getButtonText = () => {
    switch (type) {
      case 'success':
        return 'Continue'
      case 'duplicate':
        return 'Try Different Number'
      case 'error':
        return 'Try Again'
    }
  }

  const getButtonAction = () => {
    switch (type) {
      case 'success':
        return onRedirect || onClose
      case 'duplicate':
      case 'error':
        return onRetry || onClose
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center py-6">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            <p className="text-gray-700 mb-4">{message}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={getButtonAction()}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                type === 'success'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : type === 'duplicate'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {type !== 'success' && <RotateCcw className="w-4 h-4" />}
              <span>{getButtonText()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}