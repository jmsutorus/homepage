"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
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
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filter:</span>
      </div>

      <Select value={status} onValueChange={(v) => onStatusChange(v as GoalStatus | "all")}>
        <SelectTrigger className="w-[140px] cursor-pointer">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {allStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {getStatusLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(v) => onPriorityChange(v as GoalPriority | "all")}>
        <SelectTrigger className="w-[120px] cursor-pointer">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="cursor-pointer h-8"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
