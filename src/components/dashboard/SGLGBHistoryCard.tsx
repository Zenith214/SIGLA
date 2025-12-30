"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ApiBarangayData } from "@/utils/barangayUtils";

interface SGLGBHistoryCardProps {
  selectedBarangay?: ApiBarangayData | null;
  isLocked?: boolean;
}

export default function SGLGBHistoryCard({ selectedBarangay, isLocked = false }: SGLGBHistoryCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get current year and filter history to show current year and 2 years before
  const currentYear = new Date().getFullYear();
  const filteredHistory = selectedBarangay?.history?.filter(entry => {
    const entryYear = parseInt(entry.year);
    return entryYear <= currentYear && entryYear >= currentYear - 2;
  }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  // Reset to page 1 when barangay changes
  const handleBarangayChange = () => {
    setCurrentPage(1);
  };

  // Reset page when selectedBarangay changes
  if (selectedBarangay && currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <Card className={`w-full h-full flex flex-col mb-4 transition-all duration-200 ${
      selectedBarangay && !isLocked ? 'ring-2 ring-blue-300 shadow-lg' : ''
    }`}>
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>SGLGB History</span>
          {selectedBarangay && !isLocked && (
            <span className="text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Hover Preview
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-start pt-3">
        {selectedBarangay ? (
          <div className="space-y-3 flex-1 flex flex-col">
            {filteredHistory.length > 0 ? (
              <>
                <div className="space-y-3 flex-1">
                  {paginatedHistory.map((entry, index) => {
                    // Determine if it's an awardee based on the isAwardee field or score
                    const score = entry.score !== 'N/A' ? parseInt(entry.score.replace('%', '')) : 0;
                    const isAwardee = (entry as any).isAwardee !== undefined 
                      ? (entry as any).isAwardee 
                      : (entry.status === "Completed" && score >= 75);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-gray-800">{entry.year}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium text-white`}
                            style={{
                              backgroundColor: isAwardee ? "#64D9B7" : "#6A7280"
                            }}>
                            {isAwardee ? "Awardee" : "Non-Awardee"}
                          </span>
                        </div>
                        {/* Score hidden for now - will be added later with actual data */}
                        {/* <span className="text-sm font-medium text-gray-600">{entry.score}</span> */}
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500">
                <p className="text-sm">No historical data available for the past two years</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">Hover over a barangay</p>
            <p className="text-xs mt-1">Move your mouse over the map to preview SGLGB history</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}