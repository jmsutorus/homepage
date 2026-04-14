"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseStats } from "@/components/widgets/exercise/exercise-stats";
import { ExerciseCharts } from "@/components/widgets/exercise/exercise-charts";
import { AddActivityModal } from "@/components/widgets/exercise/add-activity-modal";
import { UpcomingActivities } from "@/components/widgets/calendar/upcoming-activities";
import { CompletedActivities } from "@/components/widgets/exercise/completed-activities";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";

type ViewTab = "exercise" | "analytics";

import { WorkoutActivity, WorkoutActivityStats } from "@/lib/db/workout-activities";

interface ExercisePageClientProps {
  initialUpcomingActivities: WorkoutActivity[];
  initialRecentActivities: WorkoutActivity[];
  initialCompletedActivities: WorkoutActivity[];
  initialStats: WorkoutActivityStats;
}

export function ExercisePageClient({ 
  initialUpcomingActivities,
  initialRecentActivities,
  initialCompletedActivities,
  initialStats
}: ExercisePageClientProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewTab, setViewTab] = useState<ViewTab>("exercise");

  const handleActivityAdded = () => {
    setRefreshKey(prev => prev + 1);
    router.refresh();
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
          />

          {/* Completed Activities */}
          <CompletedActivities 
            initialActivities={initialCompletedActivities}
            onRefresh={refreshKey}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          {/* Exercise Stats and Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ExerciseStats 
              initialStats={initialStats}
            />
            <ExerciseCharts 
              initialActivities={initialCompletedActivities}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

