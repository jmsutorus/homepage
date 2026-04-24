"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CuteLoader } from "@/components/ui/cute-loader";

interface MoodSelectorProps {
  date: string;
  currentMood: number | null;
  onMoodUpdated?: () => void;
}

import { MaterialSymbol } from "@/components/ui/MaterialSymbol";

const MOODS = [
  { rating: 1, icon: "sentiment_very_dissatisfied", color: "bg-media-error text-white", label: "Awful" },
  { rating: 2, icon: "sentiment_dissatisfied", color: "bg-media-secondary text-white", label: "Bad" },
  { rating: 3, icon: "sentiment_neutral", color: "bg-media-surface-container-high text-media-on-surface-variant", label: "Okay" },
  { rating: 4, icon: "sentiment_satisfied", color: "bg-blue-400 text-white", label: "Good" },
  { rating: 5, icon: "mood", color: "bg-media-secondary text-white", label: "Great" },
];

export function MoodSelector({ date, currentMood, onMoodUpdated }: MoodSelectorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [pendingMood, setPendingMood] = useState<number | null>(null);
  const router = useRouter();

  // Once the mood updates to match what we saved, stop showing the loader
  useEffect(() => {
    if (pendingMood !== null && currentMood === pendingMood) {
      setIsSaving(false);
      setPendingMood(null);
    }
  }, [currentMood, pendingMood]);

  const handleMoodSelect = async (rating: number) => {
    if (isSaving) return;

    setIsSaving(true);
    setPendingMood(rating);
    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, rating, note: "" }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mood");
      }

      // Trigger refresh of data
      if (onMoodUpdated) {
        onMoodUpdated();
      } else {
        // Fallback to router refresh for server component pages
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to save mood:", error);
      // On error, stop loading immediately
      setIsSaving(false);
      setPendingMood(null);
    }
  };

  return (
    <div className="relative min-h-[72px] flex flex-wrap gap-4 items-center">
      {isSaving && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-full">
          <CuteLoader size={16} />
        </div>
      )}
      {MOODS.map(({ rating, icon, color, label }) => {
        const isSelected = currentMood === rating;
        return (
          <button
            key={rating}
            onClick={() => handleMoodSelect(rating)}
            disabled={isSaving}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-all cursor-pointer",
              isSelected ? color : "bg-media-surface-container-high text-media-on-surface-variant",
              "shadow-sm"
            )}
            title={label}
          >
            <MaterialSymbol 
              icon={icon} 
              fill={isSelected} 
              className={cn("text-2xl transition-transform", isSelected && "scale-110")}
            />
          </button>
        );
      })}
    </div>
  );
}
