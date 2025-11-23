"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GoalStatus } from "@/lib/db/goals";

interface GoalStatusBadgeProps {
  status: GoalStatus;
  className?: string;
}

const statusConfig: Record<GoalStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  not_started: {
    label: "Not Started",
    variant: "outline",
    className: "border-slate-400 text-slate-600 dark:text-slate-400",
  },
  in_progress: {
    label: "In Progress",
    variant: "default",
    className: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  on_hold: {
    label: "On Hold",
    variant: "secondary",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  completed: {
    label: "Completed",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
  archived: {
    label: "Archived",
    variant: "secondary",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  abandoned: {
    label: "Abandoned",
    variant: "destructive",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function GoalStatusBadge({ status, className }: GoalStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: GoalStatus): string {
  return statusConfig[status].label;
}

export const allStatuses: GoalStatus[] = [
  "not_started",
  "in_progress",
  "on_hold",
  "completed",
  "archived",
  "abandoned",
];
