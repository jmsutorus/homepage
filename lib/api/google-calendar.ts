import { google } from "googleapis";
import { auth } from "@/auth";

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string; // ISO 8601 format
    timeZone: string;
  };
  end: {
    dateTime: string; // ISO 8601 format
    timeZone: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: "email" | "popup";
      minutes: number;
    }>;
  };
  colorId?: string;
}

/**
 * Get Google Calendar API client for a user
 */
export async function getCalendarClient(userId: string) {
  const db = (auth as any).options.database;

  // Get the Google account for this user
  const account = db
    .prepare(
      `SELECT accessToken, refreshToken, accessTokenExpiresAt
       FROM account
       WHERE userId = ? AND providerId = ?`
    )
    .get(userId, "google") as {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
  } | undefined;

  if (!account) {
    throw new Error("Google account not connected");
  }

  // Check if token is expired and needs refresh
  const now = Date.now();
  if (account.accessTokenExpiresAt && account.accessTokenExpiresAt <= now) {
    // Token expired, need to refresh
    // This is a simplified version - in production you'd want proper token refresh logic
    throw new Error("Google access token expired. Please reconnect your account.");
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Set credentials
  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
  });

  // Return Calendar API client
  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Create a workout event in Google Calendar
 */
export async function createCalendarEvent(
  userId: string,
  event: Omit<CalendarEvent, "id">
): Promise<string> {
  const calendar = await getCalendarClient(userId);

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      reminders: event.reminders,
      colorId: event.colorId || "9", // 9 = blue (fitness color)
    },
  });

  if (!response.data.id) {
    throw new Error("Failed to create calendar event");
  }

  return response.data.id;
}

/**
 * Update a workout event in Google Calendar
 */
export async function updateCalendarEvent(
  userId: string,
  eventId: string,
  event: Partial<Omit<CalendarEvent, "id">>
): Promise<void> {
  const calendar = await getCalendarClient(userId);

  await calendar.events.patch({
    calendarId: "primary",
    eventId: eventId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      reminders: event.reminders,
      colorId: event.colorId,
    },
  });
}

/**
 * Delete a workout event from Google Calendar
 */
export async function deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
  const calendar = await getCalendarClient(userId);

  await calendar.events.delete({
    calendarId: "primary",
    eventId: eventId,
  });
}

/**
 * Get a single event from Google Calendar
 */
export async function getCalendarEvent(userId: string, eventId: string) {
  const calendar = await getCalendarClient(userId);

  const response = await calendar.events.get({
    calendarId: "primary",
    eventId: eventId,
  });

  return response.data;
}

/**
 * List events from Google Calendar within a date range
 */
export async function listCalendarEvents(userId: string, timeMin: string, timeMax: string) {
  const calendar = await getCalendarClient(userId);

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin,
    timeMax: timeMax,
    singleEvents: true,
    orderBy: "startTime",
  });

  return response.data.items || [];
}

/**
 * Helper function to create ISO datetime string for Calendar API
 */
export function createCalendarDateTime(date: string, time: string, timeZone: string = "UTC"): string {
  // date format: YYYY-MM-DD
  // time format: HH:MM
  return `${date}T${time}:00`;
}

/**
 * Helper function to calculate end time from start time and duration
 */
export function calculateEndDateTime(startDateTime: string, durationMinutes: number): string {
  const start = new Date(startDateTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return end.toISOString();
}
