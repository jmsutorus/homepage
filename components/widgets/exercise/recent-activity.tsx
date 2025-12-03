import { DBStravaActivity } from "@/lib/db/strava";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MapPin } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/utils/strava";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RecentActivityProps {
  activities: DBStravaActivity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const activityTypeColors: Record<string, string> = {
    Run: "text-orange-500",
    Ride: "text-blue-500",
    Swim: "text-cyan-500",
    Walk: "text-green-500",
    Hike: "text-emerald-500",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="h-6 text-xs">
            <Link href="/exercise">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activities.</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 3).map((activity) => (
              <a
                key={activity.id}
                href={`https://www.strava.com/activities/${activity.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-full bg-muted ${activityTypeColors[activity.type] || "text-gray-500"}`}>
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {activity.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{format(new Date(activity.start_date), "MMM d")}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {formatDistance(activity.distance)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs font-medium tabular-nums text-muted-foreground">
                  {formatDuration(activity.moving_time)}
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
