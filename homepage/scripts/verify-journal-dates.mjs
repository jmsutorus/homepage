import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simulate the formatDateLongSafe function
function formatDateLongSafe(dateString, locale = "en-US") {
  if (!dateString) return "";
  const datePart = dateString.split("T")[0].split(" ")[0];
  const separator = datePart.includes("-") ? "-" : "/";
  const [year, month, day] = datePart.split(separator).map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Database path
const dbPath = join(__dirname, "..", "data", "homepage.db");

console.log("🔍 Verifying journal date formatting...\n");

try {
  const db = new Database(dbPath);

  const journals = db.prepare(`
    SELECT id, slug, title, journal_type, daily_date, created_at, updated_at
    FROM journals
  `).all();

  console.log(`📊 Found ${journals.length} journal(s)\n`);

  journals.forEach(journal => {
    console.log(`📝 "${journal.title}"`);
    console.log(`   Type: ${journal.journal_type}`);

    if (journal.journal_type === 'daily' && journal.daily_date) {
      console.log(`   Daily Date: ${journal.daily_date}`);
      console.log(`   → Formatted: ${formatDateLongSafe(journal.daily_date)}`);
    }

    console.log(`   Created: ${journal.created_at}`);
    console.log(`   → Formatted: ${formatDateLongSafe(journal.created_at)}`);

    if (journal.updated_at !== journal.created_at) {
      console.log(`   Updated: ${journal.updated_at}`);
      console.log(`   → Formatted: ${formatDateLongSafe(journal.updated_at)}`);
    }

    console.log();
  });

  db.close();
  console.log("✅ All dates formatted successfully!");
} catch (error) {
  console.error("❌ Error:", error);
  process.exit(1);
}
