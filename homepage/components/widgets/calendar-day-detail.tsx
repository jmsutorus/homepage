"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarDayData } from "@/lib/db/calendar";
import type { Event } from "@/lib/db/events";
import {
  Smile,
  Frown,
  Meh,
  Activity,
  Film,
  Tv,
  Book,
  Gamepad2,
  CheckSquare,
  Clock,
  X,
  Calendar,
  MapPin,
  Timer,
  Trees
} from "lucide-react";
import { cn, formatDateSafe, formatDateLongSafe } from "@/lib/utils";
import { EventEditDialog } from "./event-edit-dialog";

interface CalendarDayDetailProps {
  date: string;
  data?: CalendarDayData;
  onDataChange?: () => void;
}

// Mood icon mapping
const MOOD_ICONS: Record<number, { icon: typeof Smile; color: string; label: string }> = {
  1: { icon: Frown, color: "text-red-500", label: "Terrible" },
  2: { icon: Frown, color: "text-orange-500", label: "Bad" },
  3: { icon: Meh, color: "text-yellow-500", label: "Okay" },
  4: { icon: Smile, color: "text-green-500", label: "Good" },
  5: { icon: Smile, color: "text-emerald-500", label: "Great" },
};

// Media type icon mapping
const MEDIA_ICONS: Record<string, typeof Film> = {
  movie: Film,
  tv: Tv,
  book: Book,
  game: Gamepad2,
};

export function CalendarDayDetail({ date, data, onDataChange }: CalendarDayDetailProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formattedDate = formatDateLongSafe(date, "en-US");

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleMediaClick = (type: string, slug: string) => {
    router.push(`/media/${type}/${slug}`);
  };

  const handleParkClick = (slug: string) => {
    router.push(`/parks/${slug}`);
  };

  const handleEventUpdated = () => {
    // Call the parent's onDataChange callback to refresh the data
    onDataChange?.();
  };

  const hasMood = data?.mood !== null && data?.mood !== undefined;
  const hasActivities = (data?.activities.length ?? 0) > 0;
  const hasMedia = (data?.media.length ?? 0) > 0;
  const hasTasks = (data?.tasks.length ?? 0) > 0;
  const hasEvents = (data?.events.length ?? 0) > 0;
  const hasParks = (data?.parks.length ?? 0) > 0;
  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks;

  // Get today's date for comparison
  const today = new Date().toISOString().split("T")[0];

  // Categorize tasks
  const completedTasks = data?.tasks.filter((t) => t.completed) ?? [];
  const overdueTasks = data?.tasks.filter((t) => !t.completed && t.due_date && t.due_date.split("T")[0] < today) ?? [];
  const upcomingTasks = data?.tasks.filter((t) => !t.completed && t.due_date && t.due_date.split("T")[0] >= today) ?? [];

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{formattedDate}</CardTitle>
          <CardDescription>No data recorded for this day</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formattedDate}</CardTitle>
        <CardDescription>Summary of your day</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Section */}
        {hasMood && data.mood && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Mood
            </h3>
            <div className="flex items-center gap-2">
              {(() => {
                const MoodIcon = MOOD_ICONS[data.mood.rating].icon;
                const moodColor = MOOD_ICONS[data.mood.rating].color;
                const moodLabel = MOOD_ICONS[data.mood.rating].label;
                return (
                  <>
                    <MoodIcon className={cn("h-5 w-5", moodColor)} />
                    <span className={cn("font-medium", moodColor)}>{moodLabel}</span>
                  </>
                );
              })()}
            </div>
            {data.mood.note && (
              <p className="text-sm text-muted-foreground pl-7">{data.mood.note}</p>
            )}
          </div>
        )}

        {/* Events Section */}
        {hasEvents && data && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({data.events.length})
            </h3>
            <div className="space-y-3">
              {data.events.map((event) => (
                <div
                  key={event.id}
                  className="pl-6 border-l-2 border-indigo-500 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
                  onClick={() => handleEventClick(event)}
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
        )}

        {/* Activities Section */}
        {hasActivities && data && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activities ({data.activities.length})
            </h3>
            <div className="space-y-2">
              {data.activities.map((activity) => (
                <div key={activity.id} className="pl-6 border-l-2 border-blue-500">
                  <p className="font-medium text-blue-700 dark:text-blue-400">{activity.name}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {activity.distance && (
                      <span>{(activity.distance / 1000).toFixed(2)} km</span>
                    )}
                    {activity.moving_time && (
                      <span>{Math.round(activity.moving_time / 60)} min</span>
                    )}
                    {activity.type && (
                      <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Section */}
        {hasMedia && data && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Film className="h-4 w-4" />
              Media Completed ({data.media.length})
            </h3>
            <div className="space-y-2">
              {data.media.map((item) => {
                const MediaIcon = MEDIA_ICONS[item.type] || Film;
                return (
                  <div
                    key={item.id}
                    className="pl-6 border-l-2 border-purple-500 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
                    onClick={() => handleMediaClick(item.type, item.slug)}
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
        )}

        {/* Parks Section */}
        {hasParks && data && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Trees className="h-4 w-4" />
              Parks Visited ({data.parks.length})
            </h3>
            <div className="space-y-2">
              {data.parks.map((park) => (
                <div
                  key={park.id}
                  className="pl-6 border-l-2 border-emerald-600 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
                  onClick={() => handleParkClick(park.slug)}
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
        )}

        {/* Tasks Section */}
        {hasTasks && data && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks ({data.tasks.length})
            </h3>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Overdue ({overdueTasks.length})
                </h4>
                {overdueTasks.map((task) => (
                  <div key={task.id} className="pl-6 border-l-2 border-red-500">
                    <p className="text-sm text-red-700 dark:text-red-400">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDateSafe(task.due_date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Upcoming ({upcomingTasks.length})
                </h4>
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="pl-6 border-l-2 border-yellow-500">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due: {formatDateSafe(task.due_date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  Completed ({completedTasks.length})
                </h4>
                {completedTasks.map((task) => (
                  <div key={task.id} className="pl-6 border-l-2 border-green-500">
                    <p className="text-sm text-green-700 dark:text-green-400 line-through">{task.title}</p>
                    {task.completed_date && (
                      <p className="text-xs text-muted-foreground">
                        Completed: {formatDateSafe(task.completed_date)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Event Edit Dialog */}
      {selectedEvent && (
        <EventEditDialog
          event={selectedEvent}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </Card>
  );
}
