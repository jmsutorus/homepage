"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/db/tasks";
import { AnimatePresence } from "framer-motion";
import { TaskCompletionAnimation, useTaskCompletionAnimation } from "@/components/ui/animations/task-completion-animation";
import { toast } from "sonner";
import { EditorialTaskCard } from "./editorial-task-card";

interface TaskListProps {
  tasks: Task[];
  onTasksChanged: () => void;
  featuredTaskId?: number;
  variant?: "standard" | "archived";
}

export function TaskList({ tasks, onTasksChanged, featuredTaskId, variant = "standard" }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const { startAnimation, cleanupTask, isAnimating } = useTaskCompletionAnimation();

  // Update local tasks when prop changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleToggleComplete = async (task: Task) => {
    const isCompleting = !task.completed;
    
    // If marking as complete, start animation first
    if (isCompleting) {
      startAnimation(task.id);
    }

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: isCompleting }),
      });

      if (response.ok) {
        if (!isCompleting) {
          // If marking incomplete, refresh immediately
          onTasksChanged();
        }
        // For completion, task will be removed after animation finishes
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      if (isCompleting) {
        cleanupTask(task.id);
      }
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLocalTasks(prev => prev.filter(t => t.id !== task.id));
        onTasksChanged();
        toast.success("Task deleted");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleAnimationComplete = (taskId: number) => {
    cleanupTask(taskId);
    // Remove task from local state without refetching for smooth UI
    setLocalTasks(prev => prev.filter(task => task.id !== taskId));
    // Trigger parent refresh to sync with DB
    onTasksChanged();
  };

  if (localTasks.length === 0) {
    return (
      <div className="text-center py-12 text-media-on-surface-variant/40 font-lexend uppercase tracking-widest text-xs border border-dashed border-media-outline-variant/30 rounded-2xl">
        {variant === "archived" ? "The archive is currently empty." : "No tasks in the current flow."}
      </div>
    );
  }

  return (
    <div className={variant === "archived" ? "space-y-2" : "space-y-8"}>
      <AnimatePresence mode="popLayout">
        {localTasks.map((task) => (
          <TaskCompletionAnimation
            key={task.id}
            isCompleted={task.completed}
            shouldAnimate={isAnimating(task.id)}
            onAnimationComplete={() => handleAnimationComplete(task.id)}
          >
            <EditorialTaskCard
              task={task}
              variant={variant === "archived" ? "archived" : (task.id === featuredTaskId ? "featured" : "standard")}
              onToggleComplete={() => handleToggleComplete(task)}
              onDelete={handleDelete}
              onOpenDetails={() => {
                // For now, toggle complete or maybe we'll add a detail sheet later
                // The prototype has an "open_in_new" icon, we can use it for opening a sheet
                // But let's stick to the basics for now
              }}
            />
          </TaskCompletionAnimation>
        ))}
      </AnimatePresence>
    </div>
  );
}
