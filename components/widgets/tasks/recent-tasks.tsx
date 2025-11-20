"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/lib/db/tasks";
import { Calendar, CheckCircle2, ExternalLink } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { TaskCompletionAnimation, useTaskCompletionAnimation } from "@/components/ui/animations/task-completion-animation";

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-red-500/10 text-red-500",
};

export function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { animatingTasks, startAnimation, cleanupTask, isAnimating } = useTaskCompletionAnimation();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      // Fetch incomplete tasks only
      const response = await fetch("/api/tasks?completed=false");
      if (response.ok) {
        const data = await response.json();
        // Sort by due_date (nulls last) and then created_at (desc)
        const sorted = data.sort((a: Task, b: Task) => {
          // Tasks with due dates come first
          if (a.due_date && !b.due_date) return -1;
          if (!a.due_date && b.due_date) return 1;

          // Both have due dates - sort by due date
          if (a.due_date && b.due_date) {
            const dateCompare = a.due_date.localeCompare(b.due_date);
            if (dateCompare !== 0) return dateCompare;
          }

          // Same due date or both null - sort by created_at (newest first)
          return b.created_at.localeCompare(a.created_at);
        });

        // Take top 10
        setTasks(sorted.slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          fetchTasks();
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
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return { text: "Overdue", className: "text-red-500" };
    }
    if (isToday(date)) {
      return { text: "Due today", className: "text-orange-500" };
    }
    return { text: format(date, "MMM d"), className: "text-muted-foreground" };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your upcoming tasks</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks">
              View All
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No active tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => {
                const dueDateStatus = getDueDateStatus(task.due_date);

                return (
                  <TaskCompletionAnimation
                    key={task.id}
                    isCompleted={task.completed}
                    shouldAnimate={isAnimating(task.id)}
                    onAnimationComplete={() => handleAnimationComplete(task.id)}
                  >
                    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleToggleComplete(task.id, task.completed)}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 h-4 ${priorityColors[task.priority]}`}
                          >
                            {task.priority}
                          </Badge>
                          {task.category && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500"
                            >
                              {task.category}
                            </Badge>
                          )}
                          {dueDateStatus && (
                            <div className={`flex items-center gap-1 text-xs ${dueDateStatus.className}`}>
                              <Calendar className="h-3 w-3" />
                              <span>{dueDateStatus.text}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TaskCompletionAnimation>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
