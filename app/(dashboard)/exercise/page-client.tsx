"use client";

import { useState } from "react";
import { ExerciseStats } from "@/components/widgets/exercise/exercise-stats";
import { ExerciseCharts } from "@/components/widgets/exercise/exercise-charts";
import { StravaSync } from "@/components/widgets/exercise/strava-sync";
import { AddActivityModal } from "@/components/widgets/exercise/add-activity-modal";
import { UpcomingActivities } from "@/components/widgets/calendar/upcoming-activities";
import { ActivityCalendar } from "@/components/widgets/calendar/activity-calendar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";

type ViewTab = "exercise" | "analytics";

interface ExercisePageClientProps {
  athleteId?: number;
  lastSync?: string;
}

export function ExercisePageClient({ athleteId, lastSync }: ExercisePageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewTab, setViewTab] = useState<ViewTab>("exercise");

  const handleActivityAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exercise Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your running progress and schedule workouts
          </p>
        </div>
        <AddActivityModal onActivityAdded={handleActivityAdded} showButton={true} />
      </div>

      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
        <PageTabsList
          tabs={[
            { value: "exercise", label: "Exercise" },
            { value: "analytics", label: "Analytics" },
          ]}
        />

        <TabsContent value="exercise" className="space-y-6 mt-6">
          {/* Upcoming Activities */}
          <UpcomingActivities onRefresh={refreshKey} />

          {/* Activity Calendar */}
          <ActivityCalendar onRefresh={refreshKey} />

          {/* Strava Sync Widget */}
          <StravaSync athleteId={athleteId} lastSync={lastSync} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Exercise Stats and Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ExerciseStats />
            <ExerciseCharts />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
