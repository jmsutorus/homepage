"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Dumbbell, Activity } from "lucide-react";
import { format } from "date-fns";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  pace?: string;
  weight?: number;
}

import type { WorkoutActivity } from "@/lib/db/workout-activities";

interface UpcomingActivitiesProps {
  onRefresh?: number;
  initialActivities?: WorkoutActivity[];
}

export function UpcomingActivities({ onRefresh, initialActivities = [] }: UpcomingActivitiesProps) {
  const [activities, setActivities] = useState<WorkoutActivity[]>(initialActivities);
  const [loading, setLoading] = useState(initialActivities.length === 0);
  const isFirstRender = useState(true)[0];

  const fetchActivities = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const response = await fetch(`/api/activities?start_date=${today}&end_date=${nextWeek}`);
      const data = await response.json();

      // Filter for upcoming (not completed) and sort by date/time
      const upcoming = data.activities
        .filter((a: WorkoutActivity) => !a.completed)
        .sort((a: WorkoutActivity, b: WorkoutActivity) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 3); // Show next 3 activities

      setActivities(upcoming);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender && initialActivities.length > 0) {
      setLoading(false);
      return;
    }
    fetchActivities();
  }, [onRefresh]);

  const parseExercises = (exercisesJson: string): Exercise[] => {
    try {
      return JSON.parse(exercisesJson);
    } catch {
      return [];
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "moderate": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "hard": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "very hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cardio": return <Activity className="h-4 w-4" />;
      case "strength": return <Dumbbell className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const isToday = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    return date === today;
  };

  const isTomorrow = (date: string) => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return date === tomorrow;
  };

  const getDateLabel = (date: string) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    try {
      return format(new Date(date), "EEEE, MMM d");
    } catch {
      return date;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Activities
          </CardTitle>
          <CardDescription>Your scheduled workouts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Activities
          </CardTitle>
          <CardDescription>Your scheduled workouts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming activities scheduled. Click &quot;Add Activity&quot; to create one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Activities
        </CardTitle>
        <CardDescription>Your next scheduled workouts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const exercises = parseExercises(activity.exercises);
          return (
            <div key={activity.id} className="border-l-4 border-primary pl-4 py-2">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{getDateLabel(activity.date)}</span>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {getTypeIcon(activity.type)}
                    <span className="ml-1">{activity.type}</span>
                  </Badge>
                  <Badge className={`text-xs capitalize ${getDifficultyColor(activity.difficulty)}`}>
                    {activity.difficulty}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                {activity.length} minutes
              </div>

              <div className="space-y-1">
                {exercises.slice(0, 2).map((exercise, idx) => (
                  <div key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{exercise.description}</span>
                    {exercise.sets && exercise.reps && (
                      <span className="text-muted-foreground">
                        ({exercise.sets}x{exercise.reps}{exercise.weight ? ` @ ${exercise.weight}lbs` : ""})
                      </span>
                    )}
                  </div>
                ))}
                {exercises.length > 2 && (
                  <div className="text-sm text-muted-foreground">
                    +{exercises.length - 2} more exercise{exercises.length - 2 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {activity.notes && (
                <div className="mt-2 text-sm text-muted-foreground italic">
                  {activity.notes}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
