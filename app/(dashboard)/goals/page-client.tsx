"use client";

import { useState, useMemo } from "react";
import { CreateGoalForm } from "@/components/widgets/goals/create-goal-form";
import { MobileGoalSheet } from "@/components/widgets/goals/mobile-goal-sheet";
import { MobileGoalsFilterSheet } from "@/components/widgets/goals/mobile-goals-filter-sheet";
import { GoalsFilter } from "@/components/widgets/goals/goals-filter";
import { GoalSpotlight } from "@/components/widgets/goals/goal-spotlight";
import { GoalEditorialCard } from "@/components/widgets/goals/goal-editorial-card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, Target, MoreHorizontal, Sparkles, CheckCircle2, ListFilter } from "lucide-react";
import type { Goal, GoalStatus, GoalPriority } from "@/lib/db/goals";
import { motion, AnimatePresence } from "framer-motion";

interface GoalsPageClientProps {
  initialGoals: (Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  })[];
}

export function GoalsPageClient({ initialGoals }: GoalsPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<GoalPriority | "all">("all");
  const [viewTab, setViewTab] = useState("goals");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filteredGoals = useMemo(() => {
    return initialGoals.filter((goal) => {
      // Status filter
      if (statusFilter !== "all" && goal.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== "all" && goal.priority !== priorityFilter) {
        return false;
      }

      // By default, hide archived and abandoned unless explicitly filtered
      if (statusFilter === "all" && (goal.status === "archived" || goal.status === "abandoned")) {
        return false;
      }

      return true;
    });
  }, [initialGoals, statusFilter, priorityFilter]);

  // Derived sections for the editorial layout
  const { spotlightGoal, activeGoals, completedGoals } = useMemo(() => {
    // Active includes in_progress, not_started, and on_hold
    const active = filteredGoals.filter(g => 
      ["in_progress", "not_started", "on_hold"].includes(g.status)
    );
    
    const completed = filteredGoals.filter(g => g.status === "completed")
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    // Find the goal with highest progress for spotlight among all active goals
    const spotlight = active.length > 0 
      ? [...active].sort((a, b) => b.progress - a.progress)[0] 
      : null;
    
    // Remaining active goals
    const remainingActive = active.filter(g => g.id !== spotlight?.id);

    return { spotlightGoal: spotlight, activeGoals: remainingActive, completedGoals: completed };
  }, [filteredGoals]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const handleMobileFilterApply = (status: GoalStatus | "all", priority: GoalPriority | "all") => {
    setStatusFilter(status);
    setPriorityFilter(priority);
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const active = initialGoals.filter(g => ["in_progress", "not_started", "on_hold"].includes(g.status)).length;
    const completed = initialGoals.filter(g => g.status === "completed").length;
    const total = initialGoals.filter(g => !["archived", "abandoned"].includes(g.status)).length;
    return { active, completed, total };
  }, [initialGoals]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-background transition-colors duration-500 font-lexend">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Cinematic Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-burnt-terracotta mb-3 block">
              Personal Vision
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 dark:text-white leading-tight mb-6">
              Goals
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md font-light italic leading-relaxed text-lg">
              "The future belongs to those who believe in the beauty of their dreams."
              <span className="block mt-4 text-[10px] not-italic font-bold uppercase tracking-widest text-[#7A9E8F]">
                {stats.active} active • {stats.completed} completed • {stats.total} total
              </span>
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <CreateGoalForm />
            
            {/* Mobile Filter Trigger */}
            <Button 
              variant="outline" 
              size="icon" 
              className="sm:hidden rounded-full h-12 w-12"
              onClick={() => setMobileFilterOpen(true)}
            >
              <ListFilter className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Filters (Desktop) */}
        <section className="mb-12 hidden sm:block">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex gap-8">
              <GoalsFilter
                status={statusFilter}
                priority={priorityFilter}
                onStatusChange={setStatusFilter}
                onPriorityChange={setPriorityFilter}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>
        </section>

        {/* Global Tabs (if needed, currently simplified) */}
        <div className="space-y-16">
          {/* Spotlight Section */}
          <AnimatePresence mode="wait">
            {spotlightGoal && (
              <motion.div
                key={spotlightGoal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              >
                <GoalSpotlight goal={spotlightGoal} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Aspirations Grid */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h4 className="text-3xl font-bold tracking-tighter">Active Aspirations</h4>
            </div>
            
            {activeGoals.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {activeGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <GoalEditorialCard goal={goal} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 bg-warm-cream/30 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <Target className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-400 font-light italic">No other active aspirations found.</p>
              </div>
            )}
          </section>

          {/* Recently Manifested List */}
          {completedGoals.length > 0 && (
            <section className="mb-20">
              <div className="flex items-center gap-6 mb-10">
                <h4 className="font-playfair text-3xl shrink-0">Recently Manifested</h4>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                {completedGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="flex items-center gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900/40 border border-transparent hover:border-evergreen/20 hover:bg-white dark:hover:bg-slate-900 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-evergreen/10 flex items-center justify-center text-evergreen group-hover:scale-110 transition-transform">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-evergreen transition-colors">
                        {goal.title}
                      </h6>
                      <p className="text-xs text-slate-400 italic">
                        Manifested on {new Date(goal.updated_at).toLocaleDateString()} • {goal.milestoneCount} milestones achieved
                      </p>
                    </div>
                    <div className="hidden sm:block text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 bg-background-light dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                      {goal.tags?.[0] || "Universal"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <MobileGoalSheet 
        open={mobileSheetOpen} 
        onOpenChange={setMobileSheetOpen} 
      />

      <MobileGoalsFilterSheet
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        currentStatus={statusFilter}
        currentPriority={priorityFilter}
        onApply={handleMobileFilterApply}
      />
      
      <footer className="px-8 py-20 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center">
        <div className="w-12 h-12 bg-evergreen/5 rounded-full flex items-center justify-center mb-6">
          <Target className="text-evergreen/40 h-6 w-6" />
        </div>
        <p className="text-xs text-slate-400 uppercase tracking-[0.4em] font-medium">Kinetic Forest Design System</p>
        <div className="mt-8 flex gap-8 text-[10px] uppercase font-bold tracking-widest text-slate-500">
          <a className="hover:text-evergreen transition-colors" href="#">Archives</a>
          <a className="hover:text-evergreen transition-colors" href="#">Reflections</a>
          <a className="hover:text-evergreen transition-colors" href="#">Vision</a>
        </div>
      </footer>
    </div>
  );
}
