"use client";

import { Habit, HabitCompletion } from "@/lib/db/habits";
import { toggleHabitCompletionAction } from "@/lib/actions/habits";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { AnimatedProgress } from "@/components/ui/animations/animated-progress";
import { fireAchievementConfetti } from "@/lib/utils/confetti";

interface DailyHabitsProps {
  habits: Habit[];
  completions: HabitCompletion[];
  date: string;
}

export function DailyHabits({ habits, completions, date }: DailyHabitsProps) {
  const [optimisticCompletions, setOptimisticCompletions] = useState<Set<number>>(
    new Set(completions.map(c => c.habit_id))
  );
  const hasTriggeredConfetti = useRef(false);

  const handleToggle = async (habitId: number) => {
    // Optimistic update
    const newCompletions = new Set(optimisticCompletions);
    const wasCompleting = !newCompletions.has(habitId);

    if (newCompletions.has(habitId)) {
      newCompletions.delete(habitId);
    } else {
      newCompletions.add(habitId);
    }
    setOptimisticCompletions(newCompletions);

    // Check if all habits are now complete (and we just completed one)
    if (wasCompleting && newCompletions.size === habits.length && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      // Small delay for the UI to update first
      setTimeout(() => {
        fireAchievementConfetti("all-habits-complete");
      }, 300);
    }

    try {
      await toggleHabitCompletionAction(habitId, date);
    } catch (error) {
      // Revert on error
      console.error("Failed to toggle habit:", error);
      setOptimisticCompletions(new Set(completions.map(c => c.habit_id)));
      hasTriggeredConfetti.current = false;
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No active habits.
      </div>
    );
  }

  const completedCount = optimisticCompletions.size;
  const totalCount = habits.length;

  return (
    <div className="space-y-3">
      {/* Daily Progress Summary */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Today&apos;s progress</span>
          <span className="font-medium">{completedCount}/{totalCount} completed</span>
        </div>
        <AnimatedProgress
          value={completedCount}
          max={totalCount}
          size="sm"
          color={completedCount === totalCount ? "success" : "primary"}
        />
      </div>

      {habits.map((habit) => {
        const isCompleted = optimisticCompletions.has(habit.id);
        return (
          <div 
            key={habit.id} 
            className={cn(
              "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
              isCompleted ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-accent/50"
            )}
          >
            <Checkbox 
              id={`habit-${habit.id}`} 
              checked={isCompleted}
              onCheckedChange={() => handleToggle(habit.id)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label 
                htmlFor={`habit-${habit.id}`}
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {habit.title}
              </Label>
              {habit.description && (
                <p className="text-xs text-muted-foreground">
                  {habit.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
