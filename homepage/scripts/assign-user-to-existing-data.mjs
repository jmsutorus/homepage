import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "homepage.db");

const userId = "GbVDvSgQp2dIMo1d68D02yQP0862";

console.log("Assigning user ID to existing database records...");
console.log("User ID:", userId);
console.log("Database:", dbPath);

const db = new Database(dbPath);

try {
  db.exec("BEGIN TRANSACTION");

  // Tables that need userId updated
  const tables = [
    "mood_entries",
    "tasks",
    "strava_athlete",
    "strava_activities",
    "workout_activities",
    "media_content",
    "events",
    "parks",
    "journals",
    "journal_links",
  ];

  for (const table of tables) {
    // Check if table exists and has records without userId
    const checkStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM ${table}
      WHERE userId IS NULL OR userId = ''
    `);
    const result = checkStmt.get();

    if (result.count > 0) {
      console.log(`\nUpdating ${table}: ${result.count} records`);

      // Update records to set userId
      const updateStmt = db.prepare(`
        UPDATE ${table}
        SET userId = ?
        WHERE userId IS NULL OR userId = ''
      `);

      const info = updateStmt.run(userId);
      console.log(`  ✓ Updated ${info.changes} records`);
    } else {
      console.log(`\n${table}: No records to update`);
    }
  }

  db.exec("COMMIT");
  console.log("\n✅ Successfully assigned user ID to all existing data!");
} catch (error) {
  db.exec("ROLLBACK");
  console.error("❌ Error:", error.message);
  process.exit(1);
} finally {
  db.close();
}
