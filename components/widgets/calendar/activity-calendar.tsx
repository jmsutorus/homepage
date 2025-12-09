"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, Edit, CheckCircle2, MapPin, TrendingUp, ExternalLink, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isBefore } from "date-fns";
import { AddActivityModal } from "../exercise/add-activity-modal";
import { CompleteActivityModal } from "../exercise/complete-activity-modal";
import type { WorkoutActivity } from "@/lib/db/workout-activities";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
}

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  total_elevation_gain: number;
}

interface ActivityCalendarProps {
  onRefresh?: number;
  onActivityUpdated?: () => void;
  initialActivities?: WorkoutActivity[];
}

export function ActivityCalendar({ onRefresh, onActivityUpdated, initialActivities = [] }: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activities, setActivities] = useState<WorkoutActivity[]>(initialActivities);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingActivity, setEditingActivity] = useState<WorkoutActivity | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [completingActivity, setCompletingActivity] = useState<WorkoutActivity | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [stravaActivities, setStravaActivities] = useState<Map<number, StravaActivity>>(new Map());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<WorkoutActivity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isFirstRender = useState(true)[0];

  const fetchStravaActivities = useCallback(async (ids: number[]) => {
    try {
      const response = await fetch(`/api/strava/activities?ids=${ids.join(",")}`);
      const data = await response.json();

      if (data.activities) {
        const map = new Map<number, StravaActivity>();
        data.activities.forEach((activity: StravaActivity) => {
          map.set(activity.id, activity);
        });
        setStravaActivities(map);
      }
    } catch (error) {
      console.error("Error fetching Strava activities:", error);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const response = await fetch(`/api/activities?start_date=${start}&end_date=${end}`);
      const data = await response.json();
      const workoutActivities = data.activities || [];
      setActivities(workoutActivities);

      // Fetch linked Strava activities
      const stravaIds = workoutActivities
        .filter((a: WorkoutActivity) => a.strava_activity_id)
        .map((a: WorkoutActivity) => a.strava_activity_id);

      if (stravaIds.length > 0) {
        await fetchStravaActivities(stravaIds);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }, [currentMonth, fetchStravaActivities]);

  useEffect(() => {
    if (isFirstRender && initialActivities.length > 0 && isSameMonth(currentMonth, new Date())) {
      // If we have initial data and it's the current month, we might still need to fetch strava activities?
      // The initial data passed from server doesn't include strava details map.
      // So we should probably still fetch strava activities if needed.
      const stravaIds = initialActivities
        .filter((a: WorkoutActivity) => a.strava_activity_id)
        .map((a: WorkoutActivity) => a.strava_activity_id as number);

      if (stravaIds.length > 0) {
        fetchStravaActivities(stravaIds);
      }
      return;
    }
    fetchActivities();
  }, [currentMonth, onRefresh, fetchActivities]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getActivitiesForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return activities.filter(a => a.date === dateStr);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "moderate": return "bg-blue-500";
      case "hard": return "bg-orange-500";
      case "very hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const parseExercises = (exercisesJson: string): Exercise[] => {
    try {
      return JSON.parse(exercisesJson);
    } catch {
      return [];
    }
  };

  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(2)} mi`;
  };

  const selectedDateActivities = selectedDate ? getActivitiesForDate(selectedDate) : [];

  const handleEditActivity = (activity: WorkoutActivity) => {
    setEditingActivity(activity);
    setIsEditModalOpen(true);
  };

  const handleActivityUpdated = () => {
    fetchActivities();
    setIsEditModalOpen(false);
    setEditingActivity(null);
    onActivityUpdated?.();
  };

  const handleCompleteActivity = (activity: WorkoutActivity) => {
    setCompletingActivity(activity);
    setIsCompleteModalOpen(true);
  };

  const handleActivityCompleted = () => {
    fetchActivities();
    setIsCompleteModalOpen(false);
    setCompletingActivity(null);
    onActivityUpdated?.();
  };

  const isActivityInPast = (activity: WorkoutActivity) => {
    const activityDate = new Date(`${activity.date}T${activity.time}`);
    const now = new Date();
    return isBefore(activityDate, now);
  };

  const handleDeleteClick = (activity: WorkoutActivity, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/activities/${activityToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove activity from local state
        setActivities((prev) => prev.filter((a) => a.id !== activityToDelete.id));
        onActivityUpdated?.();
      } else {
        console.error("Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  return (
    <>
      <AddActivityModal
        editActivity={editingActivity}
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onActivityAdded={handleActivityUpdated}
      />
      <CompleteActivityModal
        activity={completingActivity}
        isOpen={isCompleteModalOpen}
        onOpenChange={setIsCompleteModalOpen}
        onActivityCompleted={handleActivityCompleted}
      />
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Activity Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day, idx) => {
              const dayActivities = getActivitiesForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    cursor-pointer min-h-[80px] p-2 rounded-lg border transition-colors
                    ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-background"}
                    ${isToday ? "border-blue-500 border-2 ring-1 ring-blue-500/20" : "border-border"}
                    ${isSelected ? "ring-2 ring-primary" : ""}
                    ${dayActivities.length > 0 ? "hover:bg-accent" : ""}
                  `}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayActivities.slice(0, 2).map((activity) => (
                      <div
                        key={activity.id}
                        className={`
                          ${getDifficultyColor(activity.difficulty)}
                          rounded px-1 py-0.5 text-[10px] text-white truncate
                        `}
                        title={`${activity.time} - ${activity.type}`}
                      >
                        {activity.time}
                      </div>
                    ))}
                    {dayActivities.length > 2 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{dayActivities.length - 2}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Date Details */}
          {selectedDate && selectedDateActivities.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <div className="space-y-3">
                {selectedDateActivities.map((activity) => {
                  const exercises = parseExercises(activity.exercises);
                  return (
                    <div
                      key={activity.id}
                      className="border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleEditActivity(activity)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.date}</span>
                          <span className="font-medium">at</span>
                          <span className="font-medium">{activity.time}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditActivity(activity);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleDeleteClick(activity, e)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                          {!activity.completed && isActivityInPast(activity) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteActivity(activity);
                              }}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Mark as Complete
                            </Button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="capitalize text-xs">
                            {activity.type}
                          </Badge>
                          <Badge className={`capitalize text-xs ${getDifficultyColor(activity.difficulty)} text-white`}>
                            {activity.difficulty}
                          </Badge>
                          {activity.completed && (
                            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                              ✓ Completed
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {activity.length} minutes
                      </div>

                      <div className="space-y-1">
                        {exercises.map((exercise, idx) => (
                          <div key={idx} className="text-sm">
                            • {exercise.description}
                            {exercise.sets && exercise.reps && (
                              <span className="text-muted-foreground ml-2">
                                ({exercise.sets}x{exercise.reps})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Linked Strava Activity */}
                      {activity.completed && activity.strava_activity_id && stravaActivities.has(activity.strava_activity_id) && (
                        <a
                          href={`https://www.strava.com/activities/${activity.strava_activity_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 p-2 rounded-md bg-orange-500/10 hover:bg-orange-500/20 transition-colors border border-orange-500/20 group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                              <span className="truncate">{stravaActivities.get(activity.strava_activity_id)!.name}</span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {formatDistance(stravaActivities.get(activity.strava_activity_id)!.distance)}
                              </span>
                              {stravaActivities.get(activity.strava_activity_id)!.total_elevation_gain > 0 && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {Math.round(stravaActivities.get(activity.strava_activity_id)!.total_elevation_gain)} m
                                </span>
                              )}
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Activity</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this activity? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
