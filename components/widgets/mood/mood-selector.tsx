"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CuteLoader } from "@/components/ui/cute-loader";

interface MoodSelectorProps {
  date: string;
  currentMood: number | null;
  onMoodUpdated?: () => void;
}

const MOODS = [
  { rating: 1, icon: Frown, color: "text-red-500", label: "Awful" },
  { rating: 2, icon: Frown, color: "text-orange-500", label: "Bad" },
  { rating: 3, icon: Meh, color: "text-yellow-500", label: "Okay" },
  { rating: 4, icon: Smile, color: "text-green-500", label: "Good" },
  { rating: 5, icon: Smile, color: "text-emerald-500", label: "Great" },
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
    <div className="relative min-h-[88px] flex justify-between gap-2 p-4 rounded-lg border bg-card">
      {isSaving && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <CuteLoader size={16} />
        </div>
      )}
      {MOODS.map(({ rating, icon: Icon, color, label }) => {
        const isSelected = currentMood === rating;
        return (
          <div key={rating} className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMoodSelect(rating)}
              className={cn(
                "h-10 w-10 rounded-full transition-all hover:scale-110 cursor-pointer",
                isSelected ? "bg-accent ring-2 ring-primary" : "hover:bg-accent/50"
              )}
              title={label}
              disabled={isSaving}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 transition-colors", 
                  isSelected ? color : "text-muted-foreground"
                )} 
              />
            </Button>
            <span className={cn(
              "text-xs font-medium",
              isSelected ? "text-foreground" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
