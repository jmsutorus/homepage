import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

async function testSchema() {
  const { getDatabase } = await import("../lib/db");
  const db = getDatabase();
  console.log("Checking schema...");
  const table = await db.execute("PRAGMA table_info(workout_activities);");
  console.log(table.rows);
}

testSchema();
