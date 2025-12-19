"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, Activity, Zap, Flame, Timer } from "lucide-react";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  pace?: string;
  weight?: number;
}

interface WorkoutActivity {
  id: number;
  date: string;
  time: string;
  length: number;
  difficulty: "easy" | "moderate" | "hard" | "very hard";
  type: "cardio" | "strength" | "flexibility" | "sports" | "mixed" | "other";
  exercises: string;
  notes?: string | null;
  completed: boolean;
}

interface UpcomingWorkoutsProps {
  workouts: WorkoutActivity[];
  todayDate: string;
}

export function UpcomingWorkouts({ workouts, todayDate }: UpcomingWorkoutsProps) {
  if (workouts.length === 0) {
    return null;
  }

  const parseExercises = (exercisesJson: string): Exercise[] => {
    try {
      return JSON.parse(exercisesJson);
    } catch {
      return [];
    }
  };

  const getDateLabel = (date: string) => {
    const today = todayDate;
    const tomorrow = new Date(new Date(todayDate).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (date === today) return "Today";
    if (date === tomorrow) return "Tomorrow";
    return date;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "moderate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "hard":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300";
      case "very hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cardio":
        return <Activity className="h-4 w-4" />;
      case "strength":
        return <Dumbbell className="h-4 w-4" />;
      case "flexibility":
        return <Zap className="h-4 w-4" />;
      case "sports":
        return <Flame className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            Upcoming Workouts
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
            <Link href="/exercise">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {workouts.map((workout) => {
          const exercises = parseExercises(workout.exercises);
          const dateLabel = getDateLabel(workout.date);
          const isToday = dateLabel === "Today";

          return (
            <div
              key={workout.id}
              className={`p-3 rounded-lg border ${
                isToday
                  ? "border-primary/30 bg-primary/5"
                  : "border-muted bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isToday ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {dateLabel}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {workout.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs capitalize">
                    {getTypeIcon(workout.type)}
                    <span className="ml-1">{workout.type}</span>
                  </Badge>
                  <Badge className={`text-xs capitalize ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </Badge>
                </div>
              </div>

              {exercises.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {exercises.slice(0, 2).map((ex, idx) => (
                    <span key={idx}>
                      {idx > 0 && " • "}
                      {ex.description}
                    </span>
                  ))}
                  {exercises.length > 2 && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      +{exercises.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
