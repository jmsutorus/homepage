"use client";

import { Habit, HabitCompletion } from "@/lib/db/habits";
import { toggleHabitCompletionAction } from "@/lib/actions/habits";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { fireAchievementConfetti } from "@/lib/utils/confetti";
import { motion } from "framer-motion";

interface EditorialDailyHabitsProps {
  habits: Habit[];
  completions: HabitCompletion[];
  date: string;
}

export function EditorialDailyHabits({ habits, completions, date }: EditorialDailyHabitsProps) {
  const [optimisticCompletions, setOptimisticCompletions] = useState<Set<number>>(
    new Set(completions.map(c => c.habit_id))
  );
  const hasTriggeredConfetti = useRef(false);

  const handleToggle = async (habitId: number) => {
    const newCompletions = new Set(optimisticCompletions);
    const wasCompleting = !newCompletions.has(habitId);

    if (newCompletions.has(habitId)) {
      newCompletions.delete(habitId);
    } else {
      newCompletions.add(habitId);
    }
    setOptimisticCompletions(newCompletions);

    if (wasCompleting && newCompletions.size === habits.length && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      setTimeout(() => {
        fireAchievementConfetti("all-habits-complete");
      }, 300);
    }

    try {
      await toggleHabitCompletionAction(habitId, date);
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      setOptimisticCompletions(new Set(completions.map(c => c.habit_id)));
      hasTriggeredConfetti.current = false;
    }
  };

  const completedCount = optimisticCompletions.size;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-media-surface-container-low rounded-2xl p-8 border border-media-outline-variant/30 h-full">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-2xl font-bold font-headline tracking-tighter text-media-primary">Daily Rituals</h2>
        <span className="text-[10px] font-bold text-media-secondary uppercase tracking-widest">{completionPercentage}% Completion</span>
      </div>
      
      {habits.length === 0 ? (
         <div className="text-sm text-media-on-surface-variant flex items-center justify-center h-40">
           No active rituals.
         </div>
      ) : (
        <div className="space-y-6">
          {habits.map((habit, index) => {
            const isCompleted = optimisticCompletions.has(habit.id);
            // Alternate colors for a bit of visual interest if preferred, but we'll stick to primary/secondary as in prototype
            const barClass = index % 2 === 0 ? "bg-media-primary" : "bg-media-secondary";
            
            return (
              <div 
                key={habit.id} 
                className="cursor-pointer group"
                onClick={() => handleToggle(habit.id)}
              >
                <div className="flex justify-between items-end mb-2">
                  <span className={cn(
                    "text-sm font-bold text-media-on-surface transition-colors",
                    isCompleted ? "opacity-60" : "group-hover:text-media-secondary"
                  )}>
                    {habit.title}
                  </span>
                  <span className="text-[10px] text-media-on-surface-variant font-medium">
                    {isCompleted ? "Complete" : "Pending"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-media-surface-container-highest rounded-full overflow-hidden">
                  <motion.div 
                    initial={false}
                    animate={{ width: isCompleted ? "100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className={cn("h-full rounded-full", barClass)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
