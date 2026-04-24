"use client";

import { useState } from "react";
import { TaskTemplate } from "@/lib/db/task-templates";
import { TaskPriority } from "@/lib/db/tasks";
import { Plus, BookOpen, LayoutTemplate, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface TemplateRegistryProps {
  initialTemplates: TaskTemplate[];
  onChanged?: () => void;
}

export function TemplateRegistry({ initialTemplates, onChanged }: TemplateRegistryProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>(initialTemplates);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/task-templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !title.trim()) return;
    try {
      const response = await fetch("/api/task-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title, priority }),
      });
      if (response.ok) {
        setName("");
        setTitle("");
        setIsAdding(false);
        await fetchTemplates();
        onChanged?.();
        toast.success("Blueprint created");
      }
    } catch (error) {
      toast.error("Failed to create template");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    try {
      const response = await fetch(`/api/task-templates/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchTemplates();
        onChanged?.();
        toast.success("Template removed");
      }
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-media-primary">Task Templates</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="cursor-pointer flex items-center gap-2 bg-media-secondary text-media-on-secondary px-6 py-2 rounded-lg font-bold hover:brightness-110 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, i) => (
          <div 
            key={template.id} 
            className={`${i % 2 === 0 ? 'bg-media-primary-container text-media-on-primary' : 'bg-media-surface-container-low border border-transparent hover:border-media-outline-variant text-media-primary'} p-6 rounded-lg group hover:translate-y-[-4px] transition-all duration-300 h-full flex flex-col relative`}
          >
            <div className="flex justify-between items-start mb-8">
              {i % 2 === 0 ? (
                <BookOpen className="w-8 h-8 text-media-secondary-container" />
              ) : (
                <LayoutTemplate className="w-8 h-8 text-media-primary" />
              )}
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[10px] uppercase tracking-widest ${i % 2 === 0 ? 'opacity-60' : 'opacity-40'}`}>Pattern ID: #TP-{template.id.toString().padStart(2, '0')}</span>
                <button 
                  onClick={() => handleDelete(template.id)}
                  className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-media-error hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{template.name}</h3>
            <p className={`${i % 2 === 0 ? 'text-media-on-primary-container' : 'text-media-on-surface-variant'} text-sm leading-snug mb-6 flex-grow uppercase tracking-tight font-medium opacity-80`}>
              {template.title}
            </p>
            <div className="flex gap-2">
              <span className={`px-2 py-1 ${i % 2 === 0 ? 'bg-media-primary/30' : 'bg-media-surface-container-high text-media-on-surface-variant'} rounded text-[10px] uppercase font-bold tracking-wider`}>
                {template.priority} Priority
              </span>
              <span className={`px-2 py-1 ${i % 2 === 0 ? 'bg-media-primary/30' : 'bg-media-surface-container-high text-media-on-surface-variant'} rounded text-[10px] uppercase font-bold tracking-wider`}>
                {template.category || 'No Category'}
              </span>
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="bg-media-tertiary-container p-6 rounded-lg text-media-surface group flex flex-col animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="text-media-secondary font-bold text-xs uppercase tracking-widest">New Blueprint</span>
              <button onClick={() => setIsAdding(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4 flex-grow">
              <input 
                className="w-full bg-media-primary/20 border-none rounded p-2 text-white placeholder:text-white/40 font-bold"
                placeholder="Template Name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input 
                className="w-full bg-media-primary/20 border-none rounded p-2 text-white placeholder:text-white/40 text-sm"
                placeholder="Default Task Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <select 
                className="w-full bg-media-primary/20 border-none rounded p-2 text-white/80 text-xs font-bold uppercase tracking-widest"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="low" className="bg-media-tertiary-container">Low Priority</option>
                <option value="medium" className="bg-media-tertiary-container">Medium Priority</option>
                <option value="high" className="bg-media-tertiary-container">High Priority</option>
              </select>
            </div>
            <button 
              onClick={handleCreate}
              className="cursor-pointer mt-6 w-full py-2 bg-media-secondary text-media-on-secondary rounded font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all"
            >
              Initialize Template
            </button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-xl h-full min-h-[250px] flex items-center p-12 bg-media-tertiary-container group">
          <div className="relative z-10 max-w-sm">
            <span className="text-media-secondary font-bold text-xs uppercase tracking-widest mb-2 block">System Insight</span>
            <h4 className="text-media-surface text-2xl font-bold leading-tight">Templates reduce friction by <span className="text-media-secondary">42%</span> across the lifecycle.</h4>
          </div>
          <div 
            className="absolute right-0 top-0 w-full h-full bg-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9uKOBDVnoDu6iaRpPR1uBTvIxu5dU-thaoLrOhcZsKas5AC1sHaYyxVXF2J7xZoQLi-KkUbh_YfA1oLn7RK9sUuqHztE-uD3ztwlN8PzulcvvVMnF7jxTNDHs2vDNH1yJeYYLysuFA86xd9wydSgtCcaXSZqGFjUXL79uec3kRq0MGRuZBY4UMYkOEYTmGrG7O38gTPsjIuFk05e6Hv6UQMqnWwhpohdPWOINqpjux6kjZeM6fb003-H0EJFzbpDWfJIiATyFMJ8')" }}
          ></div>
        </div>
      </div>
    </section>
  );
}
