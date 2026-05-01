"use client";

import { Dumbbell, Clock, CheckSquare, CheckCircle2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
interface DailyWorkoutsProps {
  upcoming: WorkoutActivity[];
  completed: WorkoutActivity[];
  onComplete?: (activity: WorkoutActivity) => void;
}

export function DailyWorkouts({ upcoming, completed, onComplete }: DailyWorkoutsProps) {
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
            const exercises = workout.exercises;
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
                        • {exercise.name || exercise.description}
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
            const exercises = workout.exercises;
            const difficultyColors = {
              "easy": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
              "moderate": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
              "hard": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
              "very hard": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            };
            return (
              <div key={workout.id} className="pl-6 border-l-2 border-green-500 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    {workout.time}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {workout.type}
                  </Badge>
                  <Badge className={cn("text-xs capitalize", difficultyColors[workout.difficulty as keyof typeof difficultyColors])}>
                    {workout.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{workout.length} min</span>
                </div>
                {/* Show Distance/Pace if available (native) */}
                {workout.distance && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2 space-y-1">
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                        Details
                      </p>
                    </div>
                    <div className="flex gap-3 text-xs text-blue-600 dark:text-blue-400 pl-4">
                        <span>{workout.distance.toFixed(2)} mi</span>
                        {/* Calculate pace if time/distance available */}
                        {/* Note: workout.length is in minutes */}
                        {(() => {
                            if (workout.distance && workout.distance > 0 && workout.length > 0) {
                                const pace = workout.length / workout.distance;
                                const minutes = Math.floor(pace);
                                const seconds = Math.round((pace - minutes) * 60);
                                return <span>{minutes}:{seconds.toString().padStart(2, '0')}/mi</span>
                            }
                            return null;
                        })()}
                    </div>
                  </div>
                )}

                {exercises.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {exercises.slice(0, 2).map((exercise: any, idx: number) => (
                      <p key={idx} className="text-xs text-muted-foreground pl-2">
                        • {exercise.name || exercise.description}
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
