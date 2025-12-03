import { getDatabase } from "../index";

const db = getDatabase();

(async () => {
  try {
    console.log("Running migration: 003_fix_mood_entries_constraint");

    const tx = await db.transaction("write");

    try {
      // 1. Rename existing table
      await tx.execute("ALTER TABLE mood_entries RENAME TO mood_entries_old");

      // 2. Create new table with correct schema
      await tx.execute(`
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
      
      await tx.execute(`
        INSERT INTO mood_entries (id, userId, date, rating, note, created_at, updated_at)
        SELECT id, userId, date, rating, note, created_at, updated_at
        FROM mood_entries_old
        WHERE userId IS NOT NULL
      `);

      // 4. Recreate indexes
      await tx.execute("CREATE INDEX idx_mood_entries_userId ON mood_entries(userId)");
      await tx.execute("CREATE INDEX idx_mood_entries_date ON mood_entries(date)");

      // 5. Recreate trigger
      await tx.execute(`
        CREATE TRIGGER update_mood_entries_timestamp
        AFTER UPDATE ON mood_entries
        BEGIN
          UPDATE mood_entries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);

      // 6. Drop old table
      await tx.execute("DROP TABLE mood_entries_old");

      await tx.commit();
      console.log("Migration completed successfully");
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
})();
