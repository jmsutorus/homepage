"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/db/tasks";
import { useHaptic } from "@/hooks/use-haptic";
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
  const haptic = useHaptic();

  // Update local tasks when prop changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleToggleComplete = async (task: Task) => {
    const isCompleting = !task.completed;
    
    if (isCompleting) {
      haptic.trigger("success");
      // Optimistically remove from list for snappy feel
      setLocalTasks(prev => prev.filter(t => t.id !== task.id));
    } else {
      haptic.trigger("medium");
    }

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: isCompleting }),
      });

      if (response.ok) {
        onTasksChanged();
      } else {
        // Revert on error
        setLocalTasks(tasks);
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      setLocalTasks(tasks);
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (task: Task) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    haptic.trigger("error");

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

  if (localTasks.length === 0) {
    return (
      <div className="text-center py-12 text-media-on-surface-variant/40 font-lexend uppercase tracking-widest text-xs border border-dashed border-media-outline-variant/30 rounded-2xl">
        {variant === "archived" ? "The archive is currently empty." : "No tasks in the current flow."}
      </div>
    );
  }

  return (
    <div className={variant === "archived" ? "space-y-2" : "space-y-8"}>
      {localTasks.map((task) => (
        <EditorialTaskCard
          key={task.id}
          task={task}
          variant={variant === "archived" ? "archived" : (task.id === featuredTaskId ? "featured" : "standard")}
          onToggleComplete={() => handleToggleComplete(task)}
          onDelete={handleDelete}
          onOpenDetails={() => {
            // Placeholder for detail sheet
          }}
        />
      ))}
    </div>
  );
}
