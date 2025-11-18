#!/usr/bin/env tsx

import { execute } from "../lib/db/index";

/**
 * Migration script to add description column to media_content table
 */
function addDescriptionColumn() {
  try {
    console.log("Adding description column to media_content table...");

    execute(
      `ALTER TABLE media_content ADD COLUMN description TEXT`
    );

    console.log("✅ Successfully added description column to media_content table");
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate column name")) {
      console.log("⚠️  Description column already exists, skipping migration");
    } else {
      console.error("❌ Failed to add description column:", error);
      throw error;
    }
  }
}

// Run the migration
addDescriptionColumn();
