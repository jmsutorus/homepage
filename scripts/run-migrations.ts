#!/usr/bin/env tsx
/**
 * Run database migrations on the production Turso database
 * Usage: tsx scripts/run-migrations.ts
 */

import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  const dbAuthToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl || !dbAuthToken) {
    console.error("❌ Missing DATABASE_URL or DATABASE_AUTH_TOKEN environment variables");
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
    const migrationPath = path.join(process.cwd(), "lib/db/migrations/001_allowed_users.sql");

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
      .filter((s) => s.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      try {
        await db.execute(statement);
        console.log(`✓ Executed: ${statement.substring(0, 60)}...`);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes("already exists")) {
          console.log(`⚠ Skipped (already exists): ${statement.substring(0, 60)}...`);
        } else {
          throw error;
        }
      }
    }

    // Verify the table was created
    console.log("\n🔍 Verifying table creation...");
    const result = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='allowed_users'"
    );

    if (result.rows.length > 0) {
      console.log("✅ allowed_users table exists");

      // Check if the initial user was added
      const userCheck = await db.execute("SELECT email FROM allowed_users");
      console.log(`✅ allowed_users has ${userCheck.rows.length} user(s)`);
      if (userCheck.rows.length > 0) {
        console.log("   Users:");
        userCheck.rows.forEach((row) => console.log(`   - ${row.email}`));
      }
    } else {
      console.error("❌ allowed_users table was not created");
      process.exit(1);
    }

    console.log("\n✨ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migrations
runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
