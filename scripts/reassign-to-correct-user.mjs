import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "homepage.db");

const oldUserId = "EnCUPgPn5GDCdQRQl070Rnura5y4Rwcz";
const correctUserId = "ae5a18d1-ec1c-4e48-baaf-52edec61989e";

console.log("Reassigning data to correct user...");
console.log("From:", oldUserId, "(old Strava user)");
console.log("To:", correctUserId, "(Google account)");
console.log();

const db = new Database(dbPath);

try {
  db.exec("BEGIN TRANSACTION");

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
    const updateStmt = db.prepare(`
      UPDATE ${table}
      SET userId = ?
      WHERE userId = ?
    `);

    const info = updateStmt.run(correctUserId, oldUserId);

    if (info.changes > 0) {
      console.log(`✓ ${table}: ${info.changes} records updated`);
    }
  }

  db.exec("COMMIT");
  console.log("\n✅ All data reassigned successfully!");

  // Optionally delete the old Strava user
  console.log("\nDeleting old Strava user record...");
  const deleteUser = db.prepare("DELETE FROM user WHERE id = ?");
  deleteUser.run(oldUserId);
  console.log("✓ Old user record deleted");

} catch (error) {
  db.exec("ROLLBACK");
  console.error("❌ Error:", error.message);
  process.exit(1);
} finally {
  db.close();
}
