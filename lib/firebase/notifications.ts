import { adminDb } from "./admin";
import { Timestamp } from "firebase-admin/firestore";
import { type Event } from "../db/events";
import { type Task } from "../db/tasks";
import { type Booking, type ItineraryDay, type Vacation } from "../types/vacations";



interface NotificationDocument {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  imageUrl?: string;
  clickAction?: string;
  data?: Record<string, string>;
  sourceType: 'event' | 'achievement' | 'goal' | 'vacation' | 'booking' | 'task' | 'habit' | 'custom' | 'vacation_followup' | 'workout' | 'milestone';

  sourceId?: string | number;
  scheduledAt: Timestamp;
  status: 'pending' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

function parseLocalDate(dateStr: string, timeStr: string = "00:00", offset: string = "+00:00"): Date {
  const [year, month, day] = dateStr.split("-");
  const [hours, minutes] = timeStr.split(":");
  const isoString = `${year}-${month}-${day}T${hours}:${minutes}:00.000${offset}`;
  return new Date(isoString);
}

/**
 * Creates one or more Firestore notification documents for an event
 */
export async function scheduleEventNotifications(event: Event, userId: string, timezoneOffset: string = "+00:00"): Promise<void> {
  try {
    const notificationsToSchedule: Omit<NotificationDocument, 'id'>[] = [];
    const now = new Date();
    
    console.log(`[notifications.ts] scheduleEventNotifications for event:`, event.id, "all_day:", event.all_day, "notification_setting:", event.notification_setting, "timezoneOffset:", timezoneOffset);

    // If setting is explicitly 'none', do not schedule any notifications
    if (event.notification_setting === 'none') {
      console.log(`[notifications.ts] notifications disabled for event ${event.id}`);
      return;
    }

    // Determine the setting to use: if null/empty, use the default
    const setting = event.notification_setting || (event.all_day ? 'day_of' : '1_hour_before');

    let scheduledAtDate: Date | null = null;
    let notificationTitle = event.title;
    let notificationBody = event.description || "Event notification";

    // Calculate scheduled date and format the message
    if (setting.includes("T")) {
      // Custom date-time ISO string
      try {
        // Strip 'Z' if present and apply the user's local timezone offset
        const cleanSetting = setting.replace('Z', '');
        scheduledAtDate = new Date(`${cleanSetting}${timezoneOffset}`);
      } catch {
        scheduledAtDate = null;
      }
    } else {
      const eventTime = event.start_time || "00:00";
      const baseDate = parseLocalDate(event.date, eventTime, timezoneOffset);

      if (event.all_day) {
        const [year, month, day] = event.date.split("-").map(Number);
        const dayOfDate = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T08:00:00.000${timezoneOffset}`);

        switch (setting) {
          case 'day_of':
            scheduledAtDate = dayOfDate;
            notificationTitle = `Today: ${event.title}`;
            notificationBody = event.description || "All-day event today";
            break;
          case 'day_before':
            const dayBefore = new Date(dayOfDate);
            dayBefore.setDate(dayBefore.getDate() - 1);
            scheduledAtDate = dayBefore;
            notificationTitle = `Tomorrow: ${event.title}`;
            notificationBody = event.description || "All-day event tomorrow";
            break;
          case '1_hour_before':
            const hourBefore = new Date(dayOfDate);
            hourBefore.setHours(hourBefore.getHours() - 1);
            scheduledAtDate = hourBefore;
            notificationBody = `Starts in 1 hour`;
            break;
          case '15_minutes_before':
            const minsBefore = new Date(dayOfDate);
            minsBefore.setMinutes(minsBefore.getMinutes() - 15);
            scheduledAtDate = minsBefore;
            notificationBody = `Starts in 15 minutes`;
            break;
          default:
            scheduledAtDate = dayOfDate;
            notificationTitle = `Today: ${event.title}`;
            notificationBody = event.description || "All-day event today";
        }
      } else {
        switch (setting) {
          case 'day_of':
            scheduledAtDate = baseDate;
            notificationBody = `Starts now (at ${eventTime})`;
            break;
          case 'day_before':
            const dayBefore = new Date(baseDate);
            dayBefore.setDate(dayBefore.getDate() - 1);
            scheduledAtDate = dayBefore;
            notificationTitle = `Tomorrow: ${event.title}`;
            notificationBody = `Starts at ${eventTime}`;
            break;
          case '1_hour_before':
            const hourBefore = new Date(baseDate);
            hourBefore.setHours(hourBefore.getHours() - 1);
            scheduledAtDate = hourBefore;
            notificationBody = `Starts in 1 hour (at ${eventTime})`;
            break;
          case '15_minutes_before':
            const minsBefore = new Date(baseDate);
            minsBefore.setMinutes(minsBefore.getMinutes() - 15);
            scheduledAtDate = minsBefore;
            notificationBody = `Starts in 15 minutes (at ${eventTime})`;
            break;
          default:
            const defHourBefore = new Date(baseDate);
            defHourBefore.setHours(defHourBefore.getHours() - 1);
            scheduledAtDate = defHourBefore;
            notificationBody = `Starts in 1 hour (at ${eventTime})`;
        }
      }
    }

    if (scheduledAtDate && scheduledAtDate > now) {
      notificationsToSchedule.push({
        userId,
        title: notificationTitle,
        body: notificationBody,
        sourceType: 'event',
        sourceId: event.id,
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        status: 'pending',
        clickAction: `/events/${event.slug}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // Add follow-up notification (1 day after start or end date) to remind about photos and notes
    const followUpDate = parseLocalDate(event.end_date || event.date, "09:00", timezoneOffset);
    followUpDate.setDate(followUpDate.getDate() + 1);

    if (followUpDate > now) {
      notificationsToSchedule.push({
        userId,
        title: `Memories: ${event.title}`,
        body: `Don't forget to upload photos and add notes!`,
        sourceType: 'event',
        sourceId: event.id,
        scheduledAt: Timestamp.fromDate(followUpDate),
        status: 'pending',
        clickAction: `/events/${event.slug}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    if (notificationsToSchedule.length === 0) return;

    const batch = adminDb.batch();
    const notificationsRef = adminDb.collection("notifications");

    for (const doc of notificationsToSchedule) {
      const newDocRef = notificationsRef.doc();
      batch.set(newDocRef, doc);
    }

    await batch.commit();
    console.log(`Successfully scheduled ${notificationsToSchedule.length} notifications for event ${event.id}`);
  } catch (error) {
    console.error(`Error scheduling notifications for event ${event.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for an event
 */
export async function cancelEventNotifications(eventId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "event")
      .where("sourceId", "==", eventId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} notifications for event ${eventId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for event ${eventId}:`, error);
  }
}

/**
 * Creates a Firestore notification document for a task
 */
export async function scheduleTaskNotifications(task: Task, userId: string, timezoneOffset: string = "+00:00"): Promise<void> {
  try {
    const now = new Date();
    console.log(`[notifications.ts] scheduleTaskNotifications for task:`, task.id, "notification_setting:", task.notification_setting, "timezoneOffset:", timezoneOffset);

    if (!task.notification_setting || task.notification_setting === 'none') {
      console.log(`[notifications.ts] notifications disabled for task ${task.id}`);
      return;
    }

    let scheduledAtDate: Date | null = null;
    const notificationTitle = task.title;
    const notificationBody = task.description || "Task reminder";

    const setting = task.notification_setting;

    if (setting.includes("T")) {
      try {
        const cleanSetting = setting.replace('Z', '');
        scheduledAtDate = new Date(`${cleanSetting}${timezoneOffset}`);
      } catch {
        scheduledAtDate = null;
      }
    } else {
      // If it's just a date (YYYY-MM-DD), default to 9:00 AM
      const [year, month, day] = setting.split("-").map(Number);
      scheduledAtDate = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:00:00.000${timezoneOffset}`);
    }

    if (scheduledAtDate && scheduledAtDate > now) {
      const doc: Omit<NotificationDocument, 'id'> = {
        userId,
        title: 'Task Due Soon: ' + notificationTitle,
        body: notificationBody,
        sourceType: 'task',
        sourceId: task.id,
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        status: 'pending',
        clickAction: `/tasks`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await adminDb.collection("notifications").add(doc);
      console.log(`Successfully scheduled notification for task ${task.id} at ${scheduledAtDate.toISOString()}`);
    } else {
      console.log(`[notifications.ts] notification time for task ${task.id} is in the past: ${scheduledAtDate?.toISOString()}`);
    }
  } catch (error) {
    console.error(`Error scheduling notifications for task ${task.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for a task
 */
export async function cancelTaskNotifications(taskId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "task")
      .where("sourceId", "==", taskId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} notifications for task ${taskId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for task ${taskId}:`, error);
  }
}

/**
 * Creates a Firestore notification document for a booking
 */
export async function scheduleBookingNotifications(
  booking: Booking, 
  userId: string, 
  timezoneOffset: string = "+00:00"
): Promise<void> {
  try {
    const now = new Date();
    console.log(`[notifications.ts] scheduleBookingNotifications for booking:`, booking.id, "notification_setting:", booking.notification_setting, "timezoneOffset:", timezoneOffset);

    if (!booking.notification_setting || booking.notification_setting === 'none') {
      console.log(`[notifications.ts] notifications disabled for booking ${booking.id}`);
      return;
    }

    if (!booking.date) {
      console.log(`[notifications.ts] no date set for booking ${booking.id}, skipping notification`);
      return;
    }

    let scheduledAtDate: Date | null = null;
    let notificationTitle = booking.title;
    let notificationBody = `Booking reminder`;

    const setting = booking.notification_setting;
    const bookingTime = booking.start_time || "09:00";
    const baseDate = parseLocalDate(booking.date, bookingTime, timezoneOffset);

    switch (setting) {
      case 'day_before':
        const dayBefore = new Date(baseDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        scheduledAtDate = dayBefore;
        notificationTitle = `Tomorrow: ${booking.title}`;
        notificationBody = `Starts at ${bookingTime}`;
        break;
      case '2_days_before':
        const twoDaysBefore = new Date(baseDate);
        twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
        scheduledAtDate = twoDaysBefore;
        notificationTitle = `In 2 days: ${booking.title}`;
        notificationBody = `Starts at ${bookingTime}`;
        break;
      case '1_week_before':
        const weekBefore = new Date(baseDate);
        weekBefore.setDate(weekBefore.getDate() - 7);
        scheduledAtDate = weekBefore;
        notificationTitle = `Next week: ${booking.title}`;
        notificationBody = `Starts at ${bookingTime}`;
        break;
      case 'at_time':
        scheduledAtDate = baseDate;
        notificationBody = `Starts now (at ${bookingTime})`;
        break;
      default:
        // If it's a custom date-time ISO string (like tasks)
        if (setting.includes("T")) {
          try {
            const cleanSetting = setting.replace('Z', '');
            scheduledAtDate = new Date(`${cleanSetting}${timezoneOffset}`);
          } catch {
            scheduledAtDate = null;
          }
        }
    }

    if (scheduledAtDate && scheduledAtDate > now) {
      const doc: Omit<NotificationDocument, 'id'> = {
        userId,
        title: notificationTitle,
        body: notificationBody,
        sourceType: 'booking',
        sourceId: booking.id,
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        status: 'pending',
        clickAction: `/vacations`, // We don't have a specific booking page, so go to vacations
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await adminDb.collection("notifications").add(doc);
      console.log(`Successfully scheduled notification for booking ${booking.id} at ${scheduledAtDate.toISOString()}`);
    } else {
      console.log(`[notifications.ts] notification time for booking ${booking.id} is in the past: ${scheduledAtDate?.toISOString()}`);
    }
  } catch (error) {
    console.error(`Error scheduling notifications for booking ${booking.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for a booking
 */
export async function cancelBookingNotifications(bookingId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "booking")
      .where("sourceId", "==", bookingId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} notifications for booking ${bookingId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for booking ${bookingId}:`, error);
  }
}

/**
 * Creates a Firestore notification document for an itinerary day
 */
export async function scheduleItineraryDayNotifications(
  day: ItineraryDay, 
  userId: string, 
  timezoneOffset: string = "+00:00"
): Promise<void> {
  try {
    const now = new Date();
    console.log(`[notifications.ts] scheduleItineraryDayNotifications for day:`, day.id, "notification_setting:", day.notification_setting, "timezoneOffset:", timezoneOffset);

    if (!day.notification_setting || day.notification_setting === 'none') {
      console.log(`[notifications.ts] notifications disabled for itinerary day ${day.id}`);
      return;
    }

    if (!day.date) {
      console.log(`[notifications.ts] no date set for itinerary day ${day.id}, skipping notification`);
      return;
    }

    let scheduledAtDate: Date | null = null;
    let notificationTitle = day.title || `Vacation Day ${day.day_number}`;
    let notificationBody = day.location ? `Location: ${day.location}` : `Vacation itinerary reminder`;

    const setting = day.notification_setting;
    const baseDate = parseLocalDate(day.date, "09:00", timezoneOffset);

    switch (setting) {
      case 'night_before':
        const nightBefore = parseLocalDate(day.date, "20:00", timezoneOffset);
        nightBefore.setDate(nightBefore.getDate() - 1);
        scheduledAtDate = nightBefore;
        notificationTitle = `Tonight: ${notificationTitle}`;
        break;
      case 'day_before':
        const dayBefore = new Date(baseDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        scheduledAtDate = dayBefore;
        notificationTitle = `Tomorrow: ${notificationTitle}`;
        break;
      case '2_days_before':
        const twoDaysBefore = new Date(baseDate);
        twoDaysBefore.setDate(twoDaysBefore.getDate() - 2);
        scheduledAtDate = twoDaysBefore;
        notificationTitle = `In 2 days: ${notificationTitle}`;
        break;
      case '1_week_before':
        const weekBefore = new Date(baseDate);
        weekBefore.setDate(weekBefore.getDate() - 7);
        scheduledAtDate = weekBefore;
        notificationTitle = `Next week: ${notificationTitle}`;
        break;
      case 'at_time':
        scheduledAtDate = baseDate;
        notificationBody = `Starts now (at 09:00 AM)`;
        break;
      default:
        if (setting.includes("T")) {
          try {
            const cleanSetting = setting.replace('Z', '');
            scheduledAtDate = new Date(`${cleanSetting}${timezoneOffset}`);
          } catch {
            scheduledAtDate = null;
          }
        }
    }

    if (scheduledAtDate && scheduledAtDate > now) {
      const doc: Omit<NotificationDocument, 'id'> = {
        userId,
        title: notificationTitle,
        body: notificationBody,
        sourceType: 'vacation',
        sourceId: day.id,
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        status: 'pending',
        clickAction: `/vacations`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await adminDb.collection("notifications").add(doc);
      console.log(`Successfully scheduled notification for itinerary day ${day.id} at ${scheduledAtDate.toISOString()}`);
    } else {
      console.log(`[notifications.ts] notification time for itinerary day ${day.id} is in the past: ${scheduledAtDate?.toISOString()}`);
    }
  } catch (error) {
    console.error(`Error scheduling notifications for itinerary day ${day.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for an itinerary day
 */
export async function cancelItineraryDayNotifications(dayId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "vacation")
      .where("sourceId", "==", dayId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} notifications for itinerary day ${dayId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for itinerary day ${dayId}:`, error);
  }
}

/**
 * Creates a Firestore notification document for a vacation follow-up
 */
export async function scheduleVacationFollowUpNotification(
  vacation: Vacation,
  userId: string, 
  timezoneOffset: string = "+00:00"
): Promise<void> {
  try {
    const now = new Date();
    console.log(`[notifications.ts] scheduleVacationFollowUpNotification for vacation:`, vacation.id, "timezoneOffset:", timezoneOffset);

    if (!vacation.end_date) {
      console.log(`[notifications.ts] no end_date set for vacation ${vacation.id}, skipping follow-up notification`);
      return;
    }

    // If any of the end dates occur before the current date and time no notifications should be created.
    const endDateParsed = parseLocalDate(vacation.end_date, "23:59", timezoneOffset);
    if (endDateParsed < now) {
      console.log(`[notifications.ts] vacation end date for ${vacation.id} is in the past: ${endDateParsed.toISOString()}, skipping notification`);
      return;
    }

    // Notification date: the day after the vacation is set to end at 10am
    const scheduledAtDate = parseLocalDate(vacation.end_date, "10:00", timezoneOffset);
    scheduledAtDate.setDate(scheduledAtDate.getDate() + 1);

    if (scheduledAtDate > now) {
      const doc: Omit<NotificationDocument, 'id'> = {
        userId,
        title: `Vacation Over: ${vacation.title}`,
        body: `Don't forget to add details and photos to your vacation after it is over!`,
        sourceType: 'vacation_followup',
        sourceId: vacation.id,
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        status: 'pending',
        clickAction: `/vacations/${vacation.slug}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await adminDb.collection("notifications").add(doc);
      console.log(`Successfully scheduled follow-up notification for vacation ${vacation.id} at ${scheduledAtDate.toISOString()}`);
    } else {
      console.log(`[notifications.ts] notification time for vacation ${vacation.id} is in the past: ${scheduledAtDate.toISOString()}`);
    }
  } catch (error) {
    console.error(`Error scheduling follow-up notification for vacation ${vacation.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for a vacation follow-up
 */
export async function cancelVacationFollowUpNotification(vacationId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "vacation_followup")
      .where("sourceId", "==", vacationId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} vacation follow-up notifications for vacation ${vacationId}`);
  } catch (error) {
    console.error(`Error cancelling vacation follow-up notifications for vacation ${vacationId}:`, error);
  }
}



/**
 * Schedules notifications for a workout activity
 */
export async function scheduleWorkoutNotifications(
  workout: { id: number; date: string; time: string; type: string; completed?: boolean },
  userId: string,
  timezoneOffset: string = "+00:00"
): Promise<void> {
  try {
    const now = new Date();
    const baseDate = parseLocalDate(workout.date, workout.time, timezoneOffset);

    // If a workout is marked as occured in the past, no notifications should be created.
    // Also skip if completed (as confirmed by user).
    if (workout.completed || baseDate < now) {
      console.log(`[notifications.ts] scheduleWorkoutNotifications skipping for workout ${workout.id}: completed=${workout.completed}, past=${baseDate < now}`);
      return;
    }

    const notificationsToSchedule: Omit<NotificationDocument, 'id'>[] = [];

    // 1. First notification: 1 hour before
    const oneHourBefore = new Date(baseDate);
    oneHourBefore.setHours(oneHourBefore.getHours() - 1);

    if (oneHourBefore > now) {
      notificationsToSchedule.push({
        userId,
        title: `Upcoming Workout: ${workout.type}`,
        body: `Your ${workout.type} workout starts in 1 hour.`,
        sourceType: 'workout',
        sourceId: workout.id,
        scheduledAt: Timestamp.fromDate(oneHourBefore),
        status: 'pending',
        clickAction: `/exercise/${workout.id}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    // 2. Second notification: 2 hours after
    const twoHoursAfter = new Date(baseDate);
    twoHoursAfter.setHours(twoHoursAfter.getHours() + 2);

    if (twoHoursAfter > now) {
      notificationsToSchedule.push({
        userId,
        title: `Workout Reminder`,
        body: `Don't forget to complete your ${workout.type} workout!`,
        sourceType: 'workout',
        sourceId: workout.id,
        scheduledAt: Timestamp.fromDate(twoHoursAfter),
        status: 'pending',
        clickAction: `/exercise/${workout.id}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }

    if (notificationsToSchedule.length === 0) return;

    const batch = adminDb.batch();
    const notificationsRef = adminDb.collection("notifications");

    for (const doc of notificationsToSchedule) {
      const newDocRef = notificationsRef.doc();
      batch.set(newDocRef, doc);
    }

    await batch.commit();
    console.log(`Successfully scheduled ${notificationsToSchedule.length} notifications for workout ${workout.id}`);
  } catch (error) {
    console.error(`Error scheduling notifications for workout ${workout.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for a workout
 */
export async function cancelWorkoutNotifications(workoutId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "workout")
      .where("sourceId", "==", workoutId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} notifications for workout ${workoutId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for workout ${workoutId}:`, error);
  }
}

/**
 * Schedules notifications for a goal
 */
export async function scheduleGoalNotifications(
  goal: { id: number; title: string; slug: string; status: string; target_date: string | null },
  userId: string,
  timezoneOffset: string = "+00:00"
): Promise<void> {
  try {
    const now = new Date();
    console.log(`[notifications.ts] scheduleGoalNotifications for goal:`, goal.id, "status:", goal.status, "target_date:", goal.target_date, "timezoneOffset:", timezoneOffset);

    // Always cancel existing notifications for this goal first
    await cancelGoalNotifications(goal.id, userId);

    if (goal.status !== 'in_progress' || !goal.target_date) {
      console.log(`[notifications.ts] goal ${goal.id} is not in_progress or has no target_date, skipping notification`);
      return;
    }

    const targetDate = parseLocalDate(goal.target_date, "15:00", timezoneOffset);
    if (targetDate <= now) {
      console.log(`[notifications.ts] goal ${goal.id} target date is in the past, skipping notification`);
      return;
    }

    // Parse offset to minutes
    const offsetParts = timezoneOffset.match(/([+-])(\d{2}):(\d{2})/);
    let offsetMinutes = 0;
    if (offsetParts) {
      const sign = offsetParts[1] === '+' ? 1 : -1;
      const hours = parseInt(offsetParts[2], 10);
      const mins = parseInt(offsetParts[3], 10);
      offsetMinutes = sign * (hours * 60 + mins);
    }

    let scheduledAtDate: Date;
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const twentyNineDaysInMs = 29 * 24 * 60 * 60 * 1000;

    if (targetDate.getTime() - now.getTime() >= oneWeekInMs) {
      const oneWeekBefore = new Date(targetDate.getTime() - oneWeekInMs);
      const twentyNineDaysFromNow = new Date(now.getTime() + twentyNineDaysInMs);
      
      if (oneWeekBefore > twentyNineDaysFromNow) {
        const localScheduledMs = twentyNineDaysFromNow.getTime() + (offsetMinutes * 60 * 1000);
        const localScheduledDate = new Date(localScheduledMs);
        const year = localScheduledDate.getUTCFullYear();
        const month = String(localScheduledDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(localScheduledDate.getUTCDate()).padStart(2, '0');
        const scheduledDateStr = `${year}-${month}-${day}`;
        scheduledAtDate = parseLocalDate(scheduledDateStr, "15:00", timezoneOffset);
      } else {
        scheduledAtDate = oneWeekBefore;
      }
    } else {
      // Split the time in half and use that day
      const diffMs = targetDate.getTime() - now.getTime();
      const halfMs = diffMs / 2;
      const halfwayDate = new Date(now.getTime() + halfMs);

      // Adjust halfwayDate to the user's local time
      const localHalfwayMs = halfwayDate.getTime() + (offsetMinutes * 60 * 1000);
      const localHalfwayDate = new Date(localHalfwayMs);

      const year = localHalfwayDate.getUTCFullYear();
      const month = String(localHalfwayDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localHalfwayDate.getUTCDate()).padStart(2, '0');
      const halfwayDateStr = `${year}-${month}-${day}`;

      scheduledAtDate = parseLocalDate(halfwayDateStr, "15:00", timezoneOffset);
    }


    if (scheduledAtDate > now) {
      const doc: Omit<NotificationDocument, 'id'> = {
        userId,
        title: `Goal Deadline Approaching`,
        body: `Your goal "${goal.title}" completion date is coming up!`,
        sourceType: 'goal',
        sourceId: goal.id,
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        status: 'pending',
        clickAction: `/goals/${goal.slug}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await adminDb.collection("notifications").add(doc);
      console.log(`Successfully scheduled notification for goal ${goal.id} at ${scheduledAtDate.toISOString()}`);
    } else {
      console.log(`[notifications.ts] calculated notification time for goal ${goal.id} is in the past: ${scheduledAtDate.toISOString()}`);
    }
  } catch (error) {
    console.error(`Error scheduling notifications for goal ${goal.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for a goal
 */
export async function cancelGoalNotifications(goalId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "goal")
      .where("sourceId", "==", goalId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} notifications for goal ${goalId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for goal ${goalId}:`, error);
  }
}

/**
 * Schedules notifications for a milestone
 */
export async function scheduleMilestoneNotifications(
  milestone: { id: number; goalId: number; title: string; target_date: string | null; completed: boolean },
  goalSlug: string,
  userId: string,
  timezoneOffset: string = "+00:00"
): Promise<void> {
  try {
    const now = new Date();
    console.log(`[notifications.ts] scheduleMilestoneNotifications for milestone:`, milestone.id, "completed:", milestone.completed, "target_date:", milestone.target_date, "timezoneOffset:", timezoneOffset);

    // Always cancel existing notifications for this milestone first
    await cancelMilestoneNotifications(milestone.id, userId);

    if (milestone.completed || !milestone.target_date) {
      console.log(`[notifications.ts] milestone ${milestone.id} is completed or has no target_date, skipping notification`);
      return;
    }

    const targetDate = parseLocalDate(milestone.target_date, "15:00", timezoneOffset);
    if (targetDate <= now) {
      console.log(`[notifications.ts] milestone ${milestone.id} target date is in the past, skipping notification`);
      return;
    }

    // Parse offset to minutes
    const offsetParts = timezoneOffset.match(/([+-])(\d{2}):(\d{2})/);
    let offsetMinutes = 0;
    if (offsetParts) {
      const sign = offsetParts[1] === '+' ? 1 : -1;
      const hours = parseInt(offsetParts[2], 10);
      const mins = parseInt(offsetParts[3], 10);
      offsetMinutes = sign * (hours * 60 + mins);
    }

    let scheduledAtDate: Date;
    const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
    const twentyNineDaysInMs = 29 * 24 * 60 * 60 * 1000;

    if (targetDate.getTime() - now.getTime() >= oneWeekInMs) {
      const oneWeekBefore = new Date(targetDate.getTime() - oneWeekInMs);
      const twentyNineDaysFromNow = new Date(now.getTime() + twentyNineDaysInMs);
      
      if (oneWeekBefore > twentyNineDaysFromNow) {
        const localScheduledMs = twentyNineDaysFromNow.getTime() + (offsetMinutes * 60 * 1000);
        const localScheduledDate = new Date(localScheduledMs);
        const year = localScheduledDate.getUTCFullYear();
        const month = String(localScheduledDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(localScheduledDate.getUTCDate()).padStart(2, '0');
        const scheduledDateStr = `${year}-${month}-${day}`;
        scheduledAtDate = parseLocalDate(scheduledDateStr, "15:00", timezoneOffset);
      } else {
        scheduledAtDate = oneWeekBefore;
      }
    } else {
      // Split the time in half and use that day
      const diffMs = targetDate.getTime() - now.getTime();
      const halfMs = diffMs / 2;
      const halfwayDate = new Date(now.getTime() + halfMs);

      // Adjust halfwayDate to the user's local time
      const localHalfwayMs = halfwayDate.getTime() + (offsetMinutes * 60 * 1000);
      const localHalfwayDate = new Date(localHalfwayMs);

      const year = localHalfwayDate.getUTCFullYear();
      const month = String(localHalfwayDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(localHalfwayDate.getUTCDate()).padStart(2, '0');
      const halfwayDateStr = `${year}-${month}-${day}`;

      scheduledAtDate = parseLocalDate(halfwayDateStr, "15:00", timezoneOffset);
    }


    if (scheduledAtDate > now) {
      const doc: Omit<NotificationDocument, 'id'> = {
        userId,
        title: `Milestone Deadline Approaching`,
        body: `Your milestone "${milestone.title}" completion date is coming up!`,
        sourceType: 'milestone',
        sourceId: milestone.id,
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        status: 'pending',
        clickAction: `/goals/${goalSlug}`,
        data: { goalId: String(milestone.goalId) },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };


      await adminDb.collection("notifications").add(doc);
      console.log(`Successfully scheduled notification for milestone ${milestone.id} at ${scheduledAtDate.toISOString()}`);
    } else {
      console.log(`[notifications.ts] calculated notification time for milestone ${milestone.id} is in the past: ${scheduledAtDate.toISOString()}`);
    }
  } catch (error) {
    console.error(`Error scheduling notifications for milestone ${milestone.id}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for a milestone
 */
export async function cancelMilestoneNotifications(milestoneId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "milestone")
      .where("sourceId", "==", milestoneId)
      .where("userId", "==", userId)
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} notifications for milestone ${milestoneId}`);
  } catch (error) {
    console.error(`Error cancelling notifications for milestone ${milestoneId}:`, error);
  }
}

/**
 * Cancels all pending or scheduled Firestore notification documents for all milestones of a goal
 */
export async function cancelAllGoalMilestoneNotifications(goalId: number, userId: string): Promise<void> {
  try {
    const snapshot = await adminDb
      .collection("notifications")
      .where("sourceType", "==", "milestone")
      .where("userId", "==", userId)
      .where("data.goalId", "==", String(goalId))
      .where("status", "in", ["pending", "scheduled"])
      .get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: "cancelled",
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log(`Successfully cancelled ${snapshot.size} milestone notifications for goal ${goalId}`);
  } catch (error) {
    console.error(`Error cancelling milestone notifications for goal ${goalId}:`, error);
  }
}



