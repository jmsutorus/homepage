"use client";

import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toggleDuolingoLessonCompletion } from "@/lib/actions/settings";

interface DuolingoCompletionToggleProps {
  date: string;
  isCompleted: boolean;
}

export function DuolingoCompletionToggle({ date, isCompleted }: DuolingoCompletionToggleProps) {
  const [completed, setCompleted] = useState(isCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await toggleDuolingoLessonCompletion(date);
      if (result.success && result.completed !== undefined) {
        setCompleted(result.completed);
      }
    });
  };

  return (
    <div 
      className={cn(
        "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
        completed ? "bg-media-secondary" : "bg-media-surface-container-high"
      )}
      onClick={handleToggle}
    >
      <div className={cn(
        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
        completed ? "right-1" : "left-1",
        isPending && "animate-pulse scale-90"
      )} />
    </div>
  );
}
