"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoalPriority, GoalStatus } from "@/lib/db/goals";
import { Circle, Flag } from "lucide-react";

interface MobileGoalsFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: GoalStatus | "all";
  currentPriority: GoalPriority | "all";
  onApply: (status: GoalStatus | "all", priority: GoalPriority | "all") => void;
}

export function MobileGoalsFilterSheet({
  open,
  onOpenChange,
  currentStatus,
  currentPriority,
  onApply,
}: MobileGoalsFilterSheetProps) {
  
  const handleStatusChange = (value: string) => {
    onApply(value as GoalStatus | "all", currentPriority);
  };

  const handlePriorityChange = (value: string) => {
    onApply(currentStatus, value as GoalPriority | "all");
  };

  const clearFilters = () => {
    onApply("all", "all");
    onOpenChange(false);
  };

  const activeFiltersCount = (currentStatus !== "all" ? 1 : 0) + (currentPriority !== "all" ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-3xl p-0">
        <div className="flex flex-col h-full pb-8">
          <SheetHeader className="px-6 pt-6 pb-4 border-b flex flex-row items-center justify-between">
            <SheetTitle>Filter Goals</SheetTitle>
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
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </label>
              <Select value={currentPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
