"use client";

import { Habit, HabitCompletion } from "@/lib/db/habits";
import { toggleHabitCompletionAction } from "@/lib/actions/habits";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DailyHabitsProps {
  habits: Habit[];
  completions: HabitCompletion[];
  date: string;
}

export function DailyHabits({ habits, completions, date }: DailyHabitsProps) {
  const [optimisticCompletions, setOptimisticCompletions] = useState<Set<number>>(
    new Set(completions.map(c => c.habit_id))
  );

  const handleToggle = async (habitId: number) => {
    // Optimistic update
    const newCompletions = new Set(optimisticCompletions);
    if (newCompletions.has(habitId)) {
      newCompletions.delete(habitId);
    } else {
      newCompletions.add(habitId);
    }
    setOptimisticCompletions(newCompletions);

    try {
      await toggleHabitCompletionAction(habitId, date);
    } catch (error) {
      // Revert on error
      console.error("Failed to toggle habit:", error);
      setOptimisticCompletions(new Set(completions.map(c => c.habit_id)));
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No active habits.
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
