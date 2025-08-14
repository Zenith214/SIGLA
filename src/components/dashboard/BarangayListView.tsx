"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Award, MapPin } from "lucide-react";
import BarangayDetailsCard from "./BarangayDetailsCard";
import SGLGBHistoryCard from "./SGLGBHistoryCard";
import { barangayData, BarangayData } from "@/data/barangayData";

export default function BarangayListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState<BarangayData | null>(null);

  // Convert barangayData to array for filtering
  const barangays = Object.values(barangayData);
  
  const filteredBarangays = barangays.filter((barangay) =>
    barangay.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to determine award status
  const getAwardStatus = (barangay: BarangayData) => {
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
    return (
      <div className="h-full flex flex-col">
        {/* Header with back button */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
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
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <BarangayDetailsCard selectedBarangay={selectedBarangay} />
          <SGLGBHistoryCard selectedBarangay={selectedBarangay} />
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
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
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
                        barangay.surveyStatus === 'Completed' ? 'bg-green-500' :
                        barangay.surveyStatus === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></span>
                      <span>{barangay.surveyStatus}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            );
          })}
          {filteredBarangays.length === 0 && (
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