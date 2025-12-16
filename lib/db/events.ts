import { execute, query, queryOne } from "./index";

export interface EventNotification {
  type: string; // e.g., 'email', 'push', 'sms'
  time: number;
  timeObject: string; // e.g., 'minutes', 'hours', 'days', 'weeks'
}

export interface EventCategory {
  id: number;
  userId: string;
  name: string;
  created_at: string;
}

export interface Event {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string; // YYYY-MM-DD format - start date
  start_time: string | null; // HH:MM format
  end_time: string | null; // HH:MM format
  all_day: boolean;
  end_date: string | null; // YYYY-MM-DD format - for multi-day events
  category: string | null;
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
  category?: string;
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
  category?: string;
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
interface DBEvent {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: number;
  end_date: string | null;
  category: string | null;
  notifications: string | null;
  created_at: string;
  updated_at: string;
}

function transformEvent(row: DBEvent): Event {
  return {
    ...row,
    all_day: Boolean(row.all_day),
    notifications: deserializeNotifications(row.notifications || "[]"),
  };
}

/**
 * Create a new event for a specific user
 */
export async function createEvent(input: CreateEventInput, userId: string): Promise<Event> {
  const result = await execute(
    `INSERT INTO events (
      userId, title, description, location, date, start_time, end_time, all_day, end_date, category, notifications
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.title,
      input.description || null,
      input.location || null,
      input.date,
      input.start_time || null,
      input.end_time || null,
      input.all_day ? 1 : 0,
      input.end_date || null,
      input.category || null,
      serializeNotifications(input.notifications),
    ]
  );

  const event = await getEvent(Number(result.lastInsertRowid), userId);
  if (!event) {
    throw new Error("Failed to create event");
  }

  return event;
}

/**
 * Get event by ID for a specific user
 */
export async function getEvent(id: number, userId: string): Promise<Event | undefined> {
  const row = await queryOne<DBEvent>("SELECT * FROM events WHERE id = ? AND userId = ?", [id, userId]);
  return row ? transformEvent(row) : undefined;
}

/**
 * Get all events for a specific user
 */
export async function getAllEvents(userId: string): Promise<Event[]> {
  const rows = await query<DBEvent>("SELECT * FROM events WHERE userId = ? ORDER BY date ASC, start_time ASC", [userId]);
  return rows.map(transformEvent);
}

/**
 * Get events for a specific date for a specific user (including multi-day events that span this date)
 */
export async function getEventsForDate(date: string, userId: string): Promise<Event[]> {
  const rows = await query<DBEvent>(
    `SELECT * FROM events
     WHERE userId = ? AND (
       date = ?
       OR (end_date IS NOT NULL AND date <= ? AND end_date >= ?)
     )
     ORDER BY all_day DESC, start_time ASC`,
    [userId, date, date, date]
  );
  return rows.map(transformEvent);
}

/**
 * Get events in a date range for a specific user (including multi-day events that overlap)
 */
export async function getEventsInRange(startDate: string, endDate: string, userId: string): Promise<Event[]> {
  const rows = await query<DBEvent>(
    `SELECT * FROM events
     WHERE userId = ? AND (
       (date BETWEEN ? AND ?)
       OR (end_date IS NOT NULL AND date <= ? AND end_date >= ?)
     )
     ORDER BY date ASC, all_day DESC, start_time ASC`,
    [userId, startDate, endDate, endDate, startDate]
  );
  return rows.map(transformEvent);
}

/**
 * Update event (with ownership verification)
 */
export async function updateEvent(id: number, userId: string, updates: UpdateEventInput): Promise<boolean> {
  // Verify ownership
  const existing = await getEvent(id, userId);
  if (!existing) {
    return false;
  }

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

  if (updates.category !== undefined) {
    fields.push("category = ?");
    params.push(updates.category || null);
  }

  if (updates.notifications !== undefined) {
    fields.push("notifications = ?");
    params.push(serializeNotifications(updates.notifications));
  }

  if (fields.length === 0) {
    return false;
  }

  params.push(id, userId);
  const sql = `UPDATE events SET ${fields.join(", ")} WHERE id = ? AND userId = ?`;
  const result = await execute(sql, params);

  return result.changes > 0;
}

/**
 * Delete event (with ownership verification)
 */
export async function deleteEvent(id: number, userId: string): Promise<boolean> {
  // Verify ownership
  const existing = await getEvent(id, userId);
  if (!existing) {
    return false;
  }

  const result = await execute("DELETE FROM events WHERE id = ? AND userId = ?", [id, userId]);
  return result.changes > 0;
}

/**
 * Get upcoming events for a specific user (from today onwards)
 */
export async function getUpcomingEvents(userId: string, limit?: number): Promise<Event[]> {
  const today = new Date().toISOString().split("T")[0];
  const sql = limit
    ? `SELECT * FROM events
       WHERE userId = ? AND (date >= ? OR (end_date IS NOT NULL AND end_date >= ?))
       ORDER BY date ASC, all_day DESC, start_time ASC
       LIMIT ?`
    : `SELECT * FROM events
       WHERE userId = ? AND (date >= ? OR (end_date IS NOT NULL AND end_date >= ?))
       ORDER BY date ASC, all_day DESC, start_time ASC`;

  const params = limit ? [userId, today, today, limit] : [userId, today, today];
  const rows = await query<DBEvent>(sql, params);
  return rows.map(transformEvent);
}

// ==================== Event Categories ====================

/**
 * Get all event categories for a specific user
 */
export async function getAllEventCategories(userId: string): Promise<EventCategory[]> {
  return await query<EventCategory>(
    "SELECT * FROM event_categories WHERE userId = ? ORDER BY name ASC",
    [userId]
  );
}

/**
 * Create a new event category
 */
export async function createEventCategory(userId: string, name: string): Promise<EventCategory> {
  const result = await execute(
    "INSERT INTO event_categories (userId, name) VALUES (?, ?)",
    [userId, name]
  );

  const category = (await query<EventCategory>(
    "SELECT * FROM event_categories WHERE id = ?",
    [result.lastInsertRowid]
  ))[0];

  if (!category) {
    throw new Error("Failed to create event category");
  }

  return category;
}

/**
 * Delete an event category
 * This will set category to NULL for all events using this category
 */
export async function deleteEventCategory(id: number, userId: string): Promise<boolean> {
  // First, get the category to find its name
  const category = (await query<EventCategory>(
    "SELECT * FROM event_categories WHERE id = ? AND userId = ?",
    [id, userId]
  ))[0];

  if (!category) {
    return false;
  }

  // Clear the category from all events using it
  await execute("UPDATE events SET category = NULL WHERE category = ? AND userId = ?", [category.name, userId]);

  // Then delete the category
  const result = await execute("DELETE FROM event_categories WHERE id = ? AND userId = ?", [id, userId]);
  return result.changes > 0;
}

/**
 * Rename an event category
 * This will update all events using the old category name to the new name
 */
export async function renameEventCategory(id: number, userId: string, newName: string): Promise<boolean> {
  const category = (await query<EventCategory>(
    "SELECT * FROM event_categories WHERE id = ? AND userId = ?",
    [id, userId]
  ))[0];

  if (!category) {
    return false;
  }

  // Update all events using this category
  await execute("UPDATE events SET category = ? WHERE category = ? AND userId = ?", [newName, category.name, userId]);

  // Update the category name
  const result = await execute(
    "UPDATE event_categories SET name = ? WHERE id = ? AND userId = ?",
    [newName, id, userId]
  );

  return result.changes > 0;
}

/**
 * Initialize default event categories for a user if they don't have any
 * This is idempotent - safe to call multiple times
 */
export async function ensureDefaultEventCategories(userId: string): Promise<void> {
  // Check if user already has categories
  const existingCategories = await query<EventCategory>(
    "SELECT * FROM event_categories WHERE userId = ? LIMIT 1",
    [userId]
  );

  // If user already has categories, don't add defaults
  if (existingCategories.length > 0) {
    return;
  }

  // Default categories for events (activity-based)
  const defaultCategories = [
    "Work",
    "Meeting",
    "Appointment",
    "Vacation",
    "Holiday"
  ];

  // Create all default categories
  for (const categoryName of defaultCategories) {
    try {
      await execute(
        "INSERT OR IGNORE INTO event_categories (userId, name) VALUES (?, ?)",
        [userId, categoryName]
      );
    } catch (error) {
      // Silently ignore errors (e.g., if category already exists)
      console.error(`Failed to create default event category "${categoryName}":`, error);
    }
  }
}
