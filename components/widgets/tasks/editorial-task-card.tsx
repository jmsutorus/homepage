"use client";

import { format, formatDistanceToNow } from "date-fns";
import { ExternalLink, History, Check, Paperclip, Trash2 } from "lucide-react";

interface EditorialTaskCardProps {
  task: Task;
  variant?: "featured" | "standard" | "archived";
  onToggleComplete?: (task: Task) => void;
  onOpenDetails?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const priorityLabels = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
};

export function EditorialTaskCard({ 
  task, 
  variant = "standard", 
  onToggleComplete, 
  onOpenDetails 
}: EditorialTaskCardProps) {
  
  if (variant === "archived") {
    const completedDate = task.completed_date ? new Date(task.completed_date.replaceAll("-", "/")) : null;
    const completedText = completedDate 
      ? `Completed by You • ${formatDistanceToNow(completedDate, { addSuffix: true })}`
      : "Archived Flow";

    return (
      <div className="group flex items-center justify-between p-6 hover:bg-media-surface-container-low/40 rounded-xl transition-all border border-transparent hover:border-media-outline-variant/10">
        <div className="flex items-center gap-6">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(task);
            }}
            className="cursor-pointer w-8 h-8 border-2 border-media-secondary/30 rounded-lg flex items-center justify-center bg-media-secondary/10 hover:bg-media-secondary/20 transition-colors shrink-0"
          >
            <Check className="w-5 h-5 text-media-secondary stroke-[3]" />
          </button>
          <div className="min-w-0">
            <h5 className="text-xl font-bold tracking-tight text-media-primary/40 line-through decoration-media-primary/20 truncate">
              {task.title}
            </h5>
            <p className="text-[10px] font-lexend uppercase tracking-widest text-media-on-surface-variant/50 mt-1">
              {completedText}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.category && (
            <span className="text-[10px] font-lexend uppercase tracking-widest px-3 py-1 bg-media-surface-container text-media-on-surface-variant rounded-full whitespace-nowrap">
              {task.category}
            </span>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(task);
            }}
            className="cursor-pointer text-media-on-surface-variant hover:text-media-primary transition-colors"
            title="Revive Task"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className="group relative overflow-hidden rounded-2xl bg-media-primary-container min-h-[320px] flex flex-col justify-end p-8 kinetic-hover cursor-pointer shadow-lg shadow-media-primary-container/10" onClick={() => onOpenDetails?.(task)}>
        <div className="absolute inset-0 z-0">
          <img 
            alt="Atmospheric Background" 
            className="w-full h-full object-cover opacity-30" 
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-media-primary-container via-media-primary-container/60 to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-6">
          <span className="inline-block bg-media-tertiary-fixed text-media-on-tertiary-fixed text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded">
            {priorityLabels[task.priority]}
          </span>
          <h4 className="text-4xl md:text-5xl font-bold tracking-tighter text-media-on-primary leading-[1.1]">
            {task.title}
          </h4>
          <div className="flex items-center gap-6">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-media-secondary rounded-full transition-all duration-1000" 
                style={{ width: task.status === 'in_progress' ? '65%' : '20%' }}
              ></div>
            </div>
            <span className="text-[10px] font-lexend font-bold text-media-on-primary uppercase tracking-[0.2em] whitespace-nowrap">
              {task.status === 'in_progress' ? '65% Progress' : 'In Flow'}
            </span>
          </div>
        </div>

        {/* Action Icons for Featured Card */}
        <div className="absolute top-8 right-8 flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
           <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(task);
            }}
            className="cursor-pointer w-10 h-10 bg-media-secondary/20 hover:bg-media-secondary/40 text-media-secondary rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            title="Mark Complete"
          >
            <Check className="w-5 h-5 stroke-[3]" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(task);
            }}
            className="cursor-pointer w-10 h-10 bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            title="Delete Task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-media-surface-container-low p-8 rounded-2xl border border-media-outline-variant/10 kinetic-hover flex flex-col md:flex-row gap-8 cursor-pointer" onClick={() => onOpenDetails?.(task)}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
            task.priority === 'high' ? 'bg-media-secondary/10 text-media-secondary' : 
            task.priority === 'medium' ? 'bg-media-tertiary-fixed-dim/20 text-media-on-tertiary-fixed-variant' :
            'bg-media-primary-fixed-dim/20 text-media-on-primary-fixed-variant'
          }`}>
            {priorityLabels[task.priority]}
          </span>
          {task.due_date && (
            <span className="text-[10px] font-lexend uppercase tracking-widest text-media-on-surface-variant/60">
              • {format(new Date(task.due_date.replaceAll("-", "/")), "MMM d")}
            </span>
          )}
        </div>
        <h4 className="text-2xl md:text-3xl font-bold tracking-tight text-media-primary mb-3">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-media-on-surface-variant leading-relaxed mb-6 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>
      <div className="flex md:flex-col justify-between md:items-end border-t md:border-t-0 md:border-l border-media-outline-variant/10 pt-6 md:pt-0 md:pl-8 shrink-0">
        <div className="flex items-center gap-4">
          {task.category && (
            <div className="flex items-center gap-2 text-media-on-surface-variant">
              <Paperclip className="w-3.5 h-3.5" />
              <span className="text-[10px] font-lexend uppercase tracking-widest">
                {task.category}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete?.(task);
            }}
            className="text-media-on-surface-variant/40 hover:text-media-secondary transition-all duration-300 hover:scale-110 cursor-pointer"
            title="Mark Complete"
          >
            <Check className="w-6 h-6 stroke-[3]" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(task);
            }}
            className="text-media-on-surface-variant/40 hover:text-red-500 transition-all duration-300 hover:scale-110 cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
