"use client";

import { useState, useEffect } from "react";
import { CheckSquare, X, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from "@/lib/utils";
import type { Task } from "@/lib/db/tasks";
import { AnimatePresence } from "framer-motion";
import { TaskCompletionAnimation, useTaskCompletionAnimation } from "@/components/ui/animations/task-completion-animation";

interface DailyTasksProps {
  overdue: Task[];
  upcoming: Task[];
  completed: Task[];
  onToggleComplete?: (taskId: number, completed: boolean) => void;
}

export function DailyTasks({ overdue, upcoming, completed, onToggleComplete }: DailyTasksProps) {
  const [localOverdue, setLocalOverdue] = useState(overdue);
  const [localUpcoming, setLocalUpcoming] = useState(upcoming);
  const [localCompleted, setLocalCompleted] = useState(completed);
  const totalTasks = localOverdue.length + localUpcoming.length + localCompleted.length;
  const { startAnimation, cleanupTask, isAnimating } = useTaskCompletionAnimation();

  // Update local state when props change
  useEffect(() => {
    setLocalOverdue(overdue);
  }, [overdue]);

  useEffect(() => {
    setLocalUpcoming(upcoming);
  }, [upcoming]);

  useEffect(() => {
    setLocalCompleted(completed);
  }, [completed]);

  const handleToggle = (taskId: number, completed: boolean) => {
    // If marking as complete, start animation first
    if (!completed) {
      startAnimation(taskId);
      // Delay the callback to allow animation to start
      setTimeout(() => {
        onToggleComplete?.(taskId, completed);
      }, 50);
    } else {
      // If marking incomplete, no animation needed
      onToggleComplete?.(taskId, completed);
    }
  };

  const handleAnimationComplete = (taskId: number) => {
    cleanupTask(taskId);
    // Remove task from local state without refetching
    setLocalOverdue(prev => prev.filter(task => task.id !== taskId));
    setLocalUpcoming(prev => prev.filter(task => task.id !== taskId));
    setLocalCompleted(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <CheckSquare className="h-4 w-4" />
        Tasks ({totalTasks})
      </h3>

      {/* Overdue Tasks */}
      {localOverdue.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
            <X className="h-3 w-3" />
            Overdue ({localOverdue.length})
          </h4>
          <AnimatePresence mode="popLayout">
            {localOverdue.map((task) => (
              <TaskCompletionAnimation
                key={task.id}
                isCompleted={task.completed}
                shouldAnimate={isAnimating(task.id)}
                onAnimationComplete={() => handleAnimationComplete(task.id)}
              >
                <div className="pl-6 border-l-2 border-red-500 flex items-start gap-2">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggle(task.id, task.completed)}
                    className="cursor-pointer mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-red-700 dark:text-red-400">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDateSafe(task.due_date)}
                        </p>
                      )}
                      {task.category && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TaskCompletionAnimation>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upcoming Tasks */}
      {localUpcoming.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Upcoming ({localUpcoming.length})
          </h4>
          <AnimatePresence mode="popLayout">
            {localUpcoming.map((task) => (
              <TaskCompletionAnimation
                key={task.id}
                isCompleted={task.completed}
                shouldAnimate={isAnimating(task.id)}
                onAnimationComplete={() => handleAnimationComplete(task.id)}
              >
                <div className="pl-6 border-l-2 border-yellow-500 flex items-start gap-2">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggle(task.id, task.completed)}
                    className="cursor-pointer mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">

                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDateSafe(task.due_date)}
                        </p>
                      )}
                      {task.category && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TaskCompletionAnimation>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed Tasks */}
      {localCompleted.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            Completed ({localCompleted.length})
          </h4>
          {localCompleted.map((task) => (
            <div key={task.id} className="pl-6 border-l-2 border-green-500 flex items-start gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggle(task.id, task.completed)}
                className="cursor-pointer mt-0.5"
              />
              <div className="flex-1">
                <p className="text-sm text-green-700 dark:text-green-400 line-through">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">

                  {task.completed_date && (
                    <p className="text-xs text-muted-foreground">
                      Completed: {formatDateSafe(task.completed_date)}
                    </p>
                  )}
                  {task.category && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500">
                      {task.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
