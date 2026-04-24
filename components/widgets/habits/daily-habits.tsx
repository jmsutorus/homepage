"use client";

import { Habit, HabitCompletion } from "@/lib/db/habits";
import { toggleHabitCompletionAction } from "@/lib/actions/habits";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
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
      {habits.map((habit) => {
        const isCompleted = optimisticCompletions.has(habit.id);
        return (
          <div 
            key={habit.id} 
            className={cn(
              "flex items-center justify-between p-4 rounded-xl transition-all h-16",
              isCompleted ? "bg-media-surface-container" : "bg-media-surface-container-low"
            )}
          >
            <div className="flex flex-col">
              <span className={cn(
                "text-sm font-medium transition-all",
                isCompleted ? "text-media-on-surface opacity-60 line-through" : "text-media-on-surface"
              )}>
                {habit.title}
              </span>
              {habit.description && !isCompleted && (
                <span className="text-[10px] text-media-on-surface-variant/60 uppercase tracking-wider font-bold mt-0.5">
                  {habit.description}
                </span>
              )}
            </div>
            <button 
              onClick={() => handleToggle(habit.id)}
              className={cn(
                "px-4 py-1.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full transition-all cursor-pointer active:scale-95",
                isCompleted 
                  ? "bg-media-primary text-media-primary-fixed" 
                  : "bg-media-surface-container-high text-media-on-surface-variant hover:bg-media-surface-container-highest"
              )}
            >
              {isCompleted ? "Completed" : "Mark Done"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
