"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Clock, 
  Dumbbell, 
  Activity, 
  Pencil, 
  ChevronDown, 
  ChevronUp,
  History
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { AddActivityModal } from "./add-activity-modal";

interface Exercise {
  description: string;
  reps?: number;
  sets?: number;
  duration?: number;
  pace?: string;
  weight?: number;
}

interface CompletedActivitiesProps {
  initialActivities?: WorkoutActivity[];
  onRefresh?: number;
}

export function CompletedActivities({ 
  initialActivities = [],
  onRefresh 
}: CompletedActivitiesProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<WorkoutActivity[]>(initialActivities);
  const [editingActivity, setEditingActivity] = useState<WorkoutActivity | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Show first 5 by default, all when expanded
  const displayedActivities = showAll ? activities : activities.slice(0, 5);
  const hasMore = activities.length > 5;

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

  const formatDate = (date: string) => {
    try {
      return format(new Date(date + "T00:00:00"), "EEEE, MMM d, yyyy");
    } catch {
      return date;
    }
  };

  const formatCompletedAt = (completedAt: string | null | undefined) => {
    if (!completedAt) return null;
    try {
      return format(new Date(completedAt), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return completedAt;
    }
  };

  const handleActivityEdited = () => {
    setEditingActivity(null);
    router.refresh();
  };

  const handleActivityDeleted = () => {
    setEditingActivity(null);
    if (editingActivity) {
      setActivities(prev => prev.filter(a => a.id !== editingActivity.id));
    }
    router.refresh();
  };

  const renderActivityCard = (activity: WorkoutActivity) => {
    const exercises = parseExercises(activity.exercises);

    return (
      <div 
        key={activity.id} 
        className="border-l-4 border-green-500 pl-4 py-3 relative group bg-green-50/30 dark:bg-green-950/10 rounded-r-lg"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-semibold">{formatDate(activity.date)}</span>
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
          {activity.completed_at && (
            <span className="ml-2 text-green-600 dark:text-green-400">
              • Completed {formatCompletedAt(activity.completed_at)}
            </span>
          )}
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

        {activity.completion_notes && (
          <div className="mt-2 text-sm text-muted-foreground italic">
            {activity.completion_notes}
          </div>
        )}

        {/* Edit button */}
        <div className="mt-3 flex items-center justify-end">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 text-xs"
            onClick={() => setEditingActivity(activity)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
    );
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

  if (activities.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Completed Workouts
            </CardTitle>
            <CardDescription>Your workout history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No completed workouts yet. Mark activities as complete to see them here!
            </p>
          </CardContent>
        </Card>
        {editModal}
      </>
    );
  }

  return (
    <>
      <Card className="border-green-200 dark:border-green-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-500">
                <History className="h-5 w-5" />
                Completed Workouts
              </CardTitle>
              <CardDescription>
                {activities.length} workout{activities.length !== 1 ? "s" : ""} completed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayedActivities.map(activity => renderActivityCard(activity))}
          
          {hasMore && (
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show All ({activities.length - 5} more)
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      {editModal}
    </>
  );
}
