import { getDatabase } from "../lib/db/index";

/**
 * Verify the parks table structure
 */
async function verifyParksTable() {
  console.log("🔍 Verifying parks table structure...\n");

  const db = getDatabase();

  // Get table info
  const tableInfoResult = await db.execute("PRAGMA table_info(parks)");
  const tableInfo = tableInfoResult.rows;

  if (tableInfo.length === 0) {
    console.log("❌ Parks table does not exist!");
    return;
  }

  console.log("Parks table columns:");
  console.table(tableInfo);

  // Get indexes
  const indexesResult = await db.execute("PRAGMA index_list(parks)");
  const indexes = indexesResult.rows;
  console.log("\nParks table indexes:");
  console.table(indexes);

  // Get row count
  const countResult = await db.execute("SELECT COUNT(*) as count FROM parks");
  const count = countResult.rows[0] as unknown as { count: number };
  console.log(`\n✅ Parks table exists with ${count.count} rows`);
}

/**
 * Run verification if this file is executed directly
 */
if (require.main === module) {
  (async () => {
    try {
      await verifyParksTable();
      process.exit(0);
    } catch (error) {
      console.error("❌ Error verifying parks table:", error);
      process.exit(1);
    }
  })();
}
