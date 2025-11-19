"use client";

import { Trees } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ParkContent } from "@/lib/db/parks";

interface DailyParksProps {
  parks: ParkContent[];
  onParkClick?: (slug: string) => void;
}

export function DailyParks({ parks, onParkClick }: DailyParksProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Trees className="h-4 w-4" />
        Parks Visited ({parks.length})
      </h3>
      <div className="space-y-2">
        {parks.map((park) => (
          <div
            key={park.id}
            className="pl-6 border-l-2 border-emerald-600 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
            onClick={() => onParkClick?.(park.slug)}
          >
            <p className="font-medium text-emerald-700 dark:text-emerald-400">{park.title}</p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">{park.category}</Badge>
              {park.state && (
                <span>{park.state}</span>
              )}
              {park.rating && (
                <span>Rating: {park.rating}/10</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
