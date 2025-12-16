#!/usr/bin/env tsx
/**
 * Run task categories migration on the database
 * Usage: tsx scripts/run-task-categories-migration.ts
 */

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

async function runMigration() {
  const dbUrl = process.env.DATABASE_URL;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl) {
    console.error("❌ Missing DATABASE_URL environment variable");
    console.error("   Make sure your .env.local file is configured correctly");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const db = createClient({
    url: dbUrl,
    authToken: dbAuthToken,
  });

  try {
    // Read and execute the migration file
    const migrationPath = path.join(process.cwd(), "lib/db/migrations/010_add_task_categories.sql");

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    console.log("📄 Reading migration file...");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      try {
        await db.execute(statement);
        console.log(`✓ Executed: ${statement.substring(0, 80)}...`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate column")
        ) {
          console.log(`⚠ Skipped (already exists): ${statement.substring(0, 80)}...`);
        } else {
          throw error;
        }
      }
    }

    // Verify the table was created
    console.log("\n🔍 Verifying table creation...");
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='task_categories'"
    );

    if (result.rows.length > 0) {
      console.log("✅ task_categories table exists");

      // Check if there are any categories
      const categoryCheck = await db.execute("SELECT COUNT(*) as count FROM task_categories");
      console.log(`✅ task_categories has ${categoryCheck.rows[0].count} categories`);
    } else {
      console.error("❌ task_categories table was not created");
      process.exit(1);
    }

    console.log("\n✨ Migration completed successfully!");
    console.log("\nNote: Default categories will be created automatically when users first");
    console.log("      access the tasks page via the ensureDefaultCategories() function.");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
