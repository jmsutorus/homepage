"use client";

import { useState, useEffect } from "react";
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
import Link from "next/link";
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

}: CompletedActivitiesProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<WorkoutActivity[]>(initialActivities);
  const [editingActivity, setEditingActivity] = useState<WorkoutActivity | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Sync state with props when data is refreshed
  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

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
    return (
      <Link 
        href={`/exercise/${activity.id}`}
        key={activity.id} 
        className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group border border-transparent hover:border-muted-foreground/10"
      >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${getDifficultyColor(activity.difficulty)}`}>
                {getTypeIcon(activity.type)}
            </div>
            
            <div className="flex flex-col">
                <span className="font-medium text-sm">{formatDate(activity.date)}</span>
                 <div className="flex items-center text-xs text-muted-foreground gap-2">
                    {activity.type === "run" && activity.distance && activity.distance > 0 ? (
                        <span>{activity.distance.toFixed(2)} mi • {activity.length} min</span>
                    ) : (
                        <span>{activity.length} min</span>
                    )}
                 </div>
            </div>
        </div>

        <div className="flex items-center gap-4">
             {/* Optional: Add small stats or badges here if needed, but keeping it clean for now */}
             {activity.completed_at && (
                 <CheckCircle2 className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
             )}
        </div>
      </Link>
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
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <History className="h-5 w-5" />
                Completed Workouts
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 px-0">
          {displayedActivities.map(activity => renderActivityCard(activity))}
          
          {hasMore && (
            <Button 
              variant="ghost" 
              className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
              onClick={() => setShowAll(!showAll)}
              size="sm"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-2" />
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
