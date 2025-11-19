"use client";

import { Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface MoodSelectorProps {
  date: string;
  currentMood: number | null;
}

const MOODS = [
  { rating: 1, icon: Frown, color: "text-red-500", label: "Awful" },
  { rating: 2, icon: Frown, color: "text-orange-500", label: "Bad" },
  { rating: 3, icon: Meh, color: "text-yellow-500", label: "Okay" },
  { rating: 4, icon: Smile, color: "text-green-500", label: "Good" },
  { rating: 5, icon: Smile, color: "text-emerald-500", label: "Great" },
];

export function MoodSelector({ date, currentMood }: MoodSelectorProps) {
  const router = useRouter();

  const handleMoodSelect = (rating: number) => {
    // Navigate to mood creation/edit page or trigger server action
    // For now, we'll redirect to the journal edit page with mood param if no journal exists,
    // or we might need a dedicated mood action.
    // Since mood is tied to journal in the current schema (mostly), 
    // let's redirect to journal creation/edit for now.
    
    router.push(`/journals/new?type=daily&date=${date}&mood=${rating}`);
  };

  return (
    <div className="flex justify-between gap-2 p-4 rounded-lg border bg-card">
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
