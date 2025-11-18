import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = join(__dirname, "..", "data", "homepage.db");

console.log("🧪 Testing calendar journal integration with timestamp fix...\n");

try {
  const db = new Database(dbPath);

  // Get journals with their raw timestamps
  const journals = db.prepare(`
    SELECT id, title, journal_type, daily_date, created_at
    FROM journals
  `).all();

  console.log("📊 Journals in database:");
  journals.forEach(j => {
    console.log(`   - "${j.title}" (${j.journal_type})`);
    if (j.journal_type === 'daily') {
      console.log(`     Date key: ${j.daily_date}`);
    } else {
      const dateStr = j.created_at.split('T')[0].split(' ')[0];
      console.log(`     Created: ${j.created_at}`);
      console.log(`     Date key: ${dateStr}`);
    }
  });

  // Simulate calendar date range for current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  console.log(`\n🗓️  Calendar date range: ${startDate} to ${endDate}\n`);

  // Get journals that should appear on calendar
  const journalsInRange = db.prepare(`
    SELECT id, title, journal_type, daily_date, created_at
    FROM journals
    WHERE (journal_type = 'daily' AND daily_date BETWEEN ? AND ?)
       OR (journal_type = 'general' AND DATE(created_at) BETWEEN ? AND ?)
  `).all(startDate, endDate, startDate, endDate);

  console.log("📅 Journals that will appear on calendar:");

  if (journalsInRange.length === 0) {
    console.log("   (none in current month)\n");
  } else {
    // Create a map to group journals by date (simulating calendar display)
    const dateMap = new Map();

    journalsInRange.forEach(journal => {
      let dateKey;
      if (journal.journal_type === 'daily' && journal.daily_date) {
        dateKey = journal.daily_date;
      } else if (journal.journal_type === 'general' && journal.created_at) {
        // Apply the fix: split on both 'T' and space
        dateKey = journal.created_at.split('T')[0].split(' ')[0];
      }

      if (dateKey) {
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, []);
        }
        dateMap.get(dateKey).push(journal);
      }
    });

    // Display grouped by date
    const sortedDates = Array.from(dateMap.keys()).sort();
    sortedDates.forEach(date => {
      const journalsOnDate = dateMap.get(date);
      console.log(`\n   ${date}:`);
      journalsOnDate.forEach(j => {
        console.log(`      ✓ "${j.title}" (${j.journal_type})`);
      });
    });
  }

  db.close();
  console.log("\n✅ Test complete! General journals should now appear on calendar.");
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
