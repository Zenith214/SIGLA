import Link from "next/link"
import { ArrowLeft, MapPin, Users, Calendar } from "lucide-react"

const barangayData = {
  1: { name: "Barangay 1", progress: 20, status: "Not Started", maxRespondents: 150, lastUpdated: "2025-01-15" },
  2: { name: "Barangay 2", progress: 40, status: "In Progress", maxRespondents: 150, lastUpdated: "2025-01-16" },
  3: { name: "Barangay 3", progress: 60, status: "In Progress", maxRespondents: 150, lastUpdated: "2025-01-16" },
  4: { name: "Barangay 4", progress: 80, status: "In Progress", maxRespondents: 150, lastUpdated: "2025-01-16" },
  5: { name: "Barangay 5", progress: 100, status: "Completed", maxRespondents: 150, lastUpdated: "2025-01-16" },
  6: { name: "Barangay 6", progress: 30, status: "In Progress", maxRespondents: 150, lastUpdated: "2025-01-15" },
  7: { name: "Barangay 7", progress: 10, status: "Not Started", maxRespondents: 150, lastUpdated: "2025-01-14" },
  8: { name: "Barangay 8", progress: 70, status: "In Progress", maxRespondents: 150, lastUpdated: "2025-01-16" },
}

export default function BarangayDetail({ params }: { params: { id: string } }) {
  const barangayId = Number.parseInt(params.id)
  const barangay = barangayData[barangayId as keyof typeof barangayData]

  if (!barangay) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#111827] mb-4">Barangay Not Found</h1>
          <Link href="/" className="text-[#3b82f6] hover:text-blue-700 font-medium">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <Link
              href="/survey"
              className="flex items-center space-x-2 text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          {/* Barangay Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-2">{barangay.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-[#6b7280]">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Survey Location</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{barangay.maxRespondents} Max Respondents</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">Updated {barangay.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs sm:text-sm rounded-full font-medium self-start ${
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

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[#6b7280]">Survey Progress</span>
                <span className="text-[#111827] font-medium">{barangay.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-[#16a34a] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${barangay.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#111827] mb-4">Survey Actions</h2>
            <div className="space-y-3 sm:space-y-4">
              <button className="w-full bg-[#16a34a] hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                Continue Survey
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button className="bg-[#3b82f6] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                  View Responses
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-[#111827] font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-4">Survey Summary</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-[#111827]">
                    {Math.round((barangay.progress / 100) * barangay.maxRespondents)}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Respondents</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-[#111827]">
                    {barangay.maxRespondents - Math.round((barangay.progress / 100) * barangay.maxRespondents)}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Remaining Surveys</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-[#111827]">{barangay.maxRespondents}</div>
                  <div className="text-xs sm:text-sm text-[#6b7280]">Total Target</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-[#6b7280] text-xs sm:text-sm leading-relaxed">
                  This barangay is part of the SIGLA Survey 2025 initiative to measure satisfaction with governance and
                  local administration. The survey covers various aspects including public services, infrastructure, and
                  community engagement. Each respondent interview takes approximately 15-20 minutes to complete with a
                  target of {barangay.maxRespondents} respondents per barangay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
