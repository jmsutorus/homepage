"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Dumbbell, Activity, CheckCircle2, Link as LinkIcon, AlertCircle, Pencil } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  stravaActivities?: any[];
}

export function UpcomingActivities({ 
  onRefresh, 
  initialActivities = [], 
  initialRecentActivities = [],
  stravaActivities = []
}: UpcomingActivitiesProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<WorkoutActivity[]>(initialActivities);
  const [recentActivities, setRecentActivities] = useState<WorkoutActivity[]>(initialRecentActivities);
  const [loading, setLoading] = useState(initialActivities.length === 0);
  const [editingActivity, setEditingActivity] = useState<WorkoutActivity | null>(null);
  const isFirstRender = useState(true)[0];

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
    if (isFirstRender && initialActivities.length > 0) {
      setLoading(false);
      return;
    }
    fetchActivities();
  }, [onRefresh]);

  const handleMarkComplete = async (activityId: number, stravaActivityId?: number) => {
    try {
      const response = await fetch("/api/activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activityId,
          strava_activity_id: stravaActivityId,
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

  const findMatchingStravaActivity = (activityDate: string) => {
    // Basic heuristic: check if there's a strava activity on the same day
    // The date formats should match YYYY-MM-DD
    return stravaActivities.find(sa => {
      const stravaDate = sa.start_date_local || sa.start_date;
      return stravaDate.split('T')[0] === activityDate;
    });
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
    const exercises = parseExercises(activity.exercises);
    const matchingStrava = isPast ? findMatchingStravaActivity(activity.date) : null;

    return (
      <div key={activity.id} className={`border-l-4 ${isPast ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/10" : "border-primary"} pl-4 py-3 relative group`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{getDateLabel(activity.date)}</span>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {activity.time}
            </Badge>
            {isPast && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Overdue
              </Badge>
            )}
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

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 text-xs"
            onClick={() => setEditingActivity(activity)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
          {isPast && matchingStrava ? (
             <Button 
               size="sm" 
               variant="default" 
               className="h-7 text-xs bg-green-600 hover:bg-green-700"
               onClick={() => handleMarkComplete(activity.id, matchingStrava.id)}
             >
               <LinkIcon className="h-3 w-3 mr-1" />
               Link to {matchingStrava.name}
             </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs"
              onClick={() => handleMarkComplete(activity.id)}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Mark Complete
            </Button>
          )}
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
              Upcoming Activities
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
        {editModal}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Upcoming */}
        {activities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Activities
              </CardTitle>
              <CardDescription>Your next scheduled workouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map(activity => renderActivityCard(activity, false))}
            </CardContent>
          </Card>
        )}

        {/* Recent / Past Due */}
        {recentActivities.length > 0 && (
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                <AlertCircle className="h-5 w-5" />
                Past Planned Activities
              </CardTitle>
              <CardDescription>Review and complete past activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map(activity => renderActivityCard(activity, true))}
            </CardContent>
          </Card>
        )}
      </div>
      {editModal}
    </>
  );
}

