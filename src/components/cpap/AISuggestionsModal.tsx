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
        
        // Handle specific error cases with user-friendly messages
        if (response.status === 404) {
          throw new Error(
            "No survey data available yet. Please ensure that survey responses have been collected and analyzed for this barangay and cycle before generating AI suggestions."
          );
        } else if (response.status === 403) {
          throw new Error(
            errorData.message || "You don't have permission to generate suggestions for this barangay."
          );
        } else if (response.status === 400) {
          throw new Error(
            errorData.message || "Invalid request. Please check the barangay and cycle information."
          );
        }
        
        throw new Error(errorData.message || `Failed to generate AI suggestions. Please try again later.`);
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
      let months = parseInt(suggestion.timeline_months.split("-")[0]) || 3;
      
      // For long-term items (12+ months), ensure it's at least 13 months
      if (months === 12 && suggestions.longTerm.includes(suggestion)) {
        months = 13;
      }
      
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + months);

      // Generate more comprehensive data for spreadsheet columns
      return {
        priority_area: suggestion.priority_area,
        target_output: suggestion.target_output,
        success_indicator: suggestion.success_indicator,
        responsible_person: "To be assigned", // User should fill this
        timeline_start: startDate.toISOString().split("T")[0],
        timeline_end: endDate.toISOString().split("T")[0],
        // Additional fields for spreadsheet (will be mapped in component)
        observation: `Based on survey data: ${suggestion.source}`,
        plan_of_action: suggestion.target_output, // Use target output as initial plan
        activity: "To be determined", // User should specify activities
        actual_output: "", // To be filled during implementation
        accomplishment_status: "", // To be filled during implementation
        actual_date: "", // To be filled when completed
        financial_requirements: "To be estimated", // User should provide budget
        committed_to_be_committed: "To be determined", // User should specify
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
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Important:</strong> These AI-generated suggestions may not be fully accurate. 
              Please review and verify each recommendation before including it in your CPAP. 
              Adjust the details to match your barangay's specific needs and context.
            </p>
          </div>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-800 mb-2">
                      Unable to Generate AI Suggestions
                    </h3>
                    <p className="text-sm text-red-700 mb-4">{error}</p>
                    
                    {error.includes("No survey data") && (
                      <div className="mt-3 p-3 bg-white border border-red-100 rounded text-sm text-gray-700">
                        <p className="font-medium mb-2">What you can do:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Ensure survey interviews have been completed for this barangay</li>
                          <li>Wait for the funnel analysis to be processed (this happens automatically)</li>
                          <li>Contact your administrator if surveys have been completed but data is still unavailable</li>
                        </ul>
                      </div>
                    )}
                    
                    <Button
                      onClick={fetchSuggestions}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> You can still create your CPAP manually by clicking "Add Action Item" 
                  and entering your own priority areas and target outputs based on your barangay's needs.
                </p>
              </div>
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
                      No AI Suggestions Generated
                    </h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                      The AI was unable to generate recommendations based on the available survey data for this barangay and cycle.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto text-left">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>Possible reasons:</strong>
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                        <li>Insufficient survey responses collected</li>
                        <li>Funnel analysis data not yet available</li>
                        <li>No clear priority areas identified from the data</li>
                      </ul>
                      <p className="text-sm text-blue-800 mt-3">
                        You can still create your CPAP manually using the "Add Action Item" button.
                      </p>
                    </div>
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
