import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@libsql/client";

/**
 * Migration script to add the personal_records and exercise_settings tables
 */
async function addPersonalRecordsTables() {
  console.log("🔄 Adding personal_records and exercise_settings tables to database...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in .env.local");
  }

  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  // Create exercise_settings table
  const createSettingsTableSQL = `
    CREATE TABLE IF NOT EXISTS exercise_settings (
      userId TEXT PRIMARY KEY,
      enable_running_prs BOOLEAN DEFAULT 0,
      enable_weights_prs BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );
  `;
  await db.execute({ sql: createSettingsTableSQL, args: [] });
  console.log("✅ Created exercise_settings table");

  // Create personal_records table
  const createRecordsTableSQL = `
    CREATE TABLE IF NOT EXISTS personal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      type TEXT CHECK(type IN ('running', 'weights')) NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      distance REAL,
      total_seconds INTEGER,
      exercise TEXT,
      weight REAL,
      reps INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );
  `;
  await db.execute({ sql: createRecordsTableSQL, args: [] });
  console.log("✅ Created personal_records table");

  // Create indexes
  await db.execute({ sql: "CREATE INDEX IF NOT EXISTS idx_personal_records_userId ON personal_records(userId);", args: [] });
  await db.execute({ sql: "CREATE INDEX IF NOT EXISTS idx_personal_records_type ON personal_records(type);", args: [] });
  console.log("✅ Created indexes");

  console.log("🎉 Migration completed successfully!");
}

/**
 * Run migration if this file is executed directly
 */
if (require.main === module) {
  (async () => {
    try {
      await addPersonalRecordsTables();
      process.exit(0);
    } catch (error) {
      console.error("❌ Error running migration:", error);
      process.exit(1);
    }
  })();
}
