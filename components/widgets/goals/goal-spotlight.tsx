"use client";

import { Goal } from "@/lib/db/goals";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, Milestone, History, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface GoalSpotlightProps {
  goal: Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  };
}

export function GoalSpotlight({ goal }: GoalSpotlightProps) {
  // Use a themed placeholder if no image is available
  const displayImage = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop";

  return (
    <Link href={`/goals/${goal.slug}`}>
      <section className="mb-16 group cursor-pointer">
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 editorial-shadow border border-slate-200 dark:border-slate-800 transition-all duration-500 hover:shadow-2xl hover:border-emerald-500/20">
          <div className="grid md:grid-cols-2">
            <div className="p-10 lg:p-14 z-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-burnt-terracotta/10 text-burnt-terracotta text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Next Milestone
                </span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  • {Math.round(goal.progress)}% Complete
                </span>
              </div>
              
              <h3 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-evergreen transition-colors transition-duration-300">
                {goal.title}
              </h3>
              
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed line-clamp-2 italic font-light text-lg">
                {goal.description || "Pursuing this vision with intention and clarity."}
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold uppercase tracking-widest text-[#7A9E8F]/60 text-xs">Current Progress</span>
                  <span className="text-evergreen font-bold tracking-tighter text-2xl">
                    {Math.round(goal.progress)}%
                  </span>
                </div>
                
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      goal.status === "on_hold" ? "bg-amber-500" : "bg-evergreen"
                    )}
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                
                {goal.milestoneCount > 0 && (
                  <div className="flex items-center gap-4 text-xs text-slate-400 italic bg-warm-cream/30 dark:bg-slate-800/30 p-4 rounded-xl border-l-2 border-burnt-terracotta">
                    <History className="text-burnt-terracotta h-4 w-4 shrink-0" />
                    <span className="font-medium">
                      {goal.status === 'not_started' ? "Laying the foundation..." : `${goal.milestonesCompleted} of ${goal.milestoneCount} milestones achieved.`} Keep moving forward.
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="relative h-64 md:h-auto min-h-[400px] overflow-hidden">
              <Image
                src={displayImage}
                alt={goal.title}
                fill
                className="object-cover brightness-95 dark:brightness-75 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-slate-900 via-transparent to-transparent md:block hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-slate-900/40 md:hidden block"></div>
            </div>
          </div>
        </div>
      </section>
    </Link>
  );
}
