import { getMoodEntry } from "@/lib/db/mood";
import { getDailyJournalByDate } from "@/lib/db/journals";
import { getHabits, getHabitCompletions } from "@/lib/db/habits";
import { getDatabase } from "@/lib/db";

async function verify() {
  try {
    const db = getDatabase();
    const result = await db.execute("SELECT id FROM user LIMIT 1");
    const user = result.rows[0] as unknown as { id: string } | undefined;
    
    if (!user) {
      console.log("No user found in database.");
      return;
    }
    
    const userId = user.id;
    console.log(`Verifying for user: ${userId}`);
    
    const now = new Date();
    const today = now.toLocaleDateString("en-CA");
    console.log(`Date: ${today}`);

    // 1. Fetch actual data
    const moodEntry = await getMoodEntry(today, userId);
    const dailyJournal = await getDailyJournalByDate(today, userId);
    const habits = await getHabits(userId);
    const habitCompletions = await getHabitCompletions(userId, today);

    console.log("--- Current State ---");
    console.log(`Mood Entry: ${moodEntry ? "Found" : "Missing"}`);
    console.log(`Daily Journal: ${dailyJournal ? "Found" : "Missing"}`);
    console.log(`Active Habits: ${habits.length}`);
    console.log(`Habit Completions: ${habitCompletions.length}`);

    // 2. Verify Logic with Actual Data
    console.log("\n--- Logic Output (Actual) ---");
    printBannerState(moodEntry, dailyJournal, habits, habitCompletions);

    // 3. Verify Logic with Simulated States
    console.log("\n--- Logic Output (Simulated) ---");
    
    // Scenario 1: No Mood/Journal
    console.log("Scenario 1: No Mood, No Journal");
    printBannerState(undefined, null, habits, habitCompletions);

    // Scenario 2: Mood Exists, Habits Missing (assuming habits exist)
    console.log("Scenario 2: Mood Exists, No Completions (Habits exist)");
    // Ensure we have habits for this test
    const mockHabits = habits.length > 0 ? habits : [{ id: 1 } as any];
    printBannerState({ id: 1 } as any, null, mockHabits, []);

    // Scenario 3: All Done
    console.log("Scenario 3: Mood Exists, Habits Completed");
    printBannerState({ id: 1 } as any, null, mockHabits, [{ id: 1 } as any]);
    
  } catch (error) {
    console.error("Error running verification:", error);
  }
}

function printBannerState(mood: any, journal: any, habits: any[], completions: any[]) {
  const hasMoodOrJournal = !!(mood || journal);
  const hasActiveHabits = habits.length > 0;
  const hasCompletedHabits = completions.length > 0;

  if (!hasMoodOrJournal) {
    console.log("Result: State 1 (Check In)");
  } else if (hasActiveHabits && !hasCompletedHabits) {
    console.log("Result: State 2 (Habits Reminder)");
  } else {
    console.log("Result: State 3 (Hidden)");
  }
}

verify();
