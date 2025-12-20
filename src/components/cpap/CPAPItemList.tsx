"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import type { CPAPItem, CPAPStatus } from "@/types/cpap";

const ITEMS_PER_PAGE = 5;

interface CPAPItemListProps {
  items: CPAPItem[];
  status: CPAPStatus;
  onEdit: (item: CPAPItem) => void;
  onDelete: (itemId: number) => void;
  canEdit?: boolean;
}

export function CPAPItemList({
  items,
  status,
  onEdit,
  onDelete,
  canEdit = true,
}: CPAPItemListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isEditable = (status === "Draft" || status === "Revision_Requested") && canEdit;
  const isReadOnly = status === "Submitted" || !canEdit;

  // Pagination calculations
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (itemId: number) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete !== null) {
      onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">No action items yet</p>
        <p className="text-sm text-gray-400 mt-1">
          {isEditable
            ? "Click 'Add Item' to create your first action item"
            : "No items have been added to this CPAP"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Item count and validation status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-gray-700">
              {items.length} {items.length === 1 ? "Action Item" : "Action Items"}
            </p>
            {isReadOnly && (
              <Badge variant="secondary">Read-only</Badge>
            )}
            {totalPages > 1 && (
              <Badge variant="outline">
                Page {currentPage} of {totalPages}
              </Badge>
            )}
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-3">
          {currentItems.map((item, index) => {
            const globalIndex = startIndex + index;
            return (
              <div
                key={item.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
                id={`item-${item.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5 font-semibold">
                        #{globalIndex + 1}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {item.priority_area}
                        </h3>
                      </div>
                    </div>

                    {/* Target Output */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Target Output
                      </p>
                      <p className="text-sm text-gray-700">{item.target_output}</p>
                    </div>

                    {/* Success Indicator */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Success Indicator
                      </p>
                      <p className="text-sm text-gray-700">
                        {item.success_indicator}
                      </p>
                    </div>

                    {/* Responsible Person */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Responsible Person
                      </p>
                      <p className="text-sm text-gray-700">
                        {item.responsible_person}
                      </p>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(item.timeline_start)} -{" "}
                        {formatDate(item.timeline_end)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isEditable && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(item)}
                        className="hover:bg-blue-50 hover:border-blue-400"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 hover:border-red-400"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of {items.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  const showEllipsis = 
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Action Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this action item? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
