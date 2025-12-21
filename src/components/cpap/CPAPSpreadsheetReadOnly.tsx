"use client";

import React from "react";
import type { CPAPItem } from "@/types/cpap";

interface CPAPSpreadsheetReadOnlyProps {
  items: CPAPItem[];
}

const SERVICE_AREAS = [
  "FINANCIAL ADMINISTRATION",
  "DISASTER PREPAREDNESS",
  "SOCIAL PROTECTION",
  "SAFETY, PEACE & ORDER",
  "BUSINESS FRIENDLINESS",
  "ENVIRONMENTAL MANAGEMENT"
];

export function CPAPSpreadsheetReadOnly({ items }: CPAPSpreadsheetReadOnlyProps) {
  // Group items by service area (case-insensitive matching)
  const itemsByServiceArea = SERVICE_AREAS.map(area => ({
    area,
    items: items.filter(item => item.priority_area.toUpperCase() === area.toUpperCase())
  }));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-700 border-b-2 border-slate-600">
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
                Output
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
            </tr>
          </thead>
          <tbody>
            {itemsByServiceArea.map(({ area, items: areaItems }) => (
              <React.Fragment key={`section-${area}`}>
                {/* Service Area Header Row */}
                <tr className="bg-blue-100 border-b border-slate-300">
                  <td colSpan={13} className="border border-slate-300 px-3 py-2 font-bold text-slate-800">
                    {area}
                  </td>
                </tr>
                
                {/* Data Rows for this service area */}
                {areaItems.length > 0 ? (
                  areaItems.map((item) => {
                    const schedule = item.timeline_start && item.timeline_end 
                      ? `${item.timeline_start.split('T')[0]} - ${item.timeline_end.split('T')[0]}` 
                      : "";
                    
                    return (
                      <tr key={item.id} className="hover:bg-blue-50">
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.observation || ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.plan_of_action || ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.activity || ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.target_output}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.actual_output || ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.accomplishment_status || ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div>{schedule}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div>{item.actual_date ? item.actual_date.split('T')[0] : ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div>{item.financial_requirements || ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.responsible_person}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div>{item.committed_to_be_committed || ""}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          <div className="whitespace-pre-wrap">{item.success_indicator}</div>
                        </td>
                        <td className="border border-slate-300 px-2 py-2 text-xs bg-white">
                          {item.progress && (
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                              item.progress === 'Completed' ? 'bg-green-100 text-green-800' :
                              item.progress === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                              item.progress === 'Delayed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.progress}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={12} className="border border-slate-300 px-3 py-4 text-center text-gray-500 bg-gray-50 text-xs">
                      No items for this service area
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
