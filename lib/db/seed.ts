import { createMoodEntry } from "./mood";
import { createTask } from "./tasks";
import { getDatabase } from "./index";

/**
 * Seed the database with sample data
 */
export async function seedDatabase() {
  console.log("🌱 Seeding database with sample data...");

  // Get the first user to associate data with
  const db = getDatabase();
  const result = await db.execute({
    sql: "SELECT id FROM user LIMIT 1",
    args: []
  });
  const user = result.rows[0] as { id: string } | undefined;

  if (!user) {
    console.log("⚠️ No user found. Skipping seed data that requires a user.");
    return;
  }

  const userId = user.id;

  // Seed mood entries for the past 30 days
  await seedMoodEntries(userId);

  // Seed sample tasks
  await seedTasks(userId);

  console.log("✅ Database seeding complete!");
}

/**
 * Seed mood entries for the past 30 days
 */
async function seedMoodEntries(userId: string) {
  console.log("  - Seeding mood entries...");

  const today = new Date();
  const moods = [
    { offset: 0, rating: 5, note: "Excellent day! Accomplished all my goals." },
    { offset: 1, rating: 4, note: "Good day overall, productive work session." },
    { offset: 2, rating: 3, note: "Average day, nothing special." },
    { offset: 3, rating: 4, note: "Had a great workout today!" },
    { offset: 4, rating: 5, note: "Celebrated a milestone with friends." },
    { offset: 5, rating: 2, note: "Stressful day at work." },
    { offset: 6, rating: 3, note: null },
    { offset: 7, rating: 4, note: "Good progress on personal project." },
    { offset: 8, rating: 3, note: null },
    { offset: 9, rating: 4, note: null },
    { offset: 10, rating: 5, note: "Amazing weather, went for a long run!" },
    { offset: 11, rating: 4, note: null },
    { offset: 12, rating: 3, note: "Tired but okay." },
    { offset: 13, rating: 2, note: "Didn't sleep well." },
    { offset: 14, rating: 4, note: "Caught up on rest." },
    { offset: 15, rating: 5, note: "Very productive day!" },
    { offset: 16, rating: 4, note: null },
    { offset: 17, rating: 3, note: null },
    { offset: 18, rating: 4, note: "Good conversation with a friend." },
    { offset: 19, rating: 3, note: null },
    { offset: 20, rating: 5, note: "Finished a major task!" },
    { offset: 21, rating: 4, note: null },
    { offset: 22, rating: 3, note: "Average day." },
    { offset: 23, rating: 4, note: null },
    { offset: 24, rating: 2, note: "Not feeling great today." },
    { offset: 25, rating: 3, note: null },
    { offset: 26, rating: 4, note: "Better today." },
    { offset: 27, rating: 5, note: "Excellent weekend!" },
    { offset: 28, rating: 4, note: null },
    { offset: 29, rating: 3, note: null },
  ];

  for (const { offset, rating, note } of moods) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateString = date.toISOString().split("T")[0];

    await createMoodEntry(dateString, rating, note || undefined, userId);
  }

  console.log(`    ✓ Created ${moods.length} mood entries`);
}

/**
 * Seed sample tasks
 */
async function seedTasks(userId: string) {
  console.log("  - Seeding tasks...");

  const tasks = [
    { title: "Review API integration documentation", completed: false, priority: "high" as const },
    { title: "Set up Strava OAuth credentials", completed: false, priority: "high" as const },
    { title: "Design mood tracker UI mockup", completed: true, priority: "medium" as const },
    { title: "Write tests for database layer", completed: false, priority: "medium" as const },
    { title: "Update README with setup instructions", completed: false, priority: "low" as const },
    { title: "Configure Home Assistant access token", completed: false, priority: "medium" as const },
    { title: "Create Docker configuration", completed: false, priority: "low" as const },
    { title: "Add Markdown sample files", completed: true, priority: "low" as const },
    { title: "Implement media grid component", completed: false, priority: "high" as const },
    { title: "Research chart libraries for exercise tracking", completed: true, priority: "medium" as const },
  ];

  // Add due dates to some tasks
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  for (const [index, task] of tasks.entries()) {
    let dueDate: string | undefined;

    // Add due dates to first 3 incomplete tasks
    if (!task.completed && index < 3) {
      if (index === 0) {
        dueDate = today.toISOString();
      } else if (index === 1) {
        dueDate = tomorrow.toISOString();
      } else {
        dueDate = nextWeek.toISOString();
      }
    }

    await createTask(task.title, dueDate, task.priority, undefined, userId);
  }

  console.log(`    ✓ Created ${tasks.length} tasks`);
}

/**
 * Run seed if this file is executed directly
 */
if (require.main === module) {
  (async () => {
    try {
      // Initialize database first
      getDatabase();

      // Seed data
      await seedDatabase();

      process.exit(0);
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      process.exit(1);
    }
  })();
}
