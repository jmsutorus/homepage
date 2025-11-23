import Database from "better-sqlite3";
import path from "path";
import { checkAchievement } from "../achievements";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

export interface DBJournal {
  id: number;
  userId: string;
  slug: string;
  title: string;
  journal_type: "daily" | "general";
  daily_date: string | null; // YYYY-MM-DD
  mood: number | null;
  tags: string | null; // JSON string
  featured: number; // SQLite boolean (0 or 1)
  published: number; // SQLite boolean (0 or 1)
  content: string;
  created_at: string;
  updated_at: string;
}

export interface JournalContent {
  id: number;
  userId: string;
  slug: string;
  title: string;
  journal_type: "daily" | "general";
  daily_date: string | null; // YYYY-MM-DD
  mood: number | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DBJournalLink {
  id: number;
  journal_id: number;
  linked_type: string;
  linked_id: number;
  linked_slug: string | null;
  created_at: string;
}

export interface JournalLink {
  id: number;
  journal_id: number;
  linked_type: "media" | "park" | "journal" | "activity";
  linked_id: number;
  linked_slug: string | null;
  created_at: string;
}

/**
 * Convert database row to JournalContent object
 */
function dbToJournalContent(row: DBJournal): JournalContent {
  return {
    id: row.id,
    userId: row.userId,
    slug: row.slug,
    title: row.title,
    journal_type: row.journal_type,
    daily_date: row.daily_date,
    mood: row.mood,
    tags: row.tags ? JSON.parse(row.tags) : [],
    featured: row.featured === 1,
    published: row.published === 1,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Format date to human-readable title (e.g., "March 11, 1996")
 */
function formatDateToTitle(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get mood entry for a specific date
 */
export function getMoodForDate(date: string): number | null {
  try {
    const stmt = db.prepare("SELECT rating FROM mood_entries WHERE date = ?");
    const result = stmt.get(date) as { rating: number } | undefined;
    return result ? result.rating : null;
  } catch (error) {
    console.error("Error getting mood for date:", error);
    return null;
  }
}

/**
 * Convert database row to JournalLink object
 */
function dbToJournalLink(row: DBJournalLink): JournalLink {
  return {
    id: row.id,
    journal_id: row.journal_id,
    linked_type: row.linked_type as "media" | "park" | "journal" | "activity",
    linked_id: row.linked_id,
    linked_slug: row.linked_slug,
    created_at: row.created_at,
  };
}

/**
 * Get all journals
 */
export function getAllJournals(): JournalContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM journals
      ORDER BY created_at DESC
    `);
    const rows = stmt.all() as DBJournal[];
    return rows.map(dbToJournalContent);
  } catch (error) {
    console.error("Error getting all journals:", error);
    return [];
  }
}

/**
 * Get total count of journals
 */
export function getJournalCount(): number {
  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM journals");
    const result = stmt.get() as { count: number };
    return result.count;
  } catch (error) {
    console.error("Error getting journal count:", error);
    return 0;
  }
}

/**
 * Get published journals only
 */
export function getPublishedJournals(): JournalContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM journals
      WHERE published = 1
      ORDER BY created_at DESC
    `);
    const rows = stmt.all() as DBJournal[];
    return rows.map(dbToJournalContent);
  } catch (error) {
    console.error("Error getting published journals:", error);
    return [];
  }
}

/**
 * Get journal by slug
 */
export function getJournalBySlug(slug: string): JournalContent | null {
  try {
    const stmt = db.prepare("SELECT * FROM journals WHERE slug = ?");
    const row = stmt.get(slug) as DBJournal | undefined;
    return row ? dbToJournalContent(row) : null;
  } catch (error) {
    console.error("Error getting journal by slug:", error);
    return null;
  }
}

/**
 * Get journal by ID
 */
export function getJournalById(id: number): JournalContent | null {
  try {
    const stmt = db.prepare("SELECT * FROM journals WHERE id = ?");
    const row = stmt.get(id) as DBJournal | undefined;
    return row ? dbToJournalContent(row) : null;
  } catch (error) {
    console.error("Error getting journal by ID:", error);
    return null;
  }
}

/**
 * Get featured journals
 */
export function getFeaturedJournals(): JournalContent[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM journals
      WHERE featured = 1 AND published = 1
      ORDER BY created_at DESC
    `);
    const rows = stmt.all() as DBJournal[];
    return rows.map(dbToJournalContent);
  } catch (error) {
    console.error("Error getting featured journals:", error);
    return [];
  }
}

/**
 * Create a new journal
 */
export function createJournal(data: {
  slug?: string;
  title?: string;
  journal_type?: "daily" | "general";
  daily_date?: string;
  mood?: number;
  tags?: string[];
  featured?: boolean;
  published?: boolean;
  content: string;
  userId: string;
}): JournalContent {
  try {
    const journalType = data.journal_type || "general";
    let title = data.title || "";
    let slug = data.slug || "";

    // For daily journals, auto-generate title and slug from date
    if (journalType === "daily") {
      if (!data.daily_date) {
        throw new Error("daily_date is required for daily journals");
      }
      title = formatDateToTitle(data.daily_date);
      slug = `daily-${data.daily_date}`;

      // Check if daily journal already exists for this date
      const existing = db.prepare(
        "SELECT id FROM journals WHERE journal_type = 'daily' AND daily_date = ?"
      ).get(data.daily_date);
      if (existing) {
        throw new Error(`A daily journal already exists for ${data.daily_date}`);
      }
    } else {
      // For general journals, title and slug are required
      if (!title) {
        throw new Error("title is required for general journals");
      }
      if (!slug) {
        throw new Error("slug is required for general journals");
      }
    }

    const stmt = db.prepare(`
      INSERT INTO journals (
        slug, title, journal_type, daily_date, mood, tags, featured, published, content, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      slug,
      title,
      journalType,
      data.daily_date || null,
      data.mood !== undefined ? data.mood : null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.featured ? 1 : 0,
      data.published !== false ? 1 : 0,
      data.content,
      data.userId
    );

    const journal = getJournalBySlug(slug);
    if (!journal) {
      throw new Error("Failed to create journal");
    }

    // Check for achievements
    checkAchievement(data.userId, 'journal').catch(console.error);

    return journal;
  } catch (error) {
    console.error("Error creating journal:", error);
    throw error;
  }
}

/**
 * Update a journal
 */
export function updateJournal(
  slug: string,
  data: {
    newSlug?: string;
    title?: string;
    journal_type?: "daily" | "general";
    daily_date?: string;
    mood?: number | null;
    tags?: string[];
    featured?: boolean;
    published?: boolean;
    content?: string;
  }
): JournalContent {
  try {
    // Get existing journal to check type
    const existing = getJournalBySlug(slug);
    if (!existing) {
      throw new Error("Journal not found");
    }

    const updates: string[] = [];
    const values: any[] = [];

    // For daily journals, regenerate title if date changes
    if (existing.journal_type === "daily" && data.daily_date && data.daily_date !== existing.daily_date) {
      updates.push("daily_date = ?");
      values.push(data.daily_date);
      updates.push("title = ?");
      values.push(formatDateToTitle(data.daily_date));
      updates.push("slug = ?");
      const newSlug = `daily-${data.daily_date}`;
      values.push(newSlug);
    }

    // For general journals, allow title updates
    if (existing.journal_type === "general") {
      if (data.newSlug !== undefined) {
        updates.push("slug = ?");
        values.push(data.newSlug);
      }
      if (data.title !== undefined) {
        updates.push("title = ?");
        values.push(data.title);
      }
    }

    if (data.mood !== undefined) {
      updates.push("mood = ?");
      values.push(data.mood);
    }
    if (data.tags !== undefined) {
      updates.push("tags = ?");
      values.push(data.tags ? JSON.stringify(data.tags) : null);
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
      UPDATE journals
      SET ${updates.join(", ")}
      WHERE slug = ?
    `);

    stmt.run(...values);

    // Determine final slug
    let updatedSlug = slug;
    if (existing.journal_type === "daily" && data.daily_date) {
      updatedSlug = `daily-${data.daily_date}`;
    } else if (data.newSlug) {
      updatedSlug = data.newSlug;
    }

    const journal = getJournalBySlug(updatedSlug);
    if (!journal) {
      throw new Error("Failed to update journal");
    }

    return journal;
  } catch (error) {
    console.error("Error updating journal:", error);
    throw error;
  }
}

/**
 * Get daily journal by date
 */
export function getDailyJournalByDate(date: string): JournalContent | null {
  try {
    const stmt = db.prepare(
      "SELECT * FROM journals WHERE journal_type = 'daily' AND daily_date = ?"
    );
    const row = stmt.get(date) as DBJournal | undefined;
    return row ? dbToJournalContent(row) : null;
  } catch (error) {
    console.error("Error getting daily journal by date:", error);
    return null;
  }
}

/**
 * Delete a journal (also deletes associated links via CASCADE)
 */
export function deleteJournal(slug: string): boolean {
  try {
    const stmt = db.prepare("DELETE FROM journals WHERE slug = ?");
    const result = stmt.run(slug);
    return result.changes > 0;
  } catch (error) {
    console.error("Error deleting journal:", error);
    return false;
  }
}

/**
 * Check if a slug exists
 */
export function journalSlugExists(slug: string): boolean {
  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM journals WHERE slug = ?");
    const result = stmt.get(slug) as { count: number };
    return result.count > 0;
  } catch (error) {
    console.error("Error checking journal slug:", error);
    return false;
  }
}

// ========== Link Management Functions ==========

/**
 * Add a link from a journal to another object
 */
export function addJournalLink(
  journalId: number,
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number,
  linkedSlug?: string
): JournalLink {
  try {
    const stmt = db.prepare(`
      INSERT INTO journal_links (journal_id, linked_type, linked_id, linked_slug)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(journalId, linkedType, linkedId, linkedSlug || null);

    const link = db
      .prepare("SELECT * FROM journal_links WHERE id = ?")
      .get(result.lastInsertRowid) as DBJournalLink;

    return dbToJournalLink(link);
  } catch (error) {
    console.error("Error adding journal link:", error);
    throw error;
  }
}

/**
 * Remove a specific link
 */
export function removeJournalLink(linkId: number): boolean {
  try {
    const stmt = db.prepare("DELETE FROM journal_links WHERE id = ?");
    const result = stmt.run(linkId);
    return result.changes > 0;
  } catch (error) {
    console.error("Error removing journal link:", error);
    return false;
  }
}

/**
 * Remove a link by journal ID and linked object
 */
export function removeJournalLinkByObject(
  journalId: number,
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number
): boolean {
  try {
    const stmt = db.prepare(`
      DELETE FROM journal_links
      WHERE journal_id = ? AND linked_type = ? AND linked_id = ?
    `);
    const result = stmt.run(journalId, linkedType, linkedId);
    return result.changes > 0;
  } catch (error) {
    console.error("Error removing journal link by object:", error);
    return false;
  }
}

/**
 * Get all links for a specific journal
 */
export function getLinksForJournal(journalId: number): JournalLink[] {
  try {
    const stmt = db.prepare(`
      SELECT * FROM journal_links
      WHERE journal_id = ?
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(journalId) as DBJournalLink[];
    return rows.map(dbToJournalLink);
  } catch (error) {
    console.error("Error getting links for journal:", error);
    return [];
  }
}

/**
 * Get all journals that link to a specific object
 */
export function getJournalsLinkingTo(
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number
): JournalContent[] {
  try {
    const stmt = db.prepare(`
      SELECT j.* FROM journals j
      INNER JOIN journal_links jl ON j.id = jl.journal_id
      WHERE jl.linked_type = ? AND jl.linked_id = ?
      ORDER BY j.created_at DESC
    `);
    const rows = stmt.all(linkedType, linkedId) as DBJournal[];
    return rows.map(dbToJournalContent);
  } catch (error) {
    console.error("Error getting journals linking to object:", error);
    return [];
  }
}

/**
 * Replace all links for a journal (useful for bulk updates)
 */
export function replaceJournalLinks(
  journalId: number,
  links: Array<{
    linkedType: "media" | "park" | "journal" | "activity";
    linkedId: number;
    linkedSlug?: string;
  }>
): JournalLink[] {
  try {
    // Delete all existing links for this journal
    db.prepare("DELETE FROM journal_links WHERE journal_id = ?").run(journalId);

    // Add new links
    const newLinks: JournalLink[] = [];
    for (const link of links) {
      const newLink = addJournalLink(
        journalId,
        link.linkedType,
        link.linkedId,
        link.linkedSlug
      );
      newLinks.push(newLink);
    }

    return newLinks;
  } catch (error) {
    console.error("Error replacing journal links:", error);
    throw error;
  }
}
