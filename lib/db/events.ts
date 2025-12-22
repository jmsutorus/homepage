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
  slug: string;
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
  content: string | null; // Markdown content
  created_at: string;
  updated_at: string;
}

export interface CreateEventInput {
  slug: string;
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
  content?: string;
}

export interface UpdateEventInput {
  slug?: string;
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
  content?: string;
}

// Event Photo types
export interface EventPhoto {
  id: number;
  eventId: number;
  url: string;
  caption: string | null;
  date_taken: string | null; // YYYY-MM-DD
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface EventPhotoInput {
  url: string;
  caption?: string;
  date_taken?: string;
  order_index?: number;
}

/**
 * Person associated with an event (from event_people junction)
 */
export interface EventPerson {
  id: number;           // event_people.id
  eventId: number;
  personId: number;
  name: string;         // Joined from people table
  photo: string | null; // Joined from people table
  relationship: 'family' | 'friends' | 'work' | 'other';
  relationshipTypeName?: string | null;
  created_at: string;
}

// Composite type with event and photos
export interface EventWithDetails {
  event: Event;
  photos: EventPhoto[];
  people: EventPerson[];
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
  slug: string;
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
  content: string | null;
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
      userId, slug, title, description, location, date, start_time, end_time, all_day, end_date, category, notifications, content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.slug,
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
      input.content || null,
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

  if (updates.slug !== undefined) {
    fields.push("slug = ?");
    params.push(updates.slug);
  }

  if (updates.content !== undefined) {
    fields.push("content = ?");
    params.push(updates.content || null);
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

// ==================== Slug-based Event Queries ====================

/**
 * Get event by slug for a specific user
 */
export async function getEventBySlug(slug: string, userId: string): Promise<Event | undefined> {
  const row = await queryOne<DBEvent>("SELECT * FROM events WHERE slug = ? AND userId = ?", [slug, userId]);
  return row ? transformEvent(row) : undefined;
}

/**
 * Get event with all photos
 */
export async function getEventWithDetails(slug: string, userId: string): Promise<EventWithDetails | undefined> {
  const event = await getEventBySlug(slug, userId);
  if (!event) return undefined;

  const [photos, people] = await Promise.all([
    getEventPhotos(event.id),
    getEventPeople(event.id),
  ]);

  return {
    event,
    photos,
    people,
  };
}

/**
 * Check if a slug already exists for a user
 */
export async function eventSlugExists(
  slug: string,
  userId: string,
  excludeId?: number
): Promise<boolean> {
  let sql = "SELECT COUNT(*) as count FROM events WHERE slug = ? AND userId = ?";
  const params: (string | number)[] = [slug, userId];

  if (excludeId !== undefined) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const result = await queryOne<{ count: number }>(sql, params);
  return (result?.count || 0) > 0;
}

// ==================== Event Photo CRUD ====================

/**
 * Create a new event photo
 */
export async function createEventPhoto(
  eventId: number,
  data: EventPhotoInput
): Promise<EventPhoto> {
  // Get the next order index
  const maxOrder = await queryOne<{ max_order: number | null }>(
    "SELECT MAX(order_index) as max_order FROM event_photos WHERE eventId = ?",
    [eventId]
  );
  const orderIndex = data.order_index ?? ((maxOrder?.max_order ?? -1) + 1);

  const result = await execute(
    `INSERT INTO event_photos (
      eventId, url, caption, date_taken, order_index
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      eventId,
      data.url,
      data.caption || null,
      data.date_taken || null,
      orderIndex,
    ]
  );

  const photo = await getEventPhoto(result.lastInsertRowid as number, eventId);
  if (!photo) {
    throw new Error("Failed to create event photo");
  }
  return photo;
}

/**
 * Get all photos for an event, ordered by order_index
 */
export async function getEventPhotos(eventId: number): Promise<EventPhoto[]> {
  return query<EventPhoto>(
    "SELECT * FROM event_photos WHERE eventId = ? ORDER BY order_index ASC",
    [eventId]
  );
}

/**
 * Get a single event photo
 */
export async function getEventPhoto(
  id: number,
  eventId: number
): Promise<EventPhoto | undefined> {
  return queryOne<EventPhoto>(
    "SELECT * FROM event_photos WHERE id = ? AND eventId = ?",
    [id, eventId]
  );
}

/**
 * Update an event photo
 */
export async function updateEventPhoto(
  id: number,
  eventId: number,
  data: Partial<EventPhotoInput>
): Promise<boolean> {
  const photo = await getEventPhoto(id, eventId);
  if (!photo) return false;

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.url !== undefined) {
    updates.push("url = ?");
    values.push(data.url);
  }
  if (data.caption !== undefined) {
    updates.push("caption = ?");
    values.push(data.caption || null);
  }
  if (data.date_taken !== undefined) {
    updates.push("date_taken = ?");
    values.push(data.date_taken || null);
  }
  if (data.order_index !== undefined) {
    updates.push("order_index = ?");
    values.push(data.order_index);
  }

  if (updates.length === 0) return true;

  values.push(id, eventId);
  await execute(
    `UPDATE event_photos SET ${updates.join(", ")} WHERE id = ? AND eventId = ?`,
    values
  );
  return true;
}

/**
 * Delete an event photo
 */
export async function deleteEventPhoto(
  id: number,
  eventId: number
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM event_photos WHERE id = ? AND eventId = ?",
    [id, eventId]
  );
  return result.changes > 0;
}

/**
 * Delete all photos for an event
 */
export async function deleteAllEventPhotos(eventId: number): Promise<number> {
  const result = await execute(
    "DELETE FROM event_photos WHERE eventId = ?",
    [eventId]
  );
  return result.changes;
}

/**
 * Add a person to an event
 */
export async function addPersonToEvent(
  eventId: number,
  personId: number,
  userId: string
): Promise<EventPerson> {
  const result = await execute(
    `INSERT INTO event_people (userId, eventId, personId) VALUES (?, ?, ?)`,
    [userId, eventId, personId]
  );

  const person = await queryOne<EventPerson>(
    `SELECT
      ep.id,
      ep.eventId,
      ep.personId,
      p.name,
      p.photo,
      p.relationship,
      rt.name as relationshipTypeName,
      ep.created_at
    FROM event_people ep
    JOIN people p ON p.id = ep.personId
    LEFT JOIN relationship_types rt ON rt.id = p.relationship_type_id
    WHERE ep.id = ?`,
    [Number(result.lastInsertRowid)]
  );

  if (!person) {
    throw new Error('Failed to retrieve added person');
  }

  return person;
}

/**
 * Get all people associated with an event
 */
export async function getEventPeople(eventId: number): Promise<EventPerson[]> {
  const people = await query<EventPerson>(
    `SELECT
      ep.id,
      ep.eventId,
      ep.personId,
      p.name,
      p.photo,
      p.relationship,
      rt.name as relationshipTypeName,
      ep.created_at
    FROM event_people ep
    JOIN people p ON p.id = ep.personId
    LEFT JOIN relationship_types rt ON rt.id = p.relationship_type_id
    WHERE ep.eventId = ?
    ORDER BY p.name ASC`,
    [eventId]
  );

  return people;
}

/**
 * Get a single event-person association
 */
export async function getEventPerson(
  id: number,
  eventId: number
): Promise<EventPerson | undefined> {
  return await queryOne<EventPerson>(
    `SELECT
      ep.id,
      ep.eventId,
      ep.personId,
      p.name,
      p.photo,
      p.relationship,
      rt.name as relationshipTypeName,
      ep.created_at
    FROM event_people ep
    JOIN people p ON p.id = ep.personId
    LEFT JOIN relationship_types rt ON rt.id = p.relationship_type_id
    WHERE ep.id = ? AND ep.eventId = ?`,
    [id, eventId]
  );
}

/**
 * Remove a person from an event by association ID
 */
export async function removePersonFromEvent(
  id: number,
  eventId: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM event_people WHERE id = ? AND eventId = ? AND userId = ?",
    [id, eventId, userId]
  );
  return result.changes > 0;
}

/**
 * Remove a person from an event by person ID
 */
export async function removePersonFromEventByPersonId(
  eventId: number,
  personId: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM event_people WHERE eventId = ? AND personId = ? AND userId = ?",
    [eventId, personId, userId]
  );
  return result.changes > 0;
}

/**
 * Delete all people associations for an event
 */
export async function deleteAllEventPeople(eventId: number): Promise<number> {
  const result = await execute(
    "DELETE FROM event_people WHERE eventId = ?",
    [eventId]
  );
  return result.changes;
}

/**
 * Check if a person is already associated with an event
 */
export async function isPersonOnEvent(
  eventId: number,
  personId: number
): Promise<boolean> {
  const result = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM event_people WHERE eventId = ? AND personId = ?",
    [eventId, personId]
  );
  return (result?.count || 0) > 0;
}
