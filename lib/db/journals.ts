import { getDatabase } from "./index";
import { checkAchievement } from "../achievements";

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
async function dbToJournalContent(row: DBJournal): Promise<JournalContent> {
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
async function formatDateToTitle(dateString: string): Promise<string> {
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
export async function getMoodForDate(date: string, userId: string): Promise<number | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT rating FROM mood_entries WHERE date = ? AND userId = ?",
      args: [date, userId]
    });
    const row = result.rows[0] as unknown as { rating: number } | undefined;
    return row ? row.rating : null;
  } catch (error) {
    console.error("Error getting mood for date:", error);
    return null;
  }
}

/**
 * Convert database row to JournalLink object
 */
async function dbToJournalLink(row: DBJournalLink): Promise<JournalLink> {
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
 * Get all journals for a specific user
 */
export async function getAllJournals(userId: string): Promise<JournalContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM journals
            WHERE userId = ?
            ORDER BY created_at DESC`,
      args: [userId]
    });
    console.log("getAllJournals", userId);
    console.log(result);
    const rows = result.rows as unknown as DBJournal[];
    return Promise.all(rows.map(dbToJournalContent));
  } catch (error) {
    console.error("Error getting all journals:", error);
    return [];
  }
}

/**
 * Get total count of journals for a specific user
 */
export async function getJournalCount(userId: string): Promise<number> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM journals WHERE userId = ?",
      args: [userId]
    });
    const row = result.rows[0] as unknown as { count: number };
    return row.count;
  } catch (error) {
    console.error("Error getting journal count:", error);
    return 0;
  }
}

/**
 * Get published journals for a specific user
 */
export async function getPublishedJournals(userId: string): Promise<JournalContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM journals
            WHERE userId = ? AND published = 1
            ORDER BY created_at DESC`,
      args: [userId]
    });
    const rows = result.rows as unknown as DBJournal[];
    return Promise.all(rows.map(dbToJournalContent));
  } catch (error) {
    console.error("Error getting published journals:", error);
    return [];
  }
}

/**
 * Get journal by slug for a specific user
 */
export async function getJournalBySlug(slug: string, userId: string): Promise<JournalContent | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM journals WHERE slug = ? AND userId = ?",
      args: [slug, userId]
    });
    const row = result.rows[0] as unknown as DBJournal | undefined;
    return row ? await dbToJournalContent(row) : null;
  } catch (error) {
    console.error("Error getting journal by slug:", error);
    return null;
  }
}

/**
 * Get journal by ID for a specific user
 */
export async function getJournalById(id: number, userId: string): Promise<JournalContent | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM journals WHERE id = ? AND userId = ?",
      args: [id, userId]
    });
    const row = result.rows[0] as unknown as DBJournal | undefined;
    return row ? await dbToJournalContent(row) : null;
  } catch (error) {
    console.error("Error getting journal by ID:", error);
    return null;
  }
}

/**
 * Get featured journals for a specific user
 */
export async function getFeaturedJournals(userId: string): Promise<JournalContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM journals
            WHERE userId = ? AND featured = 1 AND published = 1
            ORDER BY created_at DESC`,
      args: [userId]
    });
    const rows = result.rows as unknown as DBJournal[];
    return Promise.all(rows.map(dbToJournalContent));
  } catch (error) {
    console.error("Error getting featured journals:", error);
    return [];
  }
}

/**
 * Create a new journal
 */
export async function createJournal(data: {
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
}): Promise<JournalContent> {
  try {
    const db = getDatabase();
    const journalType = data.journal_type || "general";
    let title = data.title || "";
    let slug = data.slug || "";

    // For daily journals, auto-generate title and slug from date
    if (journalType === "daily") {
      if (!data.daily_date) {
        throw new Error("daily_date is required for daily journals");
      }
      title = await formatDateToTitle(data.daily_date);
      slug = `daily-${data.daily_date}`;

      // Check if daily journal already exists for this date
      const existingResult = await db.execute({
        sql: "SELECT id FROM journals WHERE journal_type = 'daily' AND daily_date = ?",
        args: [data.daily_date]
      });
      if (existingResult.rows[0]) {
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

    await db.execute({
      sql: `INSERT INTO journals (
              slug, title, journal_type, daily_date, mood, tags, featured, published, content, userId
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
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
      ]
    });

    const journal = await getJournalBySlug(slug, data.userId);
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
 * Update a journal with ownership verification
 */
export async function updateJournal(
  slug: string,
  userId: string,
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
): Promise<JournalContent> {
  try {
    const db = getDatabase();

    // Get existing journal to check type and verify ownership
    const existing = await getJournalBySlug(slug, userId);
    if (!existing) {
      throw new Error("Journal not found");
    }

    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    // For daily journals, regenerate title if date changes
    if (existing.journal_type === "daily" && data.daily_date && data.daily_date !== existing.daily_date) {
      updates.push("daily_date = ?");
      values.push(data.daily_date);
      updates.push("title = ?");
      values.push(await formatDateToTitle(data.daily_date));
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

    values.push(slug, userId);

    await db.execute({
      sql: `UPDATE journals
            SET ${updates.join(", ")}
            WHERE slug = ? AND userId = ?`,
      args: values
    });

    // Determine final slug
    let updatedSlug = slug;
    if (existing.journal_type === "daily" && data.daily_date) {
      updatedSlug = `daily-${data.daily_date}`;
    } else if (data.newSlug) {
      updatedSlug = data.newSlug;
    }

    const journal = await getJournalBySlug(updatedSlug, userId);
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
 * Get daily journal by date for a specific user
 */
export async function getDailyJournalByDate(date: string, userId: string): Promise<JournalContent | null> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT * FROM journals WHERE journal_type = 'daily' AND daily_date = ? AND userId = ?",
      args: [date, userId]
    });
    const row = result.rows[0] as unknown as DBJournal | undefined;
    return row ? await dbToJournalContent(row) : null;
  } catch (error) {
    console.error("Error getting daily journal by date:", error);
    return null;
  }
}

/**
 * Delete a journal with ownership verification (also deletes associated links via CASCADE)
 */
export async function deleteJournal(slug: string, userId: string): Promise<boolean> {
  try {
    const db = getDatabase();

    // Verify ownership
    const existing = await getJournalBySlug(slug, userId);
    if (!existing) {
      return false;
    }

    const result = await db.execute({
      sql: "DELETE FROM journals WHERE slug = ? AND userId = ?",
      args: [slug, userId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error deleting journal:", error);
    return false;
  }
}

/**
 * Check if a slug exists
 */
export async function journalSlugExists(slug: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM journals WHERE slug = ?",
      args: [slug]
    });
    const row = result.rows[0] as unknown as { count: number };
    return row.count > 0;
  } catch (error) {
    console.error("Error checking journal slug:", error);
    return false;
  }
}

// ========== Link Management Functions ==========

/**
 * Add a link from a journal to another object
 */
export async function addJournalLink(
  journalId: number,
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number,
  linkedSlug?: string
): Promise<JournalLink> {
  try {
    const db = getDatabase();

    const insertResult = await db.execute({
      sql: `INSERT INTO journal_links (journal_id, linked_type, linked_id, linked_slug)
            VALUES (?, ?, ?, ?)`,
      args: [journalId, linkedType, linkedId, linkedSlug || null]
    });

    const linkResult = await db.execute({
      sql: "SELECT * FROM journal_links WHERE id = ?",
      args: [insertResult.lastInsertRowid as any]
    });

    const link = linkResult.rows[0] as unknown as DBJournalLink;
    return await dbToJournalLink(link);
  } catch (error) {
    console.error("Error adding journal link:", error);
    throw error;
  }
}

/**
 * Remove a specific link
 */
export async function removeJournalLink(linkId: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: "DELETE FROM journal_links WHERE id = ?",
      args: [linkId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error removing journal link:", error);
    return false;
  }
}

/**
 * Remove a link by journal ID and linked object
 */
export async function removeJournalLinkByObject(
  journalId: number,
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number
): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `DELETE FROM journal_links
            WHERE journal_id = ? AND linked_type = ? AND linked_id = ?`,
      args: [journalId, linkedType, linkedId]
    });
    return (result.rowsAffected ?? 0) > 0;
  } catch (error) {
    console.error("Error removing journal link by object:", error);
    return false;
  }
}

/**
 * Get all links for a specific journal
 */
export async function getLinksForJournal(journalId: number): Promise<JournalLink[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM journal_links
            WHERE journal_id = ?
            ORDER BY created_at ASC`,
      args: [journalId]
    });
    const rows = result.rows as unknown as DBJournalLink[];
    return Promise.all(rows.map(dbToJournalLink));
  } catch (error) {
    console.error("Error getting links for journal:", error);
    return [];
  }
}

/**
 * Get all journals that link to a specific object
 */
export async function getJournalsLinkingTo(
  linkedType: "media" | "park" | "journal" | "activity",
  linkedId: number
): Promise<JournalContent[]> {
  try {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT j.* FROM journals j
            INNER JOIN journal_links jl ON j.id = jl.journal_id
            WHERE jl.linked_type = ? AND jl.linked_id = ?
            ORDER BY j.created_at DESC`,
      args: [linkedType, linkedId]
    });
    const rows = result.rows as unknown as DBJournal[];
    return Promise.all(rows.map(dbToJournalContent));
  } catch (error) {
    console.error("Error getting journals linking to object:", error);
    return [];
  }
}

/**
 * Replace all links for a journal (useful for bulk updates)
 */
export async function replaceJournalLinks(
  journalId: number,
  links: Array<{
    linkedType: "media" | "park" | "journal" | "activity";
    linkedId: number;
    linkedSlug?: string;
  }>
): Promise<JournalLink[]> {
  try {
    const db = getDatabase();

    // Delete all existing links for this journal
    await db.execute({
      sql: "DELETE FROM journal_links WHERE journal_id = ?",
      args: [journalId]
    });

    // Add new links
    const newLinks: JournalLink[] = [];
    for (const link of links) {
      const newLink = await addJournalLink(
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
