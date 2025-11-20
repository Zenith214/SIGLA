"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Calendar } from "lucide-react";
import type { CPAPItemInput } from "@/types/cpap";

interface AISuggestion {
  priority_area: string;
  target_output: string;
  success_indicator: string;
  timeline_months: string;
  source: string;
}

interface AISuggestionsData {
  shortTerm: AISuggestion[];
  mediumTerm: AISuggestion[];
  longTerm: AISuggestion[];
}

interface AISuggestionsModalProps {
  open: boolean;
  onClose: () => void;
  barangayId: number;
  cycleId: number;
  onUseSuggestions: (items: CPAPItemInput[]) => void;
}

export function AISuggestionsModal({
  open,
  onClose,
  barangayId,
  cycleId,
  onUseSuggestions,
}: AISuggestionsModalProps) {
  const [suggestions, setSuggestions] = useState<AISuggestionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [activeTab, setActiveTab] = useState<"short" | "medium" | "long">("short");

  const fetchSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setHasFetched(true);

    try {
      console.log(`Fetching AI suggestions for barangay ${barangayId}, cycle ${cycleId}`);
      const response = await fetch(
        `/api/cpap/ai-suggestions?barangay_id=${barangayId}&cycle_id=${cycleId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("AI Suggestions API Error:", response.status, errorData);
        throw new Error(errorData.message || `Failed to fetch AI suggestions (${response.status})`);
      }

      const data = await response.json();
      console.log("AI Suggestions Response:", data);
      
      if (!data.suggestions) {
        throw new Error("No suggestions data received from server");
      }
      
      setSuggestions(data.suggestions);
    } catch (err) {
      console.error("Error fetching AI suggestions:", err);
      setError(err instanceof Error ? err.message : "Failed to load suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch suggestions when modal opens
  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      // Reset state when closing
      setSuggestions(null);
      setError(null);
      setHasFetched(false);
    }
  };

  // Trigger fetch when modal opens
  if (open && !hasFetched && !isLoading) {
    fetchSuggestions();
  }

  const convertSuggestionsToItems = (): CPAPItemInput[] => {
    if (!suggestions) return [];

    const allSuggestions = [
      ...suggestions.shortTerm,
      ...suggestions.mediumTerm,
      ...suggestions.longTerm,
    ];

    const today = new Date();
    
    return allSuggestions.map((suggestion) => {
      // Parse timeline to get months
      const months = parseInt(suggestion.timeline_months.split("-")[0]) || 3;
      
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + months);

      return {
        priority_area: suggestion.priority_area,
        target_output: suggestion.target_output,
        success_indicator: suggestion.success_indicator,
        responsible_person: "To be assigned",
        timeline_start: startDate.toISOString().split("T")[0],
        timeline_end: endDate.toISOString().split("T")[0],
      };
    });
  };

  const handleUseSuggestions = () => {
    const items = convertSuggestionsToItems();
    onUseSuggestions(items);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI-Generated Action Recommendations
          </DialogTitle>
          <DialogDescription>
            These recommendations are based on survey analytics and funnel data for
            your barangay. You can use these as a starting point and customize them
            as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
              <Button
                onClick={fetchSuggestions}
                variant="outline"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : suggestions ? (
            <>
              {suggestions.shortTerm.length === 0 &&
                suggestions.mediumTerm.length === 0 &&
                suggestions.longTerm.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No AI Suggestions Available
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                      There is insufficient survey data for this barangay and cycle to generate AI recommendations.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please ensure survey responses have been collected and funnel analysis has been completed.
                    </p>
                  </div>
                ) : (
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "short" | "medium" | "long")}>
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                      <TabsTrigger value="short" className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {suggestions.shortTerm.length}
                        </Badge>
                        Short-Term
                      </TabsTrigger>
                      <TabsTrigger value="medium" className="flex items-center gap-2">
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          {suggestions.mediumTerm.length}
                        </Badge>
                        Medium-Term
                      </TabsTrigger>
                      <TabsTrigger value="long" className="flex items-center gap-2">
                        <Badge variant="outline" className="text-purple-700 border-purple-300">
                          {suggestions.longTerm.length}
                        </Badge>
                        Long-Term
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="short" className="mt-0">
                      {suggestions.shortTerm.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Timeline:</strong> 0-3 months - Quick wins and immediate improvements
                          </p>
                          {suggestions.shortTerm.map((item, index) => (
                            <div
                              key={index}
                              className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-gray-900">{item.priority_area}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {item.source}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Target Output
                                </p>
                                <p className="text-sm text-gray-700">{item.target_output}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Success Indicator
                                </p>
                                <p className="text-sm text-gray-700">{item.success_indicator}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3 w-3" />
                                <span>Timeline: {item.timeline_months}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No short-term suggestions available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="medium" className="mt-0">
                      {suggestions.mediumTerm.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Timeline:</strong> 6-12 months - Strategic improvements and capacity building
                          </p>
                          {suggestions.mediumTerm.map((item, index) => (
                            <div
                              key={index}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-gray-900">{item.priority_area}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {item.source}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Target Output
                                </p>
                                <p className="text-sm text-gray-700">{item.target_output}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Success Indicator
                                </p>
                                <p className="text-sm text-gray-700">{item.success_indicator}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3 w-3" />
                                <span>Timeline: {item.timeline_months}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No medium-term suggestions available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="long" className="mt-0">
                      {suggestions.longTerm.length > 0 ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-3">
                            <strong>Timeline:</strong> 1+ year - Long-term transformational initiatives
                          </p>
                          {suggestions.longTerm.map((item, index) => (
                            <div
                              key={index}
                              className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-gray-900">{item.priority_area}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {item.source}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Target Output
                                </p>
                                <p className="text-sm text-gray-700">{item.target_output}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Success Indicator
                                </p>
                                <p className="text-sm text-gray-700">{item.success_indicator}</p>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="h-3 w-3" />
                                <span>Timeline: {item.timeline_months}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No long-term suggestions available</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
            </>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {suggestions &&
            (suggestions.shortTerm.length > 0 ||
              suggestions.mediumTerm.length > 0 ||
              suggestions.longTerm.length > 0) && (
              <Button onClick={handleUseSuggestions}>
                <Sparkles className="h-4 w-4 mr-2" />
                Use These Suggestions
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
