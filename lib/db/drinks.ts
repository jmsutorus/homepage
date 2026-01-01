import { execute, query, queryOne } from "./index";

// ==================== Types ====================

export type DrinkType = 'beer' | 'wine' | 'cocktail' | 'spirit' | 'other' | 'coffee' | 'tea';
export type DrinkStatus = 'tasted' | 'want_to_try' | 'stocked';

export interface Drink {
  id: number;
  userId: string;
  slug: string;
  name: string;
  type: DrinkType | null;
  producer: string | null;
  year: number | null;
  abv: number | null;
  rating: number | null; // 1-10
  notes: string | null;
  image_url: string | null;
  favorite: boolean;
  status: DrinkStatus;
  created_at: string;
  updated_at: string;
}

export interface DrinkLog {
  id: number;
  userId: string;
  drinkId: number;
  date: string; // YYYY-MM-DD
  location: string | null;
  notes: string | null;
  rating: number | null; // 1-10
  created_at: string;
}

export interface DrinkWithLogs extends Drink {
  logs: DrinkLog[];
  logCount: number;
}

export interface CreateDrinkInput {
  slug: string;
  name: string;
  type?: DrinkType;
  producer?: string;
  year?: number;
  abv?: number;
  rating?: number;
  notes?: string;
  image_url?: string;
  favorite?: boolean;
  status?: DrinkStatus;
}

export interface UpdateDrinkInput {
  slug?: string;
  name?: string;
  type?: DrinkType;
  producer?: string;
  year?: number;
  abv?: number;
  rating?: number;
  notes?: string;
  image_url?: string;
  favorite?: boolean;
  status?: DrinkStatus;
}

export interface CreateDrinkLogInput {
  drinkId: number;
  date: string;
  location?: string;
  notes?: string;
  rating?: number;
}

// ==================== DB Row Types ====================

interface DBDrink {
  id: number;
  userId: string;
  slug: string;
  name: string;
  type: string | null;
  producer: string | null;
  year: number | null;
  abv: number | null;
  rating: number | null;
  notes: string | null;
  image_url: string | null;
  favorite: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DBDrinkLog {
  id: number;
  userId: string;
  drinkId: number;
  date: string;
  location: string | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
}

// ==================== Transform Functions ====================

function transformDrink(row: DBDrink): Drink {
  return {
    ...row,
    favorite: Boolean(row.favorite),
    status: row.status as DrinkStatus,
    type: row.type as DrinkType,
  };
}

function transformLog(row: DBDrinkLog): DrinkLog {
  return {
    ...row,
  };
}

// ==================== Drink CRUD ====================

/**
 * Get all drinks for a user
 */
export async function getAllDrinks(userId: string): Promise<Drink[]> {
  const rows = await query<DBDrink>(
    `SELECT * FROM drinks WHERE userId = ? ORDER BY name ASC`,
    [userId]
  );
  return rows.map(transformDrink);
}

/**
 * Get drinks with log count for card display
 */
export async function getAllDrinksWithLogCount(userId: string): Promise<(Drink & { logCount: number })[]> {
  const rows = await query<DBDrink & { logCount: number }>(
    `SELECT d.*, 
      (SELECT COUNT(*) FROM drink_logs WHERE drinkId = d.id) as logCount
    FROM drinks d
    WHERE d.userId = ?
    ORDER BY d.name ASC`,
    [userId]
  );
  return rows.map(row => ({
    ...transformDrink(row),
    logCount: row.logCount,
  }));
}

/**
 * Get a drink by slug
 */
export async function getDrinkBySlug(slug: string, userId: string): Promise<Drink | undefined> {
  const row = await queryOne<DBDrink>(
    `SELECT * FROM drinks WHERE slug = ? AND userId = ?`,
    [slug, userId]
  );
  return row ? transformDrink(row) : undefined;
}

/**
 * Get a drink with all its logs
 */
export async function getDrinkWithLogs(slug: string, userId: string): Promise<DrinkWithLogs | undefined> {
  const drink = await getDrinkBySlug(slug, userId);
  if (!drink) return undefined;

  const logs = await getDrinkLogs(drink.id);
  
  return {
    ...drink,
    logs,
    logCount: logs.length,
  };
}

/**
 * Create a new drink
 */
export async function createDrink(input: CreateDrinkInput, userId: string): Promise<Drink> {
  const result = await execute(
    `INSERT INTO drinks (
      userId, slug, name, type, producer, year, abv, rating, notes, image_url, favorite, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.slug,
      input.name,
      input.type || null,
      input.producer || null,
      input.year || null,
      input.abv || null,
      input.rating || null,
      input.notes || null,
      input.image_url || null,
      input.favorite ? 1 : 0,
      input.status || 'tasted',
    ]
  );

  const drink = await queryOne<DBDrink>(
    `SELECT * FROM drinks WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!drink) {
    throw new Error('Failed to create drink');
  }

  return transformDrink(drink);
}

/**
 * Update a drink
 */
export async function updateDrink(
  slug: string,
  userId: string,
  updates: UpdateDrinkInput
): Promise<Drink | undefined> {
  const existing = await getDrinkBySlug(slug, userId);
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
  if (updates.type !== undefined) {
    fields.push('type = ?');
    params.push(updates.type || null);
  }
  if (updates.producer !== undefined) {
    fields.push('producer = ?');
    params.push(updates.producer || null);
  }
  if (updates.year !== undefined) {
    fields.push('year = ?');
    params.push(updates.year || null);
  }
  if (updates.abv !== undefined) {
    fields.push('abv = ?');
    params.push(updates.abv || null);
  }
  if (updates.rating !== undefined) {
    fields.push('rating = ?');
    params.push(updates.rating || null);
  }
  if (updates.notes !== undefined) {
    fields.push('notes = ?');
    params.push(updates.notes || null);
  }
  if (updates.image_url !== undefined) {
    fields.push('image_url = ?');
    params.push(updates.image_url || null);
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
    `UPDATE drinks SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );

  const newSlug = updates.slug || slug;
  return getDrinkBySlug(newSlug, userId);
}

/**
 * Delete a drink
 */
export async function deleteDrink(slug: string, userId: string): Promise<boolean> {
  const existing = await getDrinkBySlug(slug, userId);
  if (!existing) return false;

  const result = await execute(
    `DELETE FROM drinks WHERE id = ? AND userId = ?`,
    [existing.id, userId]
  );
  return result.changes > 0;
}

/**
 * Check if a slug exists
 */
export async function drinkSlugExists(slug: string, userId: string, excludeId?: number): Promise<boolean> {
  let sql = 'SELECT COUNT(*) as count FROM drinks WHERE slug = ? AND userId = ?';
  const params: (string | number)[] = [slug, userId];

  if (excludeId !== undefined) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }

  const result = await queryOne<{ count: number }>(sql, params);
  return (result?.count || 0) > 0;
}

// ==================== Drink Logs ====================

/**
 * Get all logs for a drink
 */
export async function getDrinkLogs(drinkId: number): Promise<DrinkLog[]> {
  const rows = await query<DBDrinkLog>(
    `SELECT * FROM drink_logs WHERE drinkId = ? ORDER BY date DESC`,
    [drinkId]
  );
  return rows.map(transformLog);
}

/**
 * Add a log to a drink
 */
export async function createLog(input: CreateDrinkLogInput, userId: string): Promise<DrinkLog> {
  const result = await execute(
    `INSERT INTO drink_logs (userId, drinkId, date, location, notes, rating)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.drinkId,
      input.date,
      input.location || null,
      input.notes || null,
      input.rating || null,
    ]
  );

  const log = await queryOne<DBDrinkLog>(
    `SELECT * FROM drink_logs WHERE id = ?`,
    [result.lastInsertRowid]
  );

  if (!log) {
    throw new Error('Failed to create log');
  }

  return transformLog(log);
}

/**
 * Update a log
 */
export async function updateLog(
  id: number,
  userId: string,
  updates: { notes?: string; rating?: number; date?: string; location?: string }
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
  if (updates.date !== undefined) {
    fields.push('date = ?');
    params.push(updates.date);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    params.push(updates.location || null);
  }

  if (fields.length === 0) return true;

  params.push(id, userId);
  const result = await execute(
    `UPDATE drink_logs SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
    params
  );
  return result.changes > 0;
}

/**
 * Delete a log
 */
export async function deleteLog(id: number, userId: string): Promise<boolean> {
  const result = await execute(
    `DELETE FROM drink_logs WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return result.changes > 0;
}

/**
 * Get a single log
 */
export async function getLog(id: number, userId: string): Promise<DrinkLog | undefined> {
  const row = await queryOne<DBDrinkLog>(
    `SELECT * FROM drink_logs WHERE id = ? AND userId = ?`,
    [id, userId]
  );
  return row ? transformLog(row) : undefined;
}
