"use client";

import { Film, Tv, Book, Gamepad2, Music } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MediaContent } from "@/lib/db/media";

interface DailyMediaProps {
  media: MediaContent[];
  onMediaClick?: (type: string, slug: string) => void;
}

// Media type icon mapping
const MEDIA_ICONS: Record<string, typeof Film> = {
  movie: Film,
  tv: Tv,
  book: Book,
  game: Gamepad2,
  album: Music,
};

export function DailyMedia({ media, onMediaClick }: DailyMediaProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Film className="h-4 w-4" />
        Media Completed ({media.length})
      </h3>
      <div className="space-y-2">
        {media.map((item) => {
          const MediaIcon = MEDIA_ICONS[item.type] || Film;
          return (
            <div
              key={item.id}
              className="pl-6 border-l-2 border-purple-500 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
              onClick={() => onMediaClick?.(item.type, item.slug)}
            >
              <div className="flex items-center gap-2">
                <MediaIcon className="h-4 w-4 text-purple-500" />
                <p className="font-medium text-purple-700 dark:text-purple-400">{item.title}</p>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                {item.rating && (
                  <span>Rating: {item.rating}/10</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
