
import { getDatabase, execute, queryOne } from "../lib/db";
import { createMoodEntry } from "../lib/db/mood";
import { v4 as uuidv4 } from "uuid";

const db = getDatabase();
const userId = uuidv4();

(async () => {
  // Create user
  await execute(
    "INSERT INTO user (id, email, createdAt, updatedAt) VALUES (?, ?, ?, ?)",
    [userId, `test-${userId}@example.com`, Date.now(), Date.now()]
  );

  console.log(`Testing achievements for user: ${userId}`);

  // 1. Test Mood Achievement (First Step: Log first mood)
  console.log("Creating first mood entry...");
  try {
    await createMoodEntry("2025-01-01", 5, "Great day!", userId);
    
    // Wait for async check
    await new Promise(resolve => setTimeout(resolve, 1000));

    const achievement = await queryOne<{ unlocked: number; notified: number }>(
      "SELECT * FROM user_achievements WHERE userId = ? AND achievementId = 'mood-first'",
      [userId]
    );
    
    if (achievement && achievement.unlocked === 1) {
      console.log("✅ 'mood-first' achievement unlocked!");
    } else {
      console.log("❌ 'mood-first' achievement NOT unlocked.");
      console.log("Achievement record:", achievement);
    }

    // Check notification status
    if (achievement && achievement.notified === 0) {
        console.log("✅ Notification pending.");
    } else {
        console.log("❌ Notification status incorrect (expected 0).", achievement?.notified);
    }

  } catch (error) {
    console.error("Error creating mood entry:", error);
  }
})();
