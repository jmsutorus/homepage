import { query } from "./index";
import type { MoodEntry } from "./mood";
import type { DBStravaActivity } from "./strava";
import type { MediaContent } from "./media";
import type { Task } from "./tasks";
import { type Event, getEventsInRange as getEvents } from "./events";
import type { ParkContent } from "./parks";
import type { JournalContent } from "./journals";
import type { WorkoutActivity } from "./workout-activities";
import type { GithubEvent } from "@/lib/github";
import type { HabitCompletion } from "./habits";
import { getHabitCompletionsForRange } from "./habits";
import { auth } from "@/auth";
import { getDuolingoCompletionsForRange } from "./duolingo";
import type { RelationshipDate, IntimacyEntry, RelationshipMilestone } from "./relationship";

// Goal-related calendar types
export interface CalendarGoal {
  id: number;
  slug: string;
  title: string;
  status: string;
  target_date: string | null;
  completed_date: string | null;
  priority: string;
}

export interface CalendarMilestone {
  id: number;
  goalId: number;
  goalSlug: string;
  goalTitle: string;
  title: string;
  target_date: string | null;
  completed: boolean;
  completed_date: string | null;
}

// Relationship-related calendar types
export interface CalendarRelationshipItem {
  id: number;
  type: 'date' | 'intimacy' | 'milestone';
  date: string;
  title?: string;
  description?: string;
}

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
  duolingoCompleted: boolean;
  // Goals: goals with target_date on this day OR completed on this day
  goalsDue: CalendarGoal[];
  goalsCompleted: CalendarGoal[];
  // Milestones: milestones with target_date on this day OR completed on this day
  milestonesDue: CalendarMilestone[];
  milestonesCompleted: CalendarMilestone[];
  // Relationship: combined dates, intimacy, and milestones
  relationshipItems: CalendarRelationshipItem[];
}

/**
 * Lightweight summary data for calendar grid cells
 * Only contains counts and minimal display info for fast rendering
 */
export interface CalendarDaySummary {
  date: string;
  moodRating: number | null;
  activityCount: number;
  mediaCount: number;
  mediaFirstTitle: string | null;
  mediaFirstType: string | null;
  taskCounts: {
    completed: number;
    overdue: number;
    upcoming: number;
  };
  eventCount: number;
  eventFirstTitle: string | null;
  parkCount: number;
  parkFirstTitle: string | null;
  journalCount: number;
  journalFirstTitle: string | null;
  workoutCounts: {
    upcoming: number;
    completed: number;
    firstUpcomingTime: string | null;
    firstUpcomingType: string | null;
    firstCompletedName: string | null;
    firstCompletedDistance: number | null;
  };
  githubEventCount: number;
  duolingoCompleted: boolean;
  habitCount: number;
  // Goal counts
  goalCounts: {
    due: number;
    completed: number;
    firstDueTitle: string | null;
    firstDueSlug: string | null;
  };
  // Milestone counts
  milestoneCounts: {
    due: number;
    completed: number;
    firstDueTitle: string | null;
    firstDueGoalSlug: string | null;
  };
  // Relationship count
  relationshipCount: number;
}

/**
 * Get Strava activities in a date range (by start_date_local)
 */
export async function getActivitiesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<DBStravaActivity[]> {
  return await query<DBStravaActivity>(
    `SELECT * FROM strava_activities
     WHERE DATE(start_date_local) BETWEEN ? AND ?
     AND userId = ?
     ORDER BY start_date_local ASC`,
    [startDate, endDate, userId]
  );
}

/**
 * Get media completed in a date range
 */
export async function getMediaCompletedInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<MediaContent[]> {
  return await query<MediaContent>(
    `SELECT * FROM media_content
     WHERE completed BETWEEN ? AND ?
     AND userId = ?
     ORDER BY completed ASC`,
    [startDate, endDate, userId]
  );
}

/**
 * Get tasks with due date or completion in a date range
 * Returns all tasks due in range, completed in range, or incomplete tasks in the range
 */
export async function getTasksInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<Task[]> {
  const sql = `SELECT DISTINCT * FROM tasks
     WHERE (
       (due_date BETWEEN ? AND ?)
       OR (completed = 1 AND completed_date BETWEEN ? AND ?)
       OR (completed = 0 AND due_date BETWEEN ? AND ?)
     )
     AND userId = ?
     ORDER BY due_date ASC NULLS LAST`;

  const params: (string | number)[] = [
    startDate, endDate,           // Tasks due in range
    startDate, endDate,           // Completed tasks in range
    startDate, endDate,           // Incomplete tasks in range
    userId
  ];

  const result = await query<Task>(sql, params);

  return result;
}

/**
 * Get events in a date range (including multi-day events that overlap)
 */
export async function getEventsInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<Event[]> {
  // Import from events module
  return getEvents(startDate, endDate, userId);
}

/**
 * Get parks visited in a date range
 */
export async function getParksVisitedInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<ParkContent[]> {
  return await query<ParkContent>(
    `SELECT * FROM parks
     WHERE visited BETWEEN ? AND ?
     AND userId = ?
     ORDER BY visited ASC`,
    [startDate, endDate, userId]
  );
}

/**
 * Get journals in a date range
 * - Daily journals by daily_date
 * - General journals by created_at date
 */
export async function getJournalsInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<JournalContent[]> {
  interface RawJournal {
    id: number;
    userId: string;
    slug: string;
    title: string;
    content: string;
    journal_type: "daily" | "general";
    daily_date: string | null;
    created_at: string;
    updated_at: string;
    tags: string | null;
    featured: number;
    published: number;
    mood: number | null;
  }

  // Need to parse tags from JSON and convert featured/published from number to boolean
  const rawJournals = await query<RawJournal>(
    `SELECT * FROM journals
     WHERE ((journal_type = 'daily' AND daily_date BETWEEN ? AND ?)
        OR (journal_type = 'general' AND DATE(created_at) BETWEEN ? AND ?))
     AND userId = ?
     ORDER BY
       CASE
         WHEN journal_type = 'daily' THEN daily_date
         ELSE DATE(created_at)
       END ASC`,
    [startDate, endDate, startDate, endDate, userId]
  );

  return rawJournals.map((journal) => ({
    ...journal,
    tags: journal.tags ? JSON.parse(journal.tags) : [],
    featured: journal.featured === 1,
    published: journal.published === 1,
  }));
}

/**
 * Get workout activities in a date range
 */
export async function getWorkoutActivitiesInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<WorkoutActivity[]> {
  return await query<WorkoutActivity>(
    `SELECT * FROM workout_activities
     WHERE date BETWEEN ? AND ?
     AND userId = ?
     ORDER BY date ASC, time ASC`,
    [startDate, endDate, userId]
  );
}

/**
 * Get relationship items (dates, intimacy entries, milestones) in a date range
 * Returns a unified list of relationship activities
 */
export async function getRelationshipItemsInRange(
  startDate: string,
  endDate: string,
  userId: string
): Promise<CalendarRelationshipItem[]> {
  const [dates, intimacyEntries, milestones] = await Promise.all([
    query<RelationshipDate>(
      `SELECT * FROM relationship_dates
       WHERE date BETWEEN ? AND ?
       AND userId = ?
       ORDER BY date ASC`,
      [startDate, endDate, userId]
    ),
    query<IntimacyEntry>(
      `SELECT * FROM intimacy_entries
       WHERE date BETWEEN ? AND ?
       AND userId = ?
       ORDER BY date ASC`,
      [startDate, endDate, userId]
    ),
    query<RelationshipMilestone>(
      `SELECT * FROM relationship_milestones
       WHERE date BETWEEN ? AND ?
       AND userId = ?
       ORDER BY date ASC`,
      [startDate, endDate, userId]
    ),
  ]);

  const items: CalendarRelationshipItem[] = [
    ...dates.map(d => ({
      id: d.id,
      type: 'date' as const,
      date: d.date,
      title: d.venue || d.location || 'Date',
      description: d.notes || undefined,
    })),
    ...intimacyEntries.map(e => ({
      id: e.id,
      type: 'intimacy' as const,
      date: e.date,
      title: 'Intimacy',
      description: undefined,
    })),
    ...milestones.map(m => ({
      id: m.id,
      type: 'milestone' as const,
      date: m.date,
      title: m.title,
      description: m.description || undefined,
    })),
  ];

  return items;
}

/**
 * Get goals in a date range (by target_date or completed_date)
 */
export async function getGoalsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarGoal[]> {
  const rows = await query<{
    id: number;
    slug: string;
    title: string;
    status: string;
    target_date: string | null;
    completed_date: string | null;
    priority: string;
  }>(
    `SELECT id, slug, title, status, target_date, completed_date, priority FROM goals
     WHERE userId = ?
       AND status NOT IN ('archived', 'abandoned')
       AND (
         (DATE(target_date) BETWEEN ? AND ?)
         OR (DATE(completed_date) BETWEEN ? AND ?)
       )
     ORDER BY target_date ASC`,
    [userId, startDate, endDate, startDate, endDate]
  );
  return rows;
}

/**
 * Get milestones in a date range (by target_date or completed_date)
 * Includes goal info for navigation
 */
export async function getMilestonesInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarMilestone[]> {
  const rows = await query<{
    id: number;
    goalId: number;
    goalSlug: string;
    goalTitle: string;
    title: string;
    target_date: string | null;
    completed: number;
    completed_date: string | null;
  }>(
    `SELECT m.id, m.goalId, g.slug as goalSlug, g.title as goalTitle,
            m.title, m.target_date, m.completed, m.completed_date
     FROM goal_milestones m
     JOIN goals g ON m.goalId = g.id
     WHERE g.userId = ?
       AND g.status NOT IN ('archived', 'abandoned')
       AND (
         (DATE(m.target_date) BETWEEN ? AND ?)
         OR (DATE(m.completed_date) BETWEEN ? AND ?)
       )
     ORDER BY m.target_date ASC`,
    [userId, startDate, endDate, startDate, endDate]
  );
  return rows.map(row => ({
    ...row,
    completed: row.completed === 1,
  }));
}

/**
 * Get upcoming goals (incomplete with target_date in range)
 */
export async function getUpcomingGoals(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarGoal[]> {
  const rows = await query<{
    id: number;
    slug: string;
    title: string;
    status: string;
    target_date: string | null;
    completed_date: string | null;
    priority: string;
  }>(
    `SELECT id, slug, title, status, target_date, completed_date, priority FROM goals
     WHERE userId = ?
       AND status NOT IN ('completed', 'archived', 'abandoned')
       AND DATE(target_date) BETWEEN ? AND ?
     ORDER BY target_date ASC`,
    [userId, startDate, endDate]
  );
  return rows;
}

/**
 * Get upcoming milestones (incomplete with target_date in range)
 */
export async function getUpcomingMilestones(
  userId: string,
  startDate: string,
  endDate: string
): Promise<CalendarMilestone[]> {
  const rows = await query<{
    id: number;
    goalId: number;
    goalSlug: string;
    goalTitle: string;
    title: string;
    target_date: string | null;
    completed: number;
    completed_date: string | null;
  }>(
    `SELECT m.id, m.goalId, g.slug as goalSlug, g.title as goalTitle,
            m.title, m.target_date, m.completed, m.completed_date
     FROM goal_milestones m
     JOIN goals g ON m.goalId = g.id
     WHERE g.userId = ?
       AND g.status NOT IN ('archived', 'abandoned')
       AND m.completed = 0
       AND DATE(m.target_date) BETWEEN ? AND ?
     ORDER BY m.target_date ASC`,
    [userId, startDate, endDate]
  );
  return rows.map(row => ({
    ...row,
    completed: false,
  }));
}

/**
 * Get goals completed on a specific date
 */
export async function getGoalsCompletedOnDate(
  userId: string,
  date: string
): Promise<CalendarGoal[]> {
  const rows = await query<{
    id: number;
    slug: string;
    title: string;
    status: string;
    target_date: string | null;
    completed_date: string | null;
    priority: string;
  }>(
    `SELECT id, slug, title, status, target_date, completed_date, priority FROM goals
     WHERE userId = ?
       AND status = 'completed'
       AND DATE(completed_date) = ?
     ORDER BY completed_date ASC`,
    [userId, date]
  );
  return rows;
}

/**
 * Get milestones completed on a specific date
 */
export async function getMilestonesCompletedOnDate(
  userId: string,
  date: string
): Promise<CalendarMilestone[]> {
  const rows = await query<{
    id: number;
    goalId: number;
    goalSlug: string;
    goalTitle: string;
    title: string;
    target_date: string | null;
    completed: number;
    completed_date: string | null;
  }>(
    `SELECT m.id, m.goalId, g.slug as goalSlug, g.title as goalTitle,
            m.title, m.target_date, m.completed, m.completed_date
     FROM goal_milestones m
     JOIN goals g ON m.goalId = g.id
     WHERE g.userId = ?
       AND m.completed = 1
       AND DATE(m.completed_date) = ?
     ORDER BY m.completed_date ASC`,
    [userId, date]
  );
  return rows.map(row => ({
    ...row,
    completed: true,
  }));
}

/**
 * Get all calendar data for a date range, grouped by day
 */
/**
 * Get all calendar data for a date range, grouped by day
 */
export async function getCalendarDataForRange(
  startDate: string,
  endDate: string,
  githubEvents: GithubEvent[] | Promise<GithubEvent[]> = []
): Promise<Map<string, CalendarDayData>> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    // Return empty map if no user is logged in
    return new Map<string, CalendarDayData>();
  }

  // Get all data
  const moods = await query<MoodEntry>(
    `SELECT * FROM mood_entries WHERE date BETWEEN ? AND ? AND userId = ?`,
    [startDate, endDate, userId]
  );

  const [
    activities,
    media,
    tasks,
    events,
    parks,
    journals,
    workoutActivities,
    habitCompletions,
    goals,
    milestones,
    resolvedGithubEvents,
    duolingoCompletions,
    relationshipItems
  ] = await Promise.all([
    getActivitiesInRange(startDate, endDate, userId),
    getMediaCompletedInRange(startDate, endDate, userId),
    getTasksInRange(startDate, endDate, userId),
    getEventsInRange(startDate, endDate, userId),
    getParksVisitedInRange(startDate, endDate, userId),
    getJournalsInRange(startDate, endDate, userId),
    getWorkoutActivitiesInRange(startDate, endDate, userId),
    getHabitCompletionsForRange(userId, startDate, endDate),
    getGoalsInRange(userId, startDate, endDate),
    getMilestonesInRange(userId, startDate, endDate),
    Promise.resolve(githubEvents),
    getDuolingoCompletionsForRange(userId, startDate, endDate),
    getRelationshipItemsInRange(startDate, endDate, userId)
  ]);

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
      duolingoCompleted: false,
      goalsDue: [],
      goalsCompleted: [],
      milestonesDue: [],
      milestonesCompleted: [],
      relationshipItems: [],
    });
  }

  // Create a set of dates with Duolingo completions for quick lookup
  const duolingoCompletedDates = new Set(duolingoCompletions.map(c => c.date));

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
    if (task.due_date && task.due_date.trim() !== "") {
      // Extract date portion (YYYY-MM-DD) from due_date
      const dueDateStr = task.due_date.split("T")[0];
      const dayData = calendarMap.get(dueDateStr);
      if (dayData) {
        dayData.tasks.push(task);
      }
    }
    // Also add completed tasks to the day they were completed
    if (task.completed && task.completed_date && task.completed_date.trim() !== "") {
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
  resolvedGithubEvents.forEach((event) => {
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

  // Set Duolingo completion status for each day
  calendarMap.forEach((dayData) => {
    dayData.duolingoCompleted = duolingoCompletedDates.has(dayData.date);
  });

  // Add goals (by target_date and completed_date)
  goals.forEach((goal) => {
    // Add to due date day
    if (goal.target_date) {
      const targetDateStr = goal.target_date.split("T")[0];
      const dayData = calendarMap.get(targetDateStr);
      if (dayData) {
        dayData.goalsDue.push(goal);
      }
    }
    // Add to completed date day
    if (goal.completed_date && goal.status === 'completed') {
      const completedDateStr = goal.completed_date.split("T")[0];
      const dayData = calendarMap.get(completedDateStr);
      if (dayData) {
        dayData.goalsCompleted.push(goal);
      }
    }
  });

  // Add milestones (by target_date and completed_date)
  milestones.forEach((milestone) => {
    // Add to due date day
    if (milestone.target_date) {
      const targetDateStr = milestone.target_date.split("T")[0];
      const dayData = calendarMap.get(targetDateStr);
      if (dayData) {
        dayData.milestonesDue.push(milestone);
      }
    }
    // Add to completed date day
    if (milestone.completed && milestone.completed_date) {
      const completedDateStr = milestone.completed_date.split("T")[0];
      const dayData = calendarMap.get(completedDateStr);
      if (dayData) {
        dayData.milestonesCompleted.push(milestone);
      }
    }
  });

  // Add relationship items
  relationshipItems.forEach((item) => {
    const dayData = calendarMap.get(item.date);
    if (dayData) {
      dayData.relationshipItems.push(item);
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
  githubEvents: GithubEvent[] | Promise<GithubEvent[]> = []
): Promise<Map<string, CalendarDayData>> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return getCalendarDataForRange(startDate, endDate, githubEvents);
}

/**
 * Get calendar data for a specific date
 */
export async function getCalendarDataForDate(
  date: string,
  githubEvents: GithubEvent[] | Promise<GithubEvent[]> = []
): Promise<CalendarDayData | undefined> {
  const tomorrowDate = new Date(date);
  tomorrowDate.setDate(tomorrowDate.getDate() + 2);
  const tomorrowDateFromDateString = tomorrowDate.toISOString().split("T")[0];
  const map = await getCalendarDataForRange(date, tomorrowDateFromDateString, githubEvents);
  return map.get(date);
}

/**
 * Convert full CalendarDayData to lightweight CalendarDaySummary
 */
export function convertToSummary(
  data: CalendarDayData,
  today: string
): CalendarDaySummary {
  // Get IDs of Strava activities linked to completed workouts
  const completedWorkouts = data.workoutActivities.filter((w) => w.completed);
  const upcomingWorkouts = data.workoutActivities.filter((w) => !w.completed);
  const linkedStravaIds = new Set(
    completedWorkouts
      .filter((w) => w.strava_activity_id)
      .map((w) => w.strava_activity_id!)
  );

  // Filter out linked Strava activities
  const unlinkedActivities = data.activities.filter(
    (a) => !linkedStravaIds.has(a.id)
  );

  // Get first completed workout's linked Strava activity
  let firstCompletedName: string | null = null;
  let firstCompletedDistance: number | null = null;
  if (completedWorkouts.length > 0) {
    const firstWorkout = completedWorkouts[0];
    if (firstWorkout.strava_activity_id) {
      const linkedStrava = data.activities.find(
        (a) => a.id === firstWorkout.strava_activity_id
      );
      if (linkedStrava) {
        firstCompletedName = linkedStrava.name;
        firstCompletedDistance = linkedStrava.distance || null;
      }
    }
  }

  // Categorize tasks relative to today
  const completedTasks = data.tasks.filter((t) => t.completed);
  const overdueTasks = data.tasks.filter(
    (t) => !t.completed && t.due_date && t.due_date.split("T")[0] < today
  );
  const upcomingTasks = data.tasks.filter(
    (t) => !t.completed && t.due_date && t.due_date.split("T")[0] >= today
  );

  return {
    date: data.date,
    moodRating: data.mood?.rating ?? null,
    activityCount: unlinkedActivities.length,
    mediaCount: data.media.length,
    mediaFirstTitle: data.media[0]?.title ?? null,
    mediaFirstType: data.media[0]?.type ?? null,
    taskCounts: {
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      upcoming: upcomingTasks.length,
    },
    eventCount: data.events.length,
    eventFirstTitle: data.events[0]?.title ?? null,
    parkCount: data.parks.length,
    parkFirstTitle: data.parks[0]?.title ?? null,
    journalCount: data.journals.length,
    journalFirstTitle: data.journals[0]?.title ?? null,
    workoutCounts: {
      upcoming: upcomingWorkouts.length,
      completed: completedWorkouts.length,
      firstUpcomingTime: upcomingWorkouts[0]?.time ?? null,
      firstUpcomingType: upcomingWorkouts[0]?.type ?? null,
      firstCompletedName,
      firstCompletedDistance,
    },
    githubEventCount: data.githubEvents.length,
    duolingoCompleted: data.duolingoCompleted,
    habitCount: data.habitCompletions.length,
    goalCounts: {
      due: data.goalsDue.length,
      completed: data.goalsCompleted.length,
      firstDueTitle: data.goalsDue[0]?.title ?? null,
      firstDueSlug: data.goalsDue[0]?.slug ?? null,
    },
    milestoneCounts: {
      due: data.milestonesDue.length,
      completed: data.milestonesCompleted.length,
      firstDueTitle: data.milestonesDue[0]?.title ?? null,
      firstDueGoalSlug: data.milestonesDue[0]?.goalSlug ?? null,
    },
    relationshipCount: data.relationshipItems.length,
  };
}

/**
 * Get lightweight summary data for a month (optimized for calendar grid rendering)
 */
export async function getCalendarSummaryForMonth(
  year: number,
  month: number,
  githubEvents: GithubEvent[] | Promise<GithubEvent[]> = []
): Promise<Map<string, CalendarDaySummary>> {
  const fullData = await getCalendarDataForMonth(year, month, githubEvents);
  const today = new Date().toISOString().split("T")[0];

  const summaryMap = new Map<string, CalendarDaySummary>();

  fullData.forEach((data, date) => {
    summaryMap.set(date, convertToSummary(data, today));
  });

  return summaryMap;
}

