"use client";

import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DBStravaActivity } from "@/lib/db/strava";

interface DailyStravaProps {
  activities: DBStravaActivity[];
}

export function DailyStrava({ activities }: DailyStravaProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Activity className="h-4 w-4" />
        Strava Activities ({activities.length})
      </h3>
      <div className="space-y-2">
        {activities.map((activity) => (
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
  );
}
