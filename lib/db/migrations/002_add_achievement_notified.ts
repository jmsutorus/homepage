import { getDatabase } from "../index";

const db = getDatabase();

try {
  console.log("Running migration: 002_add_achievement_notified");

  db.exec(`
    ALTER TABLE user_achievements ADD COLUMN notified INTEGER DEFAULT 0;
  `);

  console.log("Migration completed successfully");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}
