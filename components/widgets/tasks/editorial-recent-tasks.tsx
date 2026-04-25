"use client";

import { useState, useEffect } from "react";
import { Task } from "@/lib/db/tasks";
import Link from "next/link";
import { useHaptic } from "@/hooks/use-haptic";

export function EditorialRecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const haptic = useHaptic();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tasks?completed=false");
      if (response.ok) {
        const data = await response.json();
        const sorted = data.sort((a: Task, b: Task) => {
          if (a.due_date && !b.due_date) return -1;
          if (!a.due_date && b.due_date) return 1;
          if (a.due_date && b.due_date) {
            const dateCompare = a.due_date.localeCompare(b.due_date);
            if (dateCompare !== 0) return dateCompare;
          }
          return b.created_at.localeCompare(a.created_at);
        });
        setTasks(sorted.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    if (!completed) {
      haptic.trigger("success");
      // Optimistically remove from list for snappy feel
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } else {
      haptic.trigger("medium");
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      
      if (!response.ok) {
        // Revert on error
        fetchTasks();
      } else {
        if (completed) {
          // If we uncompleted it, we need to refresh the list (though it's usually already filtered)
          fetchTasks();
        }
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      fetchTasks();
    }
  };

  return (
    <div className="lg:col-span-4 flex flex-col gap-4">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold">Today&apos;s Vitals</h4>
      <div className="bg-media-primary-container text-white rounded-xl p-6 h-full min-h-[200px] flex flex-col shadow-lg">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-white/20 rounded w-full" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-2">
            <span className="material-symbols-outlined text-4xl opacity-50 mb-2">task_alt</span>
            <p className="text-sm">No active tasks</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {tasks.map((task) => (
              <label key={task.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task.id, task.completed)}
                  className="rounded border-white/30 bg-transparent text-media-secondary focus:ring-offset-0 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className={`text-sm font-medium transition-colors ${task.completed ? 'line-through opacity-50' : 'group-hover:text-media-primary-fixed-dim'}`}>
                  {task.title}
                </span>
              </label>
            ))}
          </div>
        )}
        <Link href="/tasks" className="mt-auto pt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-media-secondary-fixed-dim hover:text-white transition-colors group">
          <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">add_task</span> View All Tasks
        </Link>
      </div>
    </div>
  );
}
