"use client";

import { useState, useMemo, useEffect } from "react";
import type { HabitWithStats } from "@/lib/actions/habits";
import { HabitEditorialCard } from "@/components/widgets/habits/habit-editorial-card";
import { CreateHabitForm } from "@/components/widgets/habits/create-habit-form";
import { MobileHabitSheet } from "@/components/widgets/habits/mobile-habit-sheet";
import { Plus } from "lucide-react";
import { subDays, isWithinInterval, startOfDay } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

interface HabitsPageClientProps {
  habits: HabitWithStats[];
}

export function HabitsPageClient({ habits }: HabitsPageClientProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const weeklyVelocity = useMemo(() => {
    if (habits.length === 0) return 0;
    
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 6); // Last 7 days including today
    
    let totalCompletions = 0;
    habits.forEach(habit => {
      const completionsInRange = habit.completionDates.filter(dateStr => {
        const date = startOfDay(new Date(dateStr));
        return isWithinInterval(date, { start: sevenDaysAgo, end: today });
      });
      totalCompletions += completionsInRange.length;
    });

    const maxPossibleCompletions = habits.length * 7;
    return Math.round((totalCompletions / maxPossibleCompletions) * 100);
  }, [habits]);

  const activeHabits = habits.filter(h => h.active);

  return (
    <main className="pt-24 pb-32 px-6 max-w-4xl mx-auto min-h-screen">
      {/* Hero Section */}
      <section className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
        <div className="max-w-xl">
          <span className="text-media-secondary font-lexend text-sm uppercase tracking-[0.2em] font-semibold mb-4 block">
            The Daily Discipline
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-media-primary tracking-tighter leading-none mb-6 font-lexend">
            The Habitual Rhythm
          </h1>
          <p className="text-media-on-surface-variant text-lg leading-relaxed font-lexend">
            Curating consistency through intentional action. Track your journey toward mastery, one pulse at a time.
          </p>
        </div>
        
        {/* Weekly Velocity Widget */}
        <div className="w-full md:w-48 h-32 bg-media-surface-container-high rounded-xl overflow-hidden relative shrink-0 editorial-shadow">
          <img 
            alt="Abstract texture" 
            className="w-full h-full object-cover grayscale opacity-40 mix-blend-multiply" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKUt4EzyyB4zmS8nqp8ETn1gYs0qkeBu6TNAha8Jzje8k1THbIPQW2Wj4SvvtH79Z7D7JNcrfH6VBxpflSAGS6x16ne8pSE2_Dml6aO0TRgc0g_Rb-UbCxW1HKKbj6NM1awuEvDH7lcL83VgAd33jbP6OE1jwaf20BG7SLJTeIm-etYIh8BANWyKuAhTnxUXd-YYmn300FFvIi-qOH0_yhwefm1D2D6HxcngvucDnF-LHJxG4ljMU2oBdjqadO8pv5Z6JTypp2DgM" 
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <span className="block text-3xl font-bold text-media-primary font-lexend">{weeklyVelocity}%</span>
              <span className="text-[8px] uppercase tracking-widest text-media-on-surface-variant font-bold font-lexend">
                Weekly Velocity
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Habit List */}
      <div className="space-y-16 pb-24">
        {activeHabits.length > 0 ? (
          activeHabits.map((habit) => (
            <HabitEditorialCard key={habit.id} habit={habit} />
          ))
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-media-surface-container rounded-3xl">
            <p className="text-media-on-surface-variant italic font-lexend">No active rhythms found. Start a new discipline.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setCreateDialogOpen(true)}
        tooltipText="New Habit"
      />

      {/* Forms & Dialogs */}
      <AnimatePresence>
        {isMobile ? (
          <MobileHabitSheet 
            open={createDialogOpen} 
            onOpenChange={setCreateDialogOpen} 
          />
        ) : (
          <CreateHabitForm 
            open={createDialogOpen} 
            onOpenChange={setCreateDialogOpen} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}
