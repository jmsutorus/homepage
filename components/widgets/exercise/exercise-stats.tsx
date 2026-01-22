import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration } from "@/lib/utils/strava"; // We can reuse this or move it, but keeping for now as it formats seconds/minutes
import type { WorkoutActivityStats } from "@/lib/db/workout-activities";

interface ExerciseStatsProps {
  initialStats: WorkoutActivityStats;
}

export function ExerciseStats({ initialStats }: ExerciseStatsProps) {
  if (!initialStats) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Stats (YTD)</CardTitle>
        <CardDescription>
          Your completed workouts for this year
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Workouts</p>
            <p className="text-2xl font-bold">{initialStats.total_activities}</p>
            <p className="text-xs text-muted-foreground">
              {initialStats.completed_activities} completed
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">
              {Math.round(initialStats.completion_rate)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">
              {/* input is minutes, formatDuration expects seconds usually if from strava, let's check or just do simple math */}
              {/* Checking lib/utils/strava usage previously: it was used with moving_time (seconds). 
                  Our length is in minutes. Let's do a simple format here or convert. 
                  60 min = 1 hr. 
              */}
              {Math.floor(initialStats.total_duration / 60)}h {initialStats.total_duration % 60}m
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Distance</p>
            <p className="text-2xl font-bold">
              {initialStats.total_distance.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">mi</span>
            </p>
          </div>
        </div>

        {/* Breakdown by Type */}
        <div>
          <h4 className="text-sm font-medium mb-3">By Activity Type</h4>
          <div className="space-y-2">
            {initialStats.by_type.map((typeStats) => (
              <div key={typeStats.type} className="flex items-center justify-between text-sm">
                <span className="capitalize">{typeStats.type}</span>
                <span className="text-muted-foreground">
                  {typeStats.count} workouts ({Math.floor(typeStats.total_duration / 60)}h {typeStats.total_duration % 60}m)
                </span>
              </div>
            ))}
            {initialStats.by_type.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No activities recorded yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
