"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from "@/lib/utils";
import type { CalendarDayData, CalendarGoal } from "@/lib/db/calendar";
import type { MediaContent } from "@/lib/db/media";
import type { DBStravaActivity } from "@/lib/db/strava";
import type { Event } from "@/lib/db/events";
import type { ParkContent } from "@/lib/db/parks";
import type { JournalContent } from "@/lib/db/journals";
import {
  Film,
  Tv,
  Book,
  Gamepad2,
  Activity,
  Calendar,
  MapPin,
  Timer,
  Trees,
  BookOpen,
  Mountain,
  Clock,
  TrendingUp,
  ExternalLink,
  Target,
} from "lucide-react";

interface CalendarMonthDetailProps {
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

export function CalendarMonthDetail({
  calendarData,
  year,
  month,
}: CalendarMonthDetailProps) {
  const router = useRouter();

  // Extract all media, activities, events, parks, journals, and goals from the calendar data
  const allMedia: MediaContent[] = [];
  const allActivities: DBStravaActivity[] = [];
  const allEvents: Event[] = [];
  const allParks: ParkContent[] = [];
  const allJournals: JournalContent[] = [];
  const allGoalsCompleted: CalendarGoal[] = [];

  calendarData.forEach((dayData) => {
    allMedia.push(...dayData.media);
    allActivities.push(...dayData.activities);
    allEvents.push(...dayData.events);
    allParks.push(...dayData.parks);
    allJournals.push(...dayData.journals);
    allGoalsCompleted.push(...dayData.goalsCompleted);
  });

  // Deduplicate goals (same goal might appear in multiple days if completed date spans)
  const uniqueGoalsCompleted = Array.from(
    new Map(allGoalsCompleted.map((goal) => [goal.id, goal])).values()
  );

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
    router.push(`/daily/${event.date}`);
  };

  const handleParkClick = (slug: string) => {
    router.push(`/parks/${slug}`);
  };

  const handleJournalClick = (slug: string) => {
    router.push(`/journals/${slug}`);
  };

  const handleGoalClick = (slug: string) => {
    router.push(`/goals/${slug}`);
  };

  const hasMedia = allMedia.length > 0;
  const hasActivities = allActivities.length > 0;
  const hasEvents = uniqueEvents.length > 0;
  const hasParks = allParks.length > 0;
  const hasJournals = allJournals.length > 0;
  const hasGoalsCompleted = uniqueGoalsCompleted.length > 0;

  if (!hasMedia && !hasActivities && !hasEvents && !hasParks && !hasJournals && !hasGoalsCompleted) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            No activities recorded for this month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Parks Visited */}
      {hasParks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trees className="h-5 w-5" />
              Parks Visited ({allParks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {allParks.map((park) => (
                <div
                  key={park.id}
                  className="cursor-pointer group"
                  onClick={() => handleParkClick(park.slug)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted">
                    {park.poster ? (
                      <img
                        src={park.poster}
                        alt={park.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Trees className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {park.rating && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {park.rating}/10
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {park.title}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {park.category}
                      </Badge>
                      {park.state && (
                        <Badge variant="secondary" className="text-xs">
                          {park.state}
                        </Badge>
                      )}
                    </div>
                    {park.visited && (
                      <p className="text-xs text-muted-foreground">
                        {formatDateSafe(park.visited)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journals */}
      {hasJournals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Journals ({allJournals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allJournals.map((journal) => (
                <div
                  key={journal.id}
                  className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleJournalClick(journal.slug)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[#CC5500] dark:text-[#ff6a1a]">
                      {journal.title}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs capitalize">
                        {journal.journal_type}
                      </Badge>
                      {journal.tags && journal.tags.length > 0 && (
                        <span>{journal.tags.slice(0, 3).join(", ")}</span>
                      )}
                      {journal.journal_type === "daily" && journal.daily_date ? (
                        <span>{formatDateSafe(journal.daily_date)}</span>
                      ) : (
                        <span>{formatDateSafe(journal.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Accomplished */}
      {hasGoalsCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals Accomplished ({uniqueGoalsCompleted.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uniqueGoalsCompleted.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleGoalClick(goal.slug)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-teal-700 dark:text-teal-400">
                      {goal.title}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs capitalize">
                        {goal.priority} priority
                      </Badge>
                      {goal.completed_date && (
                        <span>Completed {formatDateSafe(goal.completed_date)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Activities List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold mb-3">Activities</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {allActivities.map((activity) => (
                    <a
                      key={activity.id}
                      href={`https://www.strava.com/activities/${activity.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group cursor-pointer"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-blue-700 dark:text-blue-400 group-hover:underline">
                            {activity.name}
                          </p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
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
                    </a>
                  ))}
                </div>
              </div>

              {/* Right: Monthly Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold mb-3">Monthly Stats</h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Total Distance */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-500/10">
                        <Activity className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(allActivities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000).toFixed(2)} km
                        </p>
                        <p className="text-sm text-muted-foreground">Total Distance</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Time */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/10">
                        <Clock className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(() => {
                            const totalMinutes = Math.round(
                              allActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0) / 60
                            );
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                          })()}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Time</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Elevation */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-orange-500/10">
                        <Mountain className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {Math.round(
                            allActivities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0)
                          ).toLocaleString()} m
                        </p>
                        <p className="text-sm text-muted-foreground">Total Elevation</p>
                      </div>
                    </div>
                  </div>

                  {/* Average Pace */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-500/10">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(() => {
                            const activitiesWithSpeed = allActivities.filter(a => a.average_speed);
                            if (activitiesWithSpeed.length === 0) return "N/A";
                            const avgSpeed = activitiesWithSpeed.reduce((sum, a) => sum + (a.average_speed || 0), 0) / activitiesWithSpeed.length;
                            const speedKmH = avgSpeed * 3.6;
                            const paceMinPerKm = 60 / speedKmH;
                            const minutes = Math.floor(paceMinPerKm);
                            const seconds = Math.round((paceMinPerKm - minutes) * 60);
                            return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
                          })()}
                        </p>
                        <p className="text-sm text-muted-foreground">Average Pace</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
