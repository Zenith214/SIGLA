"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Award, MapPin } from "lucide-react";
import BarangayDetailsCard from "./BarangayDetailsCard";
import SGLGBHistoryCard from "./SGLGBHistoryCard";
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

import { type ApiBarangayData } from "@/utils/barangayUtils";

// Helper function to convert status to progress value
function getProgressValue(status: string | null) {
  switch(status) {
    case 'Completed': return 100;
    case 'In Progress': return 50;
    case 'Pending': return 0;
    default: return 0;
  }
}

// Get status badge color
const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-500';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Pending':
    default:
      return 'bg-gray-500';
  }
};

export default function BarangayListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState<ApiBarangayData | null>(null);
  const [barangays, setBarangays] = useState<ApiBarangayData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch barangays from API
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        const response = await fetch('/api/barangays');
        if (response.ok) {
          const data = await response.json();
          // Add mock history data for each barangay
          const barangaysWithHistory = data.map((barangay: any) => ({
            ...barangay,
            history: [
              { year: "2024", status: barangay.status, score: `${barangay.progress}%` },
              { year: "2023", status: "Completed", score: "75%" },
              { year: "2022", status: "Completed", score: "70%" },
              { year: "2021", status: "Completed", score: "65%" },
            ]
          }));
          setBarangays(barangaysWithHistory);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBarangays();
  }, []);
  
  const filteredBarangays = barangays.filter((barangay) =>
    barangay.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to determine award status
  const getAwardStatus = (barangay: ApiBarangayData) => {
    if (!barangay.history) return false;
    
    const currentYear = new Date().getFullYear();
    const recentHistory = barangay.history.filter(entry => {
      const entryYear = parseInt(entry.year);
      return entryYear < currentYear && entry.status === "Completed";
    });
    
    if (recentHistory.length > 0) {
      const mostRecent = recentHistory.sort((a, b) => parseInt(b.year) - parseInt(a.year))[0];
      const score = parseInt(mostRecent.score.replace('%', ''));
      return score >= 75;
    }
    return false;
  };

  if (selectedBarangay) {
    // Mock satisfaction percentage - you can replace this with actual data
    const satisfactionPercentage = 65; // Example value
    const isHighSatisfaction = satisfactionPercentage >= 58;

    const handleViewReportCard = () => {
      // Navigate to report card page with barangay data
      const params = new URLSearchParams({
        barangay: selectedBarangay.name,
        population: selectedBarangay.population.toString(),
        households: selectedBarangay.households.toString(),
        area: (selectedBarangay.area || 0).toString(),
        surveyStatus: selectedBarangay.status,
        satisfaction: satisfactionPercentage.toString()
      });
      
      window.location.href = `/reportcard?${params.toString()}`;
    };

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header with back button */}
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 p-4">
          <button
            onClick={() => setSelectedBarangay(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-3"
          >
            ← Back to List
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-slate-800">{selectedBarangay.name}</h2>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              getAwardStatus(selectedBarangay) 
                ? "text-white" 
                : "text-white"
            }`}
            style={{
              backgroundColor: getAwardStatus(selectedBarangay) ? "#64D9B7" : "#6A7280"
            }}>
              {getAwardStatus(selectedBarangay) ? "Awardee" : "Non-Awardee"}
            </div>
          </div>
        </div>
        
        {/* Content - Satisfaction Index */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {/* Overall Satisfaction */}
            <div className="border border-gray-200 rounded-full px-6 py-3 text-center bg-white shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <span className="text-gray-700 font-medium text-base">Overall Satisfaction:</span>
                <span className={`text-xl font-bold ${isHighSatisfaction ? 'text-green-600' : 'text-red-600'}`}>
                  {satisfactionPercentage}%
                </span>
              </div>
            </div>

            {/* BLGU Logo */}
            <div className="border-2 border-gray-200 rounded-xl p-6 h-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 shadow-sm">
              <span className="text-xl font-bold text-gray-700 tracking-wide">BLGU LOGO</span>
            </div>

            {/* View Report Card Button */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
              onClick={handleViewReportCard}
            >
              View Report Card
            </button>

            {/* Action Grid */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50 shadow-sm">
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 mb-1">Action Grid</h2>
              </div>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-3 h-64">
                {/* Top Left - Maintain */}
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-3 flex flex-col">
                  <div className="text-center mb-2">
                    <h3 className="text-green-800 font-bold text-sm mb-1">MAINTAIN</h3>
                    <span className="text-green-600 font-medium text-xs">High Satisfaction, Low Need for Action</span>
                  </div>
                  <div className="space-y-1 text-xs text-green-800">
                    <div className="flex items-center">
                      <span className="mr-2">★</span>
                      <span>Safety, Peace & Order</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">★</span>
                      <span>Business Friendliness</span>
                    </div>
                  </div>
                </div>

                {/* Top Right - Opportunities */}
                <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-3 flex flex-col">
                  <div className="text-center mb-2">
                    <h3 className="text-blue-800 font-bold text-sm mb-1">OPPORTUNITIES</h3>
                    <span className="text-blue-600 font-medium text-xs">High Satisfaction, High Need for Action</span>
                  </div>
                  <div className="space-y-1 text-xs text-blue-800">
                    <div className="flex items-center">
                      <span className="mr-2">★</span>
                      <span>Disaster Preparedness</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">★</span>
                      <span>Social Protection</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Left - Monitor */}
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 flex flex-col">
                  <div className="text-center mb-2">
                    <h3 className="text-yellow-800 font-bold text-sm mb-1">MONITOR</h3>
                    <span className="text-yellow-600 font-medium text-xs">Low Satisfaction, Low Need for Action</span>
                  </div>
                  <div className="space-y-1 text-xs text-yellow-800">
                    <div className="flex items-center">
                      <span className="mr-2">★</span>
                      <span>Environmental Management</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Right - Fix Now */}
                <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3 flex flex-col">
                  <div className="text-center mb-2">
                    <h3 className="text-red-800 font-bold text-sm mb-1">FIX NOW</h3>
                    <span className="text-red-600 font-medium text-xs">Low Satisfaction, High Need for Action</span>
                  </div>
                  <div className="space-y-1 text-xs text-red-800">
                    <div className="flex items-center">
                      <span className="mr-2">★</span>
                      <span>Finance Administration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Use Section */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-blue-50 shadow-sm">
              <h3 className="text-gray-800 font-semibold mb-3 text-base">How to Read This Report</h3>

              <div className="space-y-3 text-xs text-gray-700 leading-relaxed">
                {/* Overall Satisfaction */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Overall Satisfaction</h4>
                  <p>Shows the barangay's overall performance score. Green (58% or higher) indicates good performance, while red (below 58%) suggests areas needing improvement.</p>
                </div>

                {/* Action Grid */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Action Grid</h4>
                  <p>Categorizes services based on satisfaction levels and action priority:</p>
                  <ul className="mt-1 ml-2 space-y-1">
                    <li><span className="text-green-700 font-medium">• MAINTAIN:</span> Keep up good work</li>
                    <li><span className="text-blue-700 font-medium">• OPPORTUNITIES:</span> Build on strengths</li>
                    <li><span className="text-yellow-700 font-medium">• MONITOR:</span> Watch for changes</li>
                    <li><span className="text-red-700 font-medium">• FIX NOW:</span> Immediate attention needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
        <CardTitle className="text-xl font-semibold mb-3">Satisfaction Index Overview</CardTitle>
        <p className="text-sm text-gray-600 mb-4">
          Browse and search through all barangays to view their satisfaction index status and details.
        </p>
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search barangays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Barangay list */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredBarangays.map((barangay) => {
            const isAwardee = getAwardStatus(barangay);
            return (
              <button
                key={barangay.id}
                onClick={() => setSelectedBarangay(barangay)}
                className="w-full text-left p-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{barangay.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isAwardee ? "text-white" : "text-white"
                      }`}
                      style={{
                        backgroundColor: isAwardee ? "#64D9B7" : "#6A7280"
                      }}>
                        {isAwardee ? "Awardee" : "Non-Awardee"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Population: {barangay.population.toLocaleString()}</span>
                      <span>Households: {barangay.households.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <span className={`w-2 h-2 rounded-full ${
                        barangay.status === 'Completed' ? 'bg-green-500' :
                        barangay.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></span>
                      <span>{barangay.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
          {loading && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium mb-2">Loading barangays...</p>
            </div>
          )}
          {!loading && filteredBarangays.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No barangays found</p>
              <p>No barangays match "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>




    </div>
  );
}