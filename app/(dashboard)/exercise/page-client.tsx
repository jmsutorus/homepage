"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseStats } from "@/components/widgets/exercise/exercise-stats";
import { ExerciseCharts } from "@/components/widgets/exercise/exercise-charts";
import { AddActivityModal } from "@/components/widgets/exercise/add-activity-modal";
import { UpcomingActivities } from "@/components/widgets/calendar/upcoming-activities";
import { CompletedActivities } from "@/components/widgets/exercise/completed-activities";
import { ExerciseSettingsModal } from "@/components/widgets/exercise/exercise-settings-modal";
import { PersonalRecordsCard } from "@/components/widgets/exercise/personal-records-card";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";

type ViewTab = "exercise" | "analytics";

import { WorkoutActivity, WorkoutActivityStats } from "@/lib/db/workout-activities";
import { ExerciseSettings, PersonalRecord } from "@/lib/db/personal-records";

interface ExercisePageClientProps {
  initialUpcomingActivities: WorkoutActivity[];
  initialRecentActivities: WorkoutActivity[];
  initialCompletedActivities: WorkoutActivity[];
  initialStats: WorkoutActivityStats;
  initialSettings: ExerciseSettings;
  initialRecords: PersonalRecord[];
}

export function ExercisePageClient({ 
  initialUpcomingActivities,
  initialRecentActivities,
  initialCompletedActivities,
  initialStats,
  initialSettings,
  initialRecords
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
        <div className="hidden md:flex gap-2 items-center">
          <ExerciseSettingsModal 
            initialRunningEnabled={initialSettings.enable_running_prs}
            initialWeightsEnabled={initialSettings.enable_weights_prs}
          />
          <AddActivityModal onActivityAdded={handleActivityAdded} showButton={true} />
        </div>
      </div>

      {/* Mobile FAB and Actions */}
      <div className="md:hidden">
          <div className="flex justify-end gap-2 mb-4">
            <ExerciseSettingsModal 
              initialRunningEnabled={initialSettings.enable_running_prs}
              initialWeightsEnabled={initialSettings.enable_weights_prs}
            />
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

          {/* Personal Records */}
          <PersonalRecordsCard 
            initialRecords={initialRecords}
            enableRunning={initialSettings.enable_running_prs}
            enableWeights={initialSettings.enable_weights_prs}
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

