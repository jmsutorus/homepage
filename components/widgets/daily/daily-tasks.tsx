"use client";

import { CheckSquare, X, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from "@/lib/utils";
import type { Task } from "@/lib/db/tasks";

interface DailyTasksProps {
  overdue: Task[];
  upcoming: Task[];
  completed: Task[];
  onToggleComplete?: (taskId: number, completed: boolean) => void;
}

export function DailyTasks({ overdue, upcoming, completed, onToggleComplete }: DailyTasksProps) {
  const totalTasks = overdue.length + upcoming.length + completed.length;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <CheckSquare className="h-4 w-4" />
        Tasks ({totalTasks})
      </h3>

      {/* Overdue Tasks */}
      {overdue.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
            <X className="h-3 w-3" />
            Overdue ({overdue.length})
          </h4>
          {overdue.map((task) => (
            <div key={task.id} className="pl-6 border-l-2 border-red-500 flex items-start gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete?.(task.id, task.completed)}
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
          ))}
        </div>
      )}

      {/* Upcoming Tasks */}
      {upcoming.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Upcoming ({upcoming.length})
          </h4>
          {upcoming.map((task) => (
            <div key={task.id} className="pl-6 border-l-2 border-yellow-500 flex items-start gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete?.(task.id, task.completed)}
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
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            Completed ({completed.length})
          </h4>
          {completed.map((task) => (
            <div key={task.id} className="pl-6 border-l-2 border-green-500 flex items-start gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete?.(task.id, task.completed)}
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
