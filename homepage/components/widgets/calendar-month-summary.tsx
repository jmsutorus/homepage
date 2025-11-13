"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from "@/lib/utils";
import type { CalendarDayData } from "@/lib/db/calendar";
import type { MediaContent } from "@/lib/db/media";
import type { DBStravaActivity } from "@/lib/db/strava";
import type { Event } from "@/lib/db/events";
import {
  Film,
  Tv,
  Book,
  Gamepad2,
  Activity,
  Calendar,
  MapPin,
  Timer,
} from "lucide-react";

interface MonthSummaryProps {
  calendarData: Map<string, CalendarDayData>;
  year: number;
  month: number;
}

const MEDIA_ICONS: Record<string, typeof Film> = {
  movie: Film,
  tv: Tv,
  book: Book,
  game: Gamepad2,
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarMonthSummary({
  calendarData,
  year,
  month,
}: MonthSummaryProps) {
  const router = useRouter();

  // Extract all media, activities, and events from the calendar data
  const allMedia: MediaContent[] = [];
  const allActivities: DBStravaActivity[] = [];
  const allEvents: Event[] = [];

  calendarData.forEach((dayData) => {
    allMedia.push(...dayData.media);
    allActivities.push(...dayData.activities);
    allEvents.push(...dayData.events);
  });

  // Group media by type
  const mediaByType: Record<string, MediaContent[]> = {
    movie: [],
    tv: [],
    book: [],
    game: [],
  };

  allMedia.forEach((item) => {
    if (mediaByType[item.type]) {
      mediaByType[item.type].push(item);
    }
  });

  // Deduplicate events (multi-day events appear on multiple days)
  const uniqueEvents = Array.from(
    new Map(allEvents.map((event) => [event.id, event])).values()
  );

  const handleMediaClick = (type: string, slug: string) => {
    router.push(`/media/${type}/${slug}`);
  };

  const handleEventClick = (event: Event) => {
    // Navigate to the calendar day detail for this event
    router.push(`/calendar?year=${year}&month=${month}#${event.date}`);
  };

  const hasMedia = allMedia.length > 0;
  const hasActivities = allActivities.length > 0;
  const hasEvents = uniqueEvents.length > 0;

  if (!hasMedia && !hasActivities && !hasEvents) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {MONTH_NAMES[month - 1]} {year} Summary
        </h2>
        <p className="text-muted-foreground">
          Overview of your month&apos;s activities
        </p>
      </div>

      {/* Media Completed */}
      {hasMedia && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Media Completed ({allMedia.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(Object.keys(mediaByType) as Array<keyof typeof mediaByType>).map(
              (type) => {
                const items = mediaByType[type];
                if (items.length === 0) return null;

                const MediaIcon = MEDIA_ICONS[type] || Film;

                return (
                  <div key={type} className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 capitalize">
                      <MediaIcon className="h-4 w-4" />
                      {type === "tv" ? "TV Shows" : `${type}s`} ({items.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="cursor-pointer group"
                          onClick={() => handleMediaClick(item.type, item.slug)}
                        >
                          <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted">
                            {item.poster ? (
                              <img
                                src={item.poster}
                                alt={item.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <MediaIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            {item.rating && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {item.rating}/10
                              </div>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            {item.completed && (
                              <p className="text-xs text-muted-foreground">
                                {formatDateSafe(item.completed)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      )}

      {/* Exercise Activities */}
      {hasActivities && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Exercise Activities ({allActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-blue-700 dark:text-blue-400">
                      {activity.name}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {activity.distance && (
                        <span>
                          {(activity.distance / 1000).toFixed(2)} km
                        </span>
                      )}
                      {activity.moving_time && (
                        <span>{Math.round(activity.moving_time / 60)} min</span>
                      )}
                      {activity.type && (
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateSafe(activity.start_date_local)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events */}
      {hasEvents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Events ({uniqueEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uniqueEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-indigo-700 dark:text-indigo-400">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDateSafe(event.date)}
                      </span>
                      {!event.all_day && event.start_time && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {event.start_time}
                          {event.end_time && ` - ${event.end_time}`}
                        </span>
                      )}
                      {event.all_day && (
                        <Badge variant="outline" className="text-xs">
                          All Day
                        </Badge>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                      {event.end_date && event.end_date !== event.date && (
                        <Badge variant="secondary" className="text-xs">
                          Multi-day (until{" "}
                          {formatDateSafe(event.end_date)})
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
