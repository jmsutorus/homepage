"use client";

import { useState } from "react";
import type { HabitWithStats, HabitCompletionChartData } from "@/lib/actions/habits";
import { HabitsList } from "@/components/widgets/habits/habits-list";
import { CreateHabitForm } from "@/components/widgets/habits/create-habit-form";
import { HabitCompletionChart } from "@/components/widgets/habits/habit-completion-chart";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";

type ViewTab = "habits" | "analytics";

interface HabitsPageClientProps {
  habits: HabitWithStats[];
  chartData: HabitCompletionChartData[];
}

export function HabitsPageClient({ habits, chartData }: HabitsPageClientProps) {
  const [viewTab, setViewTab] = useState<ViewTab>("habits");

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your daily habits and track your consistency
          </p>
        </div>
        <CreateHabitForm />
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
        <PageTabsList
          tabs={[
            { value: "habits", label: "Habits" },
            { value: "analytics", label: "Analytics" },
          ]}
        />

        <TabsContent value="habits" className="space-y-6 sm:space-y-8 mt-6">
          <HabitsList habits={habits} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 sm:space-y-8 mt-6">
          <HabitCompletionChart data={chartData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
