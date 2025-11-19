"use client";

import { Dumbbell, Clock, CheckSquare, CheckCircle2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import type { DBStravaActivity } from "@/lib/db/strava";

interface DailyWorkoutsProps {
  upcoming: WorkoutActivity[];
  completed: WorkoutActivity[];
  stravaActivities: DBStravaActivity[];
  onComplete?: (activity: WorkoutActivity) => void;
}

export function DailyWorkouts({ upcoming, completed, stravaActivities, onComplete }: DailyWorkoutsProps) {
  // Helper to check if a workout activity is in the past
  const isActivityInPast = (activity: WorkoutActivity) => {
    const activityDateTime = new Date(`${activity.date}T${activity.time}`);
    return activityDateTime < new Date();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Dumbbell className="h-4 w-4" />
        Workouts ({upcoming.length + completed.length})
      </h3>

      {/* Upcoming Workouts */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Planned ({upcoming.length})
          </h4>
          {upcoming.map((workout) => {
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
                {canComplete && onComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                    onClick={() => onComplete(workout)}
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
      {completed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            Completed ({completed.length})
          </h4>
          {completed.map((workout) => {
            const exercises = JSON.parse(workout.exercises);
            const difficultyColors = {
              "easy": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              "moderate": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
              "hard": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
              "very hard": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            };
            // Find linked Strava activity
            const linkedStrava = workout.strava_activity_id
              ? stravaActivities.find((a) => a.id === workout.strava_activity_id)
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
                            const speedKmH = linkedStrava.average_speed! * 3.6;
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
  );
}
