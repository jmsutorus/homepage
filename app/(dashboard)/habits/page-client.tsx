"use client";

import { useState, useEffect } from "react";
import type { HabitWithStats, HabitCompletionChartData } from "@/lib/actions/habits";
import { HabitsList } from "@/components/widgets/habits/habits-list";
import { CreateHabitForm } from "@/components/widgets/habits/create-habit-form";
import { MobileHabitSheet } from "@/components/widgets/habits/mobile-habit-sheet";
import { HabitCompletionChart } from "@/components/widgets/habits/habit-completion-chart";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import { HeartIcon, TrendingUp, Plus } from "lucide-react";

type ViewTab = "habits" | "analytics";

interface HabitsPageClientProps {
  habits: HabitWithStats[];
  chartData: HabitCompletionChartData[];
}

export function HabitsPageClient({ habits, chartData }: HabitsPageClientProps) {
  const [viewTab, setViewTab] = useState<ViewTab>("habits");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Simple mobile detection for action button logic
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your daily habits and track your consistency
          </p>
        </div>
        {/* Hide header button on mobile to avoid duplication with Tabs action */}
        <div className="hidden sm:block">
          <CreateHabitForm />
        </div>
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
        <PageTabsList
          tabs={[
            { value: "habits", label: "Habits", icon: HeartIcon, showLabel: false },
            { value: "analytics", label: "Analytics", icon: TrendingUp, showLabel: false },
          ]}
          actionButton={{
            label: "New Habit",
            onClick: () => {
              // If mobile, open sheet. If desktop, we have the header button, 
              // but if the user clicks this tab action on desktop (if visible), what should happen?
              // `PageTabsList` likely shows this button on mobile as a FAB or sticky header item.
              // We'll open the sheet for mobile-like interaction or maybe just trigger the dialog if we could?
              // Since `CreateHabitForm` isn't controlled, let's just default to Sheet for this specific button for now,
              // assuming this button is primarily for mobile context or secondary.
              // Better: On desktop, this button might be active? If so, opening a sheet is weird.
              // BUT, `MobileTaskSheet` in `tasks/page-client.tsx` is used for `PageTabsList` action.
              // So, consistency suggests `PageTabsList` action -> `MobileHabitSheet`.
              setMobileSheetOpen(true);
            },
            icon: Plus,
          }}
        />

        <TabsContent value="habits" className="space-y-6 sm:space-y-8 mt-6">
          <HabitsList habits={habits} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 sm:space-y-8 mt-6">
          <HabitCompletionChart data={chartData} />
        </TabsContent>
      </Tabs>

      <MobileHabitSheet 
        open={mobileSheetOpen} 
        onOpenChange={setMobileSheetOpen} 
      />
    </div>
  );
}
