#!/usr/bin/env tsx
/**
 * Migration script to add description and status fields to tasks
 * Adds:
 * - description column to tasks table
 * - status column to tasks table with default 'active'
 * - task_statuses table for user-defined custom statuses
 * - Migrates existing completed tasks to 'completed' status
 */

import { getDatabase } from "../lib/db/index";
import * as fs from "fs";
import * as path from "path";

async function migrateTaskStatusAndDescription() {
  const db = getDatabase();

  console.log("🚀 Starting task status and description migration...");

  try {
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), "lib/db/migrations/007_add_task_description_and_status.sql");

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    console.log("📄 Reading migration file...");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 80).replace(/\n/g, " ");

      try {
        await db.execute(statement);
        console.log(`✓ [${i + 1}/${statements.length}] ${preview}...`);
      } catch (error: any) {
        // Handle common non-fatal errors
        if (
          error.message?.includes("duplicate column name") ||
          error.message?.includes("already exists") ||
          error.message?.includes("UNIQUE constraint failed")
        ) {
          console.log(`⚠ [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
        } else {
          console.error(`\n❌ Failed on statement ${i + 1}:`, statement);
          throw error;
        }
      }
    }

    // Verify the changes
    console.log("\n🔍 Verifying migration...");

    // Check if description column exists
    const tasksSchema = await db.execute("PRAGMA table_info(tasks)");
    const hasDescription = tasksSchema.rows.some((row: any) => row.name === "description");
    const hasStatus = tasksSchema.rows.some((row: any) => row.name === "status");

    if (hasDescription) {
      console.log("✅ Description column added to tasks table");
    } else {
      throw new Error("Description column was not added to tasks table");
    }

    if (hasStatus) {
      console.log("✅ Status column added to tasks table");
    } else {
      throw new Error("Status column was not added to tasks table");
    }

    // Check if task_statuses table exists
    const tablesResult = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='task_statuses'"
    );

    if (tablesResult.rows.length > 0) {
      console.log("✅ task_statuses table created");
    } else {
      throw new Error("task_statuses table was not created");
    }

    // Check data migration
    const statusCheck = await db.execute("SELECT status, COUNT(*) as count FROM tasks GROUP BY status");
    console.log("\n📊 Task status distribution:");
    statusCheck.rows.forEach((row: any) => {
      console.log(`   ${row.status || '(null)'}: ${row.count} task(s)`);
    });

    console.log("\n✨ Migration completed successfully!");
    console.log("   - Added description column to tasks table");
    console.log("   - Added status column to tasks table");
    console.log("   - Created task_statuses table for custom statuses");
    console.log("   - Migrated existing completed tasks to 'completed' status");
    console.log("   - Created indexes for performance");

  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    throw error;
  }
}

// Run migration
if (require.main === module) {
  (async () => {
    try {
      await migrateTaskStatusAndDescription();
      process.exit(0);
    } catch (error) {
      console.error("❌ Error running migration:", error);
      process.exit(1);
    }
  })();
}

export { migrateTaskStatusAndDescription };
