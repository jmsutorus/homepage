import { query } from "./index";
import type { MoodEntry } from "./mood";
import type { DBStravaActivity } from "./strava";
import type { MediaContent } from "./media";
import type { Task } from "./tasks";
import type { Event } from "./events";

export interface CalendarDayData {
  date: string; // YYYY-MM-DD format
  mood: MoodEntry | null;
  activities: DBStravaActivity[];
  media: MediaContent[];
  tasks: Task[];
  events: Event[];
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
 * Get all calendar data for a date range, grouped by day
 */
export function getCalendarDataForRange(
  startDate: string,
  endDate: string
): Map<string, CalendarDayData> {
  // Get all data
  const moods = query<MoodEntry>(
    `SELECT * FROM mood_entries WHERE date BETWEEN ? AND ?`,
    [startDate, endDate]
  );

  const activities = getActivitiesInRange(startDate, endDate);
  const media = getMediaCompletedInRange(startDate, endDate);
  const tasks = getTasksInRange(startDate, endDate);
  const events = getEventsInRange(startDate, endDate);

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

  return calendarMap;
}

/**
 * Get calendar data for a specific month
 */
export function getCalendarDataForMonth(
  year: number,
  month: number // 1-12
): Map<string, CalendarDayData> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return getCalendarDataForRange(startDate, endDate);
}
