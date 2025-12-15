"use client";

import { Languages, Check } from "lucide-react";

interface DailyDuolingoProps {
  completed: boolean;
}

export function DailyDuolingo({ completed }: DailyDuolingoProps) {
  if (!completed) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Languages className="h-4 w-4 text-[#58CC02]" />
        Duolingo
      </h3>
      <div className="pl-6 border-l-2 border-[#58CC02]">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-[#58CC02]" />
          <span className="text-sm text-[#58CC02] font-medium">
            Lesson completed
          </span>
        </div>
      </div>
    </div>
  );
}
