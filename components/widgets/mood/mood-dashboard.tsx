"use client";

import { useState } from "react";
import { MoodEntry } from "@/lib/db/mood";
import { MoodHeatmap } from "./mood-heatmap";
import { MoodTrendsChart } from "./mood-trends-chart";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";

type ViewTab = "mood" | "analytics";

interface MoodDashboardProps {
  initialMoodData: MoodEntry[];
  year: number;
}

export function MoodDashboard({ initialMoodData, year }: MoodDashboardProps) {
  const [moodData, setMoodData] = useState<MoodEntry[]>(initialMoodData);
  const [viewTab, setViewTab] = useState<ViewTab>("mood");

  const handleMoodChange = async () => {
    // Refresh data
    try {
      const response = await fetch(`/api/mood?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setMoodData(data);
      }
    } catch (error) {
      console.error("Failed to refresh mood data:", error);
    }
  };

  return (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
      <PageTabsList
        tabs={[
          { value: "mood", label: "Mood" },
          { value: "analytics", label: "Analytics" },
        ]}
      />

      <TabsContent value="mood" className="space-y-6 mt-6">
        <MoodHeatmap
          year={year}
          data={moodData}
          onMoodChange={handleMoodChange}
        />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6 mt-6">
        <MoodTrendsChart
          data={moodData}
          year={year}
        />
      </TabsContent>
    </Tabs>
  );
}
