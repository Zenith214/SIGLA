"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CPAP, CPAPItemInput } from "@/types/cpap";

interface CPAPSpreadsheetProps {
  cpap: CPAP;
  onSave: (items: any[]) => void;
  isSaving: boolean;
  aiSuggestions?: CPAPItemInput[];
}

interface SpreadsheetRow {
  id?: number;
  serviceArea: string;
  observation: string;
  planOfAction: string;
  activity: string;
  output: string;
  actualOutput: string;
  statusOfAccomplishment: string;
  implementationSchedule: string;
  actualDate: string;
  financialRequirements: string;
  responsiblePerson: string;
  committedToBeCommitted: string;
  meansOfVerification: string;
  progress: string; // Ongoing, Delayed, Completed
  isAISuggestion?: boolean;
}

const SERVICE_AREAS = [
  "FINANCIAL ADMINISTRATION",
  "DISASTER PREPAREDNESS",
  "SOCIAL PROTECTION",
  "SAFETY, PEACE & ORDER",
  "BUSINESS FRIENDLINESS",
  "ENVIRONMENTAL MANAGEMENT"
];

export function CPAPSpreadsheet({ cpap, onSave, isSaving, aiSuggestions = [] }: CPAPSpreadsheetProps) {
  const [rows, setRows] = useState<SpreadsheetRow[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Initialize rows from CPAP items ONLY ONCE on mount
    if (!isInitialized) {
      if (cpap.items && cpap.items.length > 0) {
        const mappedRows = cpap.items.map(item => ({
          id: item.id,
          serviceArea: item.priority_area || "",
          observation: item.observation || "",
          planOfAction: item.plan_of_action || "",
          activity: item.activity || "",
          output: item.target_output || "",
          actualOutput: item.actual_output || "",
          statusOfAccomplishment: item.accomplishment_status || "",
          implementationSchedule: item.timeline_start && item.timeline_end 
            ? `${item.timeline_start.split('T')[0]} - ${item.timeline_end.split('T')[0]}` 
            : "",
          actualDate: item.actual_date ? item.actual_date.split('T')[0] : "",
          financialRequirements: item.financial_requirements || "",
          responsiblePerson: item.responsible_person || "",
          committedToBeCommitted: item.committed_to_be_committed || "",
          meansOfVerification: item.success_indicator || "",
          progress: item.progress || ""
        }));
        setRows(mappedRows);
      } else {
        setRows([]);
      }
      setIsInitialized(true);
    }
  }, [cpap, isInitialized]);

  // Add AI suggestions to rows when they change
  useEffect(() => {
    if (aiSuggestions.length > 0) {
      const suggestionRows = aiSuggestions.map((item) => {
        return {
          serviceArea: item.priority_area || "",
          observation: item.observation || "",
          planOfAction: item.plan_of_action || "",
          activity: item.activity || "",
          output: item.target_output || "",
          actualOutput: item.actual_output || "",
          statusOfAccomplishment: item.accomplishment_status || "",
          implementationSchedule: item.timeline_start && item.timeline_end 
            ? `${item.timeline_start} - ${item.timeline_end}` 
            : "",
          actualDate: item.actual_date || "",
          financialRequirements: item.financial_requirements || "",
          responsiblePerson: item.responsible_person || "",
          committedToBeCommitted: item.committed_to_be_committed || "",
          meansOfVerification: item.success_indicator || "",
          progress: item.progress || "",
          isAISuggestion: true
        };
      });
      
      setRows(prev => [...prev, ...suggestionRows]);
    }
  }, [aiSuggestions]);

  const addRow = (serviceArea: string) => {
    const newRow: SpreadsheetRow = {
      serviceArea,
      observation: "",
      planOfAction: "",
      activity: "",
      output: "",
      actualOutput: "",
      statusOfAccomplishment: "",
      implementationSchedule: "",
      actualDate: "",
      financialRequirements: "",
      responsiblePerson: "",
      committedToBeCommitted: "",
      meansOfVerification: "",
      progress: ""
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (index: number) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
    // Remove from selected if it was selected
    const newSelected = new Set(selectedRows);
    newSelected.delete(index);
    // Adjust indices for rows after the deleted one
    const adjustedSelected = new Set<number>();
    newSelected.forEach(idx => {
      if (idx > index) {
        adjustedSelected.add(idx - 1);
      } else {
        adjustedSelected.add(idx);
      }
    });
    setSelectedRows(adjustedSelected);
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === rows.length && rows.length > 0) {
      // Deselect all
      setSelectedRows(new Set());
    } else {
      // Select all
      setSelectedRows(new Set(rows.map((_, idx) => idx)));
    }
  };

  const deleteSelectedRows = () => {
    if (selectedRows.size === 0) return;
    
    const newRows = rows.filter((_, idx) => !selectedRows.has(idx));
    setRows(newRows);
    setSelectedRows(new Set());
  };

  const updateCell = (rowId: number | undefined, field: keyof SpreadsheetRow, value: string) => {
    console.log(`📝 [UPDATE] Row ID ${rowId}, Field: ${field}, Value:`, value);
    const newRows = [...rows];
    const rowIndex = newRows.findIndex(r => r.id === rowId);
    if (rowIndex === -1) {
      console.error(`❌ [UPDATE] Could not find row with ID ${rowId}`);
      return;
    }
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
    console.log(`📝 [UPDATE] Updated row:`, newRows[rowIndex]);
    setRows(newRows);
  };

  const handleSave = () => {
    console.log("🔍 [SAVE] Starting save process...");
    console.log("🔍 [SAVE] Current rows state:", rows);
    console.log("🔍 [SAVE] Total rows:", rows.length);
    
    // Convert spreadsheet rows to CPAP items format
    const items = rows
      .filter(row => {
        // Only save rows with output (required field)
        const hasOutput = row.output && row.output.trim();
        if (!hasOutput) {
          console.log("⚠️ Skipping row without output:", {
            serviceArea: row.serviceArea,
            observation: row.observation?.substring(0, 50),
            hasOtherData: !!(row.observation || row.planOfAction || row.activity)
          });
        }
        return hasOutput;
      })
      .map(row => {
        // Parse implementation schedule safely
        const [startDate, endDate] = row.implementationSchedule.split(" - ");
        const defaultDate = new Date().toISOString().split("T")[0];
        
        const item = {
          id: row.id,
          priority_area: row.serviceArea,
          target_output: row.output,
          success_indicator: row.meansOfVerification,
          responsible_person: row.responsiblePerson,
          timeline_start: startDate?.trim() || defaultDate,
          timeline_end: endDate?.trim() || defaultDate,
          actual_output: row.actualOutput,
          accomplishment_status: row.statusOfAccomplishment,
          remarks: "",
          // New spreadsheet fields
          observation: row.observation,
          plan_of_action: row.planOfAction,
          activity: row.activity,
          financial_requirements: row.financialRequirements,
          committed_to_be_committed: row.committedToBeCommitted,
          actual_date: row.actualDate?.trim() || null,
          progress: row.progress || null
        };
        
        console.log("💾 Saving item:", {
          id: item.id,
          observation: item.observation,
          plan_of_action: item.plan_of_action,
          activity: item.activity,
          actual_output: item.actual_output,
          hasObservation: !!item.observation,
          hasPlanOfAction: !!item.plan_of_action,
          hasActivity: !!item.activity,
          hasActualOutput: !!item.actual_output
        });
        
        return item;
      });
    
    console.log("💾 Total items to save:", items.length);
    console.log("💾 Total rows in spreadsheet:", rows.length);
    console.log("💾 All items being saved:", JSON.stringify(items, null, 2));
    
    if (items.length === 0 && rows.length > 0) {
      console.warn("⚠️ No items to save! All rows are missing the Output field.");
      alert("⚠️ Cannot save: The 'Output' column is required for all rows.\n\nPlease fill in the Output field for each row before saving.");
      return;
    }
    
    console.log("💾 First item full:", items[0]);
    
    // Allow saving even if empty (to delete all items)
    onSave(items);
  };

  // Group rows by service area (case-insensitive matching)
  const rowsByServiceArea = SERVICE_AREAS.map(area => ({
    area,
    rows: rows.filter(row => row.serviceArea.toUpperCase() === area.toUpperCase())
  }));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Bulk Actions Bar */}
      {selectedRows.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={deleteSelectedRows}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 border-b-2 border-slate-600">
              <th className="border border-slate-600 px-2 py-3 text-center font-semibold w-[50px] text-white">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selectedRows.size === rows.length}
                  onChange={toggleAllRows}
                  className="w-4 h-4 cursor-pointer"
                  title="Select all rows"
                />
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[150px] text-white">
                Results/ Observations on Specific Target Service Area
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[120px] text-white">
                Plan of Action
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[120px] text-white">
                Activity
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[120px] text-white">
                Output <span className="text-red-400">*</span>
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[120px] text-white">
                Actual Output
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[150px] text-white">
                Status of Accomplishment
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[150px] text-white">
                Implementation Schedule
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[120px] text-white">
                Actual Date
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[120px] text-white">
                Financial Requirements
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[150px] text-white">
                Responsible Person / Office
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[150px] text-white">
                Committed/To be Committed in Sectoral Plan/Budget
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[150px] text-white">
                Means of Verification
              </th>
              <th className="border border-slate-600 px-2 py-3 text-left font-semibold min-w-[120px] text-white">
                Progress
              </th>
              <th className="border border-slate-600 px-2 py-3 text-center font-semibold w-[80px] text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rowsByServiceArea.map(({ area, rows: areaRows }) => (
              <React.Fragment key={`section-${area}`}>
                {/* Service Area Header Row */}
                <tr key={`header-${area}`} className="bg-blue-100 border-b border-slate-300">
                  <td className="border border-slate-300"></td>
                  <td colSpan={14} className="border border-slate-300 px-3 py-2 font-bold text-slate-800">
                    {area}
                  </td>
                </tr>
                
                {/* Data Rows for this service area */}
                {areaRows.length > 0 ? (
                  areaRows.map((row) => {
                    const globalIndex = rows.indexOf(row);
                    const isAISuggestion = row.isAISuggestion;
                    const isSelected = selectedRows.has(globalIndex);
                    return (
                      <tr key={globalIndex} className={isAISuggestion ? "hover:bg-purple-50 bg-purple-50/30" : "hover:bg-blue-50"}>
                        <td className={`border border-slate-300 p-1 text-center ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelection(globalIndex)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Textarea
                            value={row.observation}
                            onChange={(e) => updateCell(row.id, "observation", e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter observations..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Textarea
                            value={row.planOfAction}
                            onChange={(e) => updateCell(row.id, "planOfAction", e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter plan..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Textarea
                            value={row.activity}
                            onChange={(e) => updateCell(row.id, "activity", e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter activity..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Textarea
                            value={row.output}
                            onChange={(e) => updateCell(row.id, "output", e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter output..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Textarea
                            value={row.actualOutput}
                            onChange={(e) => updateCell(row.id, "actualOutput", e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter actual output..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Textarea
                            value={row.statusOfAccomplishment}
                            onChange={(e) => updateCell(row.id, "statusOfAccomplishment", e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter status..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Input
                            type="text"
                            value={row.implementationSchedule}
                            onChange={(e) => updateCell(row.id, "implementationSchedule", e.target.value)}
                            className="text-xs border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Jan - Dec 2024"
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Input
                            type="text"
                            value={row.actualDate}
                            onChange={(e) => updateCell(row.id, "actualDate", e.target.value)}
                            className="text-xs border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., 2025-12-21 or Within the year"
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Input
                            type="text"
                            value={row.financialRequirements}
                            onChange={(e) => updateCell(row.id, "financialRequirements", e.target.value)}
                            className="text-xs border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter amount..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Input
                            type="text"
                            value={row.responsiblePerson}
                            onChange={(e) => updateCell(row.id, "responsiblePerson", e.target.value)}
                            className="text-xs border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter name/office..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Input
                            type="text"
                            value={row.committedToBeCommitted}
                            onChange={(e) => updateCell(row.id, "committedToBeCommitted", e.target.value)}
                            className="text-xs border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter details..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Textarea
                            value={row.meansOfVerification}
                            onChange={(e) => updateCell(row.id, "meansOfVerification", e.target.value)}
                            className="min-h-[60px] text-xs resize-none border-0 focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter verification..."
                          />
                        </td>
                        <td className={`border border-slate-300 p-1 ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <select
                            value={row.progress}
                            onChange={(e) => updateCell(row.id, "progress", e.target.value)}
                            className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-500 bg-transparent h-[60px]"
                          >
                            <option value="">Select...</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Delayed">Delayed</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className={`border border-slate-300 p-1 text-center ${isAISuggestion ? 'bg-purple-50' : 'bg-white'}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRow(globalIndex)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="border border-slate-300"></td>
                    <td colSpan={14} className="border border-slate-300 px-3 py-4 text-center text-gray-500 bg-gray-50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRow(area)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add row for {area}
                      </Button>
                    </td>
                  </tr>
                )}
                
                {/* Add Row Button */}
                {areaRows.length > 0 && (
                  <tr>
                    <td className="border border-slate-300"></td>
                    <td colSpan={14} className="border border-slate-300 px-3 py-2 bg-slate-50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addRow(area)}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add another row
                      </Button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button at Bottom */}
      <div className="border-t border-slate-300 bg-slate-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="text-red-600 font-semibold">*</span> The <strong>Output</strong> column is required for all rows
          </p>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
