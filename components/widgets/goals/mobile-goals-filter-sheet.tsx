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
      <SheetContent side="bottom" className="h-auto rounded-t-[2.5rem] p-0 bg-media-surface-container border-media-outline-variant/10 shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full pb-10">
          <SheetHeader className="px-8 pt-8 pb-6 border-b border-media-outline-variant/5 flex flex-row items-center justify-between">
            <SheetTitle className="text-2xl font-bold tracking-tight text-media-primary">Filter Vision</SheetTitle>
            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-media-secondary hover:bg-media-secondary/5 transition-colors rounded-full"
              >
                Reset All
              </Button>
            )}
          </SheetHeader>

          <div className="px-8 py-8 space-y-10">
            
            {/* Status Filter */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant/60 flex items-center gap-3">
                <Circle className="h-3 w-3 text-media-primary" />
                Strategic Status
              </label>
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full h-14 bg-media-surface-container-high/50 border-media-outline-variant/10 rounded-2xl px-5 text-sm font-bold text-media-on-surface">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-media-surface-container-highest border-media-outline-variant/10 rounded-2xl shadow-xl">
                  <SelectItem value="all" className="py-4 text-sm font-medium">All Statuses</SelectItem>
                  <SelectItem value="in_progress" className="py-4 text-sm font-medium">In Progress</SelectItem>
                  <SelectItem value="completed" className="py-4 text-sm font-medium">Completed</SelectItem>
                  <SelectItem value="on_hold" className="py-4 text-sm font-medium">On Hold</SelectItem>
                  <SelectItem value="abandoned" className="py-4 text-sm font-medium">Abandoned</SelectItem>
                  <SelectItem value="archived" className="py-4 text-sm font-medium">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant/60 flex items-center gap-3">
                <Flag className="h-3 w-3 text-media-secondary" />
                Intentional Priority
              </label>
              <Select value={currentPriority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="w-full h-14 bg-media-surface-container-high/50 border-media-outline-variant/10 rounded-2xl px-5 text-sm font-bold text-media-on-surface">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent className="bg-media-surface-container-highest border-media-outline-variant/10 rounded-2xl shadow-xl">
                  <SelectItem value="all" className="py-4 text-sm font-medium">All Priorities</SelectItem>
                  <SelectItem value="high" className="py-4 text-sm font-medium">High Priority</SelectItem>
                  <SelectItem value="medium" className="py-4 text-sm font-medium">Medium Priority</SelectItem>
                  <SelectItem value="low" className="py-4 text-sm font-medium">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full h-16 text-sm font-bold uppercase tracking-widest bg-media-primary text-media-on-primary hover:bg-media-primary/90 transition-all active:scale-[0.98] rounded-2xl shadow-lg" 
              onClick={() => onOpenChange(false)}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
