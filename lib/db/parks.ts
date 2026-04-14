import { getDatabase } from "./index";
import { ParkCategoryValue } from "./enums/park-enums";
import { checkAchievement } from "../achievements";

export interface DBPark {
  id: number;
  userId: string;
  slug: string;
  title: string;
  category: ParkCategoryValue;
  state: string | null;
  poster: string | null;
  description: string | null;
  visited: string | null; // YYYY-MM-DD
  tags: string | null; // JSON string
  rating: number | null;
  featured: number; // SQLite boolean (0 or 1)
  published: number; // SQLite boolean (0 or 1)
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ParkContent {
  id: number;
  userId: string;
  slug: string;
  title: string;
  category: ParkCategoryValue;
  state: string | null;
  poster: string | null;
  description: string | null;
  visited: string | null;
  tags: string[];
  rating: number | null;
  featured: boolean;
  published: boolean;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Convert database row to ParkContent object
 */
function dbToParkContent(row: DBPark): ParkContent {
  return {
    id: row.id,
    userId: row.userId,
    slug: row.slug,
    title: row.title,
    category: row.category,
    state: row.state,
    poster: row.poster,
    description: row.description,
    visited: row.visited,
    tags: row.tags ? JSON.parse(row.tags) : [],
    rating: row.rating,
    featured: row.featured === 1,
    published: row.published === 1,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Get all parks for a specific user
 */
export async function getAllParks(userId: string): Promise<ParkContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM parks
            WHERE userId = ?
            ORDER BY visited DESC, created_at DESC`,
      args: [userId]
    });
    const rows = result.rows as unknown as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting all parks:", error);
    return [];
  }
}

/**
 * Get published parks only
 */
export async function getPublishedParks(userId: string): Promise<ParkContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM parks
            WHERE published = 1 AND userId = ?
            ORDER BY visited DESC, created_at DESC`,
      args: [userId]
    });
    const rows = result.rows as unknown as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting published parks:", error);
    return [];
  }
}

/**
 * Get park by slug for a specific user
 */
export async function getParkBySlug(slug: string, userId: string): Promise<ParkContent | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM parks WHERE slug = ? AND userId = ?",
      args: [slug, userId]
    });
    const row = result.rows[0] as unknown as DBPark | undefined;
    return row ? dbToParkContent(row) : null;
  } catch (error) {
    console.error("Error getting park by slug:", error);
    return null;
  }
}

/**
 * Get parks by category
 */
export async function getParksByCategory(category: ParkCategoryValue, userId: string): Promise<ParkContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM parks
            WHERE category = ? AND published = 1 AND userId = ?
            ORDER BY visited DESC, created_at DESC`,
      args: [category, userId]
    });
    const rows = result.rows as unknown as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting parks by category:", error);
    return [];
  }
}

/**
 * Get parks by state
 */
export async function getParksByState(state: string, userId: string): Promise<ParkContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM parks
            WHERE state = ? AND published = 1 AND userId = ?
            ORDER BY visited DESC, created_at DESC`,
      args: [state, userId]
    });
    const rows = result.rows as unknown as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting parks by state:", error);
    return [];
  }
}

/**
 * Get featured parks
 */
export async function getFeaturedParks(): Promise<ParkContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM parks
            WHERE featured = 1 AND published = 1
            ORDER BY visited DESC, created_at DESC`,
      args: []
    });
    const rows = result.rows as unknown as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting featured parks:", error);
    return [];
  }
}

/**
 * Create a new park
 */
export async function createPark(data: {
  slug: string;
  title: string;
  category: ParkCategoryValue;
  state?: string;
  poster?: string;
  description?: string;
  visited?: string;
  tags?: string[];
  rating?: number;
  featured?: boolean;
  published?: boolean;
  content: string;
  userId: string;
}): Promise<ParkContent> {
  try {
    const db = getDatabase();

    await db.execute({
      sql: `INSERT INTO parks (
              slug, title, category, state, poster, description,
              visited, tags, rating, featured, published, content, userId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.slug,
        data.title,
        data.category,
        data.state || null,
        data.poster || null,
        data.description || null,
        data.visited || null,
        data.tags ? JSON.stringify(data.tags) : null,
        data.rating !== undefined ? data.rating : null,
        data.featured ? 1 : 0,
        data.published !== false ? 1 : 0,
        data.content,
        data.userId
      ]
    });

    const park = await getParkBySlug(data.slug, data.userId);
    if (!park) {
      throw new Error("Failed to create park");
    }

    // Check for achievements
    checkAchievement(data.userId, 'parks').catch(console.error);

    return park;
  } catch (error) {
    console.error("Error creating park:", error);
    throw error;
  }
}

/**
 * Update a park with ownership verification
 */
export async function updatePark(
  slug: string,
  userId: string,
  data: {
    newSlug?: string;
    title?: string;
    category?: ParkCategoryValue;
    state?: string;
    poster?: string;
    description?: string;
    visited?: string;
    tags?: string[];
    rating?: number;
    featured?: boolean;
    published?: boolean;
    content?: string;
  }
): Promise<ParkContent> {
  try {
    const db = getDatabase();

    // Verify ownership
    const existing = await getParkBySlug(slug, userId);
    if (!existing) {
      throw new Error("Park not found or access denied");
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.newSlug !== undefined) {
      updates.push("slug = ?");
      values.push(data.newSlug);
    }
    if (data.title !== undefined) {
      updates.push("title = ?");
      values.push(data.title);
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      values.push(data.category);
    }
    if (data.state !== undefined) {
      updates.push("state = ?");
      values.push(data.state || null);
    }
    if (data.poster !== undefined) {
      updates.push("poster = ?");
      values.push(data.poster || null);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description || null);
    }
    if (data.visited !== undefined) {
      updates.push("visited = ?");
      values.push(data.visited || null);
    }
    if (data.tags !== undefined) {
      updates.push("tags = ?");
      values.push(data.tags ? JSON.stringify(data.tags) : null);
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

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(slug, userId);

    await db.execute({
      sql: `UPDATE parks
            SET ${updates.join(", ")}
            WHERE slug = ? AND userId = ?`,
      args: values
    });

    const updatedSlug = data.newSlug || slug;
    const park = await getParkBySlug(updatedSlug, userId);
    if (!park) {
      throw new Error("Failed to update park");
    }

    return park;
  } catch (error) {
    console.error("Error updating park:", error);
    throw error;
  }
}

/**
 * Delete a park with ownership verification
 */
export async function deletePark(slug: string, userId: string): Promise<boolean> {
  try {
    const db = getDatabase();

    // Verify ownership
    const existing = await getParkBySlug(slug, userId);
    if (!existing) {
      return false;
    }

    const result = await db.execute({
      sql: "DELETE FROM parks WHERE slug = ? AND userId = ?",
      args: [slug, userId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error deleting park:", error);
    return false;
  }
}

/**
 * Check if a slug exists
 */
export async function parkSlugExists(slug: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM parks WHERE slug = ?",
      args: [slug]
    });
    const row = result.rows[0] as unknown as { count: number };
    return row.count > 0;
  } catch (error) {
    console.error("Error checking park slug:", error);
    return false;
  }
}

/**
 * Person associated with a park (from park_people junction)
 */
export interface ParkPerson {
  id: number;           // park_people.id
  parkId: number;
  personId: number;
  name: string;         // Joined from people table
  photo: string | null; // Joined from people table
  relationship: 'family' | 'friends' | 'work' | 'other';
  relationshipTypeName?: string | null;
  created_at: string;
}

/**
 * Add a person to a park
 */
export async function addPersonToPark(
  parkId: number,
  personId: number,
  userId: string
): Promise<ParkPerson | null> {
  try {
    const db = getDatabase();
    const insertResult = await db.execute({
      sql: `INSERT INTO park_people (userId, parkId, personId) VALUES (?, ?, ?)`,
      args: [userId, parkId, personId]
    });

    const personResult = await db.execute({
      sql: `SELECT
        pp.id,
        pp.parkId,
        pp.personId,
        p.name,
        p.photo,
        p.relationship,
        rt.name as relationshipTypeName,
        pp.created_at
      FROM park_people pp
      JOIN people p ON p.id = pp.personId
      LEFT JOIN relationship_types rt ON rt.id = p.relationship_type_id
      WHERE pp.id = ?`,
      args: [Number(insertResult.lastInsertRowid)]
    });

    const person = personResult.rows[0] as unknown as ParkPerson | undefined;
    return person || null;
  } catch (error) {
    console.error("Error adding person to park:", error);
    return null;
  }
}

/**
 * Get all people associated with a park
 */
export async function getParkPeople(parkId: number): Promise<ParkPerson[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT
        pp.id,
        pp.parkId,
        pp.personId,
        p.name,
        p.photo,
        p.relationship,
        rt.name as relationshipTypeName,
        pp.created_at
      FROM park_people pp
      JOIN people p ON p.id = pp.personId
      LEFT JOIN relationship_types rt ON rt.id = p.relationship_type_id
      WHERE pp.parkId = ?
      ORDER BY p.name ASC`,
      args: [parkId]
    });

    return result.rows as unknown as ParkPerson[];
  } catch (error) {
    console.error("Error getting park people:", error);
    return [];
  }
}

/**
 * Get a single park-person association
 */
export async function getParkPerson(
  id: number,
  parkId: number
): Promise<ParkPerson | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT
        pp.id,
        pp.parkId,
        pp.personId,
        p.name,
        p.photo,
        p.relationship,
        rt.name as relationshipTypeName,
        pp.created_at
      FROM park_people pp
      JOIN people p ON p.id = pp.personId
      LEFT JOIN relationship_types rt ON rt.id = p.relationship_type_id
      WHERE pp.id = ? AND pp.parkId = ?`,
      args: [id, parkId]
    });

    const person = result.rows[0] as unknown as ParkPerson | undefined;
    return person || null;
  } catch (error) {
    console.error("Error getting park person:", error);
    return null;
  }
}

/**
 * Remove a person from a park by association ID
 */
export async function removePersonFromPark(
  id: number,
  parkId: number,
  userId: string
): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "DELETE FROM park_people WHERE id = ? AND parkId = ? AND userId = ?",
      args: [id, parkId, userId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error removing person from park:", error);
    return false;
  }
}

/**
 * Remove a person from a park by person ID
 */
export async function removePersonFromParkByPersonId(
  parkId: number,
  personId: number,
  userId: string
): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "DELETE FROM park_people WHERE parkId = ? AND personId = ? AND userId = ?",
      args: [parkId, personId, userId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error removing person from park by person ID:", error);
    return false;
  }
}

/**
 * Delete all people associations for a park
 */
export async function deleteAllParkPeople(parkId: number): Promise<number> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "DELETE FROM park_people WHERE parkId = ?",
      args: [parkId]
    });
    return result.rowsAffected ?? 0;
  } catch (error) {
    console.error("Error deleting all park people:", error);
    return 0;
  }
}

/**
 * Check if a person is already associated with a park
 */
export async function isPersonOnPark(
  parkId: number,
  personId: number
): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM park_people WHERE parkId = ? AND personId = ?",
      args: [parkId, personId]
    });
    const row = result.rows[0] as unknown as { count: number };
    return row.count > 0;
  } catch (error) {
    console.error("Error checking if person is on park:", error);
    return false;
  }
}

// ==================== Photo CRUD ====================

export interface ParkPhoto {
  id: number;
  parkId: number;
  url: string;
  caption: string | null;
  date_taken: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ParkPhotoInput {
  url: string;
  caption?: string | null;
  date_taken?: string | null;
  order_index?: number;
}

/**
 * Create a new park photo
 */
export async function createParkPhoto(
  parkId: number,
  data: ParkPhotoInput
): Promise<ParkPhoto | null> {
  try {
    const db = getDatabase();
    
    // Get the next order index
    const resultOrder = await db.execute({
      sql: "SELECT MAX(order_index) as max_order FROM park_photos WHERE parkId = ?",
      args: [parkId]
    });
    const maxOrderRow = resultOrder.rows[0] as unknown as { max_order: number | null };
    const orderIndex = data.order_index ?? ((maxOrderRow?.max_order ?? -1) + 1);

    const result = await db.execute({
      sql: `INSERT INTO park_photos (
              parkId, url, caption, date_taken, order_index
            ) VALUES (?, ?, ?, ?, ?)`,
      args: [
        parkId,
        data.url,
        data.caption || null,
        data.date_taken || null,
        orderIndex,
      ]
    });

    return await getParkPhoto(Number(result.lastInsertRowid), parkId);
  } catch (error) {
    console.error("Error creating park photo:", error);
    return null;
  }
}

/**
 * Get all photos for a park, ordered by order_index
 */
export async function getParkPhotos(parkId: number): Promise<ParkPhoto[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM park_photos WHERE parkId = ? ORDER BY order_index ASC",
      args: [parkId]
    });
    return result.rows as unknown as ParkPhoto[];
  } catch (error) {
    console.error("Error getting park photos:", error);
    return [];
  }
}

/**
 * Get a single park photo
 */
export async function getParkPhoto(
  id: number,
  parkId: number
): Promise<ParkPhoto | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM park_photos WHERE id = ? AND parkId = ?",
      args: [id, parkId]
    });
    const row = result.rows[0] as unknown as ParkPhoto | undefined;
    return row || null;
  } catch (error) {
    console.error("Error getting park photo:", error);
    return null;
  }
}

/**
 * Update a park photo
 */
export async function updateParkPhoto(
  id: number,
  parkId: number,
  data: Partial<ParkPhotoInput>
): Promise<boolean> {
  try {
    const photo = await getParkPhoto(id, parkId);
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

    values.push(id, parkId);
    
    const db = getDatabase();
    await db.execute({
      sql: `UPDATE park_photos SET ${updates.join(", ")} WHERE id = ? AND parkId = ?`,
      args: values
    });
    return true;
  } catch (error) {
    console.error("Error updating park photo:", error);
    return false;
  }
}

/**
 * Delete a park photo
 */
export async function deleteParkPhoto(
  id: number,
  parkId: number
): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "DELETE FROM park_photos WHERE id = ? AND parkId = ?",
      args: [id, parkId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error deleting park photo:", error);
    return false;
  }
}

// ==================== Trail CRUD ====================

export interface ParkTrail {
  id: number;
  parkId: number;
  name: string;
  distance: number | null;
  elevation_gain: number | null;
  difficulty: string | null;
  rating: number | null;
  date_hiked: string | null;
  notes: string | null;
  alltrails_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParkTrailInput {
  name: string;
  distance?: number | null;
  elevation_gain?: number | null;
  difficulty?: string | null;
  rating?: number | null;
  date_hiked?: string | null;
  notes?: string | null;
  alltrails_url?: string | null;
}

/**
 * Create a new park trail
 */
export async function createParkTrail(
  parkId: number,
  data: ParkTrailInput
): Promise<ParkTrail | null> {
  try {
    const db = getDatabase();
    
    const result = await db.execute({
      sql: `INSERT INTO park_trails (
              parkId, name, distance, elevation_gain, difficulty, rating, date_hiked, notes, alltrails_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        parkId,
        data.name,
        data.distance ?? null,
        data.elevation_gain ?? null,
        data.difficulty || null,
        data.rating ?? null,
        data.date_hiked || null,
        data.notes || null,
        data.alltrails_url || null,
      ]
    });

    return await getParkTrail(Number(result.lastInsertRowid), parkId);
  } catch (error) {
    console.error("Error creating park trail:", error);
    return null;
  }
}

/**
 * Get all trails for a park, ordered by date_hiked descending
 */
export async function getParkTrails(parkId: number): Promise<ParkTrail[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM park_trails WHERE parkId = ? ORDER BY date_hiked DESC, created_at DESC",
      args: [parkId]
    });
    return result.rows as unknown as ParkTrail[];
  } catch (error) {
    console.error("Error getting park trails:", error);
    return [];
  }
}

/**
 * Get a single park trail
 */
export async function getParkTrail(
  id: number,
  parkId: number
): Promise<ParkTrail | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM park_trails WHERE id = ? AND parkId = ?",
      args: [id, parkId]
    });
    const row = result.rows[0] as unknown as ParkTrail | undefined;
    return row || null;
  } catch (error) {
    console.error("Error getting park trail:", error);
    return null;
  }
}

/**
 * Update a park trail
 */
export async function updateParkTrail(
  id: number,
  parkId: number,
  data: Partial<ParkTrailInput>
): Promise<boolean> {
  try {
    const trail = await getParkTrail(id, parkId);
    if (!trail) return false;

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.distance !== undefined) {
      updates.push("distance = ?");
      values.push(data.distance ?? null);
    }
    if (data.elevation_gain !== undefined) {
      updates.push("elevation_gain = ?");
      values.push(data.elevation_gain ?? null);
    }
    if (data.difficulty !== undefined) {
      updates.push("difficulty = ?");
      values.push(data.difficulty || null);
    }
    if (data.rating !== undefined) {
      updates.push("rating = ?");
      values.push(data.rating ?? null);
    }
    if (data.date_hiked !== undefined) {
      updates.push("date_hiked = ?");
      values.push(data.date_hiked || null);
    }
    if (data.notes !== undefined) {
      updates.push("notes = ?");
      values.push(data.notes || null);
    }
    if (data.alltrails_url !== undefined) {
      updates.push("alltrails_url = ?");
      values.push(data.alltrails_url || null);
    }

    if (updates.length === 0) return true;

    values.push(id, parkId);
    
    const db = getDatabase();
    await db.execute({
      sql: `UPDATE park_trails SET ${updates.join(", ")} WHERE id = ? AND parkId = ?`,
      args: values
    });
    return true;
  } catch (error) {
    console.error("Error updating park trail:", error);
    return false;
  }
}

/**
 * Delete a park trail
 */
export async function deleteParkTrail(
  id: number,
  parkId: number
): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "DELETE FROM park_trails WHERE id = ? AND parkId = ?",
      args: [id, parkId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error deleting park trail:", error);
    return false;
  }
}
