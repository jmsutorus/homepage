import { getDatabase } from "@/lib/db";

/**
 * Migration script to add the 'completed' column to the habits table
 * Run this with: npx tsx scripts/migrate-habits-completed.ts
 */
async function migrate() {
  try {
    const db = getDatabase();

    console.log("Starting migration: Adding 'completed' column to habits table...");

    // Check if the column already exists
    const tableInfo = db.prepare("PRAGMA table_info(habits)").all() as any[];
    const hasCompletedColumn = tableInfo.some((col) => col.name === "completed");

    if (hasCompletedColumn) {
      console.log("✓ Column 'completed' already exists. Migration not needed.");
      return;
    }

    // Add the completed column
    db.prepare("ALTER TABLE habits ADD COLUMN completed BOOLEAN DEFAULT 0").run();

    console.log("✓ Successfully added 'completed' column to habits table.");
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
