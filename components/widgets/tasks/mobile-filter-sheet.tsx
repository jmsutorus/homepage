"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { TaskCategory, TaskStatusRecord } from "@/lib/db/tasks";
import { FolderKanban, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TaskCategory[];
  statuses: TaskStatusRecord[];
  currentCategory: string;
  currentStatus: string;
  onApply: (category: string, status: string) => void;
}

export function MobileFilterSheet({
  open,
  onOpenChange,
  categories,
  statuses,
  currentCategory,
  currentStatus,
  onApply,
}: MobileFilterSheetProps) {
  
  const handleCategoryChange = (value: string) => {
    onApply(value, currentStatus);
  };

  const handleStatusChange = (value: string) => {
    onApply(currentCategory, value);
  };

  const clearFilters = () => {
    onApply("all", "all");
    onOpenChange(false);
  };

  const activeFiltersCount = (currentCategory !== "all" ? 1 : 0) + (currentStatus !== "all" ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl p-0">
        <div className="flex flex-col h-full pb-8">
          <SheetHeader className="px-6 pt-6 pb-4 border-b flex flex-row items-center justify-between">
            <SheetTitle>Filter Tasks</SheetTitle>
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            )}
          </SheetHeader>

          <div className="px-6 py-6 space-y-6">
            
            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <FolderKanban className="h-4 w-4" />
                Category
              </label>
              <Select value={currentCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <Circle className="h-4 w-4" />
                Status
              </label>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  {statuses.length > 0 && (
                    <>
                      <SelectSeparator />
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full h-12 text-base" 
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
