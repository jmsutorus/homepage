import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "homepage.db");
const db = new Database(dbPath);

const TARGET_EMAIL = "jmsutorus@gmail.com";
const TARGET_USER_ID = "ae5a18d1-ec1c-4e48-baaf-52edec61989e";

console.log("=== Strava Records Migration Script ===\n");
console.log(`Target User: ${TARGET_EMAIL}`);
console.log(`Target User ID: ${TARGET_USER_ID}\n`);

// Step 1: Check strava_athlete records
console.log("1. Checking strava_athlete records...");
const allAthletes = db.prepare("SELECT id, userId, firstname, lastname FROM strava_athlete").all() as any[];
console.log(`   Found ${allAthletes.length} athlete record(s)`);

allAthletes.forEach((athlete) => {
  if (athlete.userId === TARGET_USER_ID) {
    console.log(`   ✅ Athlete ${athlete.id} (${athlete.firstname} ${athlete.lastname}) already linked to target user`);
  } else {
    console.log(`   ⚠️  Athlete ${athlete.id} (${athlete.firstname} ${athlete.lastname}) linked to: ${athlete.userId}`);
    console.log(`      → Updating to target user...`);
    db.prepare("UPDATE strava_athlete SET userId = ? WHERE id = ?").run(TARGET_USER_ID, athlete.id);
    console.log(`      ✅ Updated!`);
  }
});

// Step 2: Check strava_activities records
console.log("\n2. Checking strava_activities records...");
const allActivities = db.prepare("SELECT id, userId, athlete_id, name, start_date FROM strava_activities").all() as any[];
console.log(`   Found ${allActivities.length} activity record(s)`);

let activitiesUpdated = 0;
let activitiesAlreadyCorrect = 0;

allActivities.forEach((activity) => {
  if (activity.userId === TARGET_USER_ID) {
    activitiesAlreadyCorrect++;
  } else {
    console.log(`   ⚠️  Activity ${activity.id} (${activity.name}) linked to: ${activity.userId}`);
    db.prepare("UPDATE strava_activities SET userId = ? WHERE id = ?").run(TARGET_USER_ID, activity.id);
    activitiesUpdated++;
  }
});

console.log(`   ✅ ${activitiesAlreadyCorrect} activities already linked correctly`);
if (activitiesUpdated > 0) {
  console.log(`   ✅ Updated ${activitiesUpdated} activities to target user`);
}

// Step 3: Verify migration
console.log("\n3. Verifying migration...");
const athleteCheck = db.prepare(`
  SELECT COUNT(*) as count
  FROM strava_athlete
  WHERE userId = ?
`).get(TARGET_USER_ID) as any;

const activityCheck = db.prepare(`
  SELECT COUNT(*) as count
  FROM strava_activities
  WHERE userId = ?
`).get(TARGET_USER_ID) as any;

const otherAthletesCheck = db.prepare(`
  SELECT COUNT(*) as count
  FROM strava_athlete
  WHERE userId != ?
`).get(TARGET_USER_ID) as any;

const otherActivitiesCheck = db.prepare(`
  SELECT COUNT(*) as count
  FROM strava_activities
  WHERE userId != ?
`).get(TARGET_USER_ID) as any;

console.log(`   ✅ strava_athlete records for target user: ${athleteCheck.count}`);
console.log(`   ✅ strava_activities records for target user: ${activityCheck.count}`);
console.log(`   ${otherAthletesCheck.count === 0 ? '✅' : '⚠️'}  strava_athlete records for other users: ${otherAthletesCheck.count}`);
console.log(`   ${otherActivitiesCheck.count === 0 ? '✅' : '⚠️'}  strava_activities records for other users: ${otherActivitiesCheck.count}`);

// Step 4: Summary
console.log("\n=== Migration Summary ===");
console.log(`✅ All Strava records have been migrated to user: ${TARGET_EMAIL}`);
console.log(`   - Athlete records: ${athleteCheck.count}`);
console.log(`   - Activity records: ${activityCheck.count}`);

db.close();
