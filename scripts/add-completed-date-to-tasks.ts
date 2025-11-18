#!/usr/bin/env tsx
/**
 * Migration script to add completed_date column to tasks table
 * Run with: npm run tsx scripts/add-completed-date-to-tasks.ts
 */

import Database from "better-sqlite3";
import { config } from "dotenv";
import { join } from "path";

// Load environment variables
config({ path: join(process.cwd(), ".env.local") });

function addCompletedDateColumn() {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "homepage.db";
  const db = new Database(dbPath);

  try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
    const hasCompletedDate = tableInfo.some(
      (col: any) => col.name === "completed_date"
    );

    if (hasCompletedDate) {
      console.log("✓ Column 'completed_date' already exists in tasks table");
      db.close();
      return;
    }

    // Add the completed_date column
    db.prepare("ALTER TABLE tasks ADD COLUMN completed_date TEXT").run();
    console.log("✓ Added 'completed_date' column to tasks table");

    // Create index for completed_date
    db.prepare(
      "CREATE INDEX IF NOT EXISTS idx_tasks_completed_date ON tasks(completed_date)"
    ).run();
    console.log("✓ Created index on completed_date column");

    console.log("\n✓ Migration completed successfully!");
    db.close();
  } catch (error) {
    console.error("✗ Migration failed:", error);
    db.close();
    process.exit(1);
  }
}

addCompletedDateColumn();
