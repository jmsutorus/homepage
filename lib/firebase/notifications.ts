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
    
    console.log(`[notifications.ts] scheduleEventNotifications for event:`, event.id, "all_day:", event.all_day, "notifications count:", event.notifications?.length, "timezoneOffset:", timezoneOffset);


    if (event.all_day) {
      // 1. Night before at 8:00 PM (20:00)
      const [year, month, day] = event.date.split("-").map(Number);
      const nightBeforeDate = new Date(year, month - 1, day);
      nightBeforeDate.setDate(nightBeforeDate.getDate() - 1);
      
      const nbYear = nightBeforeDate.getFullYear();
      const nbMonth = String(nightBeforeDate.getMonth() + 1).padStart(2, "0");
      const nbDay = String(nightBeforeDate.getDate()).padStart(2, "0");
      
      const nightBeforeIso = `${nbYear}-${nbMonth}-${nbDay}T20:00:00.000${timezoneOffset}`;
      const nightBefore = new Date(nightBeforeIso);

      if (nightBefore > now) {
        notificationsToSchedule.push({
          userId,
          title: `Tomorrow: ${event.title}`,
          body: event.description || "All-day event tomorrow",
          sourceType: 'event',
          sourceId: event.id,
          scheduledAt: Timestamp.fromDate(nightBefore),
          status: 'pending',
          clickAction: `/calendar?date=${event.date}`,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      // 2. Morning of at 8:00 AM (08:00)
      const morningOfIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T08:00:00.000${timezoneOffset}`;
      const morningOf = new Date(morningOfIso);

      if (morningOf > now) {
        notificationsToSchedule.push({
          userId,
          title: `Today: ${event.title}`,
          body: event.description || "All-day event today",
          sourceType: 'event',
          sourceId: event.id,
          scheduledAt: Timestamp.fromDate(morningOf),
          status: 'pending',
          clickAction: `/calendar?date=${event.date}`,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
    } else {
      // Standard timed event
      const relativeNotifications = [...(event.notifications || [])];
      const has30Min = relativeNotifications.some(n => n.time === 30 && n.timeObject === 'minutes');
      if (!has30Min) {
        relativeNotifications.push({ type: 'push', time: 30, timeObject: 'minutes' });
      }

      const eventTime = event.start_time || "00:00";
      const baseDate = parseLocalDate(event.date, eventTime, timezoneOffset);
      console.log(`[notifications.ts] baseDate:`, baseDate, "now:", now);
      
      for (const notification of relativeNotifications) {

        let intervalMs = 0;
        const timeValue = notification.time;


        switch (notification.timeObject) {
          case 'minutes':
            intervalMs = timeValue * 60 * 1000;
            break;
          case 'hours':
            intervalMs = timeValue * 60 * 60 * 1000;
            break;
          case 'days':
            intervalMs = timeValue * 24 * 60 * 60 * 1000;
            break;
          case 'weeks':
            intervalMs = timeValue * 7 * 24 * 60 * 60 * 1000;
            break;
          default:
            console.warn(`Unknown notification timeObject: ${notification.timeObject}`);
            continue;
        }

        const scheduledAtDate = new Date(baseDate.getTime() - intervalMs);
        console.log(`[notifications.ts] scheduledAtDate:`, scheduledAtDate, "is future:", scheduledAtDate > now);

        if (scheduledAtDate > now) {

          notificationsToSchedule.push({
            userId,
            title: event.title,
            body: `Starts in ${timeValue} ${notification.timeObject} (at ${eventTime})`,
            sourceType: 'event',
            sourceId: event.id,
            scheduledAt: Timestamp.fromDate(scheduledAtDate),
            status: 'pending',
            clickAction: `/calendar?date=${event.date}`,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        }
      }
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
