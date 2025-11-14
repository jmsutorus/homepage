import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = join(__dirname, "..", "data", "homepage.db");

console.log("🔍 Testing journal calendar integration...\n");

try {
  const db = new Database(dbPath);

  // Check journals in database
  const journals = db.prepare(`
    SELECT id, slug, title, journal_type, daily_date,
           DATE(created_at) as created_date, created_at
    FROM journals
  `).all();

  console.log(`📊 Found ${journals.length} journal(s) in database:\n`);

  if (journals.length === 0) {
    console.log("ℹ️  No journals found. Create some journals to test calendar integration.");
  } else {
    journals.forEach(journal => {
      console.log(`📝 "${journal.title}"`);
      console.log(`   Type: ${journal.journal_type}`);
      if (journal.journal_type === 'daily') {
        console.log(`   Daily Date: ${journal.daily_date}`);
        console.log(`   📅 Will appear on calendar: ${journal.daily_date}`);
      } else {
        console.log(`   Created: ${journal.created_at}`);
        console.log(`   📅 Will appear on calendar: ${journal.created_date}`);
      }
      console.log();
    });
  }

  // Test the calendar query for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  console.log(`🗓️  Testing query for ${year}-${String(month).padStart(2, '0')}:`);
  console.log(`   Range: ${startDate} to ${endDate}\n`);

  const journalsInRange = db.prepare(`
    SELECT id, title, journal_type, daily_date, DATE(created_at) as created_date
    FROM journals
    WHERE (journal_type = 'daily' AND daily_date BETWEEN ? AND ?)
       OR (journal_type = 'general' AND DATE(created_at) BETWEEN ? AND ?)
    ORDER BY
      CASE
        WHEN journal_type = 'daily' THEN daily_date
        ELSE DATE(created_at)
      END ASC
  `).all(startDate, endDate, startDate, endDate);

  console.log(`📅 Journals that will appear on calendar this month: ${journalsInRange.length}\n`);

  journalsInRange.forEach(journal => {
    const displayDate = journal.journal_type === 'daily'
      ? journal.daily_date
      : journal.created_date;
    console.log(`   ${displayDate} - ${journal.title} (${journal.journal_type})`);
  });

  db.close();
  console.log("\n✅ Test complete!");
} catch (error) {
  console.error("❌ Test failed:", error);
  process.exit(1);
}
