import { query } from "./index";
import type { MoodEntry } from "./mood";
import type { DBStravaActivity } from "./strava";
import type { MediaContent } from "./media";
import type { Task } from "./tasks";
import type { Event } from "./events";
import type { ParkContent } from "./parks";
import type { JournalContent } from "./journals";
import type { WorkoutActivity } from "./workout-activities";
import type { GithubEvent } from "@/lib/github";
import type { HabitCompletion } from "./habits";
import { getHabitCompletionsForRange } from "./habits";
import { auth } from "@/auth";

export interface CalendarDayData {
  date: string; // YYYY-MM-DD format
  mood: MoodEntry | null;
  activities: DBStravaActivity[];
  media: MediaContent[];
  tasks: Task[];
  events: Event[];
  parks: ParkContent[];
  journals: JournalContent[];
  workoutActivities: WorkoutActivity[];
  githubEvents: GithubEvent[];
  habitCompletions: HabitCompletion[];
}

/**
 * Get Strava activities in a date range (by start_date_local)
 */
export function getActivitiesInRange(
  startDate: string,
  endDate: string
): DBStravaActivity[] {
  return query<DBStravaActivity>(
    `SELECT * FROM strava_activities
     WHERE DATE(start_date_local) BETWEEN ? AND ?
     ORDER BY start_date_local ASC`,
    [startDate, endDate]
  );
}

/**
 * Get media completed in a date range
 */
export function getMediaCompletedInRange(
  startDate: string,
  endDate: string
): MediaContent[] {
  return query<MediaContent>(
    `SELECT * FROM media_content
     WHERE completed BETWEEN ? AND ?
     ORDER BY completed ASC`,
    [startDate, endDate]
  );
}

/**
 * Get tasks with due date or completion in a date range
 */
export function getTasksInRange(
  startDate: string,
  endDate: string
): Task[] {
  return query<Task>(
    `SELECT * FROM tasks
     WHERE (due_date BETWEEN ? AND ?)
        OR (completed = 1 AND completed_date BETWEEN ? AND ?)
     ORDER BY due_date ASC NULLS LAST`,
    [startDate, endDate, startDate, endDate]
  );
}

/**
 * Get events in a date range (including multi-day events that overlap)
 */
export function getEventsInRange(
  startDate: string,
  endDate: string
): Event[] {
  // Import from events module
  const { getEventsInRange: getEvents } = require("./events");
  return getEvents(startDate, endDate);
}

/**
 * Get parks visited in a date range
 */
export function getParksVisitedInRange(
  startDate: string,
  endDate: string
): ParkContent[] {
  return query<ParkContent>(
    `SELECT * FROM parks
     WHERE visited BETWEEN ? AND ?
     ORDER BY visited ASC`,
    [startDate, endDate]
  );
}

/**
 * Get journals in a date range
 * - Daily journals by daily_date
 * - General journals by created_at date
 */
export function getJournalsInRange(
  startDate: string,
  endDate: string
): JournalContent[] {
  // Need to parse tags from JSON and convert featured/published from number to boolean
  const rawJournals = query<any>(
    `SELECT * FROM journals
     WHERE (journal_type = 'daily' AND daily_date BETWEEN ? AND ?)
        OR (journal_type = 'general' AND DATE(created_at) BETWEEN ? AND ?)
     ORDER BY
       CASE
         WHEN journal_type = 'daily' THEN daily_date
         ELSE DATE(created_at)
       END ASC`,
    [startDate, endDate, startDate, endDate]
  );

  return rawJournals.map((journal: any) => ({
    ...journal,
    tags: journal.tags ? JSON.parse(journal.tags) : [],
    featured: journal.featured === 1,
    published: journal.published === 1,
  }));
}

/**
 * Get workout activities in a date range
 */
export function getWorkoutActivitiesInRange(
  startDate: string,
  endDate: string
): WorkoutActivity[] {
  return query<WorkoutActivity>(
    `SELECT * FROM workout_activities
     WHERE date BETWEEN ? AND ?
     ORDER BY date ASC, time ASC`,
    [startDate, endDate]
  );
}

/**
 * Get all calendar data for a date range, grouped by day
 */
export async function getCalendarDataForRange(
  startDate: string,
  endDate: string,
  githubEvents: GithubEvent[] = []
): Promise<Map<string, CalendarDayData>> {
  const session = await auth();
  const userId = session?.user?.id;

  // Get all data
  const moods = query<MoodEntry>(
    `SELECT * FROM mood_entries WHERE date BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  const activities = getActivitiesInRange(startDate, endDate);
  const media = getMediaCompletedInRange(startDate, endDate);
  const tasks = getTasksInRange(startDate, endDate);
  const events = getEventsInRange(startDate, endDate);
  const parks = getParksVisitedInRange(startDate, endDate);
  const journals = getJournalsInRange(startDate, endDate);
  const workoutActivities = getWorkoutActivitiesInRange(startDate, endDate);
  const habitCompletions = userId ? getHabitCompletionsForRange(userId, startDate, endDate) : [];

  // Create a map of date -> data
  const calendarMap = new Map<string, CalendarDayData>();

  // Initialize all dates in range with empty data
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    calendarMap.set(dateStr, {
      date: dateStr,
      mood: null,
      activities: [],
      media: [],
      tasks: [],
      events: [],
      parks: [],
      journals: [],
      workoutActivities: [],
      githubEvents: [],
      habitCompletions: [],
    });
  }

  // Add moods
  moods.forEach((mood) => {
    const dayData = calendarMap.get(mood.date);
    if (dayData) {
      dayData.mood = mood;
    }
  });

  // Add activities (extract date from start_date_local)
  activities.forEach((activity) => {
    const dateStr = activity.start_date_local.split("T")[0];
    const dayData = calendarMap.get(dateStr);
    if (dayData) {
      dayData.activities.push(activity);
    }
  });

  // Add media (by completed date)
  media.forEach((item) => {
    if (item.completed) {
      const dayData = calendarMap.get(item.completed);
      if (dayData) {
        dayData.media.push(item);
      }
    }
  });

  // Add tasks (by due_date or completion date)
  tasks.forEach((task) => {
    if (task.due_date) {
      // Extract date portion (YYYY-MM-DD) from due_date
      const dueDateStr = task.due_date.split("T")[0];
      const dayData = calendarMap.get(dueDateStr);
      if (dayData) {
        dayData.tasks.push(task);
      }
    }
    // Also add completed tasks to the day they were completed
    if (task.completed && task.completed_date) {
      // Extract date portion (YYYY-MM-DD) from completed_date
      const completedDateStr = task.completed_date.split("T")[0];
      const dayData = calendarMap.get(completedDateStr);
      if (dayData && !dayData.tasks.includes(task)) {
        dayData.tasks.push(task);
      }
    }
  });

  // Add events (including multi-day events to all days they span)
  events.forEach((event) => {
    // Single-day event
    if (!event.end_date) {
      const dayData = calendarMap.get(event.date);
      if (dayData) {
        dayData.events.push(event);
      }
    } else {
      // Multi-day event - add to all days between start and end date
      const eventStart = new Date(event.date);
      const eventEnd = new Date(event.end_date);

      for (let d = new Date(eventStart); d <= eventEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const dayData = calendarMap.get(dateStr);
        if (dayData) {
          dayData.events.push(event);
        }
      }
    }
  });

  // Add parks (by visited date)
  parks.forEach((park) => {
    if (park.visited) {
      const dayData = calendarMap.get(park.visited);
      if (dayData) {
        dayData.parks.push(park);
      }
    }
  });

  // Add journals
  journals.forEach((journal) => {
    let dateStr: string | null = null;

    if (journal.journal_type === 'daily' && journal.daily_date) {
      // Daily journals use daily_date
      dateStr = journal.daily_date;
    } else if (journal.journal_type === 'general' && journal.created_at) {
      // General journals use created_at date
      // Handle both ISO format (YYYY-MM-DDTHH:MM:SS) and SQLite TIMESTAMP (YYYY-MM-DD HH:MM:SS)
      dateStr = journal.created_at.split('T')[0].split(' ')[0];
    }

    if (dateStr) {
      const dayData = calendarMap.get(dateStr);
      if (dayData) {
        dayData.journals.push(journal);
      }
    }
  });

  // Add workout activities (by date)
  workoutActivities.forEach((workoutActivity) => {
    const dayData = calendarMap.get(workoutActivity.date);
    if (dayData) {
      dayData.workoutActivities.push(workoutActivity);
    }
  });

  // Add GitHub events
  githubEvents.forEach((event) => {
    if (event.created_at) {
      const dateStr = event.created_at.split("T")[0];
      const dayData = calendarMap.get(dateStr);
      if (dayData) {
        dayData.githubEvents.push(event);
      }
    }
  });

  // Add habit completions
  habitCompletions.forEach((completion) => {
    const dayData = calendarMap.get(completion.date);
    if (dayData) {
      dayData.habitCompletions.push(completion);
    }
  });

  return calendarMap;
}

/**
 * Get calendar data for a specific month
 */
export async function getCalendarDataForMonth(
  year: number,
  month: number, // 1-12
  githubEvents: GithubEvent[] = []
): Promise<Map<string, CalendarDayData>> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return getCalendarDataForRange(startDate, endDate, githubEvents);
}
