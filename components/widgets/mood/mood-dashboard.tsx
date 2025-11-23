"use client";

import { useState } from "react";
import { MoodEntry } from "@/lib/db/mood";
import { MoodHeatmap } from "./mood-heatmap";
import { MoodTrendsChart } from "./mood-trends-chart";

interface MoodDashboardProps {
  initialMoodData: MoodEntry[];
  year: number;
}

export function MoodDashboard({ initialMoodData, year }: MoodDashboardProps) {
  const [moodData, setMoodData] = useState<MoodEntry[]>(initialMoodData);

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
    <div className="space-y-6">
      <MoodHeatmap 
        year={year} 
        data={moodData} 
        onMoodChange={handleMoodChange} 
      />
      
      <MoodTrendsChart 
        data={moodData} 
        year={year} 
      />
    </div>
  );
}
