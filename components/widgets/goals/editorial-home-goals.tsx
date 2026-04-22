"use client";

import { GoalWithProgress } from "@/lib/db/goals";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EditorialHomeGoalsProps {
  goals: GoalWithProgress[];
}

export function EditorialHomeGoals({ goals }: EditorialHomeGoalsProps) {
  return (
    <div className="bg-media-surface-container-low rounded-2xl p-8 border border-media-outline-variant/30 flex flex-col h-full">
      <h2 className="text-2xl font-bold font-headline tracking-tighter text-media-primary mb-8">Seasonal Aspirations</h2>
      
      {goals.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-media-on-surface-variant">
          No active goals.
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {goals.map((goal) => {
            return (
              <Link key={goal.id} href={`/goals/${goal.id}`} className="group block">
                <p className="text-[10px] text-media-secondary font-bold tracking-widest uppercase mb-1">
                  {goal.category || "General"}
                </p>
                <h5 className="text-base font-bold text-media-primary mb-1 group-hover:text-media-secondary transition-colors line-clamp-1">{goal.title}</h5>
                <p className="text-xs text-media-on-surface-variant mb-3 line-clamp-2">{goal.description || "Pursuing continuous progress."}</p>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-1 bg-media-surface-container-highest rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-media-primary transition-all duration-1000 ease-in-out group-hover:bg-media-secondary" 
                      style={{ width: `${goal.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-media-on-surface">
                    {Math.round(goal.progress || 0)}%
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
