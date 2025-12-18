"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CalendarDayData } from "@/lib/db/calendar";
import type { Event } from "@/lib/db/events";
import type { WorkoutActivity } from "@/lib/db/workout-activities";
import { formatDateLongSafe } from "@/lib/utils";
import { EventEditDialog } from "./event-edit-dialog";
import { CompleteActivityModal } from "../exercise/complete-activity-modal";
import { DailyMood } from "../daily/daily-mood";
import { DailyEvents } from "../daily/daily-events";
import { DailyWorkouts } from "../daily/daily-workouts";
import { DailyStrava } from "../daily/daily-strava";
import { DailyGithub } from "../daily/daily-github";
import { DailyMedia } from "../daily/daily-media";
import { DailyParks } from "../daily/daily-parks";
import { DailyJournals } from "../daily/daily-journals";
import { DailyTasks } from "../daily/daily-tasks";
import { DailyDuolingo } from "../daily/daily-duolingo";
import { DailyRelationship } from "../daily/daily-relationship";
import { DailyVacations } from "../daily/daily-vacations";
import { ExternalLink } from "lucide-react";

interface CalendarDayDetailProps {
  date: string;
  data?: CalendarDayData | null;
  isLoading?: boolean;
  error?: string | null;
  onDataChange?: () => void;
}



export function CalendarDayDetail({ date, data, isLoading, error, onDataChange }: CalendarDayDetailProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [completingActivity, setCompletingActivity] = useState<WorkoutActivity | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const formattedDate = formatDateLongSafe(date, "en-US");

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>{formattedDate}</CardTitle>
            <CardDescription>Loading day details...</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/daily/${date}`} className="flex items-center gap-1.5">
              View Full Day
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Skeleton loading state */}
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-20 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle>{formattedDate}</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/daily/${date}`} className="flex items-center gap-1.5">
              View Full Day
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleMediaClick = (type: string, slug: string) => {
    router.push(`/media/${type}/${slug}`);
  };

  const handleParkClick = (slug: string) => {
    router.push(`/parks/${slug}`);
  };

  const handleJournalClick = (slug: string) => {
    router.push(`/journals/${slug}`);
  };

  const handleRelationshipClick = () => {
    router.push("/relationship");
  };

  const handleEventUpdated = () => {
    // Call the parent's onDataChange callback to refresh the data
    onDataChange?.();
  };

  const handleCompleteActivity = (activity: WorkoutActivity) => {
    setCompletingActivity(activity);
    setIsCompleteModalOpen(true);
  };

  const handleActivityCompleted = () => {
    setIsCompleteModalOpen(false);
    setCompletingActivity(null);
    // Refresh calendar data
    onDataChange?.();
  };

  // Handler for toggling task completion
  const handleToggleTaskComplete = async (taskId: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });

      if (response.ok) {
        // Refresh calendar data
        onDataChange?.();
      } else {
        console.error("Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const hasMood = data?.mood !== null && data?.mood !== undefined;
  const hasMedia = (data?.media.length ?? 0) > 0;
  const hasTasks = (data?.tasks.length ?? 0) > 0;
  const hasEvents = (data?.events.length ?? 0) > 0;
  const hasParks = (data?.parks.length ?? 0) > 0;
  const hasJournals = (data?.journals.length ?? 0) > 0;
  const hasGithub = (data?.githubEvents.length ?? 0) > 0;
  const hasDuolingo = data?.duolingoCompleted ?? false;
  const hasRelationship = (data?.relationshipItems.length ?? 0) > 0;
  const hasVacations = (data?.vacations.length ?? 0) > 0;

  // Workout activities
  const upcomingWorkoutActivities = data?.workoutActivities.filter((w) => !w.completed) ?? [];
  const completedWorkoutActivities = data?.workoutActivities.filter((w) => w.completed) ?? [];
  const hasWorkoutActivities = upcomingWorkoutActivities.length > 0 || completedWorkoutActivities.length > 0;

  // Get IDs of Strava activities that are linked to completed workouts
  const linkedStravaActivityIds = new Set(
    completedWorkoutActivities
      .filter((w) => w.strava_activity_id)
      .map((w) => w.strava_activity_id!)
  );

  // Filter out Strava activities that are already linked to completed workouts
  const unlinkedStravaActivities = data?.activities.filter(
    (activity) => !linkedStravaActivityIds.has(activity.id)
  ) ?? [];

  const hasActivities = unlinkedStravaActivities.length > 0;

  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks || hasJournals || hasWorkoutActivities || hasGithub || hasDuolingo || hasRelationship || hasVacations;

  // Categorize tasks relative to the date being viewed
  const completedTasks = data?.tasks.filter((t) => t.completed) ?? [];
  const overdueTasks = data?.tasks.filter((t) => !t.completed && t.due_date && t.due_date.split("T")[0] < date) ?? [];
  const upcomingTasks = data?.tasks.filter((t) => !t.completed && t.due_date && t.due_date.split("T")[0] >= date) ?? [];

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="space-y-1.5">
            <CardTitle>{formattedDate}</CardTitle>
            <CardDescription>No data recorded for this day</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/daily/${date}`} className="flex items-center gap-1.5">
              View Full Day
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1.5">
          <CardTitle>{formattedDate}</CardTitle>
          <CardDescription>Summary of your day</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/daily/${date}`} className="flex items-center gap-1.5">
            View Full Day
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Section */}
        {hasMood && data.mood && (
          <DailyMood
            mood={data.mood}
            date={date}
            onMoodUpdated={onDataChange}
          />
        )}

        {/* Relationship Section */}
        {hasRelationship && data && (
          <DailyRelationship
            items={data.relationshipItems}
            onItemClick={handleRelationshipClick}
          />
        )}

        {/* Vacations Section */}
        {hasVacations && data && (
          <DailyVacations vacations={data.vacations} />
        )}

        {/* Events Section */}
        {hasEvents && data && (
          <DailyEvents
            events={data.events}
            onEventClick={handleEventClick}
          />
        )}

        {/* Workout Activities Section */}
        {hasWorkoutActivities && data && (
          <DailyWorkouts 
            upcoming={upcomingWorkoutActivities}
            completed={completedWorkoutActivities}
            stravaActivities={data.activities}
            onComplete={handleCompleteActivity}
          />
        )}

        {/* Strava Activities (not linked to workouts) Section */}
        {hasActivities && data && (
          <DailyStrava activities={unlinkedStravaActivities} />
        )}

        {/* GitHub Section */}
        {hasGithub && data && (
          <DailyGithub events={data.githubEvents} />
        )}

        {/* Duolingo Section */}
        {hasDuolingo && (
          <DailyDuolingo completed={true} />
        )}

        {/* Media Section */}
        {hasMedia && data && (
          <DailyMedia 
            media={data.media} 
            onMediaClick={handleMediaClick} 
          />
        )}

        {/* Parks Section */}
        {hasParks && data && (
          <DailyParks 
            parks={data.parks} 
            onParkClick={handleParkClick} 
          />
        )}

        {/* Journals Section */}
        {hasJournals && data && (
          <DailyJournals 
            journals={data.journals} 
            onJournalClick={handleJournalClick} 
          />
        )}

        {/* Tasks Section */}
        {hasTasks && data && (
          <DailyTasks 
            overdue={overdueTasks}
            upcoming={upcomingTasks}
            completed={completedTasks}
            onToggleComplete={handleToggleTaskComplete}
          />
        )}
      </CardContent>

      {/* Event Edit Dialog */}
      {selectedEvent && (
        <EventEditDialog
          event={selectedEvent}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {/* Complete Activity Modal */}
      <CompleteActivityModal
        activity={completingActivity}
        isOpen={isCompleteModalOpen}
        onOpenChange={setIsCompleteModalOpen}
        onActivityCompleted={handleActivityCompleted}
      />
    </Card>
  );
}
