"use client";

import { useState } from "react";
import HeatMap from "@uiw/react-heat-map";
import { MoodEntryModal } from "./mood-entry-modal";
import { MoodEntry } from "@/lib/db/mood";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { addToQueue } from "@/lib/pwa/offline-queue";
import { generateTempId } from "@/lib/pwa/optimistic-updates";
import { toast } from "sonner";

interface MoodHeatmapProps {
  year?: number;
  data: MoodEntry[];
  onMoodChange: () => void;
}

export function MoodHeatmap({ year = new Date().getFullYear(), data, onMoodChange }: MoodHeatmapProps) {
  const { isOnline } = useNetworkStatus();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert mood entries to heatmap format
  const heatmapData = data.map((entry) => ({
    date: entry.date,
    count: entry.rating,
    content: entry.note || "",
  }));

  // Handle cell click
  const handleCellClick = (date: string) => {
    const existing = data.find((entry) => entry.date === date);
    console.log("Clicked date:", date, "Existing entry:", existing);
    setSelectedDate(date);
    setSelectedMood(existing || null);
    setIsModalOpen(true);
  };

  // Handle mood save
  const handleSaveMood = async (rating: number, note: string) => {
    if (!selectedDate) return;

    const moodData = {
      date: selectedDate,
      rating,
      note,
    };

    try {
      // Handle offline mode
      if (!isOnline) {
        const tempId = generateTempId("mood");
        await addToQueue("LOG_MOOD", moodData, tempId);

        // Show offline success message
        toast.success("Mood saved offline", {
          description: "Will sync when you're back online",
          icon: <WifiOff className="h-4 w-4" />,
        });

        return;
      }

      // Online mode - normal API call
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moodData),
      });

      if (response.ok) {
        onMoodChange();
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
      throw error;
    }
  };

  // Check if today's mood exists
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD format in local timezone
  };

  const todayString = getTodayString();
  const hasTodaysMood = data.some((entry) => entry.date === todayString);

  // Handle quick add for today
  const handleQuickAddToday = () => {
    setSelectedDate(todayString);
    setSelectedMood(null);
    setIsModalOpen(true);
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Mood Tracker</CardTitle>
              <CardDescription>
                Year in Pixels - {year} • Click any day to add or edit your mood
              </CardDescription>
            </div>
            {!hasTodaysMood && (
              <Button onClick={handleQuickAddToday} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Today
              </Button>
            )}
          </div>
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
