"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ChevronDown } from "lucide-react";
import { allStatuses, getStatusLabel } from "./goal-status-badge";
import type { GoalStatus, GoalPriority } from "@/lib/db/goals";

interface GoalsFilterProps {
  status: GoalStatus | "all";
  priority: GoalPriority | "all";
  onStatusChange: (status: GoalStatus | "all") => void;
  onPriorityChange: (priority: GoalPriority | "all") => void;
  onClearFilters: () => void;
}

export function GoalsFilter({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
}: GoalsFilterProps) {
  const hasFilters = status !== "all" || priority !== "all";

  return (
    <div className="flex flex-wrap items-center gap-10">
      <Select value={status} onValueChange={(v) => onStatusChange(v as GoalStatus | "all")}>
        <SelectTrigger className="w-auto gap-3 bg-transparent border-none shadow-none p-0 h-auto text-[11px] font-bold uppercase tracking-[0.2em] text-media-on-surface-variant/70 hover:text-media-primary hover:scale-[1.02] active:scale-95 transition-all focus:ring-0 [&>svg]:hidden cursor-pointer group">
          <SelectValue placeholder="All Categories" />
          <ChevronDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
        </SelectTrigger>
        <SelectContent align="start" className="bg-media-surface-container/95 backdrop-blur-xl border-media-outline-variant/10 rounded-2xl shadow-2xl min-w-[200px] p-2">
          <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            All Statuses
          </SelectItem>
          {allStatuses.map((s) => (
            <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
              {getStatusLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(v) => onPriorityChange(v as GoalPriority | "all")}>
        <SelectTrigger className="w-auto gap-3 bg-transparent border-none shadow-none p-0 h-auto text-[11px] font-bold uppercase tracking-[0.2em] text-media-on-surface-variant/70 hover:text-media-primary hover:scale-[1.02] active:scale-95 transition-all focus:ring-0 [&>svg]:hidden cursor-pointer group">
          <SelectValue placeholder="Recent First" />
          <ChevronDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
        </SelectTrigger>
        <SelectContent align="start" className="bg-media-surface-container/95 backdrop-blur-xl border-media-outline-variant/10 rounded-2xl shadow-2xl min-w-[200px] p-2">
          <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            All Priorities
          </SelectItem>
          <SelectItem value="high" className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            High Priority
          </SelectItem>
          <SelectItem value="medium" className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            Medium Priority
          </SelectItem>
          <SelectItem value="low" className="text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            Low Priority
          </SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="cursor-pointer h-auto p-0 text-[10px] font-bold uppercase tracking-wider text-burnt-terracotta hover:text-burnt-terracotta/80 hover:bg-transparent transition-colors"
        >
          <X className="h-3 w-3 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
