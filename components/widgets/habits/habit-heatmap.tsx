"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, eachDayOfInterval, subDays, parseISO, startOfWeek, addDays } from "date-fns";

interface HabitHeatmapProps {
  completionDates: string[]; // Array of YYYY-MM-DD dates
  createdAt: string; // Habit creation date
  completedAt?: string; // Habit completion date (when marked as complete)
  isCompleted?: boolean; // Whether the habit has been marked as complete
}

export function HabitHeatmap({ completionDates, createdAt, completedAt, isCompleted }: HabitHeatmapProps) {
  const { weeks, completionSet } = useMemo(() => {
    const today = new Date();
    const weeksToShow = 16; // Show last ~4 months
    
    // Calculate the start of the first week (Sunday)
    const endWeekStart = startOfWeek(today, { weekStartsOn: 0 });
    const start = subDays(endWeekStart, (weeksToShow - 1) * 7);
    const end = addDays(endWeekStart, 6);
    
    // Create a Set of completion dates for O(1) lookup
    const completions = new Set(completionDates);
    
    // Group days into weeks
    const allDays = eachDayOfInterval({ start, end });
    const weekGroups: Date[][] = [];
    
    for (let i = 0; i < allDays.length; i += 7) {
      weekGroups.push(allDays.slice(i, i + 7));
    }
    
    return {
      weeks: weekGroups,
      completionSet: completions,
    };
  }, [completionDates]);
  
  const createdDate = parseISO(createdAt.split(' ')[0]);
  const habitCompletedDate = isCompleted && completedAt ? parseISO(completedAt.split(' ')[0]) : null;
  
  // Get intensity based on completion (binary for now: completed or not)
  const getIntensity = (date: Date): "none" | "completed" | "future" | "before-created" | "after-completed" => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For completed habits, treat days after completion as "after-completed"
    if (habitCompletedDate) {
      const compDate = new Date(habitCompletedDate);
      compDate.setHours(0, 0, 0, 0);
      if (date > compDate) return "after-completed";
    } else if (date > today) {
      return "future";
    }
    
    if (date < createdDate) return "before-created";
    
    const dateStr = format(date, "yyyy-MM-dd");
    return completionSet.has(dateStr) ? "completed" : "none";
  };
  
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  
  return (
    <div className="space-y-2">
      {/* Month labels */}
      <div className="flex text-xs text-muted-foreground ml-5 gap-[3px]">
        {weeks.map((week, weekIndex) => {
          // Show month label at the start of each month
          const firstDay = week[0];
          const showLabel = weekIndex === 0 || firstDay.getDate() <= 7;
          return (
            <div key={weekIndex} className="w-3 text-center">
              {showLabel && firstDay.getDate() <= 7 ? format(firstDay, "MMM").slice(0, 1) : ""}
            </div>
          );
        })}
      </div>
      
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-xs text-muted-foreground">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 w-3 flex items-center justify-center text-[8px]">
              {i % 2 === 1 ? label : ""}
            </div>
          ))}
        </div>
        
        {/* Heatmap grid */}
        <TooltipProvider delayDuration={0}>
          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => {
                  const intensity = getIntensity(day);
                  const dateStr = format(day, "MMM d, yyyy");
                  const isCompletedDay = intensity === "completed";
                  
                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "h-3 w-3 rounded-sm transition-colors",
                            intensity === "completed" && "bg-green-500 dark:bg-green-600",
                            intensity === "none" && "bg-muted hover:bg-muted-foreground/20",
                            intensity === "future" && "bg-transparent border border-dashed border-muted-foreground/20",
                            intensity === "before-created" && "bg-transparent",
                            intensity === "after-completed" && "bg-transparent border border-dashed border-muted-foreground/20"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">{dateStr}</p>
                        <p className={cn(
                          isCompletedDay ? "text-green-500" : "text-muted-foreground"
                        )}>
                          {intensity === "completed" 
                            ? "Completed ✓" 
                            : intensity === "future" 
                              ? "Future" 
                              : intensity === "before-created"
                                ? "Before habit created"
                                : intensity === "after-completed"
                                  ? "After habit completed"
                                  : "Not completed"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-[2px]">
          <div className="h-3 w-3 rounded-sm bg-muted" />
          <div className="h-3 w-3 rounded-sm bg-green-500/50" />
          <div className="h-3 w-3 rounded-sm bg-green-500" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
