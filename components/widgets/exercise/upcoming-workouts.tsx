"use client";

import { format } from "date-fns";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Activity, Zap, Flame, Timer } from "lucide-react";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  pace?: string;
  weight?: number;
}

import { WorkoutActivity } from "@/lib/db/workout-activities";

interface UpcomingWorkoutsProps {
  workouts: WorkoutActivity[];
  todayDate: string;
}

export function UpcomingWorkouts({ workouts, todayDate }: UpcomingWorkoutsProps) {
  if (workouts.length === 0) {
    return null;
  }

  const getDateLabel = (date: string) => {
    const today = todayDate;
    const tomorrow = new Date(new Date(todayDate).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (date === today) return "Today";
    if (date === tomorrow) return "Tomorrow";
    return format(new Date(date + "T00:00:00"), "MMM d");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "moderate": return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "hard": return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300";
      case "very hard": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cardio": return <Activity className="h-3.5 w-3.5" />;
      case "strength": return <Dumbbell className="h-3.5 w-3.5" />;
      case "flexibility": return <Zap className="h-3.5 w-3.5" />;
      case "sports": return <Flame className="h-3.5 w-3.5" />;
      default: return <Activity className="h-3.5 w-3.5" />;
    }
  };
  
  // Helper to format date for display in the list (e.g. Feb 14)
  const formatListDate = (date: string) => {
      try {
          return format(new Date(date + "T00:00:00"), "MMM d");
      } catch {
          return date;
      }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            Upcoming Workouts
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-6 text-xs px-2">
            <Link href="/exercise">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {workouts.map((workout) => {
          const dateLabel = getDateLabel(workout.date);
          const isToday = dateLabel === "Today";

          return (
            <Link
              href={`/exercise/${workout.id}`}
              key={workout.id}
              className={`flex items-center justify-between p-2 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                isToday ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                 <div className={`p-1.5 rounded-full ${getDifficultyColor(workout.difficulty)}`}>
                    {getTypeIcon(workout.type)}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {isToday ? "Today" : formatListDate(workout.date)}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                        {workout.type}
                    </span>
                 </div>
              </div>
              
               <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{workout.time}</span>
               </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
