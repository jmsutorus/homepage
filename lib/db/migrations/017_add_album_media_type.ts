import { getDatabase } from "../index";

const db = getDatabase();

(async () => {
  try {
    console.log("Running migration: 017_add_album_media_type");

    const tx = await db.transaction("write");

    try {
      // 1. Rename existing table
      await tx.execute("ALTER TABLE media_content RENAME TO media_content_old");

      // 2. Create new table with updated type constraint (includes 'album')
      await tx.execute(`
        CREATE TABLE media_content (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          slug TEXT NOT NULL,
          title TEXT NOT NULL,
          type TEXT CHECK(type IN ('movie', 'tv', 'book', 'game', 'album')) NOT NULL,
          status TEXT CHECK(status IN ('in-progress', 'completed', 'planned')) NOT NULL,
          rating INTEGER CHECK(rating BETWEEN 0 AND 10),
          started TEXT,
          completed TEXT,
          released TEXT,
          genres TEXT,
          poster TEXT,
          tags TEXT,
          description TEXT,
          length TEXT,
          creator TEXT,
          featured BOOLEAN DEFAULT 0,
          published BOOLEAN DEFAULT 1,
          time_spent INTEGER NOT NULL DEFAULT 0,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
          UNIQUE(userId, slug)
        )
      `);

      // 3. Copy all data from old table
      await tx.execute(`
        INSERT INTO media_content
        SELECT * FROM media_content_old
      `);

      // 4. Recreate indexes
      await tx.execute("CREATE INDEX idx_media_content_userId ON media_content(userId)");
      await tx.execute("CREATE INDEX idx_media_content_type ON media_content(type)");
      await tx.execute("CREATE INDEX idx_media_content_status ON media_content(status)");

      // 5. Recreate trigger
      await tx.execute(`
        CREATE TRIGGER update_media_content_timestamp
        AFTER UPDATE ON media_content
        BEGIN
          UPDATE media_content SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `);

      // 6. Drop old table
      await tx.execute("DROP TABLE media_content_old");

      await tx.commit();
      console.log("Migration completed successfully - 'album' type added to media_content");
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
})();
