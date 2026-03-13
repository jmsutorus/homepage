"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Dumbbell, Activity, CheckCircle2, Link as LinkIcon, AlertCircle, Pencil } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  pace?: string;
  weight?: number;
}

import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { AddActivityModal } from "@/components/widgets/exercise/add-activity-modal";

interface UpcomingActivitiesProps {
  onRefresh?: number;
  initialActivities?: WorkoutActivity[];
  initialRecentActivities?: WorkoutActivity[];
}

export function UpcomingActivities({ 
  onRefresh, 
  initialActivities = [], 
  initialRecentActivities = []
}: UpcomingActivitiesProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<WorkoutActivity[]>(initialActivities);
  const [recentActivities, setRecentActivities] = useState<WorkoutActivity[]>(initialRecentActivities);
  const [loading, setLoading] = useState(initialActivities.length === 0);
  const [editingActivity, setEditingActivity] = useState<WorkoutActivity | null>(null);
  const isFirstRender = useRef(true);

  const fetchActivities = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      // Fetch upcoming
      const response = await fetch(`/api/activities?start_date=${today}&end_date=${nextWeek}`);
      const data = await response.json();
      
      const upcoming = data.activities
        .filter((a: WorkoutActivity) => !a.completed)
        .sort((a: WorkoutActivity, b: WorkoutActivity) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 3);

      setActivities(upcoming);
      
      // We rely on initialRecentActivities for now or we could fetch them too if we add a range param
      // For now, let's keep recent activities static from server or allow complete refresh if we update the endpoint
      // To strictly follow "refresh" we should probably refetch recent too, but let's stick to upcoming for dynamic updates for now
      // unless we modify the route to fetch recent specifically.
      
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current && initialActivities.length > 0) {
      isFirstRender.current = false;
      setLoading(false);
      return;
    }
    fetchActivities();
  }, [onRefresh]);

  const handleMarkComplete = async (activityId: number) => {
    try {
      const response = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activityId,
          completion_notes: "Completed via dashboard"
        }),
      });

      if (!response.ok) throw new Error("Failed to mark completed");

      toast.success("Activity marked as complete");
      
      // Update local state to remove the activity
      setActivities(prev => prev.filter(a => a.id !== activityId));
      setRecentActivities(prev => prev.filter(a => a.id !== activityId));
      
      router.refresh();
    } catch (error) {
      console.error("Error completing activity:", error);
      toast.error("Failed to complete activity");
    }
  };



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

  const getDateLabel = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    if (date === today) return "Today";
    if (date === tomorrow) return "Tomorrow";
    try {
      return format(new Date(date), "EEEE, MMM d");
    } catch {
      return date;
    }
  };

  const renderActivityCard = (activity: WorkoutActivity, isPast: boolean) => {
    return (
      <div 
        key={activity.id} 
        className={`flex items-center justify-between p-2 rounded-md transition-colors hover:bg-muted/50 border border-transparent hover:border-muted-foreground/10 group ${
            isPast ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
        }`}
      >
        <Link 
            href={`/exercise/${activity.id}`}
            className="flex items-center gap-3 flex-1 min-w-0"
        >
             <div className={`p-1.5 rounded-full shrink-0 ${getDifficultyColor(activity.difficulty)}`}>
                {getTypeIcon(activity.type)}
             </div>
             
             <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{getDateLabel(activity.date)}</span>
                    {isPast && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded-full font-medium shrink-0">Overdue</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                    <span className="capitalize">{activity.type}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                    <span>•</span>
                    <span>{activity.length}m</span>
                </div>
             </div>
        </Link>
        
         <div className="flex items-center gap-2 pl-2">
             <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleMarkComplete(activity.id)}
                title="Mark as Complete"
             >
                <CheckCircle2 className="h-4 w-4" />
             </Button>
         </div>
      </div>
    );
  };

  const handleActivityEdited = () => {
    setEditingActivity(null);
    fetchActivities();
    router.refresh();
  };

  const handleActivityDeleted = () => {
    setEditingActivity(null);
    // Remove from local state
    if (editingActivity) {
      setActivities(prev => prev.filter(a => a.id !== editingActivity.id));
      setRecentActivities(prev => prev.filter(a => a.id !== editingActivity.id));
    }
    router.refresh();
  };

  const editModal = (
    <AddActivityModal
      editActivity={editingActivity}
      isOpen={!!editingActivity}
      onOpenChange={(open) => !open && setEditingActivity(null)}
      onActivityAdded={handleActivityEdited}
      onActivityDeleted={handleActivityDeleted}
    />
  );

  if (loading) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Workouts
            </CardTitle>
            <CardDescription>Your scheduled workouts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
        {editModal}
      </>
    );
  }

  if (activities.length === 0 && recentActivities.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Workouts
            </CardTitle>
            <CardDescription>Your scheduled workouts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No upcoming activities scheduled. Click &quot;Add Activity&quot; to create one!
            </p>
          </CardContent>
        </Card>
        {editModal}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Upcoming */}
        {activities.length > 0 && (
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Upcoming Workouts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-0">
              {activities.map(activity => renderActivityCard(activity, false))}
            </CardContent>
          </Card>
        )}

        {/* Recent / Past Due */}
        {recentActivities.length > 0 && (
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-500">
                <AlertCircle className="h-4 w-4" />
                Past Due
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 px-0">
              {recentActivities.map(activity => renderActivityCard(activity, true))}
            </CardContent>
          </Card>
        )}
      </div>
      {editModal}
    </>
  );
}

