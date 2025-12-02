"use client";

import { useState } from "react";
import { MoodEntry } from "@/lib/db/mood";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Smile } from "lucide-react";
import { MoodEntryModal } from "./mood-entry-modal";
import { cn } from "@/lib/utils";

interface MoodSummaryProps {
  todayMood?: MoodEntry;
  recentMoods: MoodEntry[];
}

export function MoodSummary({ todayMood: initialTodayMood, recentMoods }: MoodSummaryProps) {
  const [todayMood, setTodayMood] = useState<MoodEntry | undefined>(initialTodayMood);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveMood = async (rating: number, note: string) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, rating, note }),
      });

      if (response.ok) {
        const newMood = await response.json();
        setTodayMood(newMood);
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
    }
  };

  const getMoodColor = (rating: number) => {
    switch (rating) {
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-lime-500";
      case 5: return "bg-green-500";
      default: return "bg-muted";
    }
  };

  const getMoodLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Terrible";
      case 2: return "Bad";
      case 3: return "Okay";
      case 4: return "Good";
      case 5: return "Great";
      default: return "Unknown";
    }
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Mood
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayMood ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white font-bold", getMoodColor(todayMood.rating))}>
                  {todayMood.rating}
                </div>
                <div>
                  <p className="font-medium">{getMoodLabel(todayMood.rating)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{todayMood.note || "No note"}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">How are you feeling?</p>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Log
              </Button>
            </div>
          )}

          {/* Recent Moods Dots */}
          <div className="mt-4 flex items-center gap-1 justify-end">
            {recentMoods.slice(0, 7).reverse().map((mood) => (
              <div
                key={mood.date}
                className={cn("h-2 w-2 rounded-full", getMoodColor(mood.rating))}
                title={`${mood.date}: ${getMoodLabel(mood.rating)}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <MoodEntryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        date={dateStr}
        initialRating={todayMood?.rating}
        initialNote={todayMood?.note || ""}
        onSave={handleSaveMood}
      />
    </>
  );
}
