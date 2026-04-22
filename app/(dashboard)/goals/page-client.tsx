"use client";

import { useState, useMemo, useEffect } from "react";
import { CreateGoalForm } from "@/components/widgets/goals/create-goal-form";
import { MobileGoalSheet } from "@/components/widgets/goals/mobile-goal-sheet";
import { MobileGoalsFilterSheet } from "@/components/widgets/goals/mobile-goals-filter-sheet";
import { GoalsFilter } from "@/components/widgets/goals/goals-filter";
import { GoalSpotlight } from "@/components/widgets/goals/goal-spotlight";
import { GoalEditorialCard } from "@/components/widgets/goals/goal-editorial-card";
import { Button } from "@/components/ui/button";
import { Plus, Target, Sparkles, ListFilter, ArrowRight } from "lucide-react";
import type { Goal, GoalStatus, GoalPriority } from "@/lib/db/goals";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

interface GoalsPageClientProps {
  initialGoals: (Goal & {
    progress: number;
    milestoneCount: number;
    milestonesCompleted: number;
  })[];
}

export function GoalsPageClient({ initialGoals }: GoalsPageClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<GoalPriority | "all">("all");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredGoals = useMemo(() => {
    return initialGoals.filter((goal) => {
      if (statusFilter !== "all" && goal.status !== statusFilter) return false;
      if (priorityFilter !== "all" && goal.priority !== priorityFilter) return false;
      if (statusFilter === "all" && (goal.status === "archived" || goal.status === "abandoned")) return false;
      return true;
    });
  }, [initialGoals, statusFilter, priorityFilter]);

  const { spotlightGoal, activeGoals, completedGoals } = useMemo(() => {
    const active = filteredGoals.filter(g => ["in_progress", "not_started", "on_hold"].includes(g.status));
    const completed = filteredGoals.filter(g => g.status === "completed")
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    const spotlight = active.length > 0 ? [...active].sort((a, b) => b.progress - a.progress)[0] : null;
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

  const stats = useMemo(() => {
    const active = initialGoals.filter(g => ["in_progress", "not_started", "on_hold"].includes(g.status)).length;
    const completed = initialGoals.filter(g => g.status === "completed").length;
    const total = initialGoals.filter(g => !["archived", "abandoned"].includes(g.status)).length;
    return { active, completed, total };
  }, [initialGoals]);

  return (
    <div className="min-h-screen bg-media-background text-media-on-background transition-colors duration-500 font-lexend pb-32">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Cinematic Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-media-secondary mb-4 block">
              Personal Vision
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-media-primary leading-tight mb-8">
              Strategic Intentions.
            </h1>
            <p className="text-media-on-surface-variant font-medium leading-relaxed text-lg max-w-xl">
              &quot;The future belongs to those who believe in the beauty of their dreams.&quot;
              <span className="block mt-6 text-[10px] not-italic font-black uppercase tracking-[0.2em] text-media-secondary/60">
                {stats.active} active aspirations • {stats.completed} manifested • {stats.total} total
              </span>
            </p>
          </motion.div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setMobileSheetOpen(true)}
              className="bg-media-secondary text-media-on-secondary px-8 py-6 rounded-2xl font-bold tracking-tight shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase hidden sm:flex items-center gap-3"
            >
              Establish New Vision <ArrowRight className="h-4 w-4" />
            </Button>
            
            {/* Mobile Filter Trigger */}
            <Button 
              variant="outline" 
              size="icon" 
              className="sm:hidden rounded-full h-14 w-14 bg-media-surface-container-low border-media-outline-variant/20"
              onClick={() => setMobileFilterOpen(true)}
            >
              <ListFilter className="h-6 w-6 text-media-primary" />
            </Button>
          </div>
        </header>

        {/* Filters (Desktop) */}
        <section className="mb-20 hidden sm:block">
          <div className="flex items-center justify-between pb-6 border-b border-media-outline-variant/10">
            <GoalsFilter
              status={statusFilter}
              priority={priorityFilter}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onClearFilters={handleClearFilters}
            />
          </div>
        </section>

        {/* Spotlight Section */}
        <div className="space-y-24">
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
          <section>
            <div className="flex items-center justify-between mb-12 border-b border-media-outline-variant/10 pb-6">
              <h4 className="text-3xl font-bold tracking-tighter text-media-primary">Active Aspirations</h4>
            </div>
            
            {activeGoals.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
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
              <div className="text-center py-24 bg-media-surface-container-low/30 rounded-3xl border-2 border-dashed border-media-outline-variant/10">
                <Target className="h-16 w-16 mx-auto text-media-on-surface-variant/20 mb-6" />
                <p className="text-media-on-surface-variant italic font-medium">No other active aspirations found in the current tactical view.</p>
              </div>
            )}
          </section>

          {/* Recently Manifested List */}
          {completedGoals.length > 0 && (
            <section>
              <div className="flex items-center gap-8 mb-12">
                <h4 className="text-3xl font-bold tracking-tighter text-media-primary shrink-0">Recently Manifested</h4>
                <div className="h-px flex-1 bg-gradient-to-r from-media-outline-variant/20 to-transparent"></div>
              </div>
              
              <div className="space-y-6">
                {completedGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => router.push(`/goals/${goal.slug}`)}
                    className="flex items-center gap-8 p-8 rounded-3xl bg-media-surface-container-low border border-transparent hover:border-media-secondary/20 hover:bg-media-surface-container-high transition-all group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-media-secondary/10 flex items-center justify-center text-media-secondary group-hover:scale-110 transition-transform shadow-sm">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-bold text-media-primary text-xl group-hover:text-media-secondary transition-colors">
                        {goal.title}
                      </h6>
                      <p className="text-sm text-media-on-surface-variant font-medium mt-1">
                        Manifested on {new Date(goal.updated_at).toLocaleDateString()} • {goal.milestoneCount} milestones achieved
                      </p>
                    </div>
                    <div className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 bg-media-surface-container border border-media-outline-variant/20 rounded-full shadow-sm text-media-secondary">
                      {goal.tags?.[0] || "Universal"}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setMobileSheetOpen(true)}
        tooltipText="New Goal"
      />

      {/* Forms & Dialogs */}
      <AnimatePresence>
        {isMobile ? (
          <MobileGoalSheet 
            open={mobileSheetOpen} 
            onOpenChange={setMobileSheetOpen} 
          />
        ) : (
          <CreateGoalForm 
            open={mobileSheetOpen} 
            onOpenChange={setMobileSheetOpen} 
          />
        )}
      </AnimatePresence>

      <MobileGoalsFilterSheet
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        currentStatus={statusFilter}
        currentPriority={priorityFilter}
        onApply={handleMobileFilterApply}
      />
      
      <footer className="px-8 py-24 border-t border-media-outline-variant/10 flex flex-col items-center">
        <div className="w-14 h-14 bg-media-secondary/5 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <Target className="text-media-secondary h-7 w-7" />
        </div>
        <p className="text-[10px] text-media-on-surface-variant uppercase tracking-[0.4em] font-black">Kinetic Forest Design System</p>
        <div className="mt-10 flex gap-10 text-[10px] uppercase font-black tracking-widest text-media-secondary/60">
          <button className="cursor-pointer hover:text-media-secondary transition-colors">Archives</button>
          <button className="cursor-pointer hover:text-media-secondary transition-colors">Reflections</button>
          <button className="cursor-pointer hover:text-media-secondary transition-colors">Vision</button>
        </div>
      </footer>
    </div>
  );
}
