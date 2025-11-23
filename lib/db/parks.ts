import Database from "better-sqlite3";
import path from "path";
import { ParkCategoryValue } from "./enums/park-enums";
import { checkAchievement } from "../achievements";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

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
 * Get all parks
 */
export function getAllParks(): ParkContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM parks
      ORDER BY visited DESC, created_at DESC
    `);
    const rows = stmt.all() as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting all parks:", error);
    return [];
  }
}

/**
 * Get published parks only
 */
export function getPublishedParks(): ParkContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM parks
      WHERE published = 1
      ORDER BY visited DESC, created_at DESC
    `);
    const rows = stmt.all() as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting published parks:", error);
    return [];
  }
}

/**
 * Get park by slug
 */
export function getParkBySlug(slug: string): ParkContent | null {
  try {
    const stmt = db.prepare("SELECT * FROM parks WHERE slug = ?");
    const row = stmt.get(slug) as DBPark | undefined;
    return row ? dbToParkContent(row) : null;
  } catch (error) {
    console.error("Error getting park by slug:", error);
    return null;
  }
}

/**
 * Get parks by category
 */
export function getParksByCategory(category: ParkCategoryValue): ParkContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM parks
      WHERE category = ? AND published = 1
      ORDER BY visited DESC, created_at DESC
    `);
    const rows = stmt.all(category) as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting parks by category:", error);
    return [];
  }
}

/**
 * Get parks by state
 */
export function getParksByState(state: string): ParkContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM parks
      WHERE state = ? AND published = 1
      ORDER BY visited DESC, created_at DESC
    `);
    const rows = stmt.all(state) as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting parks by state:", error);
    return [];
  }
}

/**
 * Get featured parks
 */
export function getFeaturedParks(): ParkContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM parks
      WHERE featured = 1 AND published = 1
      ORDER BY visited DESC, created_at DESC
    `);
    const rows = stmt.all() as DBPark[];
    return rows.map(dbToParkContent);
  } catch (error) {
    console.error("Error getting featured parks:", error);
    return [];
  }
}

/**
 * Create a new park
 */
export function createPark(data: {
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
}): ParkContent {
  try {
    const stmt = db.prepare(`
      INSERT INTO parks (
        slug, title, category, state, poster, description,
        visited, tags, rating, featured, published, content, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
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
    );

    const park = getParkBySlug(data.slug);
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
 * Update a park
 */
export function updatePark(
  slug: string,
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
): ParkContent {
  try {
    const updates: string[] = [];
    const values: any[] = [];

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

    values.push(slug);
    const stmt = db.prepare(`
      UPDATE parks
      SET ${updates.join(", ")}
      WHERE slug = ?
    `);

    stmt.run(...values);

    const updatedSlug = data.newSlug || slug;
    const park = getParkBySlug(updatedSlug);
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
 * Delete a park
 */
export function deletePark(slug: string): boolean {
  try {
    const stmt = db.prepare("DELETE FROM parks WHERE slug = ?");
    const result = stmt.run(slug);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting park:", error);
    return false;
  }
}

/**
 * Check if a slug exists
 */
export function parkSlugExists(slug: string): boolean {
  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM parks WHERE slug = ?");
    const result = stmt.get(slug) as { count: number };
    return result.count > 0;
  } catch (error) {
    console.error("Error checking park slug:", error);
    return false;
  }
}
