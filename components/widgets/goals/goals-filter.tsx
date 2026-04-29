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
import { cn } from "@/lib/utils";

interface GoalsFilterProps {
  status: GoalStatus | "all";
  priority: GoalPriority | "all";
  onStatusChange: (status: GoalStatus | "all") => void;
  onPriorityChange: (priority: GoalPriority | "all") => void;
  onClearFilters: () => void;
}

const statusDots: Record<GoalStatus | "all", string> = {
  all: "bg-media-on-surface-variant/30",
  not_started: "bg-slate-400",
  in_progress: "bg-blue-500",
  on_hold: "bg-amber-500",
  completed: "bg-emerald-500",
  archived: "bg-slate-500",
  abandoned: "bg-rose-500",
};

const priorityDots: Record<GoalPriority | "all", string> = {
  all: "bg-media-on-surface-variant/30",
  high: "bg-rose-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export function GoalsFilter({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
}: GoalsFilterProps) {
  const hasFilters = status !== "all" || priority !== "all";

  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      <Select value={status} onValueChange={(v) => onStatusChange(v as GoalStatus | "all")}>
        <SelectTrigger className="flex items-center gap-3 bg-media-surface-container-low/60 backdrop-blur-md border border-media-outline-variant/15 hover:border-media-primary/30 rounded-full px-5 py-2.5 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary hover:bg-media-surface-container-high/40 shadow-sm transition-all active:scale-95 focus:ring-2 focus:ring-media-primary/20 focus:outline-none cursor-pointer [&>svg:last-child]:hidden group">
          <span className="opacity-40 font-black">Status:</span>
          <SelectValue />
          <ChevronDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-data-[state=open]:rotate-180 transition-transform duration-200" />
        </SelectTrigger>
        <SelectContent align="start" className="bg-media-surface-container/95 backdrop-blur-xl border border-media-outline-variant/15 rounded-2xl shadow-2xl min-w-[200px] p-2">
          <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", statusDots.all)} />
              <span>All Statuses</span>
            </div>
          </SelectItem>
          {allStatuses.map((s) => (
            <SelectItem key={s} value={s} className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", statusDots[s])} />
                <span>{getStatusLabel(s)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(v) => onPriorityChange(v as GoalPriority | "all")}>
        <SelectTrigger className="flex items-center gap-3 bg-media-surface-container-low/60 backdrop-blur-md border border-media-outline-variant/15 hover:border-media-primary/30 rounded-full px-5 py-2.5 h-auto text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary hover:bg-media-surface-container-high/40 shadow-sm transition-all active:scale-95 focus:ring-2 focus:ring-media-primary/20 focus:outline-none cursor-pointer [&>svg:last-child]:hidden group">
          <span className="opacity-40 font-black">Priority:</span>
          <SelectValue />
          <ChevronDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-data-[state=open]:rotate-180 transition-transform duration-200" />
        </SelectTrigger>
        <SelectContent align="start" className="bg-media-surface-container/95 backdrop-blur-xl border border-media-outline-variant/15 rounded-2xl shadow-2xl min-w-[200px] p-2">
          <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", priorityDots.all)} />
              <span>All Priorities</span>
            </div>
          </SelectItem>
          <SelectItem value="high" className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", priorityDots.high)} />
              <span>High Priority</span>
            </div>
          </SelectItem>
          <SelectItem value="medium" className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", priorityDots.medium)} />
              <span>Medium Priority</span>
            </div>
          </SelectItem>
          <SelectItem value="low" className="text-[10px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl focus:bg-media-primary/10 focus:text-media-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", priorityDots.low)} />
              <span>Low Priority</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="cursor-pointer h-auto px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-burnt-terracotta hover:text-burnt-terracotta/80 hover:bg-burnt-terracotta/10 rounded-full transition-all active:scale-95 flex items-center gap-2 border border-burnt-terracotta/20"
        >
          <X className="h-3 w-3" />
          Reset
        </Button>
      )}
    </div>
  );
}

