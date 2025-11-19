#!/usr/bin/env tsx
/**
 * Migration script to add userId column to tasks table
 * and assign all existing tasks to the first user
 * Run with: npm run tsx scripts/add-userId-to-tasks.ts
 */

import Database from "better-sqlite3";
import { config } from "dotenv";
import { join } from "path";

// Load environment variables
config({ path: join(process.cwd(), ".env.local") });

function addUserIdColumn() {
  const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "data/homepage.db";
  const db = new Database(dbPath);

  try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
    const hasUserId = tableInfo.some(
      (col: any) => col.name === "userId"
    );

    if (hasUserId) {
      console.log("✓ Column 'userId' already exists in tasks table");
    } else {
      // Add the userId column
      db.prepare("ALTER TABLE tasks ADD COLUMN userId TEXT").run();
      console.log("✓ Added 'userId' column to tasks table");

      // Create index for userId
      db.prepare(
        "CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId)"
      ).run();
      console.log("✓ Created index on userId column");
    }

    // Get the first user from the database
    const firstUser = db.prepare("SELECT id FROM user LIMIT 1").get() as { id: string } | undefined;

    if (!firstUser) {
      console.log("⚠ No users found in database. Skipping userId assignment.");
      console.log("  Tasks will be assigned to users when they're created.");
      db.close();
      return;
    }

    console.log(`✓ Found user with ID: ${firstUser.id}`);

    // Update all existing tasks without a userId to use the first user's ID
    const result = db.prepare(
      "UPDATE tasks SET userId = ? WHERE userId IS NULL"
    ).run(firstUser.id);

    console.log(`✓ Updated ${result.changes} tasks with userId: ${firstUser.id}`);

    console.log("\n✓ Migration completed successfully!");
    db.close();
  } catch (error) {
    console.error("✗ Migration failed:", error);
    db.close();
    process.exit(1);
  }
}

addUserIdColumn();
