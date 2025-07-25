"use client"

import { MapPin, FileText, User } from "lucide-react"

interface HeaderProps {
  user: {
    name: string
    role: string
    id: string
    avatar: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Satisfaction Index for Governance and Local Administration
              </h1>
              <p className="text-sm text-gray-600">Community Assessment Survey Tool</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Location Tracking Active</span>
            </div>

            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-8 h-8 rounded-full bg-blue-100"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">
                  {user.role} • {user.id}
                </p>
              </div>
              <User className="w-4 h-4 text-gray-400 sm:hidden" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
