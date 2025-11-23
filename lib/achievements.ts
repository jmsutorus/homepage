import { execute, query, queryOne } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function getUserAchievements(userId: string) {
  const rows = query<{ achievementId: string; unlocked: number; progress: number }>(
    `SELECT achievementId, unlocked, progress FROM user_achievements WHERE userId = ?`,
    [userId]
  );

  const map: Record<string, { unlocked: boolean; progress: number }> = {};
  rows.forEach(row => {
    map[row.achievementId] = {
      unlocked: row.unlocked === 1,
      progress: row.progress
    };
  });
  
  return map;
}

export type AchievementCategory = 'mood' | 'media' | 'habits' | 'tasks' | 'parks' | 'journal' | 'general';

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  points: number;
  target_value: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Mood Achievements
  {
    id: 'mood-first',
    slug: 'mood-first',
    title: 'First Step',
    description: 'Log your first mood entry',
    icon: 'sunrise',
    category: 'mood',
    points: 5,
    target_value: 1,
  },
  {
    id: 'early-bird',
    slug: 'early-bird',
    title: 'Early Bird',
    description: 'Log your mood before 9 AM for 7 days',
    icon: 'sunrise',
    category: 'mood',
    points: 20,
    target_value: 7,
  },
  {
    id: 'mood-streak-7',
    slug: 'mood-streak-7',
    title: 'Mood Tracker',
    description: 'Log your mood for 7 consecutive days',
    icon: 'flame',
    category: 'mood',
    points: 10,
    target_value: 7,
  },
  {
    id: 'mood-streak-30',
    slug: 'mood-streak-30',
    title: 'Mood Master',
    description: 'Log your mood for 30 consecutive days',
    icon: 'zap',
    category: 'mood',
    points: 50,
    target_value: 30,
  },
  
  // Media Achievements
  {
    id: 'bookworm-10',
    slug: 'bookworm-10',
    title: 'Bookworm',
    description: 'Read 10 books',
    icon: 'book-open',
    category: 'media',
    points: 30,
    target_value: 10,
  },
  {
    id: 'movie-buff-100',
    slug: 'movie-buff-100',
    title: 'Movie Buff',
    description: 'Watch 100 movies',
    icon: 'film',
    category: 'media',
    points: 50,
    target_value: 100,
  },

  // Habit Achievements
  {
    id: 'habit-streak-30',
    slug: 'habit-streak-30',
    title: 'Habit Forming',
    description: 'Maintain a 30-day streak on any habit',
    icon: 'repeat',
    category: 'habits',
    points: 50,
    target_value: 30,
  },

  // Task Achievements
  {
    id: 'task-master-5',
    slug: 'task-master-5',
    title: 'Productive Day',
    description: 'Complete 5 tasks in a single day',
    icon: 'check-circle-2',
    category: 'tasks',
    points: 15,
    target_value: 5,
  },
  {
    id: 'completionist',
    slug: 'completionist',
    title: 'Completionist',
    description: 'Finish all tasks 5 days in a row',
    icon: 'list-checks',
    category: 'tasks',
    points: 40,
    target_value: 5,
  },

  // Park Achievements
  {
    id: 'explorer-10',
    slug: 'explorer-10',
    title: 'Explorer',
    description: 'Visit 10 national parks',
    icon: 'mountain',
    category: 'parks',
    points: 50,
    target_value: 10,
  },

  // Journal Achievements
  {
    id: 'memory-keeper-100',
    slug: 'memory-keeper-100',
    title: 'Memory Keeper',
    description: 'Create 100 journal entries',
    icon: 'pen-tool',
    category: 'journal',
    points: 50,
    target_value: 100,
  },
];

export async function initializeAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    execute(
      `INSERT OR IGNORE INTO achievements (id, slug, title, description, icon, category, points, target_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        achievement.id,
        achievement.slug,
        achievement.title,
        achievement.description,
        achievement.icon,
        achievement.category,
        achievement.points,
        achievement.target_value,
      ]
    );
  }
}

export async function checkAchievement(userId: string, type: AchievementCategory) {
  console.log(`Checking achievements for user ${userId} type ${type}`);
  switch (type) {
    case 'mood':
      await checkMoodAchievements(userId);
      break;
    case 'media':
      await checkMediaAchievements(userId);
      break;
    case 'habits':
      await checkHabitAchievements(userId);
      break;
    case 'tasks':
      await checkTaskAchievements(userId);
      break;
    case 'parks':
      await checkParkAchievements(userId);
      break;
    case 'journal':
      await checkJournalAchievements(userId);
      break;
  }
}

async function unlockAchievement(userId: string, achievementId: string, progress: number = 0) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return;

  // Check if already unlocked
  const existing = queryOne<{ unlocked: number }>(
    `SELECT unlocked FROM user_achievements WHERE userId = ? AND achievementId = ?`,
    [userId, achievementId]
  );

  if (existing?.unlocked) {
    // Just update progress if needed
    execute(
      `UPDATE user_achievements SET progress = ? WHERE userId = ? AND achievementId = ?`,
      [progress, userId, achievementId]
    );
    return;
  }

  // Unlock if progress meets target
  if (progress >= achievement.target_value) {
    execute(
      `INSERT INTO user_achievements (userId, achievementId, unlocked, unlocked_at, progress)
       VALUES (?, ?, 1, CURRENT_TIMESTAMP, ?)
       ON CONFLICT(userId, achievementId) DO UPDATE SET
       unlocked = 1, unlocked_at = CURRENT_TIMESTAMP, progress = ?`,
      [userId, achievementId, progress, progress]
    );
    
    console.log(`Achievement Unlocked: ${achievement.title} for user ${userId}`);
  } else {
    // Update progress
    execute(
      `INSERT INTO user_achievements (userId, achievementId, unlocked, progress)
       VALUES (?, ?, 0, ?)
       ON CONFLICT(userId, achievementId) DO UPDATE SET progress = ?`,
      [userId, achievementId, progress, progress]
    );
  }
}

// --- Specific Check Functions ---

async function checkMoodAchievements(userId: string) {
  // Check First Mood
  const count = queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM mood_entries WHERE userId = ?",
    [userId]
  )?.count || 0;

  if (count >= 1) {
    await unlockAchievement(userId, 'mood-first', count);
  }

  // Check Mood Streak (7 and 30 days)
  const streak = queryOne<{ streak: number }>(
    `WITH RECURSIVE dates(date) AS (
       SELECT date(min(date)) FROM mood_entries WHERE userId = ?
       UNION ALL
       SELECT date(date, '+1 day') FROM dates WHERE date < date('now')
     ),
     streaks AS (
       SELECT
         date,
         CASE WHEN EXISTS(SELECT 1 FROM mood_entries WHERE userId = ? AND date = dates.date) THEN 1 ELSE 0 END as logged
       FROM dates
     ),
     groups AS (
       SELECT
         date,
         logged,
         SUM(CASE WHEN logged = 0 THEN 1 ELSE 0 END) OVER (ORDER BY date) as grp
       FROM streaks
     )
     SELECT COUNT(*) as streak
     FROM groups
     WHERE logged = 1
     GROUP BY grp
     ORDER BY streak DESC
     LIMIT 1`,
    [userId, userId]
  );
  
  const currentStreak = streak?.streak || 0;
  await unlockAchievement(userId, 'mood-streak-7', currentStreak);
  await unlockAchievement(userId, 'mood-streak-30', currentStreak);
}

async function checkMediaAchievements(userId: string) {
  // Bookworm
  const books = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM media_content WHERE userId = ? AND type = 'book' AND status = 'completed'`,
    [userId]
  );
  await unlockAchievement(userId, 'bookworm-10', books?.count || 0);

  // Movie Buff
  const movies = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM media_content WHERE userId = ? AND type = 'movie' AND status = 'completed'`,
    [userId]
  );
  await unlockAchievement(userId, 'movie-buff-100', movies?.count || 0);
}

async function checkHabitAchievements(userId: string) {
  // Habit Streak 30
  // Placeholder:
  const completions = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM habit_completions WHERE userId = ?`,
    [userId]
  );
  await unlockAchievement(userId, 'habit-streak-30', completions?.count || 0);
}

async function checkTaskAchievements(userId: string) {
  // Productive Day (5 tasks in a day)
  const todayTasks = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND completed = 1 AND date(completed_date) = date('now')`,
    [userId]
  );
  await unlockAchievement(userId, 'task-master-5', todayTasks?.count || 0);
}

async function checkParkAchievements(userId: string) {
  const parks = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM parks WHERE userId = ? AND visited IS NOT NULL`,
    [userId]
  );
  await unlockAchievement(userId, 'explorer-10', parks?.count || 0);
}

async function checkJournalAchievements(userId: string) {
  const journals = queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM journals WHERE userId = ?`,
    [userId]
  );
  await unlockAchievement(userId, 'memory-keeper-100', journals?.count || 0);
}
