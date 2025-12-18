"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";

interface FIPerformance {
  fiId: number;
  name: string;
  email: string;
  assignedSpots: number;
  completedInterviews: number;
  inProgress: number;
  callbacks: number;
  flaggedForSubstitution: number;
  totalInterviews: number;
  completionRate: number;
}

interface FIPerformanceTableProps {
  fieldInterviewers: FIPerformance[];
  loading?: boolean;
}

type SortField = keyof FIPerformance;
type SortDirection = "asc" | "desc" | null;

export default function FIPerformanceTable({
  fieldInterviewers,
  loading = false,
}: FIPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField | null>("completionRate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction or clear sort
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) {
      return fieldInterviewers;
    }

    return [...fieldInterviewers].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [fieldInterviewers, sortField, sortDirection]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Assigned Spots",
      "Completed Interviews",
      "In Progress",
      "Callbacks",
      "Flagged",
      "Total Interviews",
      "Completion Rate",
    ];

    const rows = sortedData.map((fi) => [
      fi.name,
      fi.email,
      fi.assignedSpots,
      fi.completedInterviews,
      fi.inProgress,
      fi.callbacks,
      fi.flaggedForSubstitution,
      fi.totalInterviews,
      `${(fi.completionRate * 100).toFixed(1)}%`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `fi-performance-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (fieldInterviewers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">No field interviewers assigned</p>
          <p className="text-sm text-gray-500">
            Assign spots to field interviewers to see their performance here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with export button */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Field Interviewer Performance
        </h3>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  <span>Name</span>
                  {renderSortIcon("name")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center gap-2">
                  <span>Email</span>
                  {renderSortIcon("email")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("assignedSpots")}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Assigned Spots</span>
                  {renderSortIcon("assignedSpots")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("completedInterviews")}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Completed</span>
                  {renderSortIcon("completedInterviews")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("inProgress")}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>In Progress</span>
                  {renderSortIcon("inProgress")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("callbacks")}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Callbacks</span>
                  {renderSortIcon("callbacks")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("flaggedForSubstitution")}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Flagged</span>
                  {renderSortIcon("flaggedForSubstitution")}
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort("completionRate")}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Completion Rate</span>
                  {renderSortIcon("completionRate")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((fi) => (
              <tr key={fi.fiId} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{fi.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{fi.email}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">{fi.assignedSpots}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="text-sm font-medium text-green-600">
                    {fi.completedInterviews}
                  </div>
                  <div className="text-xs text-gray-500">
                    of {fi.totalInterviews}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="text-sm text-blue-600">{fi.inProgress}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="text-sm text-orange-600">{fi.callbacks}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="text-sm text-red-600">
                    {fi.flaggedForSubstitution}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {(fi.completionRate * 100).toFixed(1)}%
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          fi.completionRate >= 0.8
                            ? "bg-green-500"
                            : fi.completionRate >= 0.5
                            ? "bg-blue-500"
                            : fi.completionRate >= 0.3
                            ? "bg-orange-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${fi.completionRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total: {fieldInterviewers.length} Field Interviewer{fieldInterviewers.length !== 1 ? "s" : ""}
          </span>
          <span>
            Overall Completion:{" "}
            <span className="font-semibold text-gray-900">
              {fieldInterviewers.length > 0
                ? (
                    (fieldInterviewers.reduce((sum, fi) => sum + fi.completedInterviews, 0) /
                      fieldInterviewers.reduce((sum, fi) => sum + fi.totalInterviews, 0)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
