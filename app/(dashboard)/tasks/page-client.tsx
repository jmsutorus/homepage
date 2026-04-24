"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskCategory, TaskStatusRecord, TaskVelocityData } from "@/lib/db/tasks";
import { TaskForm } from "@/components/widgets/tasks/task-form";
import { TaskList } from "@/components/widgets/tasks/task-list";
import { Settings } from "lucide-react";
import { MobileTaskSheet } from "@/components/widgets/tasks/mobile-task-sheet";
import Link from "next/link";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

interface TasksPageClientProps {
  initialTasks: Task[];
  initialVelocityData: TaskVelocityData;
}

export function TasksPageClient({ initialTasks, initialVelocityData }: TasksPageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [statuses, setStatuses] = useState<TaskStatusRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoriesAndStatuses = useCallback(async () => {
    try {
      const [categoriesRes, statusesRes] = await Promise.all([
        fetch("/api/task-categories"),
        fetch("/api/task-statuses"),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (statusesRes.ok) {
        const statusesData = await statusesRes.json();
        setStatuses(statusesData.custom || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories and statuses:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesAndStatuses();
  }, [fetchCategoriesAndStatuses]);

  const handleTasksChanged = () => {
    fetchTasks();
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Pick a featured task: highest priority or first in progress
  const featuredTask = activeTasks.find(t => t.priority === 'high') || activeTasks[0];

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-24 font-lexend">
      {/* Hero Section: Draft Your Next Action */}
      <section className="text-center">
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-media-on-surface mb-6">Draft Your Next Action.</h2>
          <p className="text-media-on-surface-variant text-lg leading-relaxed max-w-xl mx-auto">
            Every great project begins with a single, clearly defined entry in the journal. Define the scope, set the priority, and begin the flow.
          </p>
        </div>
        
        <div className="hidden md:block">
          <TaskForm onTaskAdded={handleTasksChanged} />
        </div>
      </section>

      {/* In Progress Section */}
      <section>
        <div className="flex items-baseline justify-between mb-10 border-b border-media-outline-variant/20 pb-4">
          <h3 className="text-3xl font-bold tracking-tighter text-media-on-surface">In Progress</h3>
          <span className="font-lexend text-xs uppercase tracking-[0.2em] text-media-secondary font-bold">
            {activeTasks.length} Ongoing {activeTasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-media-primary"></div>
          </div>
        ) : (
          <TaskList 
            tasks={activeTasks} 
            onTasksChanged={handleTasksChanged}
            featuredTaskId={featuredTask?.id}
          />
        )}
      </section>

      {/* Archived Flow Section */}
      <section className="pb-12">
        <div className="flex items-baseline gap-6 mb-10">
          <h3 className="text-3xl font-bold tracking-tighter text-media-on-surface opacity-30">Archived Flow</h3>
          <div className="h-px flex-1 bg-media-outline-variant/20"></div>
        </div>

        <TaskList 
          tasks={completedTasks.slice(0, 5)} 
          onTasksChanged={handleTasksChanged}
          variant="archived"
        />

        {completedTasks.length > 5 && (
          <div className="mt-16 text-center">
            <button className="cursor-pointer text-[10px] font-lexend uppercase tracking-[0.3em] text-media-on-surface-variant/40 hover:text-media-primary transition-all font-bold border border-media-outline-variant/20 px-8 py-4 rounded-full hover:bg-media-surface-container-low">
              View Entire Archive Library ({completedTasks.length})
            </button>
          </div>
        )}
      </section>

      {/* Management Registry Link */}
      <section className="pt-12 border-t border-media-outline-variant/10 text-center">
        <Link 
          href="/tasks/manage"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-media-on-surface-variant/60 hover:text-media-secondary transition-colors group"
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
          System Governance & Flow Registry
        </Link>
      </section>

      {/* Floating Action Button: New Task */}
      <FloatingActionButton 
        onClick={() => setMobileSheetOpen(true)}
        tooltipText="New Task"
        className="md:hidden"
      />

      {/* Mobile Task Sheet */}
      <MobileTaskSheet
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
        onTaskAdded={handleTasksChanged}
      />
    </main>
  );
}
