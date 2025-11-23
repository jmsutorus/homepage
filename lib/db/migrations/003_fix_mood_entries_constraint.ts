import { getDatabase } from "../index";

const db = getDatabase();

try {
  console.log("Running migration: 003_fix_mood_entries_constraint");

  db.transaction(() => {
    // 1. Rename existing table
    db.exec("ALTER TABLE mood_entries RENAME TO mood_entries_old");

    // 2. Create new table with correct schema
    db.exec(`
      CREATE TABLE mood_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        date TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
        UNIQUE(userId, date)
      )
    `);

    // 3. Copy data
    // Note: We need to handle potential duplicates if any exist that violate the new constraint
    // But since the old schema had UNIQUE(userId, date), it should be fine.
    // However, if userId was missing in some rows (which caused the issue), we need to filter or handle them.
    // The previous error was "FOREIGN KEY constraint failed", implying some rows might have invalid userIds.
    // Let's assume we only want to migrate valid rows.
    
    db.exec(`
      INSERT INTO mood_entries (id, userId, date, rating, note, created_at, updated_at)
      SELECT id, userId, date, rating, note, created_at, updated_at
      FROM mood_entries_old
      WHERE userId IS NOT NULL
    `);

    // 4. Recreate indexes
    db.exec("CREATE INDEX idx_mood_entries_userId ON mood_entries(userId)");
    db.exec("CREATE INDEX idx_mood_entries_date ON mood_entries(date)");

    // 5. Recreate trigger
    db.exec(`
      CREATE TRIGGER update_mood_entries_timestamp
      AFTER UPDATE ON mood_entries
      BEGIN
        UPDATE mood_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `);

    // 6. Drop old table
    db.exec("DROP TABLE mood_entries_old");
  })();

  console.log("Migration completed successfully");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
