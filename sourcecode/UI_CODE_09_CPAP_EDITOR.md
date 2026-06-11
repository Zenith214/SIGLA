# CPAP EDITOR PAGE (Spreadsheet Editor)

**File**: `src/app/cpap/editor/page.tsx`

---

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { useActiveCycle } from "@/hooks/useSurveyCycle";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { CPAPSpreadsheet } from "@/components/cpap/CPAPSpreadsheet";
import { AISuggestionsModal } from "@/components/cpap/AISuggestionsModal";
import type { CPAP, CPAPItemInput } from "@/types/cpap";

export default function CPAPEditorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeCycle } = useActiveCycle();
  const { toast } = useToast();
  const { canEditCPAP } = usePermissions();
  
  const [cpap, setCpap] = useState<CPAP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBarangayId, setUserBarangayId] = useState<number | null>(null);
  const [userBarangayName, setUserBarangayName] = useState<string>("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiGeneratedItems, setAiGeneratedItems] = useState<CPAPItemInput[]>([]);
  const [showTips, setShowTips] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserBarangay();
    }
  }, [user]);

  useEffect(() => {
    if (userBarangayId && activeCycle) {
      fetchOrCreateCPAP();
    }
  }, [userBarangayId, activeCycle]);

  // Check if user has permission to edit CPAPs
  useEffect(() => {
    if (user && !canEditCPAP) {
      router.push("/forbidden?reason=permission_denied&attempted_path=/cpap/editor");
    }
  }, [user, canEditCPAP, router]);

  const fetchUserBarangay = async () => {
    try {
      const response = await fetch("/api/users/me/barangay");
      
      if (response.status === 404) {
        setError("You are not assigned to any barangay. Please contact your administrator.");
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch user barangay");
      }
      
      const data = await response.json();
      setUserBarangayId(data.barangay_id);
      setUserBarangayName(data.barangay_name || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to determine your assigned barangay");
      setIsLoading(false);
    }
  };

  const fetchOrCreateCPAP = async () => {
    if (!userBarangayId || !activeCycle?.cycle_id) {
      setError("Missing barangay or cycle information");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Cache-busting: Add timestamp to force fresh data
      const timestamp = Date.now();
      console.log("🔄 [FETCH] Fetching CPAP with cache-busting timestamp:", timestamp);

      // Try to get existing CPAP with cache-busting
      const listResponse = await fetch(
        `/api/cpap?barangay_id=${userBarangayId}&cycle_id=${activeCycle.cycle_id}&_t=${timestamp}`,
        {
          cache: 'no-store', // Disable Next.js cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );

      if (!listResponse.ok) {
        throw new Error("Failed to fetch CPAP");
      }

      const listData = await listResponse.json();

      if (listData.cpaps && listData.cpaps.length > 0) {
        const cpapId = listData.cpaps[0].id;
        console.log("🔄 [FETCH] Fetching CPAP details for ID:", cpapId);
        
        const detailResponse = await fetch(`/api/cpap/${cpapId}?_t=${timestamp}`, {
          cache: 'no-store', // Disable Next.js cache
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!detailResponse.ok) {
          throw new Error("Failed to fetch CPAP details");
        }

        const detailData = await detailResponse.json();
        console.log("✅ [FETCH] CPAP data loaded:", {
          id: detailData.cpap.id,
          itemCount: detailData.cpap.items?.length || 0,
          firstItemSample: detailData.cpap.items?.[0] ? {
            observation: detailData.cpap.items[0].observation?.substring(0, 50),
            actualOutput: detailData.cpap.items[0].actual_output?.substring(0, 50)
          } : null
        });
        setCpap(detailData.cpap);
      } else {
        // Create new CPAP
        const createResponse = await fetch("/api/cpap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barangay_id: userBarangayId,
            cycle_id: activeCycle.cycle_id,
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create CPAP");
        }

        const createData = await createResponse.json();
        const detailResponse = await fetch(`/api/cpap/${createData.cpap.id}?_t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const detailData = await detailResponse.json();
        setCpap(detailData.cpap);
      }
    } catch (err) {
      console.error("Error fetching/creating CPAP:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (items: any[]) => {
    if (!cpap) return;

    try {
      setIsSaving(true);

      // Calculate which items were deleted
      // Items that exist in cpap.items but not in the new items array
      const existingItemIds = (cpap.items || []).map(item => item.id).filter(id => id !== undefined);
      const newItemIds = items.map(item => item.id).filter(id => id !== undefined);
      const deleted_item_ids = existingItemIds.filter(id => !newItemIds.includes(id));

      console.log("Saving CPAP:", {
        totalItems: items.length,
        existingIds: existingItemIds,
        newIds: newItemIds,
        deletedIds: deleted_item_ids
      });

      const response = await fetch(`/api/cpap/${cpap.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          deleted_item_ids,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save");
      }

      const data = await response.json();
      setCpap(data.cpap);

      toast({
        title: "Success",
        description: "CPAP saved successfully. Redirecting to overview...",
        type: "success",
      });

      // Redirect to overview page after successful save
      setTimeout(() => {
        router.push("/cpap");
      }, 1000);
    } catch (err) {
      console.error("Error saving CPAP:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseSuggestions = (items: CPAPItemInput[]) => {
    setAiGeneratedItems(items);
    setShowAISuggestions(false);
    toast({
      title: "AI Suggestions Loaded",
      description: `${items.length} suggestions added. Review and edit them in the spreadsheet below.`,
      type: "success",
    });
  };

  const handleDiscardAI = () => {
    setAiGeneratedItems([]);
    toast({
      title: "Suggestions Cleared",
      description: "AI suggestions have been removed.",
      type: "info",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#dbeafe' }}>
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/cpap")}
                  className="text-white hover:bg-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    CITIZEN PRIORITY ACTION PLAN
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">{userBarangayName}</span>
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="font-medium">{activeCycle?.name || "Survey Cycle"}:</span> {activeCycle?.year}
                    </p>
                  </div>
                </div>
              </div>
              {/* Removed save button from header - use the one in spreadsheet component */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to Load CPAP
                </h3>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          ) : cpap ? (
            <div className="space-y-4">
              {/* Tips Card */}
              {showTips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">
                          Tips for Creating Your CPAP
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Use the <strong>AI Suggestions</strong> button to get started with recommendations based on survey data</li>
                          <li>• Fill in the <strong>Output</strong> column for each row (required for saving)</li>
                          <li>• Add multiple rows per service area as needed</li>
                          <li>• Use <strong>Tab</strong> key to navigate between cells quickly</li>
                          <li>• Click <strong>Save All Changes</strong> when done to persist your work</li>
                        </ul>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTips(false)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Suggestions Button */}
              <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI-Powered Suggestions</h3>
                    <p className="text-sm text-gray-600">
                      Get action item recommendations based on your barangay's survey results
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAISuggestions(true)}
                  variant="outline"
                  className="border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Suggestions
                </Button>
              </div>

              {/* AI Generated Items Warning */}
              {aiGeneratedItems.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-2">
                        ⚠️ AI Suggestions Loaded - Review Required
                      </h3>
                      <p className="text-sm text-amber-800 mb-3">
                        <strong>{aiGeneratedItems.length} AI-generated suggestions</strong> have been added to the spreadsheet below. 
                        <strong className="block mt-1">Important:</strong>
                      </p>
                      <ul className="text-sm text-amber-800 space-y-1 mb-3">
                        <li>• AI suggestions may contain inaccuracies or be incomplete</li>
                        <li>• Review and edit each suggestion to match your barangay's actual needs</li>
                        <li>• Verify all information before saving</li>
                        <li>• Add or remove rows as needed</li>
                        <li>• These are recommendations only - you have full control</li>
                      </ul>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDiscardAI}
                          className="border-amber-600 text-amber-700 hover:bg-amber-100"
                        >
                          Clear All Suggestions
                        </Button>
                        <span className="text-xs text-amber-700 flex items-center">
                          Scroll down to see the suggestions in the spreadsheet
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Spreadsheet */}
              <CPAPSpreadsheet
                cpap={cpap}
                onSave={handleSave}
                isSaving={isSaving}
                aiSuggestions={aiGeneratedItems}
              />
            </div>
          ) : null}
        </div>

        {/* AI Suggestions Modal */}
        {userBarangayId && activeCycle?.cycle_id && (
          <AISuggestionsModal
            open={showAISuggestions}
            onClose={() => setShowAISuggestions(false)}
            barangayId={userBarangayId}
            cycleId={activeCycle.cycle_id}
            onUseSuggestions={handleUseSuggestions}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
```

---

## NOTES

**CPAP Editor Page** - Spreadsheet-style editor for creating/editing CPAP action items

**Key Features:**
- **Auto-create CPAP** - Creates new CPAP if none exists for barangay+cycle
- **AI-powered suggestions** - Get action items based on survey data
- **Spreadsheet interface** - Excel-like editing with Tab navigation
- **Tips card** - Dismissible blue card with usage tips
- **AI warning banner** - Amber alert when AI suggestions loaded
- **Cache-busting** - Timestamp + no-cache headers for fresh data
- **Auto-redirect** - Returns to `/cpap` after successful save
- **Permission check** - Requires `canEditCPAP` permission

**Header:**
- Dark slate-800 background
- Back arrow to CPAP overview (`/cpap`)
- "CITIZEN PRIORITY ACTION PLAN" title
- Barangay name + Survey cycle/year display

**Tips Card (Blue):**
- Lightbulb icon
- 5 tips for using the editor
- Dismissible with "Dismiss" button
- Shows on first load (`showTips` state)

**AI Suggestions Section:**
- Purple Sparkles icon
- "AI-Powered Suggestions" heading
- Description: "Get action item recommendations based on your barangay's survey results"
- "Get AI Suggestions" button (purple outline)
- Opens `AISuggestionsModal`

**AI Warning Banner (Amber):**
- Shows when `aiGeneratedItems.length > 0`
- AlertTriangle icon
- "⚠️ AI Suggestions Loaded - Review Required" heading
- Lists count of suggestions
- 5 warning points about AI accuracy
- "Clear All Suggestions" button
- Note: "Scroll down to see the suggestions in the spreadsheet"

**Spreadsheet Component:**
- `CPAPSpreadsheet` - Main editable spreadsheet
- Props: `cpap`, `onSave`, `isSaving`, `aiSuggestions`
- Handles add/edit/delete rows
- Tab key navigation
- "Save All Changes" button (in component)

**Save Flow:**
1. Calculate deleted items (existingIds - newIds)
2. PUT to `/api/cpap/{id}` with items + deleted_item_ids
3. Show success toast
4. Wait 1 second
5. Redirect to `/cpap` overview

**AI Suggestions Flow:**
1. Click "Get AI Suggestions" button
2. Opens `AISuggestionsModal`
3. Modal fetches suggestions from API
4. User reviews suggestions
5. Click "Use These Suggestions"
6. `handleUseSuggestions` sets `aiGeneratedItems` state
7. Shows amber warning banner
8. Suggestions passed to `CPAPSpreadsheet` via `aiSuggestions` prop
9. User can "Clear All Suggestions" to discard

**Error States:**
- No barangay assignment - Shows error message
- Failed to fetch/create CPAP - Shows error in white card

**Permission Enforcement:**
- Checks `canEditCPAP` permission
- Redirects to `/forbidden?reason=permission_denied&attempted_path=/cpap/editor` if denied

**Max Width:**
- Container: `max-w-[1600px]` (wider than standard for spreadsheet)

**Auto-Create Logic:**
- If no CPAP exists for barangay+cycle, creates new one via POST `/api/cpap`
- Then fetches full details
- User can start editing immediately
