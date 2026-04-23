"use client";

import { useState } from "react";
import type { Task, TaskCategory, TaskStatusRecord } from "@/lib/db/tasks";
import type { TaskTemplate } from "@/lib/db/task-templates";
import { CategoryRegistry } from "@/components/widgets/tasks/registry/category-registry";
import { StatusRegistry } from "@/components/widgets/tasks/registry/status-registry";
import { TemplateRegistry } from "@/components/widgets/tasks/registry/template-registry";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";

interface ManageClientProps {
  initialTasks: Task[];
  initialCategories: TaskCategory[];
  initialStatuses: TaskStatusRecord[];
  initialTemplates: TaskTemplate[];
}

export function ManageClient({
  initialTasks,
  initialCategories,
  initialStatuses,
  initialTemplates,
}: ManageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleDataChanged = async () => {
    // Refresh tasks if needed for counts, but usually categories/statuses changes 
    // don't immediately change tasks in this view unless we re-fetch everything.
    // For simplicity, we just keep the initial tasks or re-fetch if really needed.
    const res = await fetch("/api/tasks");
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  };

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-16 font-lexend">
      {/* Header / Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <Link 
            href="/tasks" 
            className="flex items-center gap-2 text-media-secondary font-bold text-xs uppercase tracking-widest mb-6 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Tasks
          </Link>
          <h1 className="text-5xl md:text-6xl font-extrabold text-media-primary tracking-tighter mb-4 max-w-2xl leading-[0.9]">
            System <span className="text-media-secondary italic">Governance</span> & Flow.
          </h1>
          <p className="text-media-on-surface-variant max-w-lg text-lg leading-relaxed">
            Orchestrate your workflow taxonomy and task patterns. Define the architecture that powers your daily publication.
          </p>
        </div>
      </div>

      {/* Registry Grid */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <CategoryRegistry 
            initialCategories={initialCategories} 
            tasks={tasks} 
            onChanged={handleDataChanged}
          />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <StatusRegistry 
            initialStatuses={initialStatuses} 
            onChanged={handleDataChanged}
          />
        </div>
      </div>

      {/* Template Section */}
      <TemplateRegistry 
        initialTemplates={initialTemplates} 
        onChanged={handleDataChanged}
      />

      {/* Floating Action Button (Prototype style) */}
      <Link 
        href="/tasks"
        className="fixed bottom-12 right-12 w-16 h-16 bg-media-secondary text-media-on-secondary rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 shadow-media-secondary/40"
      >
        <Edit3 className="w-8 h-8" />
      </Link>
    </div>
  );
}
