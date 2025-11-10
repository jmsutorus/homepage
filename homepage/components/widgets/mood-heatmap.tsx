"use client";

import { useState, useEffect } from "react";
import HeatMap from "@uiw/react-heat-map";
import { MoodEntryModal } from "./mood-entry-modal";
import { MoodEntry } from "@/lib/db/mood";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MoodHeatmapProps {
  year?: number;
}

export function MoodHeatmap({ year = new Date().getFullYear() }: MoodHeatmapProps) {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch mood data for the year
  useEffect(() => {
    fetchMoodData();
  }, [year]);

  const fetchMoodData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mood?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setMoodData(data);
      }
    } catch (error) {
      console.error("Failed to fetch mood data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert mood entries to heatmap format
  const heatmapData = moodData.map((entry) => ({
    date: entry.date,
    count: entry.rating,
    content: entry.note || "",
  }));

  // Handle cell click
  const handleCellClick = (date: string) => {
    const existing = moodData.find((entry) => entry.date === date);
    setSelectedDate(date);
    setSelectedMood(existing || null);
    setIsModalOpen(true);
  };

  // Handle mood save
  const handleSaveMood = async (rating: number, note: string) => {
    if (!selectedDate) return;

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, rating, note }),
      });

      if (response.ok) {
        // Refresh data
        await fetchMoodData();
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
      throw error;
    }
  };

  // Color mapping for moods
  const panelColors = {
    0: "hsl(var(--muted))",
    1: "hsl(0 84% 60%)", // Red - Terrible
    2: "hsl(25 95% 53%)", // Orange - Bad
    3: "hsl(48 96% 53%)", // Yellow - Okay
    4: "hsl(84 81% 44%)", // Lime - Good
    5: "hsl(142 71% 45%)", // Green - Great
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Tracker</CardTitle>
          <CardDescription>Year in Pixels - {year}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading mood data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Mood Tracker</CardTitle>
          <CardDescription>
            Year in Pixels - {year} • Click any day to add or edit your mood
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <HeatMap
              value={heatmapData}
              startDate={new Date(`${year}-01-01`)}
              endDate={new Date(`${year}-12-31`)}
              width="100%"
              rectSize={14}
              space={3}
              panelColors={panelColors}
              rectRender={(props, data) => {
                return (
                  <rect
                    {...props}
                    onClick={() => {
                      if (data.date) {
                        handleCellClick(data.date);
                      }
                    }}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                );
              }}
              rectProps={{
                rx: 2,
              }}
            />
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className="h-4 w-4 rounded-sm"
                  style={{ backgroundColor: panelColors[level as keyof typeof panelColors] }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      {/* Mood Entry Modal */}
      {selectedDate && (
        <MoodEntryModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          date={selectedDate}
          initialRating={selectedMood?.rating}
          initialNote={selectedMood?.note || ""}
          onSave={handleSaveMood}
        />
      )}
    </>
  );
}
