"use client";

import { useState } from "react";
import { ExerciseStats } from "@/components/widgets/exercise/exercise-stats";
import { ExerciseCharts } from "@/components/widgets/exercise/exercise-charts";
import { StravaSync } from "@/components/widgets/exercise/strava-sync";
import { AddActivityModal } from "@/components/widgets/exercise/add-activity-modal";
import { UpcomingActivities } from "@/components/widgets/calendar/upcoming-activities";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";

type ViewTab = "exercise" | "analytics";

import { WorkoutActivity } from "@/lib/db/workout-activities";

interface ExercisePageClientProps {
  athleteId?: number;
  lastSync?: string;
  initialUpcomingActivities: WorkoutActivity[];
  initialRecentActivities: WorkoutActivity[];
  initialStravaActivities: any[]; // Using any to avoid importing StravaActivity type from component
  initialStats: any; // Using any to avoid importing Stats type from component
}

export function ExercisePageClient({ 
  athleteId, 
  lastSync,
  initialUpcomingActivities,
  initialRecentActivities,
  initialStravaActivities,
  initialStats
}: ExercisePageClientProps) {
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
        <div className="hidden md:block">
          <AddActivityModal onActivityAdded={handleActivityAdded} showButton={true} />
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden">
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
          <UpcomingActivities 
            onRefresh={refreshKey} 
            initialActivities={initialUpcomingActivities}
            initialRecentActivities={initialRecentActivities}
            stravaActivities={initialStravaActivities}
          />

          {/* Strava Sync Widget */}
          <StravaSync athleteId={athleteId} lastSync={lastSync} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Exercise Stats and Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ExerciseStats 
              initialActivities={initialStravaActivities}
              initialStats={initialStats}
            />
            <ExerciseCharts 
              initialActivities={initialStravaActivities}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
