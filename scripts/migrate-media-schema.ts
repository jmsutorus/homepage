#!/usr/bin/env tsx

import { getDatabase } from "@/lib/db/index";

/**
 * Migrate media_content table from old schema to new schema
 *
 * Old fields → New fields:
 * - image_url → poster
 * - date_watched → completed
 * - date_started → started
 * - status: "watching" → "in-progress"
 * - rating: 1-5 → 0-10 (multiply by 2)
 *
 * New fields (default values):
 * - released: null
 * - tags: null
 * - length: null
 * - featured: 0
 * - published: 1
 */

interface OldMediaContent {
  id: number;
  slug: string;
  title: string;
  type: string;
  status: string;
  rating: number | null;
  image_url: string | null;
  date_watched: string | null;
  date_started: string | null;
  genres: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

async function migrateMediaSchema() {
  console.log("🚀 Starting media schema migration...\n");

  const db = getDatabase();

  try {
    // Step 1: Check if old table exists
    const tableCheckResult = await db.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='media_content'",
      args: []
    });
    const tableCheck = tableCheckResult.rows[0];

    if (!tableCheck) {
      console.log("⚠️  No media_content table found. Nothing to migrate.");
      return;
    }

    console.log("📊 Found existing media_content table");

    // Step 2: Read all existing media
    const oldMediaResult = await db.execute("SELECT * FROM media_content");
    const oldMedia = oldMediaResult.rows as unknown as OldMediaContent[];
    console.log(`📁 Found ${oldMedia.length} existing media entries\n`);

    if (oldMedia.length === 0) {
      console.log("⚠️  No data to migrate. Dropping old table and creating new schema...");
      await db.execute("DROP TABLE IF EXISTS media_content");
      // Apply just the media content table schema
      await db.execute(`
-- Media Content Table
CREATE TABLE IF NOT EXISTS media_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK(type IN ('movie', 'tv', 'book', 'game')) NOT NULL,
  status TEXT CHECK(status IN ('in-progress', 'completed', 'planned')) NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 0 AND 10),
  started TEXT,
  completed TEXT,
  released TEXT,
  genres TEXT,
  poster TEXT,
  tags TEXT,
  length TEXT,
  featured BOOLEAN DEFAULT 0,
  published BOOLEAN DEFAULT 1,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
      await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_type ON media_content(type);");
      await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_status ON media_content(status);");
      await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_slug ON media_content(slug);");
      await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_completed ON media_content(completed);");
      await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_featured ON media_content(featured);");
      await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_published ON media_content(published);");
      await db.execute(`
CREATE TRIGGER IF NOT EXISTS update_media_content_timestamp
AFTER UPDATE ON media_content
BEGIN
  UPDATE media_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
      `);
      console.log("✅ New schema applied successfully");
      return;
    }

    // Step 3: Create backup table
    console.log("💾 Creating backup table...");
    await db.execute("CREATE TABLE IF NOT EXISTS media_content_backup AS SELECT * FROM media_content");
    console.log("✅ Backup created: media_content_backup\n");

    // Step 4: Drop old table
    console.log("🗑️  Dropping old media_content table...");
    await db.execute("DROP TABLE media_content");

    // Step 5: Apply new schema (just the media_content part)
    console.log("📋 Applying new schema...");
    await db.execute(`
-- Media Content Table
-- Stores media library entries (movies, TV shows, books, video games) with markdown content
CREATE TABLE IF NOT EXISTS media_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK(type IN ('movie', 'tv', 'book', 'game')) NOT NULL,
  status TEXT CHECK(status IN ('in-progress', 'completed', 'planned')) NOT NULL,
  rating INTEGER CHECK(rating BETWEEN 0 AND 10),
  started TEXT,
  completed TEXT,
  released TEXT,
  genres TEXT,
  poster TEXT,
  tags TEXT,
  length TEXT,
  featured BOOLEAN DEFAULT 0,
  published BOOLEAN DEFAULT 1,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);
    await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_type ON media_content(type);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_status ON media_content(status);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_slug ON media_content(slug);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_completed ON media_content(completed);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_featured ON media_content(featured);");
    await db.execute("CREATE INDEX IF NOT EXISTS idx_media_content_published ON media_content(published);");
    await db.execute(`
-- Trigger to update updated_at timestamp on media_content
CREATE TRIGGER IF NOT EXISTS update_media_content_timestamp
AFTER UPDATE ON media_content
BEGIN
  UPDATE media_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
    `);
    console.log("✅ New schema applied\n");

    // Step 6: Migrate data
    console.log("🔄 Migrating data to new schema...");

    let successCount = 0;
    let errorCount = 0;

    for (const media of oldMedia) {
      try {
        // Map old status to new status
        let newStatus = media.status;
        if (media.status === "watching") {
          newStatus = "in-progress";
        }

        // Convert rating from 1-5 to 0-10 (multiply by 2)
        let newRating = media.rating;
        if (newRating !== null && newRating >= 1 && newRating <= 5) {
          newRating = newRating * 2;
        }

        await db.execute({
          sql: `
            INSERT INTO media_content (
              slug, title, type, status, rating, started, completed, released,
              genres, poster, tags, length, featured, published, content, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            media.slug,
            media.title,
            media.type,
            newStatus,
            newRating,
            media.date_started, // started
            media.date_watched, // completed
            null, // released
            media.genres,
            media.image_url, // poster
            null, // tags
            null, // length
            0, // featured
            1, // published
            media.content,
            media.created_at,
            media.updated_at
          ]
        });

        console.log(`  ✅ Migrated: ${media.slug}`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error migrating ${media.slug}:`, error);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📁 Total entries: ${oldMedia.length}`);
    console.log("💾 Backup table: media_content_backup");
    console.log("=".repeat(50) + "\n");

    console.log("💡 Migration complete!");
    console.log("   - Old data is backed up in 'media_content_backup'");
    console.log("   - You can drop the backup table once verified:");
    console.log("     DROP TABLE media_content_backup;\n");

  } catch (error) {
    console.error("💥 Migration failed:", error);
    console.log("\n⚠️  Attempting to restore from backup...");

    try {
      await db.execute("DROP TABLE IF EXISTS media_content");
      await db.execute("ALTER TABLE media_content_backup RENAME TO media_content");
      console.log("✅ Backup restored successfully");
    } catch (restoreError) {
      console.error("❌ Failed to restore backup:", restoreError);
      console.log("⚠️  Manual intervention required!");
    }

    throw error;
  }
}

/**
 * Run migration
 */
if (require.main === module) {
  migrateMediaSchema()
    .then(() => {
      console.log("✨ Schema migration complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Schema migration failed:", error);
      process.exit(1);
    });
}

export { migrateMediaSchema };
