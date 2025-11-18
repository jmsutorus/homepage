"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { CalendarDayData } from "@/lib/db/calendar";
import type { Event } from "@/lib/db/events";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
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
  Trees,
  BookOpen,
  Dumbbell,
  CheckCircle2
} from "lucide-react";
import { cn, formatDateSafe, formatDateLongSafe } from "@/lib/utils";
import { EventEditDialog } from "./event-edit-dialog";
import { CompleteActivityModal } from "../exercise/complete-activity-modal";

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
  const [completingActivity, setCompletingActivity] = useState<WorkoutActivity | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

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

  const handleJournalClick = (slug: string) => {
    router.push(`/journals/${slug}`);
  };

  const handleEventUpdated = () => {
    // Call the parent's onDataChange callback to refresh the data
    onDataChange?.();
  };

  const handleCompleteActivity = (activity: WorkoutActivity) => {
    setCompletingActivity(activity);
    setIsCompleteModalOpen(true);
  };

  const handleActivityCompleted = () => {
    setIsCompleteModalOpen(false);
    setCompletingActivity(null);
    // Refresh calendar data
    onDataChange?.();
  };

  // Helper to check if a workout activity is in the past
  const isActivityInPast = (activity: WorkoutActivity) => {
    const activityDateTime = new Date(`${activity.date}T${activity.time}`);
    return activityDateTime < new Date();
  };

  // Handler for toggling task completion
  const handleToggleTaskComplete = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        // Refresh calendar data
        onDataChange?.();
      } else {
        console.error("Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const hasMood = data?.mood !== null && data?.mood !== undefined;
  const hasMedia = (data?.media.length ?? 0) > 0;
  const hasTasks = (data?.tasks.length ?? 0) > 0;
  const hasEvents = (data?.events.length ?? 0) > 0;
  const hasParks = (data?.parks.length ?? 0) > 0;
  const hasJournals = (data?.journals.length ?? 0) > 0;

  // Workout activities
  const upcomingWorkoutActivities = data?.workoutActivities.filter((w) => !w.completed) ?? [];
  const completedWorkoutActivities = data?.workoutActivities.filter((w) => w.completed) ?? [];
  const hasWorkoutActivities = upcomingWorkoutActivities.length > 0 || completedWorkoutActivities.length > 0;

  // Get IDs of Strava activities that are linked to completed workouts
  const linkedStravaActivityIds = new Set(
    completedWorkoutActivities
      .filter((w) => w.strava_activity_id)
      .map((w) => w.strava_activity_id!)
  );

  // Filter out Strava activities that are already linked to completed workouts
  const unlinkedStravaActivities = data?.activities.filter(
    (activity) => !linkedStravaActivityIds.has(activity.id)
  ) ?? [];

  const hasActivities = unlinkedStravaActivities.length > 0;

  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks || hasJournals || hasWorkoutActivities;

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

        {/* Workout Activities Section */}
        {hasWorkoutActivities && data && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Workouts ({upcomingWorkoutActivities.length + completedWorkoutActivities.length})
            </h3>

            {/* Upcoming Workouts */}
            {upcomingWorkoutActivities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Planned ({upcomingWorkoutActivities.length})
                </h4>
                {upcomingWorkoutActivities.map((workout) => {
                  const exercises = JSON.parse(workout.exercises);
                  const difficultyColors = {
                    "easy": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                    "moderate": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                    "hard": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
                    "very hard": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  };
                  const canComplete = isActivityInPast(workout);
                  return (
                    <div key={workout.id} className="pl-6 border-l-2 border-orange-500 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                          {workout.time}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {workout.type}
                        </Badge>
                        <Badge className={cn("text-xs capitalize", difficultyColors[workout.difficulty])}>
                          {workout.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{workout.length} min</span>
                      </div>
                      {exercises.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {exercises.slice(0, 2).map((exercise: any, idx: number) => (
                            <p key={idx} className="text-xs text-muted-foreground pl-2">
                              • {exercise.description}
                              {exercise.sets && exercise.reps && ` - ${exercise.sets}x${exercise.reps}`}
                              {exercise.weight && ` @ ${exercise.weight}lbs`}
                              {exercise.duration && ` - ${exercise.duration} min`}
                            </p>
                          ))}
                          {exercises.length > 2 && (
                            <p className="text-xs text-muted-foreground pl-2">
                              +{exercises.length - 2} more exercises
                            </p>
                          )}
                        </div>
                      )}
                      {workout.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{workout.notes}</p>
                      )}
                      {canComplete && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => handleCompleteActivity(workout)}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark as Complete
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Workouts */}
            {completedWorkoutActivities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  Completed ({completedWorkoutActivities.length})
                </h4>
                {completedWorkoutActivities.map((workout) => {
                  const exercises = JSON.parse(workout.exercises);
                  const difficultyColors = {
                    "easy": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                    "moderate": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                    "hard": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
                    "very hard": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  };
                  // Find linked Strava activity
                  const linkedStrava = workout.strava_activity_id
                    ? data?.activities.find((a) => a.id === workout.strava_activity_id)
                    : null;

                  return (
                    <div key={workout.id} className="pl-6 border-l-2 border-green-500 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">
                          {workout.time}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {workout.type}
                        </Badge>
                        <Badge className={cn("text-xs capitalize", difficultyColors[workout.difficulty])}>
                          {workout.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{workout.length} min</span>
                      </div>

                      {/* Show Strava activity data if linked */}
                      {linkedStrava && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2 space-y-1">
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                              Strava: {linkedStrava.name}
                            </p>
                          </div>
                          <div className="flex gap-3 text-xs text-blue-600 dark:text-blue-400 pl-4">
                            {linkedStrava.distance && (
                              <span>{(linkedStrava.distance / 1000).toFixed(2)} km</span>
                            )}
                            {linkedStrava.moving_time && (
                              <span>{Math.round(linkedStrava.moving_time / 60)} min</span>
                            )}
                            {linkedStrava.average_speed && (
                              <span>
                                {(() => {
                                  // Convert m/s to min/km
                                  const speedKmH = linkedStrava.average_speed * 3.6;
                                  const paceMinPerKm = 60 / speedKmH;
                                  const minutes = Math.floor(paceMinPerKm);
                                  const seconds = Math.round((paceMinPerKm - minutes) * 60);
                                  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
                                })()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {exercises.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {exercises.slice(0, 2).map((exercise: any, idx: number) => (
                            <p key={idx} className="text-xs text-muted-foreground pl-2">
                              • {exercise.description}
                              {exercise.sets && exercise.reps && ` - ${exercise.sets}x${exercise.reps}`}
                              {exercise.weight && ` @ ${exercise.weight}lbs`}
                              {exercise.duration && ` - ${exercise.duration} min`}
                            </p>
                          ))}
                          {exercises.length > 2 && (
                            <p className="text-xs text-muted-foreground pl-2">
                              +{exercises.length - 2} more exercises
                            </p>
                          )}
                        </div>
                      )}
                      {workout.completion_notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Note: {workout.completion_notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Strava Activities (not linked to workouts) Section */}
        {hasActivities && data && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Strava Activities ({unlinkedStravaActivities.length})
            </h3>
            <div className="space-y-2">
              {unlinkedStravaActivities.map((activity) => (
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

        {/* Journals Section */}
        {hasJournals && data && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Journals ({data.journals.length})
            </h3>
            <div className="space-y-2">
              {data.journals.map((journal) => (
                <div
                  key={journal.id}
                  className="pl-6 border-l-2 border-[#CC5500] cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
                  onClick={() => handleJournalClick(journal.slug)}
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
                  <div key={task.id} className="pl-6 border-l-2 border-red-500 flex items-start gap-2">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTaskComplete(task.id, task.completed)}
                      className="cursor-pointer mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 dark:text-red-400">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDateSafe(task.due_date)}
                          </p>
                        )}
                        {task.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
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
                  <div key={task.id} className="pl-6 border-l-2 border-yellow-500 flex items-start gap-2">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTaskComplete(task.id, task.completed)}
                      className="cursor-pointer mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDateSafe(task.due_date)}
                          </p>
                        )}
                        {task.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
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
                  <div key={task.id} className="pl-6 border-l-2 border-green-500 flex items-start gap-2">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTaskComplete(task.id, task.completed)}
                      className="cursor-pointer mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-green-700 dark:text-green-400 line-through">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        
                        {task.completed_date && (
                          <p className="text-xs text-muted-foreground">
                            Completed: {formatDateSafe(task.completed_date)}
                          </p>
                        )}
                        {task.category && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/10 text-purple-500">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
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

      {/* Complete Activity Modal */}
      <CompleteActivityModal
        activity={completingActivity}
        isOpen={isCompleteModalOpen}
        onOpenChange={setIsCompleteModalOpen}
        onActivityCompleted={handleActivityCompleted}
      />
    </Card>
  );
}
