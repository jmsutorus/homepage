"use client";

import { useRouter } from "next/navigation";
import type { CalendarDayData } from "@/lib/db/calendar";
import type { Event } from "@/lib/db/events";
import type { MediaContent } from "@/lib/db/media";
import type { ParkContent } from "@/lib/db/parks";
import type { JournalContent } from "@/lib/db/journals";
import type { Task } from "@/lib/db/tasks";
import { DailyEvents } from "@/components/widgets/daily/daily-events";
import { DailyWorkouts } from "@/components/widgets/daily/daily-workouts";
import { DailyStrava } from "@/components/widgets/daily/daily-strava";
import { DailyGithub } from "@/components/widgets/daily/daily-github";
import { DailyMedia } from "@/components/widgets/daily/daily-media";
import { DailyParks } from "@/components/widgets/daily/daily-parks";
import { DailyJournals } from "@/components/widgets/daily/daily-journals";
import { DailyTasks } from "@/components/widgets/daily/daily-tasks";
import { toggleTaskCompleteAction } from "@/lib/actions/tasks";
import { useTransition } from "react";

interface DailyActivitiesProps {
  dailyData: CalendarDayData | undefined;
  overdueTasks: Task[];
  upcomingTasks: Task[];
  completedTasks: Task[];
  unlinkedStravaActivities: any[];
  upcomingWorkoutActivities: any[];
  completedWorkoutActivities: any[];
}

export function DailyActivities({
  dailyData,
  overdueTasks,
  upcomingTasks,
  completedTasks,
  unlinkedStravaActivities,
  upcomingWorkoutActivities,
  completedWorkoutActivities,
}: DailyActivitiesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEventClick = (event: Event) => {
    // Could open an edit dialog or navigate to event detail
    console.log("Event clicked:", event);
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

  const handleToggleTaskComplete = async (taskId: number, completed: boolean) => {
    startTransition(async () => {
      try {
        await toggleTaskCompleteAction(taskId);
        router.refresh();
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    });
  };

  if (!dailyData) return null;

  return (
    <>
      {/* Events Section */}
      {dailyData.events.length > 0 && (
        <section className="rounded-lg border bg-card p-6">
          <DailyEvents events={dailyData.events} onEventClick={handleEventClick} />
        </section>
      )}

      {/* Workouts Section */}
      {(upcomingWorkoutActivities.length > 0 || completedWorkoutActivities.length > 0) && (
        <section className="rounded-lg border bg-card p-6">
          <DailyWorkouts 
            upcoming={upcomingWorkoutActivities}
            completed={completedWorkoutActivities}
            stravaActivities={dailyData.activities}
          />
        </section>
      )}

      {/* Strava Activities Section */}
      {unlinkedStravaActivities.length > 0 && (
        <section className="rounded-lg border bg-card p-6">
          <DailyStrava activities={unlinkedStravaActivities} />
        </section>
      )}

      {/* Tasks Section */}
      {dailyData.tasks.length > 0 && (
        <section className="rounded-lg border bg-card p-6">
          <DailyTasks 
            overdue={overdueTasks}
            upcoming={upcomingTasks}
            completed={completedTasks}
            onToggleComplete={handleToggleTaskComplete}
          />
        </section>
      )}

      {/* GitHub Section */}
      {dailyData.githubEvents.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <DailyGithub events={dailyData.githubEvents} />
        </section>
      )}

      {/* Media Section */}
      {dailyData.media.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <DailyMedia media={dailyData.media} onMediaClick={handleMediaClick} />
        </section>
      )}

      {/* Parks Section */}
      {dailyData.parks.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <DailyParks parks={dailyData.parks} onParkClick={handleParkClick} />
        </section>
      )}

      {/* Other Journals Section */}
      {dailyData.journals.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <DailyJournals journals={dailyData.journals} onJournalClick={handleJournalClick} />
        </section>
      )}
    </>
  );
}
