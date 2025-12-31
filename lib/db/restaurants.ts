import { execute, query, queryOne } from "./index";

// ==================== Types ====================

export type RestaurantStatus = 'visited' | 'want_to_try' | 'closed';

export interface Restaurant {
  id: number;
  userId: string;
  slug: string;
  name: string;
  cuisine: string | null;
  price_range: number | null; // 1-4 ($-$$$$)
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  poster: string | null;
  rating: number | null; // 1-10
  notes: string | null;
  favorite: boolean;
  status: RestaurantStatus;
  created_at: string;
  updated_at: string;
}

export interface RestaurantVisit {
  id: number;
  userId: string;
  restaurantId: number;
  eventId: number | null;
  visit_date: string; // YYYY-MM-DD
  notes: string | null;
  rating: number | null; // 1-10
  created_at: string;
  // Joined fields from events table
  eventTitle?: string | null;
  eventSlug?: string | null;
}

export interface RestaurantWithVisits extends Restaurant {
  visits: RestaurantVisit[];
  visitCount: number;
}

export interface CreateRestaurantInput {
  slug: string;
  name: string;
  cuisine?: string;
  price_range?: number;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  poster?: string;
  rating?: number;
  notes?: string;
  favorite?: boolean;
  status?: RestaurantStatus;
}

export interface UpdateRestaurantInput {
  slug?: string;
  name?: string;
  cuisine?: string;
  price_range?: number;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  poster?: string;
  rating?: number;
  notes?: string;
  favorite?: boolean;
  status?: RestaurantStatus;
}

export interface CreateVisitInput {
  restaurantId: number;
  eventId?: number;
  visit_date: string;
  notes?: string;
  rating?: number;
}

// ==================== DB Row Types ====================

interface DBRestaurant {
  id: number;
  userId: string;
  slug: string;
  name: string;
  cuisine: string | null;
  price_range: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  poster: string | null;
  rating: number | null;
  notes: string | null;
  favorite: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DBRestaurantVisit {
  id: number;
  userId: string;
  restaurantId: number;
  eventId: number | null;
  visit_date: string;
  notes: string | null;
  rating: number | null;
  created_at: string;
  eventTitle?: string | null;
  eventSlug?: string | null;
}

// ==================== Transform Functions ====================

function transformRestaurant(row: DBRestaurant): Restaurant {
  return {
    ...row,
    favorite: Boolean(row.favorite),
    status: row.status as RestaurantStatus,
  };
}

function transformVisit(row: DBRestaurantVisit): RestaurantVisit {
  return {
    ...row,
  };
}

// ==================== Restaurant CRUD ====================

/**
 * Get all restaurants for a user
 */
export async function getAllRestaurants(userId: string): Promise<Restaurant[]> {
  const rows = await query<DBRestaurant>(
    `SELECT * FROM restaurants WHERE userId = ? ORDER BY name ASC`,
    [userId]
  );
  return rows.map(transformRestaurant);
}

/**
 * Get restaurants with visit count for card display
 */
export async function getAllRestaurantsWithVisitCount(userId: string): Promise<(Restaurant & { visitCount: number })[]> {
  const rows = await query<DBRestaurant & { visitCount: number }>(
    `SELECT r.*, 
      (SELECT COUNT(*) FROM restaurant_visits WHERE restaurantId = r.id) as visitCount
    FROM restaurants r
    WHERE r.userId = ?
    ORDER BY r.name ASC`,
    [userId]
  );
  return rows.map(row => ({
    ...transformRestaurant(row),
    visitCount: row.visitCount,
  }));
}

/**
 * Get a restaurant by slug
 */
export async function getRestaurantBySlug(slug: string, userId: string): Promise<Restaurant | undefined> {
  const row = await queryOne<DBRestaurant>(
    `SELECT * FROM restaurants WHERE slug = ? AND userId = ?`,
    [slug, userId]
  );
  return row ? transformRestaurant(row) : undefined;
}

/**
 * Get a restaurant with all its visits
 */
export async function getRestaurantWithVisits(slug: string, userId: string): Promise<RestaurantWithVisits | undefined> {
  const restaurant = await getRestaurantBySlug(slug, userId);
  if (!restaurant) return undefined;

  const visits = await getRestaurantVisits(restaurant.id);
  
  return {
    ...restaurant,
    visits,
    visitCount: visits.length,
  };
}

/**
 * Create a new restaurant
 */
export async function createRestaurant(input: CreateRestaurantInput, userId: string): Promise<Restaurant> {
  const result = await execute(
    `INSERT INTO restaurants (
      userId, slug, name, cuisine, price_range, address, city, state, 
      phone, website, poster, rating, notes, favorite, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.slug,
      input.name,
      input.cuisine || null,
      input.price_range || null,
      input.address || null,
      input.city || null,
      input.state || null,
      input.phone || null,
      input.website || null,
      input.poster || null,
      input.rating || null,
      input.notes || null,
      input.favorite ? 1 : 0,
      input.status || 'visited',
    ]
  );

  const restaurant = await queryOne<DBRestaurant>(
    `SELECT * FROM restaurants WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!restaurant) {
    throw new Error('Failed to create restaurant');
  }

  return transformRestaurant(restaurant);
}

/**
 * Update a restaurant
 */
export async function updateRestaurant(
  slug: string,
  userId: string,
  updates: UpdateRestaurantInput
): Promise<Restaurant | undefined> {
  const existing = await getRestaurantBySlug(slug, userId);
  if (!existing) return undefined;

  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.slug !== undefined) {
    fields.push('slug = ?');
    params.push(updates.slug);
  }
  if (updates.cuisine !== undefined) {
    fields.push('cuisine = ?');
    params.push(updates.cuisine || null);
  }
  if (updates.price_range !== undefined) {
    fields.push('price_range = ?');
    params.push(updates.price_range || null);
  }
  if (updates.address !== undefined) {
    fields.push('address = ?');
    params.push(updates.address || null);
  }
  if (updates.city !== undefined) {
    fields.push('city = ?');
    params.push(updates.city || null);
  }
  if (updates.state !== undefined) {
    fields.push('state = ?');
    params.push(updates.state || null);
  }
  if (updates.phone !== undefined) {
    fields.push('phone = ?');
    params.push(updates.phone || null);
  }
  if (updates.website !== undefined) {
    fields.push('website = ?');
    params.push(updates.website || null);
  }
  if (updates.poster !== undefined) {
    fields.push('poster = ?');
    params.push(updates.poster || null);
  }
  if (updates.rating !== undefined) {
    fields.push('rating = ?');
    params.push(updates.rating || null);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes || null);
  }
  if (updates.favorite !== undefined) {
    fields.push('favorite = ?');
    params.push(updates.favorite ? 1 : 0);
  }
  if (updates.status !== undefined) {
    fields.push('status = ?');
    params.push(updates.status);
  }

  if (fields.length === 0) {
    return existing;
  }

  params.push(existing.id, userId);
  await execute(
    `UPDATE restaurants SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );

  const newSlug = updates.slug || slug;
  return getRestaurantBySlug(newSlug, userId);
}

/**
 * Delete a restaurant
 */
export async function deleteRestaurant(slug: string, userId: string): Promise<boolean> {
  const existing = await getRestaurantBySlug(slug, userId);
  if (!existing) return false;

  const result = await execute(
    `DELETE FROM restaurants WHERE id = ? AND userId = ?`,
    [existing.id, userId]
  );
  return result.changes > 0;
}

/**
 * Check if a slug exists
 */
export async function restaurantSlugExists(slug: string, userId: string, excludeId?: number): Promise<boolean> {
  let sql = 'SELECT COUNT(*) as count FROM restaurants WHERE slug = ? AND userId = ?';
  const params: (string | number)[] = [slug, userId];

  if (excludeId !== undefined) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }

  const result = await queryOne<{ count: number }>(sql, params);
  return (result?.count || 0) > 0;
}

// ==================== Restaurant Visits ====================

/**
 * Get all visits for a restaurant
 */
export async function getRestaurantVisits(restaurantId: number): Promise<RestaurantVisit[]> {
  const rows = await query<DBRestaurantVisit>(
    `SELECT rv.*, e.title as eventTitle, e.slug as eventSlug
    FROM restaurant_visits rv
    LEFT JOIN events e ON e.id = rv.eventId
    WHERE rv.restaurantId = ?
    ORDER BY rv.visit_date DESC`,
    [restaurantId]
  );
  return rows.map(transformVisit);
}

/**
 * Get visits linked to an event
 */
export async function getVisitsByEvent(eventId: number): Promise<(RestaurantVisit & { restaurantName: string; restaurantSlug: string })[]> {
  const rows = await query<DBRestaurantVisit & { restaurantName: string; restaurantSlug: string }>(
    `SELECT rv.*, r.name as restaurantName, r.slug as restaurantSlug
    FROM restaurant_visits rv
    JOIN restaurants r ON r.id = rv.restaurantId
    WHERE rv.eventId = ?
    ORDER BY rv.visit_date DESC`,
    [eventId]
  );
  return rows.map(row => ({
    ...transformVisit(row),
    restaurantName: row.restaurantName,
    restaurantSlug: row.restaurantSlug,
  }));
}

/**
 * Add a visit to a restaurant
 */
export async function createVisit(input: CreateVisitInput, userId: string): Promise<RestaurantVisit> {
  const result = await execute(
    `INSERT INTO restaurant_visits (userId, restaurantId, eventId, visit_date, notes, rating)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.restaurantId,
      input.eventId || null,
      input.visit_date,
      input.notes || null,
      input.rating || null,
    ]
  );

  const visit = await queryOne<DBRestaurantVisit>(
    `SELECT rv.*, e.title as eventTitle, e.slug as eventSlug
    FROM restaurant_visits rv
    LEFT JOIN events e ON e.id = rv.eventId
    WHERE rv.id = ?`,
    [result.lastInsertRowid]
  );

  if (!visit) {
    throw new Error('Failed to create visit');
  }

  return transformVisit(visit);
}

/**
 * Update a visit
 */
export async function updateVisit(
  id: number,
  userId: string,
  updates: { notes?: string; rating?: number; visit_date?: string; eventId?: number | null }
): Promise<boolean> {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes || null);
  }
  if (updates.rating !== undefined) {
    fields.push('rating = ?');
    params.push(updates.rating || null);
  }
  if (updates.visit_date !== undefined) {
    fields.push('visit_date = ?');
    params.push(updates.visit_date);
  }
  if (updates.eventId !== undefined) {
    fields.push('eventId = ?');
    params.push(updates.eventId);
  }

  if (fields.length === 0) return true;

  params.push(id, userId);
  const result = await execute(
    `UPDATE restaurant_visits SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );
  return result.changes > 0;
}

/**
 * Delete a visit
 */
export async function deleteVisit(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM restaurant_visits WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Get a single visit
 */
export async function getVisit(id: number, userId: string): Promise<RestaurantVisit | undefined> {
  const row = await queryOne<DBRestaurantVisit>(
    `SELECT rv.*, e.title as eventTitle, e.slug as eventSlug
    FROM restaurant_visits rv
    LEFT JOIN events e ON e.id = rv.eventId
    WHERE rv.id = ? AND rv.userId = ?`,
    [id, userId]
  );
  return row ? transformVisit(row) : undefined;
}
