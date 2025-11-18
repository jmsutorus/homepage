#!/usr/bin/env tsx

import { execute, query } from "../lib/db/index";

/**
 * Script to delete all media entries from the database
 */
function clearAllMedia() {
  try {
    // Get count before deletion
    const before = query<{ count: number }>("SELECT COUNT(*) as count FROM media_content")[0];
    console.log(`📊 Found ${before.count} media entries in database`);

    if (before.count === 0) {
      console.log("✅ Database is already empty");
      return;
    }

    // Delete all media entries
    console.log("🗑️  Deleting all media entries...");
    const result = execute("DELETE FROM media_content");

    console.log(`✅ Successfully deleted ${result.changes} media entries`);
    console.log("💡 You can now reimport media through the UI");
  } catch (error) {
    console.error("❌ Failed to clear media:", error);
    throw error;
  }
}

// Run the script
clearAllMedia();
