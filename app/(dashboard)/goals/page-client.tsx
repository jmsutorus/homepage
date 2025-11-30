"use client";

import { useState, useMemo } from "react";
import { GoalsList } from "@/components/widgets/goals/goals-list";
import { CreateGoalForm } from "@/components/widgets/goals/create-goal-form";
import { GoalsFilter } from "@/components/widgets/goals/goals-filter";
import type { Goal, GoalStatus, GoalPriority } from "@/lib/db/goals";

interface GoalsPageClientProps {
  initialGoals: (Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  })[];
}

export function GoalsPageClient({ initialGoals }: GoalsPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<GoalPriority | "all">("all");

  const filteredGoals = useMemo(() => {
    return initialGoals.filter((goal) => {
      // Status filter
      if (statusFilter !== "all" && goal.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && goal.priority !== priorityFilter) {
        return false;
      }

      // By default, hide archived and abandoned unless explicitly filtered
      if (statusFilter === "all" && (goal.status === "archived" || goal.status === "abandoned")) {
        return false;
      }

      return true;
    });
  }, [initialGoals, statusFilter, priorityFilter]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const active = initialGoals.filter(g => g.status === "in_progress").length;
    const completed = initialGoals.filter(g => g.status === "completed").length;
    const total = initialGoals.filter(g => !["archived", "abandoned"].includes(g.status)).length;
    return { active, completed, total };
  }, [initialGoals]);

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {stats.active} active • {stats.completed} completed • {stats.total} total
          </p>
        </div>
        <CreateGoalForm />
      </div>

      <div className="space-y-4 sm:space-y-6">
        <GoalsFilter
          status={statusFilter}
          priority={priorityFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onClearFilters={handleClearFilters}
        />

        <GoalsList goals={filteredGoals} />
      </div>
    </div>
  );
}
