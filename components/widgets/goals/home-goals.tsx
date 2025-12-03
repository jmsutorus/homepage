"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedProgressRing } from "@/components/ui/animations/animated-progress";
import { ChevronRight } from "lucide-react";
import type { Goal } from "@/lib/db/goals";

interface HomeGoalsProps {
  goals: (Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  })[];
}

export function HomeGoals({ goals }: HomeGoalsProps) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">No active goals</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {goals.map((goal) => (
        <Link key={goal.id} href={`/goals/${goal.slug}`}>
          <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Progress Ring */}
                <div className="flex-shrink-0">
                  <AnimatedProgressRing
                    value={goal.progress}
                    max={100}
                    size={40}
                    strokeWidth={4}
                    showLabel={false}
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {goal.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{Math.round(goal.progress)}%</span>
                    {goal.milestoneCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{goal.milestonesCompleted}/{goal.milestoneCount} milestones</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
