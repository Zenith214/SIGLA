"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Search, Filter, ClipboardList, Trash2, CheckCircle2 } from "lucide-react";
import type { CPAPListItem, CPAPStatus } from "@/types/cpap";

interface CPAPListProps {
  cpaps: CPAPListItem[];
  onUpdate: () => void;
}

export function CPAPList({ cpaps, onUpdate }: CPAPListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CPAPStatus | "all">("all");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [barangayFilter, setBarangayFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "barangay" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [markingDoneId, setMarkingDoneId] = useState<number | null>(null);

  // Extract unique cycles and barangays for filters
  const cycles = useMemo(() => {
    const uniqueCycles = new Map<number, string>();
    cpaps.forEach(cpap => {
      if (!uniqueCycles.has(cpap.cycle_id)) {
        uniqueCycles.set(cpap.cycle_id, cpap.cycle_name);
      }
    });
    return Array.from(uniqueCycles.entries()).map(([id, name]) => ({ id, name }));
  }, [cpaps]);

  const barangays = useMemo(() => {
    const uniqueBarangays = new Map<number, string>();
    cpaps.forEach(cpap => {
      if (!uniqueBarangays.has(cpap.barangay_id)) {
        uniqueBarangays.set(cpap.barangay_id, cpap.barangay_name);
      }
    });
    return Array.from(uniqueBarangays.entries()).map(([id, name]) => ({ id, name }));
  }, [cpaps]);

  // Filter and sort CPAPs
  const filteredAndSortedCPAPs = useMemo(() => {
    let filtered = cpaps;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cpap =>
        cpap.barangay_name.toLowerCase().includes(query) ||
        cpap.cycle_name.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(cpap => cpap.status === statusFilter);
    }

    // Apply cycle filter
    if (cycleFilter !== "all") {
      filtered = filtered.filter(cpap => cpap.cycle_id.toString() === cycleFilter);
    }

    // Apply barangay filter
    if (barangayFilter !== "all") {
      filtered = filtered.filter(cpap => cpap.barangay_id.toString() === barangayFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          const dateA = new Date(a.submitted_at || a.created_at).getTime();
          const dateB = new Date(b.submitted_at || b.created_at).getTime();
          comparison = dateB - dateA;
          break;
        case "barangay":
          comparison = a.barangay_name.localeCompare(b.barangay_name);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [cpaps, searchQuery, statusFilter, cycleFilter, barangayFilter, sortBy, sortOrder]);

  const getStatusBadgeVariant = (status: CPAPStatus) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Submitted":
        return "default";
      case "Approved":
        return "default";
      case "Revision_Requested":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: CPAPStatus) => {
    switch (status) {
      case "Revision_Requested":
        return "Revision Requested";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewCPAP = (cpapId: number) => {
    router.push(`/admin/cpap/review/${cpapId}`);
  };

  const toggleSort = (column: "date" | "barangay" | "status") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleDeleteCPAP = async (cpapId: number, barangayName: string) => {
    if (!confirm(`Are you sure you want to delete the CPAP for ${barangayName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(cpapId);
      
      const response = await fetch(`/api/cpap/${cpapId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete CPAP');
      }

      // Refresh the list
      onUpdate();
    } catch (error) {
      console.error('Error deleting CPAP:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete CPAP');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsDone = async (cpapId: number, barangayName: string) => {
    if (!confirm(`Mark the CPAP for ${barangayName} as completed?`)) {
      return;
    }

    try {
      setMarkingDoneId(cpapId);
      
      const response = await fetch(`/api/cpap/${cpapId}/mark-done`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark CPAP as done');
      }

      // Refresh the list
      onUpdate();
    } catch (error) {
      console.error('Error marking CPAP as done:', error);
      alert(error instanceof Error ? error.message : 'Failed to mark CPAP as done');
    } finally {
      setMarkingDoneId(null);
    }
  };

  // Show empty state if no CPAPs at all
  if (cpaps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No CPAPs Yet
          </h3>
          <p className="text-sm text-gray-500 text-center max-w-md mb-6">
            No Citizen Priority Action Plans have been submitted yet. CPAPs will appear here once LGU officers create and submit them for review.
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 max-w-md">
            <p className="text-sm text-indigo-800">
              <strong>What are CPAPs?</strong> Citizen Priority Action Plans are created by LGU officers based on survey results to address community priorities and improve service delivery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search barangay..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CPAPStatus | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Revision_Requested">Revision Requested</SelectItem>
            </SelectContent>
          </Select>

          {/* Cycle Filter */}
          <Select value={cycleFilter} onValueChange={setCycleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Cycles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cycles</SelectItem>
              {cycles.map(cycle => (
                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                  {cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Barangay Filter */}
          <Select value={barangayFilter} onValueChange={setBarangayFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Barangays" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Barangays</SelectItem>
              {barangays.map(barangay => (
                <SelectItem key={barangay.id} value={barangay.id.toString()}>
                  {barangay.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedCPAPs.length} of {cpaps.length} CPAPs
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSort("barangay")}
              >
                Barangay {sortBy === "barangay" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSort("status")}
              >
                Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Items</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSort("date")}
              >
                Submitted {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead>Approved</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCPAPs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No CPAPs found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedCPAPs.map((cpap) => (
                <TableRow key={cpap.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{cpap.barangay_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{cpap.cycle_name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(cpap.status)}>
                      {getStatusLabel(cpap.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{cpap.item_count}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(cpap.submitted_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(cpap.approved_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCPAP(cpap.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {cpap.status === "Approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsDone(cpap.id, cpap.barangay_name)}
                          disabled={markingDoneId === cpap.id}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {markingDoneId === cpap.id ? "Marking..." : "Mark Done"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCPAP(cpap.id, cpap.barangay_name)}
                        disabled={deletingId === cpap.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deletingId === cpap.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
