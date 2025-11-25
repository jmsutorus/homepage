import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

console.log("Checking strava_athlete table for userId...\n");

// Check for specific user
const specificUser = db.prepare(`
  SELECT id, userId, username, firstname, lastname, created_at, last_sync
  FROM strava_athlete 
  WHERE userId = ?
`).get("jmsutorus@gmail.com");

if (specificUser) {
  console.log("✅ Found strava_athlete record for jmsutorus@gmail.com:");
  console.log(JSON.stringify(specificUser, null, 2));
} else {
  console.log("❌ No strava_athlete record found for userId: jmsutorus@gmail.com");
}

console.log("\n--- All strava_athlete records ---");
const allAthletes = db.prepare(`
  SELECT id, userId, username, firstname, lastname, created_at, last_sync
  FROM strava_athlete
`).all();

console.log(`Total records: ${allAthletes.length}`);
if (allAthletes.length > 0) {
  allAthletes.forEach((athlete: any) => {
    console.log(`- Athlete ID: ${athlete.id}, User: ${athlete.userId}, Name: ${athlete.firstname} ${athlete.lastname}`);
  });
}

db.close();
