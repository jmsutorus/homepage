import { execute, query, queryOne } from "./index";

export interface EventNotification {
  type: string; // e.g., 'email', 'push', 'sms'
  time: number;
  timeObject: string; // e.g., 'minutes', 'hours', 'days', 'weeks'
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  date: string; // YYYY-MM-DD format - start date
  start_time: string | null; // HH:MM format
  end_time: string | null; // HH:MM format
  all_day: boolean;
  end_date: string | null; // YYYY-MM-DD format - for multi-day events
  notifications: EventNotification[];
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  end_date?: string;
  notifications?: EventNotification[];
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  all_day?: boolean;
  end_date?: string;
  notifications?: EventNotification[];
}

// Helper to serialize notifications to JSON string
function serializeNotifications(notifications?: EventNotification[]): string {
  return JSON.stringify(notifications || []);
}

// Helper to deserialize notifications from JSON string
function deserializeNotifications(notificationsJson: string): EventNotification[] {
  try {
    return JSON.parse(notificationsJson);
  } catch {
    return [];
  }
}

// Transform DB row to Event object
function transformEvent(row: any): Event {
  return {
    ...row,
    all_day: Boolean(row.all_day),
    notifications: deserializeNotifications(row.notifications || "[]"),
  };
}

/**
 * Create a new event
 */
export function createEvent(input: CreateEventInput): Event {
  const result = execute(
    `INSERT INTO events (
      title, description, location, date, start_time, end_time, all_day, end_date, notifications
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.description || null,
      input.location || null,
      input.date,
      input.start_time || null,
      input.end_time || null,
      input.all_day ? 1 : 0,
      input.end_date || null,
      serializeNotifications(input.notifications),
    ]
  );

  const event = getEvent(Number(result.lastInsertRowid));
  if (!event) {
    throw new Error("Failed to create event");
  }

  return event;
}

/**
 * Get event by ID
 */
export function getEvent(id: number): Event | undefined {
  const row = queryOne<any>("SELECT * FROM events WHERE id = ?", [id]);
  return row ? transformEvent(row) : undefined;
}

/**
 * Get all events
 */
export function getAllEvents(): Event[] {
  const rows = query<any>("SELECT * FROM events ORDER BY date ASC, start_time ASC");
  return rows.map(transformEvent);
}

/**
 * Get events for a specific date (including multi-day events that span this date)
 */
export function getEventsForDate(date: string): Event[] {
  const rows = query<any>(
    `SELECT * FROM events
     WHERE date = ?
        OR (end_date IS NOT NULL AND date <= ? AND end_date >= ?)
     ORDER BY all_day DESC, start_time ASC`,
    [date, date, date]
  );
  return rows.map(transformEvent);
}

/**
 * Get events in a date range (including multi-day events that overlap)
 */
export function getEventsInRange(startDate: string, endDate: string): Event[] {
  const rows = query<any>(
    `SELECT * FROM events
     WHERE (date BETWEEN ? AND ?)
        OR (end_date IS NOT NULL AND date <= ? AND end_date >= ?)
     ORDER BY date ASC, all_day DESC, start_time ASC`,
    [startDate, endDate, endDate, startDate]
  );
  return rows.map(transformEvent);
}

/**
 * Update event
 */
export function updateEvent(id: number, updates: UpdateEventInput): boolean {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    params.push(updates.title);
  }

  if (updates.description !== undefined) {
    fields.push("description = ?");
    params.push(updates.description || null);
  }

  if (updates.location !== undefined) {
    fields.push("location = ?");
    params.push(updates.location || null);
  }

  if (updates.date !== undefined) {
    fields.push("date = ?");
    params.push(updates.date);
  }

  if (updates.start_time !== undefined) {
    fields.push("start_time = ?");
    params.push(updates.start_time || null);
  }

  if (updates.end_time !== undefined) {
    fields.push("end_time = ?");
    params.push(updates.end_time || null);
  }

  if (updates.all_day !== undefined) {
    fields.push("all_day = ?");
    params.push(updates.all_day ? 1 : 0);
  }

  if (updates.end_date !== undefined) {
    fields.push("end_date = ?");
    params.push(updates.end_date || null);
  }

  if (updates.notifications !== undefined) {
    fields.push("notifications = ?");
    params.push(serializeNotifications(updates.notifications));
  }

  if (fields.length === 0) {
    return false;
  }

  params.push(id);
  const sql = `UPDATE events SET ${fields.join(", ")} WHERE id = ?`;
  const result = execute(sql, params);

  return result.changes > 0;
}

/**
 * Delete event
 */
export function deleteEvent(id: number): boolean {
  const result = execute("DELETE FROM events WHERE id = ?", [id]);
  return result.changes > 0;
}

/**
 * Get upcoming events (from today onwards)
 */
export function getUpcomingEvents(limit?: number): Event[] {
  const today = new Date().toISOString().split("T")[0];
  const sql = limit
    ? `SELECT * FROM events
       WHERE date >= ? OR (end_date IS NOT NULL AND end_date >= ?)
       ORDER BY date ASC, all_day DESC, start_time ASC
       LIMIT ?`
    : `SELECT * FROM events
       WHERE date >= ? OR (end_date IS NOT NULL AND end_date >= ?)
       ORDER BY date ASC, all_day DESC, start_time ASC`;

  const params = limit ? [today, today, limit] : [today, today];
  const rows = query<any>(sql, params);
  return rows.map(transformEvent);
}
