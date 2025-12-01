"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoalStatusBadge } from "./goal-status-badge";
import { AnimatedProgressRing } from "@/components/ui/animations/animated-progress";
import { Calendar, Tag, Flag, ChevronRight, Milestone } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isPast, isToday } from "date-fns";
import Link from "next/link";
import type { Goal, GoalPriority } from "@/lib/db/goals";

interface GoalCardProps {
  goal: Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  };
}

const priorityConfig: Record<GoalPriority, { label: string; className: string; icon: string }> = {
  low: {
    label: "Low",
    className: "text-slate-500",
    icon: "↓",
  },
  medium: {
    label: "Medium",
    className: "text-yellow-600 dark:text-yellow-500",
    icon: "→",
  },
  high: {
    label: "High",
    className: "text-red-600 dark:text-red-500",
    icon: "↑",
  },
};

export function GoalCard({ goal }: GoalCardProps) {
  const priority = priorityConfig[goal.priority];
  const isOverdue = goal.target_date && isPast(parseISO(goal.target_date)) && !isToday(parseISO(goal.target_date)) && goal.status !== "completed";
  const isDueSoon = goal.target_date && !isOverdue && (() => {
    const daysUntil = Math.ceil((parseISO(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil >= 0;
  })();

  return (
    <Link href={`/goals/${goal.slug}`}>
      <Card className={cn(
        "transition-all hover:shadow-md hover:border-primary/30 cursor-pointer group",
        goal.status === "completed" && "border-green-500/30 bg-green-50/30 dark:bg-green-950/10",
        goal.status === "archived" && "opacity-60",
        goal.status === "abandoned" && "opacity-50",
        isOverdue && "border-red-500/50"
      )}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <AnimatedProgressRing
                value={goal.progress}
                max={100}
                size={56}
                strokeWidth={5}
                showLabel={true}
                color={
                  goal.status === "completed"
                    ? "success"
                    : goal.progress >= 75
                      ? "success"
                      : goal.progress >= 50
                        ? "warning"
                        : "primary"
                }
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title and Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>
                <GoalStatusBadge status={goal.status} />
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {/* Target Date */}
                {goal.target_date && (
                  <div className={cn(
                    "flex items-center gap-1.5",
                    isOverdue ? "text-red-600 dark:text-red-400" : isDueSoon ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"
                  )}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(parseISO(goal.target_date), "MMM d, yyyy")}</span>
                    {isOverdue && <span className="font-medium">(Overdue)</span>}
                  </div>
                )}

                {/* Priority */}
                <div className={cn("flex items-center gap-1", priority.className)}>
                  <Flag className="h-3.5 w-3.5" />
                  <span>{priority.icon} {priority.label}</span>
                </div>

                {/* Milestones */}
                {goal.milestoneCount > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Milestone className="h-3.5 w-3.5" />
                    <span>{goal.milestonesCompleted}/{goal.milestoneCount} milestones</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {goal.tags && goal.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {goal.tags.slice(0, 4).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs py-0">
                      {tag}
                    </Badge>
                  ))}
                  {goal.tags.length > 4 && (
                    <span className="text-xs text-muted-foreground">+{goal.tags.length - 4}</span>
                  )}
                </div>
              )}
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 self-center">
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
