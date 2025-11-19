"use client";

import { useState } from "react";
import { Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MoodEntry } from "@/lib/db/mood";
import { MoodEntryModal } from "../mood/mood-entry-modal";

interface DailyMoodProps {
  mood: MoodEntry;
  date: string;
  onMoodUpdated?: () => void;
}

// Mood icon mapping
const MOOD_ICONS: Record<number, { icon: typeof Smile; color: string; label: string }> = {
  1: { icon: Frown, color: "text-red-500", label: "Terrible" },
  2: { icon: Frown, color: "text-orange-500", label: "Bad" },
  3: { icon: Meh, color: "text-yellow-500", label: "Okay" },
  4: { icon: Smile, color: "text-green-500", label: "Good" },
  5: { icon: Smile, color: "text-emerald-500", label: "Great" },
};

export function DailyMood({ mood, date, onMoodUpdated }: DailyMoodProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveMood = async (rating: number, note: string) => {
    const response = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, rating, note }),
    });

    if (!response.ok) {
      throw new Error("Failed to save mood entry");
    }

    // Trigger refresh of calendar data
    onMoodUpdated?.();
  };

  const MoodIcon = MOOD_ICONS[mood.rating].icon;
  const moodColor = MOOD_ICONS[mood.rating].color;
  const moodLabel = MOOD_ICONS[mood.rating].label;

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Smile className="h-4 w-4" />
          Mood
        </h3>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer flex items-center gap-2 hover:opacity-70 transition-opacity w-full text-left"
        >
          <MoodIcon className={cn("h-5 w-5", moodColor)} />
          <span className={cn("font-medium", moodColor)}>{moodLabel}</span>
        </button>
        {mood.note && (
          <p className="text-sm text-muted-foreground pl-7">{mood.note}</p>
        )}
      </div>

      <MoodEntryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        date={date}
        initialRating={mood.rating}
        initialNote={mood.note || ""}
        onSave={handleSaveMood}
      />
    </>
  );
}
