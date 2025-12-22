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
