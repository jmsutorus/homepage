"use client";

import { useRouter } from "next/navigation";
import { Target, Flag, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe, cn } from "@/lib/utils";
import type { CalendarGoal, CalendarMilestone } from "@/lib/db/calendar";

interface DailyGoalsProps {
  upcomingGoals: CalendarGoal[];
  upcomingMilestones: CalendarMilestone[];
  completedGoals: CalendarGoal[];
  completedMilestones: CalendarMilestone[];
  colors?: {
    goal?: {
      due?: { bg: string; text: string };
      completed?: { bg: string; text: string };
    };
    milestone?: {
      due?: { bg: string; text: string };
      completed?: { bg: string; text: string };
    };
  };
}

export function DailyGoals({
  upcomingGoals,
  upcomingMilestones,
  completedGoals,
  completedMilestones,
  colors,
}: DailyGoalsProps) {
  const router = useRouter();

  const totalItems = upcomingGoals.length + upcomingMilestones.length +
                     completedGoals.length + completedMilestones.length;

  const handleGoalClick = (slug: string) => {
    router.push(`/goals/${slug}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'low':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Get colors with fallbacks
  const goalDueText = colors?.goal?.due?.text || "text-cyan-500";
  const goalDueBg = colors?.goal?.due?.bg || "bg-cyan-500";
  const goalCompletedText = colors?.goal?.completed?.text || "text-teal-500";
  const goalCompletedBg = colors?.goal?.completed?.bg || "bg-teal-500";
  const milestoneDueText = colors?.milestone?.due?.text || "text-violet-500";
  const milestoneDueBg = colors?.milestone?.due?.bg || "bg-violet-500";
  const milestoneCompletedText = colors?.milestone?.completed?.text || "text-fuchsia-500";
  const milestoneCompletedBg = colors?.milestone?.completed?.bg || "bg-fuchsia-500";

  // Extract border colors from bg colors (replace 'bg-' with 'border-')
  const goalDueBorder = goalDueBg.replace('bg-', 'border-');
  const goalCompletedBorder = goalCompletedBg.replace('bg-', 'border-');
  const milestoneDueBorder = milestoneDueBg.replace('bg-', 'border-');
  const milestoneCompletedBorder = milestoneCompletedBg.replace('bg-', 'border-');

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Target className="h-4 w-4" />
        Goals & Milestones ({totalItems})
      </h3>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className={cn("text-xs font-medium flex items-center gap-1", goalCompletedText)}>
            <CheckCircle className="h-3 w-3" />
            Goals Completed Today ({completedGoals.length})
          </h4>
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className={cn("pl-6 border-l-2 cursor-pointer hover:bg-accent/50 rounded-r-lg p-2 -ml-0 transition-colors", goalCompletedBorder)}
              onClick={() => handleGoalClick(goal.slug)}
            >
              <div className="flex items-center gap-2">
                <Target className={cn("h-3 w-3 flex-shrink-0", goalCompletedText)} />
                <p className={cn("text-sm font-medium", goalCompletedText)}>
                  {goal.title}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-5">
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${getPriorityColor(goal.priority)}`}>
                  {goal.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <div className="space-y-2">
          <h4 className={cn("text-xs font-medium flex items-center gap-1", milestoneCompletedText)}>
            <CheckCircle className="h-3 w-3" />
            Milestones Completed Today ({completedMilestones.length})
          </h4>
          {completedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className={cn("pl-6 border-l-2 cursor-pointer hover:bg-accent/50 rounded-r-lg p-2 -ml-0 transition-colors", milestoneCompletedBorder)}
              onClick={() => handleGoalClick(milestone.goalSlug)}
            >
              <div className="flex items-center gap-2">
                <Flag className={cn("h-3 w-3 flex-shrink-0", milestoneCompletedText)} />
                <p className={cn("text-sm font-medium", milestoneCompletedText)}>
                  {milestone.title}
                </p>
              </div>
              <p className="text-xs text-muted-foreground ml-5 mt-0.5">
                Goal: {milestone.goalTitle}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Goals */}
      {upcomingGoals.length > 0 && (
        <div className="space-y-2">
          <h4 className={cn("text-xs font-medium flex items-center gap-1", goalDueText)}>
            <Clock className="h-3 w-3" />
            Upcoming Goals ({upcomingGoals.length})
          </h4>
          {upcomingGoals.map((goal) => (
            <div
              key={goal.id}
              className={cn("pl-6 border-l-2 cursor-pointer hover:bg-accent/50 rounded-r-lg p-2 -ml-0 transition-colors", goalDueBorder)}
              onClick={() => handleGoalClick(goal.slug)}
            >
              <div className="flex items-center gap-2">
                <Target className={cn("h-3 w-3 flex-shrink-0", goalDueText)} />
                <p className={cn("text-sm font-medium", goalDueText)}>
                  {goal.title}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-5">
                {goal.target_date && (
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDateSafe(goal.target_date)}
                  </p>
                )}
                <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${getPriorityColor(goal.priority)}`}>
                  {goal.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <div className="space-y-2">
          <h4 className={cn("text-xs font-medium flex items-center gap-1", milestoneDueText)}>
            <Clock className="h-3 w-3" />
            Upcoming Milestones ({upcomingMilestones.length})
          </h4>
          {upcomingMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className={cn("pl-6 border-l-2 cursor-pointer hover:bg-accent/50 rounded-r-lg p-2 -ml-0 transition-colors", milestoneDueBorder)}
              onClick={() => handleGoalClick(milestone.goalSlug)}
            >
              <div className="flex items-center gap-2">
                <Flag className={cn("h-3 w-3 flex-shrink-0", milestoneDueText)} />
                <p className={cn("text-sm font-medium", milestoneDueText)}>
                  {milestone.title}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-5">
                <p className="text-xs text-muted-foreground">
                  Goal: {milestone.goalTitle}
                </p>
                {milestone.target_date && (
                  <span className="text-xs text-muted-foreground">
                    Due: {formatDateSafe(milestone.target_date)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
