"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApiBarangayData } from "@/utils/barangayUtils";

interface SGLGBHistoryCardProps {
  selectedBarangay?: ApiBarangayData | null;
}

export default function SGLGBHistoryCard({ selectedBarangay }: SGLGBHistoryCardProps) {
  // Get current year and filter history to show only 2 years before current year
  const currentYear = new Date().getFullYear();
  const filteredHistory = selectedBarangay?.history?.filter(entry => {
    const entryYear = parseInt(entry.year);
    return entryYear < currentYear && entryYear >= currentYear - 2;
  }) || [];

  return (
    <Card className="w-full h-full flex flex-col mb-4">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          SGLGB History
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-start pt-3">
        {selectedBarangay ? (
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((entry, index) => {
                // Determine if it's an awardee based on score (assuming 75% or higher is awardee)
                const score = parseInt(entry.score.replace('%', ''));
                const isAwardee = entry.status === "Completed" && score >= 75;
                
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
                    <span className="text-sm font-medium text-gray-600">{entry.score}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500">
                <p className="text-sm">No historical data available for the past two years</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">
            <p className="text-sm">Click on a barangay in the map to view SGLGB history</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}