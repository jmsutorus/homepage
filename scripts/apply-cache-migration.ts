import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const migrationPath = path.join(process.cwd(), "lib", "db", "migrations", "004_add_userid_to_api_cache.sql");

const db = new Database(dbPath);
const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

console.log("Applying migration: 004_add_userid_to_api_cache.sql");

try {
  // Split by semicolon and execute each statement
  const statements = migrationSQL
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const statement of statements) {
    if (statement.trim()) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      db.exec(statement);
    }
  }

  console.log("Migration statements executed successfully!");

  // Clear existing cache entries that have NULL userId
  console.log("Clearing old cache entries without userId...");
  try {
    const result = db.prepare("DELETE FROM api_cache WHERE userId IS NULL").run();
    console.log(`Deleted ${result.changes} old cache entries`);
  } catch (e) {
    console.log("No old cache entries to clear (column may have been added previously)");
  }

  console.log("Migration applied successfully!");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  db.close();
}
