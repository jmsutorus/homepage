"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Task, TaskStatusRecord, PredefinedTaskStatus } from "@/lib/db/tasks";
import { format } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { TaskCompletionAnimation, useTaskCompletionAnimation } from "@/components/ui/animations/task-completion-animation";
import { toast } from "sonner";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { addDays, startOfToday } from "date-fns";
import { RescheduleDialog } from "./reschedule-dialog";
import { TaskStatusSelect } from "./task-status-select";
import { Calendar, Trash2, Clock, ArrowRight } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  onTasksChanged: () => void;
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};



export function TaskList({ tasks, onTasksChanged }: TaskListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);
  const { startAnimation, cleanupTask, isAnimating } = useTaskCompletionAnimation();
  const [rescheduleTaskId, setRescheduleTaskId] = useState<number | null>(null);
  const [statuses, setStatuses] = useState<{ predefined: PredefinedTaskStatus[]; custom: TaskStatusRecord[] }>({ predefined: [], custom: [] });

  // Fetch statuses on mount
  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const response = await fetch("/api/task-statuses");
      if (response.ok) {
        const data = await response.json();
        setStatuses(data);
      }
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
    }
  };

  // Update local tasks when prop changes
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    // If marking as complete, start animation first
    if (!completed) {
      startAnimation(taskId);
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        // If marking incomplete, refresh immediately
        if (completed) {
          onTasksChanged();
        }
        // For completion, task will be removed after animation finishes
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      // On error, cleanup animation state
      if (!completed) {
        cleanupTask(taskId);
      }
    }
  };

  const handleAnimationComplete = (taskId: number) => {
    cleanupTask(taskId);
    // Remove task from local state without refetching
    setLocalTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setDeletingId(taskId);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from local state without refetching
        setLocalTasks(prev => prev.filter(task => task.id !== taskId));
        toast.success("Task deleted", {
          description: "The task has been permanently removed."
        });
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task", {
        description: "Please try again."
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state optimistically
        setLocalTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));

        toast.success("Status updated", {
          description: `Task status changed to ${newStatus.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`
        });

        // Refresh tasks to get updated completed state
        onTasksChanged();
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update status", {
        description: "Please try again."
      });
    }
  };

  const handleReschedule = async (taskId: number, date: Date) => {
    // Tranform the date to the format yyyy-MM-dd
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: formattedDate }),
      });

      if (response.ok) {
        toast.success("Task rescheduled", {
          description: `Due date set to ${format(date, "MMM d, yyyy")}`
        });
        onTasksChanged();
      }
    } catch (error) {
      console.error("Failed to reschedule task:", error);
      toast.error("Failed to reschedule task");
    }
  };

  if (localTasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tasks found. Add your first task above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {localTasks.map((task) => (
          <TaskCompletionAnimation
            key={task.id}
            isCompleted={task.completed}
            shouldAnimate={isAnimating(task.id)}
            onAnimationComplete={() => handleAnimationComplete(task.id)}
          >
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
                    className="mt-0.5 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {/* Status Dropdown */}
                      <TaskStatusSelect
                        status={task.status}
                        onStatusChange={(value) => handleStatusChange(task.id, value)}
                        customStatuses={statuses.custom}
                      />
                      
                      <Badge variant="secondary" className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>

                      {task.category && (
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
                          {task.category}
                        </Badge>
                      )}
                      {task.due_date && task.due_date.trim() !== "" && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(task.due_date.replaceAll("-", "/")), "MMM d, yyyy")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(task.id)}
                    disabled={deletingId === task.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => handleReschedule(task.id, startOfToday())}>
                  <Clock className="mr-2 h-4 w-4" />
                  Today
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleReschedule(task.id, addDays(startOfToday(), 1))}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Tomorrow
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleReschedule(task.id, addDays(task.due_date && task.due_date.trim() !== "" ? new Date(task.due_date.replaceAll("-", "/")) : startOfToday(), 8))}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Next Week
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => setRescheduleTaskId(task.id)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Pick Date...
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleDelete(task.id)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </TaskCompletionAnimation>
        ))}
      </AnimatePresence>

      <RescheduleDialog
        open={!!rescheduleTaskId}
        onOpenChange={(open) => !open && setRescheduleTaskId(null)}
        onConfirm={(date) => rescheduleTaskId && handleReschedule(rescheduleTaskId, date)}
      />
    </div>
  );
}
