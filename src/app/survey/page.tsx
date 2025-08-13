"use client"
import Link from "next/link"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

const barangays = [
  { id: 1, name: "Barangay 1", progress: 20, status: "Not Started" },
  { id: 2, name: "Barangay 2", progress: 40, status: "In Progress" },
  { id: 3, name: "Barangay 3", progress: 60, status: "In Progress" },
  { id: 4, name: "Barangay 4", progress: 80, status: "In Progress" },
  { id: 5, name: "Barangay 5", progress: 100, status: "Completed" },
  { id: 6, name: "Barangay 6", progress: 30, status: "In Progress" },
  { id: 7, name: "Barangay 7", progress: 10, status: "Not Started" },
  { id: 8, name: "Barangay 8", progress: 70, status: "In Progress" },
]

export default function Dashboard() {
  // Add this state at the top of the Dashboard component
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Logout handler function
  const handleLogout = () => {
    Cookies.remove("sigla_token", { path: "/" })
    router.push("/")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-sm sm:text-lg md:text-xl font-semibold text-[#111827] truncate pr-4">
              <span className="hidden sm:inline">
                SIGLA: Satisfaction Index for Governance and Local Administration
              </span>
              <span className="sm:hidden">SIGLA Survey</span>
            </h1>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 text-[#6b7280] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
                  <button 
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">Welcome, Field Interviewer!</h2>
            <p className="text-sm sm:text-base text-[#6b7280]">
              Continue your survey work and track progress across all barangays.
            </p>
          </div>

          {/* Overall Progress Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">
              SIGLA Survey 2025 - Overall Progress
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Progress</span>
                <span className="text-[#111827] font-medium">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#16a34a] h-3 rounded-full transition-all duration-300"
                  style={{ width: "45%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Barangay Progress Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {barangays.map((barangay) => (
              <Link key={barangay.id} href={`/survey/barangay/${barangay.id}`} className="block">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-[#111827] text-sm sm:text-base">{barangay.name}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          barangay.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : barangay.status === "In Progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {barangay.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[#6b7280]">Progress</span>
                        <span className="text-[#111827] font-medium">{barangay.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#16a34a] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${barangay.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
