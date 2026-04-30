/**
 * Migrates a user's ID across all database tables.
 *
 * Old ID: 81382a8c-95fc-4e66-b26b-a760ff813471
 * New ID: GbVDvSgQp2dIMo1d68D02yQP0862
 *
 * Strategy (handles FK constraints & unique email constraint):
 *   1. Verify old user exists
 *   2. Disable FK enforcement (PRAGMA foreign_keys = OFF)
 *   3. UPDATE user.id directly (now safe without FK checks)
 *   4. UPDATE userId in all data tables
 *   5. Re-enable FK enforcement
 *
 * Run with: npx tsx scripts/migrate-user-id.ts
 */

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const OLD_USER_ID = "81382a8c-95fc-4e66-b26b-a760ff813471";
const NEW_USER_ID = "GbVDvSgQp2dIMo1d68D02yQP0862";

// All tables that have a userId column
const USER_ID_TABLES = [
  "mood_entries",
  "tasks",
  "task_categories",
  "task_statuses",
  "task_templates",
  "strava_athlete",
  "strava_activities",
  "workout_activities",
  "workout_goals",
  "media_content",
  "events",
  "event_categories",
  "parks",
  "park_categories",
  "journals",
  "journal_links",
  "vacations",
  "vacation_people",
  "habits",
  "habit_completions",
  "drinks",
  "drink_entries",
  "meals",
  "daily_meals",
  "grocery_lists",
  "grocery_items",
  "goals",
  "goal_milestones",
  "goal_categories",
  "quick_links",
  "people",
  "relationships",
  "relationship_dates",
  "relationship_milestones",
  "intimacy_entries",
  "restaurants",
  "restaurant_visits",
  "subscriptions",
  "savings_accounts",
  "savings_balances",
  "debts",
  "debt_payments",
  "budget_categories",
  "budget_entries",
  "personal_records",
  "scratch_pads",
  "calendar_events",
  "calendar_colors",
  "duolingo_stats",
  "github_stats",
  "steam_stats",
  "api_cache",
  "saved_searches",
  "achievements",
  "user_achievements",
];

async function migrateUserId() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  console.log("🔌 Connecting to Turso database...");
  const db = createClient({ url, authToken });

  console.log(`\n🔄 Migrating user ID:`);
  console.log(`   OLD: ${OLD_USER_ID}`);
  console.log(`   NEW: ${NEW_USER_ID}\n`);

  // --- Step 1: Verify old user exists ---
  console.log("🔍 Step 1: Verifying old user exists...");
  try {
    const result = await db.execute({
      sql: "SELECT id, email FROM user WHERE id = ?",
      args: [OLD_USER_ID],
    });

    if (result.rows.length === 0) {
      console.error(`❌ No user found with ID: ${OLD_USER_ID}`);
      process.exit(1);
    }

    const email = result.rows[0]["email"] ?? "(no email)";
    console.log(`✅ Found user: ${email}\n`);
  } catch (err) {
    console.error(`❌ Could not query 'user' table: ${(err as Error).message}`);
    process.exit(1);
  }

  // --- Step 2: Ensure new ID doesn't already exist ---
  console.log("🔍 Step 2: Checking for ID conflicts...");
  try {
    const conflict = await db.execute({
      sql: "SELECT id FROM user WHERE id = ?",
      args: [NEW_USER_ID],
    });

    if (conflict.rows.length > 0) {
      console.error(`❌ A user with ID "${NEW_USER_ID}" already exists. Aborting.`);
      process.exit(1);
    }
    console.log("✅ No conflict — new ID is available.\n");
  } catch (err) {
    console.error(`❌ Conflict check failed: ${(err as Error).message}`);
    process.exit(1);
  }

  // --- Step 3: Disable FK checks, update user.id, re-enable ---
  // Turso (libSQL) supports PRAGMA foreign_keys per-connection.
  // Disabling it lets us UPDATE the PK directly without touching child rows yet.
  console.log("🔓 Step 3: Disabling FK checks and updating user.id...");
  try {
    await db.execute({ sql: "PRAGMA foreign_keys = OFF", args: [] });

    const userUpdate = await db.execute({
      sql: "UPDATE user SET id = ? WHERE id = ?",
      args: [NEW_USER_ID, OLD_USER_ID],
    });

    if (userUpdate.rowsAffected === 0) {
      throw new Error("UPDATE affected 0 rows — user may not exist.");
    }

    console.log(`✅ user.id updated to ${NEW_USER_ID}\n`);
  } catch (err) {
    // Make sure FKs are re-enabled even on failure
    await db.execute({ sql: "PRAGMA foreign_keys = ON", args: [] }).catch(() => {});
    console.error(`❌ Failed to update user.id: ${(err as Error).message}`);
    process.exit(1);
  }

  // --- Step 4: Update userId across all data tables ---
  console.log("📋 Step 4: Updating userId across all data tables...\n");

  let totalUpdated = 0;
  const skippedTables: string[] = [];
  const updatedTables: { table: string; count: number }[] = [];

  for (const table of USER_ID_TABLES) {
    try {
      const result = await db.execute({
        sql: `UPDATE ${table} SET userId = ? WHERE userId = ?`,
        args: [NEW_USER_ID, OLD_USER_ID],
      });

      const count = result.rowsAffected;
      if (count > 0) {
        console.log(`  ✅ ${table}: ${count} row(s) updated`);
        updatedTables.push({ table, count });
        totalUpdated += count;
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("no such table") || msg.includes("no such column")) {
        skippedTables.push(table); // table/column doesn't exist — skip silently
      } else {
        console.warn(`  ⚠️  ${table}: ${msg}`);
      }
    }
  }

  // --- Step 5: Re-enable FK checks ---
  console.log("\n🔒 Step 5: Re-enabling FK checks...");
  try {
    await db.execute({ sql: "PRAGMA foreign_keys = ON", args: [] });
    console.log("✅ FK checks restored.\n");
  } catch (err) {
    console.warn(`⚠️  Could not re-enable FK checks: ${(err as Error).message}`);
  }

  // --- Summary ---
  console.log("═══════════════════════════════════════");
  console.log("          MIGRATION SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`✅ Total data rows updated: ${totalUpdated}`);

  if (updatedTables.length > 0) {
    console.log("\nTables with updated rows:");
    for (const { table, count } of updatedTables) {
      console.log(`  - ${table}: ${count} row(s)`);
    }
  }

  if (skippedTables.length > 0) {
    console.log(`\n⏭️  Tables not present in DB (skipped): ${skippedTables.join(", ")}`);
  }

  console.log("\n✅ Migration complete!\n");
}

migrateUserId().catch((err) => {
  console.error("❌ Unhandled error:", err);
  process.exit(1);
});
