import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = join(__dirname, "..", "data", "homepage.db");

console.log("🔧 Fixing journals table schema...");
console.log("📁 Database path:", dbPath);

try {
  // Create database instance
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Check if journals table exists
  const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='journals'").get();

  if (tableExists) {
    console.log("📊 Journals table exists - checking structure...");

    // Check current columns
    const columns = db.prepare("PRAGMA table_info(journals)").all();
    console.log("Current columns:");
    columns.forEach(col => {
      console.log(`   - ${col.name} (${col.type})`);
    });

    // Check if journal_type column exists
    const hasJournalType = columns.some(col => col.name === 'journal_type');
    const hasDailyDate = columns.some(col => col.name === 'daily_date');

    if (!hasJournalType || !hasDailyDate) {
      console.log("\n⚠️  Missing columns detected. Recreating table...");

      // Get existing data
      const existingJournals = db.prepare("SELECT * FROM journals").all();
      console.log(`📋 Backing up ${existingJournals.length} existing journals...`);

      // Drop existing tables
      db.prepare("DROP TABLE IF EXISTS journal_links").run();
      db.prepare("DROP TABLE IF EXISTS journals").run();
      console.log("🗑️  Dropped old tables");

      // Recreate journals table with correct schema
      db.exec(`
        CREATE TABLE journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          journal_type TEXT CHECK(journal_type IN ('daily', 'general')) DEFAULT 'general',
          daily_date TEXT,
          mood INTEGER CHECK(mood BETWEEN 0 AND 10),
          tags TEXT,
          featured BOOLEAN DEFAULT 0,
          published BOOLEAN DEFAULT 1,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(journal_type, daily_date)
        );

        CREATE INDEX idx_journals_slug ON journals(slug);
        CREATE INDEX idx_journals_featured ON journals(featured);
        CREATE INDEX idx_journals_published ON journals(published);
        CREATE INDEX idx_journals_created_at ON journals(created_at);
        CREATE INDEX idx_journals_updated_at ON journals(updated_at);
        CREATE INDEX idx_journals_journal_type ON journals(journal_type);
        CREATE INDEX idx_journals_daily_date ON journals(daily_date);

        CREATE TRIGGER update_journals_timestamp
        AFTER UPDATE ON journals
        BEGIN
          UPDATE journals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;

        CREATE TABLE journal_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          journal_id INTEGER NOT NULL,
          linked_type TEXT NOT NULL,
          linked_id INTEGER NOT NULL,
          linked_slug TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_journal_links_journal_id ON journal_links(journal_id);
        CREATE INDEX idx_journal_links_linked_type ON journal_links(linked_type);
        CREATE INDEX idx_journal_links_linked_id ON journal_links(linked_id);
        CREATE INDEX idx_journal_links_type_id ON journal_links(linked_type, linked_id);
        CREATE INDEX idx_journal_links_type_slug ON journal_links(linked_type, linked_slug);
      `);

      console.log("✅ Created new tables with correct schema");

      // Restore data if any
      if (existingJournals.length > 0) {
        console.log("📝 Restoring journals...");
        const insert = db.prepare(`
          INSERT INTO journals (id, slug, title, journal_type, tags, featured, published, content, created_at, updated_at)
          VALUES (?, ?, ?, 'general', ?, ?, ?, ?, ?, ?)
        `);

        for (const journal of existingJournals) {
          insert.run(
            journal.id,
            journal.slug,
            journal.title,
            journal.tags || null,
            journal.featured || 0,
            journal.published !== undefined ? journal.published : 1,
            journal.content,
            journal.created_at,
            journal.updated_at
          );
        }
        console.log(`✅ Restored ${existingJournals.length} journals`);
      }
    } else {
      console.log("✅ Journals table already has correct schema");
    }
  } else {
    console.log("ℹ️  Journals table doesn't exist yet - will be created on next app start");
  }

  // Verify final structure
  const finalColumns = db.prepare("PRAGMA table_info(journals)").all();
  console.log("\n📋 Final table structure:");
  finalColumns.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  db.close();
  console.log("\n🎉 Migration complete!");
} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
}
