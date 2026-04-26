import { adminDb } from "./admin";
import { Timestamp } from "firebase-admin/firestore";
import { type Event } from "../db/events";

interface NotificationDocument {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  imageUrl?: string;
  clickAction?: string;
  data?: Record<string, string>;
  sourceType: 'event' | 'achievement' | 'goal' | 'vacation' | 'task' | 'habit' | 'custom';
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
