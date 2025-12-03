"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodEntryModal } from "./mood-entry-modal";
import { MoodEntry } from "@/lib/db/mood";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const MOOD_COLORS = {
  0: "bg-muted",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-lime-500",
  5: "bg-green-500",
};

export function MoodMonthView() {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    fetchMoodData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMoodData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mood?year=${currentYear}`);
      if (response.ok) {
        const data = await response.json();
        // Filter for current month only
        const currentMonthData = data.filter((entry: MoodEntry) => {
          // Parse date components directly to avoid timezone issues
          const [year, month] = entry.date.split("-").map(Number);
          return month - 1 === currentMonth && year === currentYear;
        });
        setMoodData(currentMonthData);
      }
    } catch (error) {
      console.error("Failed to fetch mood data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate calendar days for current month
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: Array<{ date: number; dateString: string } | null> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const month = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      days.push({
        date: day,
        dateString: `${currentYear}-${month}-${dayStr}`,
      });
    }

    return days;
  };

  const getMoodForDate = (dateString: string): number => {
    const entry = moodData.find((m) => m.date === dateString);
    return entry ? entry.rating : 0;
  };

  const handleDayClick = (dateString: string) => {
    const existing = moodData.find((entry) => entry.date === dateString);
    setSelectedDate(dateString);
    setSelectedMood(existing || null);
    setIsModalOpen(true);
  };

  const handleSaveMood = async (rating: number, note: string) => {
    if (!selectedDate) return;

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, rating, note }),
      });

      if (response.ok) {
        await fetchMoodData();
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
      throw error;
    }
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Tracker</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const days = getDaysInMonth();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mood Tracker</CardTitle>
              <CardDescription>{monthName}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mood">
                View Full Year
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div>
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-1"
                >
                  {day.charAt(0)}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const moodRating = getMoodForDate(day.dateString);
                const colorClass = MOOD_COLORS[moodRating as keyof typeof MOOD_COLORS];
                const isToday = day.dateString === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={day.dateString}
                    onClick={() => handleDayClick(day.dateString)}
                    className={`cursor-pointer aspect-square rounded-sm text-xs font-medium transition-all hover:scale-110 hover:z-10 relative ${colorClass} ${
                      isToday ? "ring-2 ring-primary ring-offset-1" : ""
                    } ${moodRating === 0 ? "text-muted-foreground" : "text-white"}`}
                  >
                    {day.date}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-3 w-3 rounded-sm ${MOOD_COLORS[level as keyof typeof MOOD_COLORS]}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
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
