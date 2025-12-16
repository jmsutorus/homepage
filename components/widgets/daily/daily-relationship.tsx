"use client";

import { Heart, Calendar, Lock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CalendarRelationshipItem } from "@/lib/db/calendar";

interface DailyRelationshipProps {
  items: CalendarRelationshipItem[];
  onItemClick?: () => void;
}

// Relationship type icon mapping
const RELATIONSHIP_ICONS: Record<string, typeof Heart> = {
  date: Calendar,
  intimacy: Lock,
  milestone: Star,
};

// Relationship type labels
const RELATIONSHIP_LABELS: Record<string, string> = {
  date: "Date",
  intimacy: "Intimacy",
  milestone: "Milestone",
};

export function DailyRelationship({ items, onItemClick }: DailyRelationshipProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Heart className="h-4 w-4" />
        Relationship ({items.length})
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const ItemIcon = RELATIONSHIP_ICONS[item.type] || Heart;
          return (
            <div
              key={`${item.type}-${item.id}`}
              className="pl-6 border-l-2 border-pink-500 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
              onClick={onItemClick}
            >
              <div className="flex items-center gap-2">
                <ItemIcon className="h-4 w-4 text-pink-500" />
                <p className="font-medium text-pink-700 dark:text-pink-400">
                  {item.title || RELATIONSHIP_LABELS[item.type]}
                </p>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs capitalize">
                  {RELATIONSHIP_LABELS[item.type]}
                </Badge>
                {item.description && (
                  <span className="truncate max-w-xs">{item.description}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
