"use client";

import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JournalContent } from "@/lib/db/journals";

interface DailyJournalsProps {
  journals: JournalContent[];
  onJournalClick?: (slug: string) => void;
}

export function DailyJournals({ journals, onJournalClick }: DailyJournalsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        Journals ({journals.length})
      </h3>
      <div className="space-y-2">
        {journals.map((journal) => (
          <div
            key={journal.id}
            className="pl-6 border-l-2 border-[#CC5500] cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
            onClick={() => onJournalClick?.(journal.slug)}
          >
            <p className="font-medium text-[#CC5500] dark:text-[#ff6a1a]">{journal.title}</p>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs capitalize">
                {journal.journal_type}
              </Badge>
              {journal.tags && journal.tags.length > 0 && (
                <span>{journal.tags.slice(0, 2).join(", ")}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
