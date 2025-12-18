import { execute, query, queryOne } from "./index";

// Re-export types from shared types file
export type {
  VacationStatus,
  VacationType,
  BookingType,
  BookingStatus,
  Vacation,
  VacationInput,
  ItineraryDay,
  ItineraryDayInput,
  Booking,
  BookingInput,
  VacationPhoto,
  VacationPhotoInput,
  VacationWithDetails,
} from "@/lib/types/vacations";

export {
  VACATION_STATUSES,
  VACATION_STATUS_NAMES,
  VACATION_TYPES,
  VACATION_TYPE_NAMES,
  BOOKING_TYPES,
  BOOKING_TYPE_NAMES,
  BOOKING_STATUSES,
  BOOKING_STATUS_NAMES,
  calculateDurationDays,
  calculateDayNumber,
  formatDateYMD,
  getYearFromDate,
  calculateTotalBudget,
} from "@/lib/types/vacations";

import type {
  Vacation,
  VacationInput,
  ItineraryDay,
  ItineraryDayInput,
  Booking,
  BookingInput,
  VacationPhoto,
  VacationPhotoInput,
  VacationWithDetails
} from "@/lib/types/vacations";

// ==================== Helper Functions ====================

/**
 * Parse a vacation row from the database
 * Converts JSON fields and SQLite booleans to proper types
 */
function parseVacation(row: any): Vacation {
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
    featured: row.featured === 1,
    published: row.published === 1,
  };
}

/**
 * Parse an itinerary day row from the database
 */
function parseItineraryDay(row: any): ItineraryDay {
  return {
    ...row,
    activities: row.activities ? JSON.parse(row.activities) : [],
  };
}

// ==================== Vacation CRUD ====================

/**
 * Create a new vacation
 */
export async function createVacation(
  data: VacationInput,
  userId: string
): Promise<Vacation> {
  const result = await execute(
    `INSERT INTO vacations (
      userId, slug, title, destination, type, start_date, end_date,
      description, poster, status, budget_planned, budget_actual,
      budget_currency, tags, rating, featured, published, content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.slug,
      data.title,
      data.destination,
      data.type || 'other',
      data.start_date,
      data.end_date,
      data.description || null,
      data.poster || null,
      data.status || 'planning',
      data.budget_planned || null,
      data.budget_actual || null,
      data.budget_currency || 'USD',
      data.tags ? JSON.stringify(data.tags) : null,
      data.rating || null,
      data.featured ? 1 : 0,
      data.published !== undefined ? (data.published ? 1 : 0) : 1,
      data.content || null,
    ]
  );

  const vacation = await getVacationById(result.lastInsertRowid as number, userId);
  if (!vacation) {
    throw new Error("Failed to create vacation");
  }
  return vacation;
}

/**
 * Get a vacation by ID with ownership verification
 */
export async function getVacationById(
  id: number,
  userId: string
): Promise<Vacation | undefined> {
  const row = await queryOne<any>(
    "SELECT * FROM vacations WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return row ? parseVacation(row) : undefined;
}

/**
 * Get a vacation by slug with ownership verification
 */
export async function getVacationBySlug(
  slug: string,
  userId: string
): Promise<Vacation | undefined> {
  const row = await queryOne<any>(
    "SELECT * FROM vacations WHERE slug = ? AND userId = ?",
    [slug, userId]
  );
  return row ? parseVacation(row) : undefined;
}

/**
 * Get all vacations for a user
 */
export async function getAllVacations(userId: string): Promise<Vacation[]> {
  const rows = await query<any>(
    "SELECT * FROM vacations WHERE userId = ? ORDER BY start_date DESC",
    [userId]
  );
  return rows.map(parseVacation);
}

/**
 * Get vacations for a specific year
 */
export async function getVacationsByYear(
  year: number,
  userId: string
): Promise<Vacation[]> {
  const rows = await query<any>(
    `SELECT * FROM vacations
     WHERE userId = ?
     AND (
       substr(start_date, 1, 4) = ?
       OR substr(end_date, 1, 4) = ?
     )
     ORDER BY start_date ASC`,
    [userId, year.toString(), year.toString()]
  );
  return rows.map(parseVacation);
}

/**
 * Get vacation with all related itinerary and bookings
 */
export async function getVacationWithDetails(
  slug: string,
  userId: string
): Promise<VacationWithDetails | undefined> {
  const vacation = await getVacationBySlug(slug, userId);
  if (!vacation) return undefined;

  const itinerary = await getItineraryDays(vacation.id);
  const bookings = await getBookings(vacation.id);
  const photos = await getVacationPhotos(vacation.id);

  return {
    vacation,
    itinerary,
    bookings,
    photos,
  };
}

/**
 * Update a vacation with ownership verification
 */
export async function updateVacation(
  id: number,
  userId: string,
  data: Partial<VacationInput>
): Promise<boolean> {
  const vacation = await getVacationById(id, userId);
  if (!vacation) return false;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.slug !== undefined) {
    updates.push("slug = ?");
    values.push(data.slug);
  }
  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data.destination !== undefined) {
    updates.push("destination = ?");
    values.push(data.destination);
  }
  if (data.type !== undefined) {
    updates.push("type = ?");
    values.push(data.type);
  }
  if (data.start_date !== undefined) {
    updates.push("start_date = ?");
    values.push(data.start_date);
  }
  if (data.end_date !== undefined) {
    updates.push("end_date = ?");
    values.push(data.end_date);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description);
  }
  if (data.poster !== undefined) {
    updates.push("poster = ?");
    values.push(data.poster);
  }
  if (data.status !== undefined) {
    updates.push("status = ?");
    values.push(data.status);
  }
  if (data.budget_planned !== undefined) {
    updates.push("budget_planned = ?");
    values.push(data.budget_planned);
  }
  if (data.budget_actual !== undefined) {
    updates.push("budget_actual = ?");
    values.push(data.budget_actual);
  }
  if (data.budget_currency !== undefined) {
    updates.push("budget_currency = ?");
    values.push(data.budget_currency);
  }
  if (data.tags !== undefined) {
    updates.push("tags = ?");
    values.push(JSON.stringify(data.tags));
  }
  if (data.rating !== undefined) {
    updates.push("rating = ?");
    values.push(data.rating);
  }
  if (data.featured !== undefined) {
    updates.push("featured = ?");
    values.push(data.featured ? 1 : 0);
  }
  if (data.published !== undefined) {
    updates.push("published = ?");
    values.push(data.published ? 1 : 0);
  }
  if (data.content !== undefined) {
    updates.push("content = ?");
    values.push(data.content);
  }

  if (updates.length === 0) return true;

  values.push(id, userId);
  await execute(
    `UPDATE vacations SET ${updates.join(", ")} WHERE id = ? AND userId = ?`,
    values
  );
  return true;
}

/**
 * Delete a vacation with ownership verification
 * Cascade deletes itinerary and bookings
 */
export async function deleteVacation(
  id: number,
  userId: string
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM vacations WHERE id = ? AND userId = ?",
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Check if a slug already exists for a user
 */
export async function vacationSlugExists(
  slug: string,
  userId: string,
  excludeId?: number
): Promise<boolean> {
  let sql = "SELECT COUNT(*) as count FROM vacations WHERE slug = ? AND userId = ?";
  const params: any[] = [slug, userId];

  if (excludeId !== undefined) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const result = await queryOne<{ count: number }>(sql, params);
  return (result?.count || 0) > 0;
}

// ==================== Itinerary Day CRUD ====================

/**
 * Create a new itinerary day
 */
export async function createItineraryDay(
  vacationId: number,
  data: ItineraryDayInput
): Promise<ItineraryDay> {
  const result = await execute(
    `INSERT INTO vacation_itinerary_days (
      vacationId, date, day_number, title, location,
      activities, notes, budget_planned, budget_actual
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vacationId,
      data.date,
      data.day_number,
      data.title || null,
      data.location || null,
      data.activities ? JSON.stringify(data.activities) : null,
      data.notes || null,
      data.budget_planned || null,
      data.budget_actual || null,
    ]
  );

  const day = await getItineraryDay(result.lastInsertRowid as number, vacationId);
  if (!day) {
    throw new Error("Failed to create itinerary day");
  }
  return day;
}

/**
 * Get all itinerary days for a vacation
 */
export async function getItineraryDays(vacationId: number): Promise<ItineraryDay[]> {
  const rows = await query<any>(
    "SELECT * FROM vacation_itinerary_days WHERE vacationId = ? ORDER BY date ASC",
    [vacationId]
  );
  return rows.map(parseItineraryDay);
}

/**
 * Get a single itinerary day
 */
export async function getItineraryDay(
  id: number,
  vacationId: number
): Promise<ItineraryDay | undefined> {
  const row = await queryOne<any>(
    "SELECT * FROM vacation_itinerary_days WHERE id = ? AND vacationId = ?",
    [id, vacationId]
  );
  return row ? parseItineraryDay(row) : undefined;
}

/**
 * Update an itinerary day
 */
export async function updateItineraryDay(
  id: number,
  vacationId: number,
  data: Partial<ItineraryDayInput>
): Promise<boolean> {
  const day = await getItineraryDay(id, vacationId);
  if (!day) return false;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.date !== undefined) {
    updates.push("date = ?");
    values.push(data.date);
  }
  if (data.day_number !== undefined) {
    updates.push("day_number = ?");
    values.push(data.day_number);
  }
  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data.location !== undefined) {
    updates.push("location = ?");
    values.push(data.location);
  }
  if (data.activities !== undefined) {
    updates.push("activities = ?");
    values.push(JSON.stringify(data.activities));
  }
  if (data.notes !== undefined) {
    updates.push("notes = ?");
    values.push(data.notes);
  }
  if (data.budget_planned !== undefined) {
    updates.push("budget_planned = ?");
    values.push(data.budget_planned);
  }
  if (data.budget_actual !== undefined) {
    updates.push("budget_actual = ?");
    values.push(data.budget_actual);
  }

  if (updates.length === 0) return true;

  values.push(id, vacationId);
  await execute(
    `UPDATE vacation_itinerary_days SET ${updates.join(", ")} WHERE id = ? AND vacationId = ?`,
    values
  );
  return true;
}

/**
 * Delete an itinerary day
 */
export async function deleteItineraryDay(
  id: number,
  vacationId: number
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM vacation_itinerary_days WHERE id = ? AND vacationId = ?",
    [id, vacationId]
  );
  return result.changes > 0;
}

/**
 * Delete all itinerary days for a vacation
 */
export async function deleteAllItineraryDays(vacationId: number): Promise<number> {
  const result = await execute(
    "DELETE FROM vacation_itinerary_days WHERE vacationId = ?",
    [vacationId]
  );
  return result.changes;
}

// ==================== Booking CRUD ====================

/**
 * Create a new booking
 */
export async function createBooking(
  vacationId: number,
  data: BookingInput
): Promise<Booking> {
  const result = await execute(
    `INSERT INTO vacation_bookings (
      vacationId, type, title, date, start_time, end_time,
      confirmation_number, provider, location, cost, status, notes, url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vacationId,
      data.type,
      data.title,
      data.date || null,
      data.start_time || null,
      data.end_time || null,
      data.confirmation_number || null,
      data.provider || null,
      data.location || null,
      data.cost || null,
      data.status || 'pending',
      data.notes || null,
      data.url || null,
    ]
  );

  const booking = await getBooking(result.lastInsertRowid as number, vacationId);
  if (!booking) {
    throw new Error("Failed to create booking");
  }
  return booking;
}

/**
 * Get all bookings for a vacation
 */
export async function getBookings(vacationId: number): Promise<Booking[]> {
  return query<Booking>(
    "SELECT * FROM vacation_bookings WHERE vacationId = ? ORDER BY date ASC, start_time ASC",
    [vacationId]
  );
}

/**
 * Get bookings by type
 */
export async function getBookingsByType(
  vacationId: number,
  type: string
): Promise<Booking[]> {
  return query<Booking>(
    "SELECT * FROM vacation_bookings WHERE vacationId = ? AND type = ? ORDER BY date ASC, start_time ASC",
    [vacationId, type]
  );
}

/**
 * Get a single booking
 */
export async function getBooking(
  id: number,
  vacationId: number
): Promise<Booking | undefined> {
  return queryOne<Booking>(
    "SELECT * FROM vacation_bookings WHERE id = ? AND vacationId = ?",
    [id, vacationId]
  );
}

/**
 * Update a booking
 */
export async function updateBooking(
  id: number,
  vacationId: number,
  data: Partial<BookingInput>
): Promise<boolean> {
  const booking = await getBooking(id, vacationId);
  if (!booking) return false;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.type !== undefined) {
    updates.push("type = ?");
    values.push(data.type);
  }
  if (data.title !== undefined) {
    updates.push("title = ?");
    values.push(data.title);
  }
  if (data.date !== undefined) {
    updates.push("date = ?");
    values.push(data.date);
  }
  if (data.start_time !== undefined) {
    updates.push("start_time = ?");
    values.push(data.start_time);
  }
  if (data.end_time !== undefined) {
    updates.push("end_time = ?");
    values.push(data.end_time);
  }
  if (data.confirmation_number !== undefined) {
    updates.push("confirmation_number = ?");
    values.push(data.confirmation_number);
  }
  if (data.provider !== undefined) {
    updates.push("provider = ?");
    values.push(data.provider);
  }
  if (data.location !== undefined) {
    updates.push("location = ?");
    values.push(data.location);
  }
  if (data.cost !== undefined) {
    updates.push("cost = ?");
    values.push(data.cost);
  }
  if (data.status !== undefined) {
    updates.push("status = ?");
    values.push(data.status);
  }
  if (data.notes !== undefined) {
    updates.push("notes = ?");
    values.push(data.notes);
  }
  if (data.url !== undefined) {
    updates.push("url = ?");
    values.push(data.url);
  }

  if (updates.length === 0) return true;

  values.push(id, vacationId);
  await execute(
    `UPDATE vacation_bookings SET ${updates.join(", ")} WHERE id = ? AND vacationId = ?`,
    values
  );
  return true;
}

/**
 * Delete a booking
 */
export async function deleteBooking(
  id: number,
  vacationId: number
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM vacation_bookings WHERE id = ? AND vacationId = ?",
    [id, vacationId]
  );
  return result.changes > 0;
}

export async function deleteAllBookings(vacationId: number): Promise<number> {
  const result = await execute(
    "DELETE FROM vacation_bookings WHERE vacationId = ?",
    [vacationId]
  );
  return result.changes;
}

// ==================== Homepage Queries ====================

/**
 * Get the currently active vacation for a user
 * A vacation is active if:
 * - status is 'in-progress', OR
 * - status is 'booked' and today falls between start_date and end_date
 */
export async function getActiveVacation(
  userId: string,
  todayDate: string
): Promise<Vacation | undefined> {
  const row = await queryOne<any>(
    `SELECT * FROM vacations 
     WHERE userId = ? 
     AND (
       status = 'in-progress'
       OR (status = 'booked' AND start_date <= ? AND end_date >= ?)
     )
     ORDER BY start_date ASC
     LIMIT 1`,
    [userId, todayDate, todayDate]
  );
  return row ? parseVacation(row) : undefined;
}

/**
 * Get upcoming vacations within a specified number of days
 * Returns vacations with start_date in the future (up to daysAhead)
 * and status in ['planning', 'booked']
 */
export async function getUpcomingVacations(
  userId: string,
  todayDate: string,
  daysAhead: number = 30
): Promise<Vacation[]> {
  const rows = await query<any>(
    `SELECT * FROM vacations 
     WHERE userId = ? 
     AND start_date > ?
     AND start_date <= date(?, '+' || ? || ' days')
     AND status IN ('planning', 'booked')
     ORDER BY start_date ASC`,
    [userId, todayDate, todayDate, daysAhead]
  );
  return rows.map(parseVacation);
}

// ==================== Photo CRUD ====================

/**
 * Create a new vacation photo
 */
export async function createVacationPhoto(
  vacationId: number,
  data: VacationPhotoInput
): Promise<VacationPhoto> {
  // Get the next order index
  const maxOrder = await queryOne<{ max_order: number | null }>(
    "SELECT MAX(order_index) as max_order FROM vacation_photos WHERE vacationId = ?",
    [vacationId]
  );
  const orderIndex = data.order_index ?? ((maxOrder?.max_order ?? -1) + 1);

  const result = await execute(
    `INSERT INTO vacation_photos (
      vacationId, url, caption, date_taken, order_index
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      vacationId,
      data.url,
      data.caption || null,
      data.date_taken || null,
      orderIndex,
    ]
  );

  const photo = await getVacationPhoto(result.lastInsertRowid as number, vacationId);
  if (!photo) {
    throw new Error("Failed to create vacation photo");
  }
  return photo;
}

/**
 * Get all photos for a vacation, ordered by order_index
 */
export async function getVacationPhotos(vacationId: number): Promise<VacationPhoto[]> {
  return query<VacationPhoto>(
    "SELECT * FROM vacation_photos WHERE vacationId = ? ORDER BY order_index ASC",
    [vacationId]
  );
}

/**
 * Get a single vacation photo
 */
export async function getVacationPhoto(
  id: number,
  vacationId: number
): Promise<VacationPhoto | undefined> {
  return queryOne<VacationPhoto>(
    "SELECT * FROM vacation_photos WHERE id = ? AND vacationId = ?",
    [id, vacationId]
  );
}

/**
 * Update a vacation photo
 */
export async function updateVacationPhoto(
  id: number,
  vacationId: number,
  data: Partial<VacationPhotoInput>
): Promise<boolean> {
  const photo = await getVacationPhoto(id, vacationId);
  if (!photo) return false;

  const updates: string[] = [];
  const values: any[] = [];

  if (data.url !== undefined) {
    updates.push("url = ?");
    values.push(data.url);
  }
  if (data.caption !== undefined) {
    updates.push("caption = ?");
    values.push(data.caption);
  }
  if (data.date_taken !== undefined) {
    updates.push("date_taken = ?");
    values.push(data.date_taken);
  }
  if (data.order_index !== undefined) {
    updates.push("order_index = ?");
    values.push(data.order_index);
  }

  if (updates.length === 0) return true;

  values.push(id, vacationId);
  await execute(
    `UPDATE vacation_photos SET ${updates.join(", ")} WHERE id = ? AND vacationId = ?`,
    values
  );
  return true;
}

/**
 * Delete a vacation photo
 */
export async function deleteVacationPhoto(
  id: number,
  vacationId: number
): Promise<boolean> {
  const result = await execute(
    "DELETE FROM vacation_photos WHERE id = ? AND vacationId = ?",
    [id, vacationId]
  );
  return result.changes > 0;
}

/**
 * Delete all photos for a vacation
 */
export async function deleteAllVacationPhotos(vacationId: number): Promise<number> {
  const result = await execute(
    "DELETE FROM vacation_photos WHERE vacationId = ?",
    [vacationId]
  );
  return result.changes;
}
