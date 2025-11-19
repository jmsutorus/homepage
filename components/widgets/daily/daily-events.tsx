"use client";

import { Calendar, MapPin, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from "@/lib/utils";
import type { Event } from "@/lib/db/events";

interface DailyEventsProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export function DailyEvents({ events, onEventClick }: DailyEventsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Events ({events.length})
      </h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="pl-6 border-l-2 border-indigo-500 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
            onClick={() => onEventClick?.(event)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium text-indigo-700 dark:text-indigo-400">{event.title}</p>
                {event.description && (
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {!event.all_day && event.start_time && (
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3" />
                      {event.start_time}
                      {event.end_time && ` - ${event.end_time}`}
                    </span>
                  )}
                  {event.all_day && (
                    <Badge variant="outline" className="text-xs">All Day</Badge>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                  {event.end_date && event.end_date !== event.date && (
                    <Badge variant="secondary" className="text-xs">
                      Multi-day event (until {formatDateSafe(event.end_date)})
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
