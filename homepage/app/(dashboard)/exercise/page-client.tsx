"use client";

import { useState } from "react";
import { ExerciseStats } from "@/components/widgets/exercise-stats";
import { ExerciseCharts } from "@/components/widgets/exercise-charts";
import { StravaSync } from "@/components/widgets/strava-sync";
import { AddActivityModal } from "@/components/widgets/add-activity-modal";
import { UpcomingActivities } from "@/components/widgets/upcoming-activities";
import { ActivityCalendar } from "@/components/widgets/activity-calendar";

interface ExercisePageClientProps {
  athleteId?: number;
  lastSync?: string;
}

export function ExercisePageClient({ athleteId, lastSync }: ExercisePageClientProps) {
  const [refreshKey, setRefreshKey] = useState(0);

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

      {/* Upcoming Activities */}
      <UpcomingActivities onRefresh={refreshKey} />

      {/* Activity Calendar */}
      <ActivityCalendar onRefresh={refreshKey} />

      {/* Exercise Stats and Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ExerciseStats />
        <ExerciseCharts />
      </div>

      {/* Strava Sync Widget */}
      <StravaSync athleteId={athleteId} lastSync={lastSync} />
    </div>
  );
}
