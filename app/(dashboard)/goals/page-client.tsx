"use client";

import { useState, useMemo } from "react";
import { GoalsList } from "@/components/widgets/goals/goals-list";
import { CreateGoalForm } from "@/components/widgets/goals/create-goal-form";
import { MobileGoalSheet } from "@/components/widgets/goals/mobile-goal-sheet";
import { MobileGoalsFilterSheet } from "@/components/widgets/goals/mobile-goals-filter-sheet";
import { GoalsFilter } from "@/components/widgets/goals/goals-filter";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Target, MoreHorizontal } from "lucide-react";
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
  const [viewTab, setViewTab] = useState("goals");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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

  const handleMobileFilterApply = (status: GoalStatus | "all", priority: GoalPriority | "all") => {
    setStatusFilter(status);
    setPriorityFilter(priority);
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
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {stats.active} active • {stats.completed} completed • {stats.total} total
          </p>
        </div>
        
        {/* Desktop: New Goal Button */}
        <div className="hidden sm:block">
          <CreateGoalForm />
        </div>

        {/* Mobile: Options Menu */}
        <div className="sm:hidden mt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setMobileFilterOpen(true)}>
                Sort / Filter...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={viewTab} onValueChange={setViewTab}>
        <PageTabsList
          tabs={[
            { value: "goals", label: "Goals", icon: Target, showLabel: false },
          ]}
          actionButton={{
            label: "New Goal",
            onClick: () => setMobileSheetOpen(true),
            icon: Plus,
          }}
        />

        <TabsContent value="goals" className="space-y-4 sm:space-y-6 mt-6 pb-20 md:pb-0">
          <div className="hidden sm:block">
            <GoalsFilter
              status={statusFilter}
              priority={priorityFilter}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onClearFilters={handleClearFilters}
            />
          </div>

          <GoalsList goals={filteredGoals} />
        </TabsContent>
      </Tabs>

      <MobileGoalSheet 
        open={mobileSheetOpen} 
        onOpenChange={setMobileSheetOpen} 
      />

      <MobileGoalsFilterSheet
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        currentStatus={statusFilter}
        currentPriority={priorityFilter}
        onApply={handleMobileFilterApply}
      />
    </div>
  );
}
