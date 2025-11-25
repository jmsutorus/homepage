import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

console.log("Checking user and strava_athlete relationship...\n");

// First, find the user with email jmsutorus@gmail.com
const user = db.prepare(`
  SELECT id, email, name
  FROM user
  WHERE email = ?
`).get("jmsutorus@gmail.com");

if (user) {
  console.log("✅ Found user record:");
  console.log(`   - User ID: ${(user as any).id}`);
  console.log(`   - Email: ${(user as any).email}`);
  console.log(`   - Name: ${(user as any).name}`);

  // Now check if there's a strava_athlete record for this user
  const athlete = db.prepare(`
    SELECT id, userId, username, firstname, lastname, created_at, last_sync
    FROM strava_athlete
    WHERE userId = ?
  `).get((user as any).id);

  if (athlete) {
    console.log("\n✅ Found matching strava_athlete record:");
    console.log(`   - Athlete ID: ${(athlete as any).id}`);
    console.log(`   - User ID: ${(athlete as any).userId}`);
    console.log(`   - Username: ${(athlete as any).username}`);
    console.log(`   - Name: ${(athlete as any).firstname} ${(athlete as any).lastname}`);
    console.log(`   - Last Sync: ${(athlete as any).last_sync || 'Never'}`);
  } else {
    console.log("\n❌ No strava_athlete record found for this user");
  }
} else {
  console.log("❌ No user found with email: jmsutorus@gmail.com");
}

// Show all users
console.log("\n--- All users in database ---");
const allUsers = db.prepare(`SELECT id, email, name FROM user`).all();
allUsers.forEach((u: any) => {
  console.log(`- ${u.email} (${u.name}) - ID: ${u.id}`);
});

db.close();
