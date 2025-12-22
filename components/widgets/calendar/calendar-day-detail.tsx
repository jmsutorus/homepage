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
import { DailyBirthday } from "../daily/daily-birthday";
import { DailyPeopleBirthdays } from "../daily/daily-people-birthdays";
import { ExternalLink, Star, Loader2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CalendarDayDetailProps {
  date: string;
  data?: CalendarDayData | null;
  isLoading?: boolean;
  error?: string | null;
  holidayName?: string | null;
  isBirthday?: boolean;
  onDataChange?: () => void;
}



export function CalendarDayDetail({ date, data, isLoading, error, holidayName, isBirthday, onDataChange }: CalendarDayDetailProps) {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [completingActivity, setCompletingActivity] = useState<WorkoutActivity | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCreatingHolidayEvent, setIsCreatingHolidayEvent] = useState(false);

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
    router.push(`/events/${event.slug}`);
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

  // Find existing holiday event (matches "${holidayName} ${year}" format)
  const year = date.split('-')[0];
  const expectedHolidayEventTitle = holidayName ? `${holidayName} ${year}` : null;
  const existingHolidayEvent = expectedHolidayEventTitle
    ? data?.events.find((e) => e.title === expectedHolidayEventTitle)
    : null;

  // Filter out holiday event from regular events display
  const nonHolidayEvents = existingHolidayEvent
    ? data?.events.filter((e) => e.id !== existingHolidayEvent.id) ?? []
    : data?.events ?? [];
  const hasNonHolidayEvents = nonHolidayEvents.length > 0;

  // People events (birthdays and anniversaries)
  const hasPeopleEvents = (data?.peopleEvents.length ?? 0) > 0;

  const hasAnyData = hasMood || hasActivities || hasMedia || hasTasks || hasEvents || hasParks || hasJournals || hasWorkoutActivities || hasGithub || hasDuolingo || hasRelationship || hasVacations || !!holidayName || isBirthday || hasPeopleEvents;

  // Handler to create an event from a holiday
  const handleCreateHolidayEvent = async () => {
    if (!holidayName) return;
    
    setIsCreatingHolidayEvent(true);
    try {
      const year = date.split('-')[0];
      const eventTitle = `${holidayName} ${year}`;
      const slug = eventTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          date: date,
          all_day: true,
          category: 'Holiday',
          slug: slug,
        }),
      });
      
      if (response.ok) {
        const createdEvent = await response.json();
        router.push(`/events/${createdEvent.slug}`);
      } else {
        console.error('Failed to create holiday event');
      }
    } catch (error) {
      console.error('Error creating holiday event:', error);
    } finally {
      setIsCreatingHolidayEvent(false);
    }
  };

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
        {/* Holiday Section */}
        {holidayName && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">{holidayName}</p>
                <p className="text-sm text-muted-foreground">Federal Holiday</p>
              </div>
            </div>
            {existingHolidayEvent ? (
              <Button
                size="sm"
                variant="outline"
                asChild
                className="border-amber-500/30 hover:bg-amber-500/10"
              >
                <Link href={`/events/${existingHolidayEvent.slug}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Event
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateHolidayEvent}
                disabled={isCreatingHolidayEvent}
                className="border-amber-500/30 hover:bg-amber-500/10"
              >
                {isCreatingHolidayEvent ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Event
              </Button>
            )}
          </div>
        )}

        {/* Mood Section */}
        {hasMood && data.mood && (
          <DailyMood
            mood={data.mood}
            date={date}
            onMoodUpdated={onDataChange}
          />
        )}

        {/* Birthday Section */}
        {isBirthday && <DailyBirthday />}

        {/* People Birthdays and Anniversaries */}
        {hasPeopleEvents && data && (
          <DailyPeopleBirthdays events={data.peopleEvents} />
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
        {hasNonHolidayEvents && data && (
          <DailyEvents
            events={nonHolidayEvents}
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
