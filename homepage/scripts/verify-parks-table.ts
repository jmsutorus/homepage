import { getDatabase } from "../lib/db/index";

/**
 * Verify the parks table structure
 */
function verifyParksTable() {
  console.log("🔍 Verifying parks table structure...\n");

  const db = getDatabase();

  // Get table info
  const tableInfo = db.prepare("PRAGMA table_info(parks)").all();

  if (tableInfo.length === 0) {
    console.log("❌ Parks table does not exist!");
    return;
  }

  console.log("Parks table columns:");
  console.table(tableInfo);

  // Get indexes
  const indexes = db.prepare("PRAGMA index_list(parks)").all();
  console.log("\nParks table indexes:");
  console.table(indexes);

  // Get row count
  const count = db.prepare("SELECT COUNT(*) as count FROM parks").get() as {
    count: number;
  };
  console.log(`\n✅ Parks table exists with ${count.count} rows`);
}

/**
 * Run verification if this file is executed directly
 */
if (require.main === module) {
  try {
    verifyParksTable();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error verifying parks table:", error);
    process.exit(1);
  }
}
