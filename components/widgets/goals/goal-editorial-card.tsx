"use client";

import { Goal } from "@/lib/db/goals";
import { LucideIcon, Target, Edit3, Heart, Footprints, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GoalEditorialCardProps {
  goal: Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  };
}

const categoryIcons: Record<string, LucideIcon> = {
  Wellness: Heart,
  Creative: Sparkles,
  Career: Target,
  Adventure: Footprints,
  Connection: Flame,
};

export function GoalEditorialCard({ goal }: GoalEditorialCardProps) {
  const category = goal.tags?.[0] || "General";
  const Icon = categoryIcons[category] || Target;
  
  // Progress calculations for SVG
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (goal.progress / 100) * circumference;

  return (
    <Link href={`/goals/${goal.slug}`}>
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 editorial-shadow hover:translate-y-[-4px] transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="relative">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                className="text-slate-100 dark:text-slate-800"
                cx="32"
                cy="32"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                className={cn(
                  "transition-all duration-1000 ease-out",
                  goal.progress >= 75 ? "text-evergreen" : "text-burnt-terracotta"
                )}
                cx="32"
                cy="32"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className={cn(
              "absolute inset-0 flex items-center justify-center text-[10px] font-bold",
              goal.status === "on_hold" ? "text-amber-500" : goal.progress >= 75 ? "text-evergreen" : "text-burnt-terracotta"
            )}>
              {Math.round(goal.progress)}%
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-full">
            {goal.status === 'not_started' ? 'Pending' : goal.status === 'on_hold' ? 'Paused' : category}
          </span>
        </div>

        <h5 className="text-xl font-bold tracking-tight mb-3 group-hover:text-evergreen transition-colors leading-tight">
          {goal.title}
        </h5>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed line-clamp-3">
          {goal.description || "Striving towards this meaningful aspiration."}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <div className="p-4 bg-warm-cream/20 dark:bg-slate-800/30 rounded-xl">
            <p className="text-[11px] italic text-slate-400 flex items-center gap-2">
              <Edit3 className="h-3 w-3" />
              <span>
                {goal.milestoneCount > 0 
                  ? `${goal.milestonesCompleted} of ${goal.milestoneCount} milestones complete`
                  : "Drafting the next chapter..."}
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
