import { initializeAchievements } from "../lib/achievements";
import { getDatabase } from "../lib/db";

const db = getDatabase();

console.log("Seeding achievements...");
initializeAchievements();
console.log("Achievements seeded successfully.");
