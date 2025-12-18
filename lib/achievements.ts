import { execute, query, queryOne } from "@/lib/db";

export async function getUserAchievements(userId: string) {
  const rows = await query<{ achievementId: string; unlocked: number; progress: number }>(
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

export type AchievementCategory = 'mood' | 'media' | 'habits' | 'tasks' | 'parks' | 'journal' | 'exercise' | 'duolingo' | 'relationship' | 'vacations' | 'general';

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
    id: 'bookworm-1',
    slug: 'bookworm-1',
    title: 'Page Turner',
    description: 'Read your first book',
    icon: 'book-open',
    category: 'media',
    points: 5,
    target_value: 1,
  },
  {
    id: 'bookworm-5',
    slug: 'bookworm-5',
    title: 'Avid Reader',
    description: 'Read 5 books',
    icon: 'book-open',
    category: 'media',
    points: 15,
    target_value: 5,
  },
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
    id: 'bookworm-25',
    slug: 'bookworm-25',
    title: 'Library Regular',
    description: 'Read 25 books',
    icon: 'book-open',
    category: 'media',
    points: 40,
    target_value: 25,
  },
  {
    id: 'bookworm-50',
    slug: 'bookworm-50',
    title: 'Bibliophile',
    description: 'Read 50 books',
    icon: 'book-open',
    category: 'media',
    points: 50,
    target_value: 50,
  },
  {
    id: 'movie-buff-10',
    slug: 'movie-buff-10',
    title: 'Movie Enthusiast',
    description: 'Watch 10 movies',
    icon: 'film',
    category: 'media',
    points: 10,
    target_value: 10,
  },
  {
    id: 'movie-buff-1',
    slug: 'movie-buff-1',
    title: 'Movie Fan',
    description: 'Watch your first movie',
    icon: 'film',
    category: 'media',
    points: 5,
    target_value: 1,
  },
  {
    id: 'movie-buff-25',
    slug: 'movie-buff-25',
    title: 'Film Critic',
    description: 'Watch 25 movies',
    icon: 'film',
    category: 'media',
    points: 20,
    target_value: 25,
  },
  {
    id: 'movie-buff-50',
    slug: 'movie-buff-50',
    title: 'Cinephile',
    description: 'Watch 50 movies',
    icon: 'film',
    category: 'media',
    points: 35,
    target_value: 50,
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
  {
    id: 'habit-master-1',
    slug: 'habit-master-1',
    title: 'Habit Starter',
    description: 'Complete your first habit',
    icon: 'repeat',
    category: 'habits',
    points: 5,
    target_value: 1,
  },
  {
    id: 'habit-master-10',
    slug: 'habit-master-10',
    title: 'Consistency',
    description: 'Complete 10 habits',
    icon: 'repeat',
    category: 'habits',
    points: 15,
    target_value: 10,
  },
  {
    id: 'habit-master-50',
    slug: 'habit-master-50',
    title: 'Routine Builder',
    description: 'Complete 50 habits',
    icon: 'repeat',
    category: 'habits',
    points: 30,
    target_value: 50,
  },
  {
    id: 'habit-master-100',
    slug: 'habit-master-100',
    title: 'Habit Master',
    description: 'Complete 100 habits',
    icon: 'repeat',
    category: 'habits',
    points: 50,
    target_value: 100,
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
  {
    id: 'task-master-1',
    slug: 'task-master-1',
    title: 'Getting Started',
    description: 'Complete your first task',
    icon: 'check-circle-2',
    category: 'tasks',
    points: 5,
    target_value: 1,
  },
  {
    id: 'task-master-10',
    slug: 'task-master-10',
    title: 'Task Doer',
    description: 'Complete 10 tasks',
    icon: 'check-circle-2',
    category: 'tasks',
    points: 15,
    target_value: 10,
  },
  {
    id: 'task-master-50',
    slug: 'task-master-50',
    title: 'Productivity Pro',
    description: 'Complete 50 tasks',
    icon: 'check-circle-2',
    category: 'tasks',
    points: 30,
    target_value: 50,
  },
  {
    id: 'task-master-100',
    slug: 'task-master-100',
    title: 'Task Master',
    description: 'Complete 100 tasks',
    icon: 'check-circle-2',
    category: 'tasks',
    points: 50,
    target_value: 100,
  },
  
  // Exercise Achievements
  {
    id: 'fitness-1',
    slug: 'fitness-1',
    title: 'First Workout',
    description: 'Log your first workout',
    icon: 'dumbbell',
    category: 'exercise',
    points: 5,
    target_value: 1,
  },
  {
    id: 'fitness-10',
    slug: 'fitness-10',
    title: 'Getting Fit',
    description: 'Log 10 workouts',
    icon: 'dumbbell',
    category: 'exercise',
    points: 15,
    target_value: 10,
  },
  {
    id: 'fitness-50',
    slug: 'fitness-50',
    title: 'Athlete',
    description: 'Log 50 workouts',
    icon: 'dumbbell',
    category: 'exercise',
    points: 30,
    target_value: 50,
  },
  {
    id: 'fitness-100',
    slug: 'fitness-100',
    title: 'Iron Will',
    description: 'Log 100 workouts',
    icon: 'dumbbell',
    category: 'exercise',
    points: 50,
    target_value: 100,
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
  {
    id: 'explorer-1',
    slug: 'explorer-1',
    title: 'First Steps',
    description: 'Visit your first national park',
    icon: 'mountain',
    category: 'parks',
    points: 5,
    target_value: 1,
  },
  {
    id: 'explorer-5',
    slug: 'explorer-5',
    title: 'Adventurer',
    description: 'Visit 5 national parks',
    icon: 'mountain',
    category: 'parks',
    points: 20,
    target_value: 5,
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
  {
    id: 'memory-keeper-1',
    slug: 'memory-keeper-1',
    title: 'Dear Diary',
    description: 'Create your first journal entry',
    icon: 'pen-tool',
    category: 'journal',
    points: 5,
    target_value: 1,
  },
  {
    id: 'memory-keeper-10',
    slug: 'memory-keeper-10',
    title: 'Storyteller',
    description: 'Create 10 journal entries',
    icon: 'pen-tool',
    category: 'journal',
    points: 15,
    target_value: 10,
  },
  {
    id: 'memory-keeper-50',
    slug: 'memory-keeper-50',
    title: 'Chronicler',
    description: 'Create 50 journal entries',
    icon: 'pen-tool',
    category: 'journal',
    points: 30,
    target_value: 50,
  },

  // Duolingo Achievements
  {
    id: 'duolingo-1',
    slug: 'duolingo-1',
    title: 'Language Learner',
    description: 'Complete your first Duolingo lesson',
    icon: 'languages',
    category: 'duolingo',
    points: 5,
    target_value: 1,
  },
  {
    id: 'duolingo-7',
    slug: 'duolingo-7',
    title: 'Week Streak',
    description: 'Complete Duolingo lessons for 7 days',
    icon: 'languages',
    category: 'duolingo',
    points: 15,
    target_value: 7,
  },
  {
    id: 'duolingo-30',
    slug: 'duolingo-30',
    title: 'Dedicated Student',
    description: 'Complete Duolingo lessons for 30 days',
    icon: 'languages',
    category: 'duolingo',
    points: 30,
    target_value: 30,
  },
  {
    id: 'duolingo-100',
    slug: 'duolingo-100',
    title: 'Polyglot',
    description: 'Complete Duolingo lessons for 100 days',
    icon: 'languages',
    category: 'duolingo',
    points: 50,
    target_value: 100,
  },

  // Relationship Achievements
  {
    id: 'relationship-first-date',
    slug: 'relationship-first-date',
    title: 'Date Night',
    description: 'Log your first date',
    icon: 'heart',
    category: 'relationship',
    points: 5,
    target_value: 1,
  },
  {
    id: 'relationship-10-dates',
    slug: 'relationship-10-dates',
    title: 'Making Memories',
    description: 'Log 10 dates',
    icon: 'heart',
    category: 'relationship',
    points: 15,
    target_value: 10,
  },
  {
    id: 'relationship-25-dates',
    slug: 'relationship-25-dates',
    title: 'Date Expert',
    description: 'Log 25 dates',
    icon: 'heart',
    category: 'relationship',
    points: 30,
    target_value: 25,
  },
  {
    id: 'relationship-50-dates',
    slug: 'relationship-50-dates',
    title: 'Date Night Champions',
    description: 'Log 50 dates',
    icon: 'heart',
    category: 'relationship',
    points: 50,
    target_value: 50,
  },
  {
    id: 'relationship-first-intimacy',
    slug: 'relationship-first-intimacy',
    title: 'Connected',
    description: 'Log your first intimacy entry',
    icon: 'heart',
    category: 'relationship',
    points: 5,
    target_value: 1,
  },
  {
    id: 'relationship-10-intimacy',
    slug: 'relationship-10-intimacy',
    title: 'Passionate',
    description: 'Log 10 intimacy entries',
    icon: 'heart',
    category: 'relationship',
    points: 15,
    target_value: 10,
  },
  {
    id: 'relationship-50-intimacy',
    slug: 'relationship-50-intimacy',
    title: 'Lovers',
    description: 'Log 50 intimacy entries',
    icon: 'heart',
    category: 'relationship',
    points: 30,
    target_value: 50,
  },
  {
    id: 'relationship-perfect-dates-5',
    slug: 'relationship-perfect-dates-5',
    title: 'Perfect Nights',
    description: 'Log 5 dates with 5-star ratings',
    icon: 'sparkles',
    category: 'relationship',
    points: 25,
    target_value: 5,
  },
  {
    id: 'relationship-variety',
    slug: 'relationship-variety',
    title: 'Variety Seeker',
    description: 'Try at least 5 different date types',
    icon: 'calendar',
    category: 'relationship',
    points: 30,
    target_value: 5,
  },
  {
    id: 'relationship-first-milestone',
    slug: 'relationship-first-milestone',
    title: 'Special Moment',
    description: 'Record your first milestone',
    icon: 'star',
    category: 'relationship',
    points: 10,
    target_value: 1,
  },
  {
    id: 'relationship-5-milestones',
    slug: 'relationship-5-milestones',
    title: 'Memory Maker',
    description: 'Record 5 milestones',
    icon: 'star',
    category: 'relationship',
    points: 25,
    target_value: 5,
  },
  {
    id: 'relationship-10-milestones',
    slug: 'relationship-10-milestones',
    title: 'Milestone Master',
    description: 'Record 10 milestones',
    icon: 'star',
    category: 'relationship',
    points: 40,
    target_value: 10,
  },
  {
    id: 'relationship-blissful',
    slug: 'relationship-blissful',
    title: 'Blissful',
    description: 'Maintain an average satisfaction rating of 4.5 or higher across 10+ entries',
    icon: 'sparkles',
    category: 'relationship',
    points: 40,
    target_value: 1,
  },

  // Vacation Achievements
  {
    id: 'vacation-first',
    slug: 'vacation-first',
    title: 'Wanderlust',
    description: 'Plan your first vacation',
    icon: 'plane',
    category: 'vacations',
    points: 5,
    target_value: 1,
  },
  {
    id: 'vacation-5',
    slug: 'vacation-5',
    title: 'Travel Enthusiast',
    description: 'Plan 5 vacations',
    icon: 'plane',
    category: 'vacations',
    points: 15,
    target_value: 5,
  },
  {
    id: 'vacation-10',
    slug: 'vacation-10',
    title: 'Frequent Traveler',
    description: 'Plan 10 vacations',
    icon: 'plane',
    category: 'vacations',
    points: 30,
    target_value: 10,
  },
  {
    id: 'vacation-25',
    slug: 'vacation-25',
    title: 'Globetrotter',
    description: 'Plan 25 vacations',
    icon: 'plane',
    category: 'vacations',
    points: 40,
    target_value: 25,
  },
  {
    id: 'vacation-50',
    slug: 'vacation-50',
    title: 'World Traveler',
    description: 'Plan 50 vacations',
    icon: 'plane',
    category: 'vacations',
    points: 50,
    target_value: 50,
  },
  {
    id: 'vacation-completed-1',
    slug: 'vacation-completed-1',
    title: 'Trip Complete',
    description: 'Complete your first vacation',
    icon: 'luggage',
    category: 'vacations',
    points: 10,
    target_value: 1,
  },
  {
    id: 'vacation-completed-5',
    slug: 'vacation-completed-5',
    title: 'Seasoned Traveler',
    description: 'Complete 5 vacations',
    icon: 'luggage',
    category: 'vacations',
    points: 20,
    target_value: 5,
  },
  {
    id: 'vacation-completed-10',
    slug: 'vacation-completed-10',
    title: 'Travel Veteran',
    description: 'Complete 10 vacations',
    icon: 'luggage',
    category: 'vacations',
    points: 35,
    target_value: 10,
  },
  {
    id: 'vacation-perfect-trip',
    slug: 'vacation-perfect-trip',
    title: 'Perfect Getaway',
    description: 'Complete a vacation with a 10/10 rating',
    icon: 'star',
    category: 'vacations',
    points: 25,
    target_value: 1,
  },
  {
    id: 'vacation-perfect-5',
    slug: 'vacation-perfect-5',
    title: 'Five Star Traveler',
    description: 'Complete 5 vacations with 9+ ratings',
    icon: 'sparkles',
    category: 'vacations',
    points: 40,
    target_value: 5,
  },
  {
    id: 'vacation-detailed-planner',
    slug: 'vacation-detailed-planner',
    title: 'Meticulous Planner',
    description: 'Create a vacation with a complete day-by-day itinerary',
    icon: 'calendar-check',
    category: 'vacations',
    points: 20,
    target_value: 1,
  },
  {
    id: 'vacation-organized',
    slug: 'vacation-organized',
    title: 'Booking Master',
    description: 'Complete a vacation with 5+ confirmed bookings',
    icon: 'check-circle',
    category: 'vacations',
    points: 20,
    target_value: 1,
  },
  {
    id: 'vacation-budget-keeper',
    slug: 'vacation-budget-keeper',
    title: 'Budget Keeper',
    description: 'Complete a vacation staying within budget',
    icon: 'piggy-bank',
    category: 'vacations',
    points: 30,
    target_value: 1,
  },
  {
    id: 'vacation-budget-master',
    slug: 'vacation-budget-master',
    title: 'Budget Master',
    description: 'Complete 3 vacations staying within budget',
    icon: 'wallet',
    category: 'vacations',
    points: 45,
    target_value: 3,
  },
  {
    id: 'vacation-weekend-warrior',
    slug: 'vacation-weekend-warrior',
    title: 'Weekend Warrior',
    description: 'Complete 5 short trips (3 days or less)',
    icon: 'sunrise',
    category: 'vacations',
    points: 25,
    target_value: 5,
  },
  {
    id: 'vacation-long-haul',
    slug: 'vacation-long-haul',
    title: 'Long Haul Explorer',
    description: 'Complete a vacation lasting 14+ days',
    icon: 'compass',
    category: 'vacations',
    points: 30,
    target_value: 1,
  },
  {
    id: 'vacation-epic-journey',
    slug: 'vacation-epic-journey',
    title: 'Epic Journey',
    description: 'Complete a vacation lasting 30+ days',
    icon: 'globe',
    category: 'vacations',
    points: 50,
    target_value: 1,
  },
  {
    id: 'vacation-destination-collector',
    slug: 'vacation-destination-collector',
    title: 'Destination Collector',
    description: 'Visit 10 unique destinations',
    icon: 'map-pin',
    category: 'vacations',
    points: 35,
    target_value: 10,
  },
  {
    id: 'vacation-activity-seeker',
    slug: 'vacation-activity-seeker',
    title: 'Activity Seeker',
    description: 'Plan a vacation with 20+ activities in the itinerary',
    icon: 'activity',
    category: 'vacations',
    points: 25,
    target_value: 1,
  },
  {
    id: 'vacation-spontaneous',
    slug: 'vacation-spontaneous',
    title: 'Spontaneous Adventurer',
    description: 'Go on a trip from planning to completion within 7 days',
    icon: 'zap',
    category: 'vacations',
    points: 30,
    target_value: 1,
  },
  {
    id: 'vacation-early-bird',
    slug: 'vacation-early-bird',
    title: 'Early Planner',
    description: 'Plan a vacation 90+ days in advance',
    icon: 'calendar-clock',
    category: 'vacations',
    points: 20,
    target_value: 1,
  },
  {
    id: 'vacation-jet-setter',
    slug: 'vacation-jet-setter',
    title: 'Jet Setter',
    description: 'Book 10+ flights across all vacations',
    icon: 'plane-takeoff',
    category: 'vacations',
    points: 30,
    target_value: 10,
  },
  {
    id: 'vacation-luxury-traveler',
    slug: 'vacation-luxury-traveler',
    title: 'Luxury Traveler',
    description: 'Complete a vacation with a budget of $5000+',
    icon: 'gem',
    category: 'vacations',
    points: 35,
    target_value: 1,
  },
  {
    id: 'vacation-budget-backpacker',
    slug: 'vacation-budget-backpacker',
    title: 'Budget Backpacker',
    description: 'Complete a vacation spending under $500',
    icon: 'backpack',
    category: 'vacations',
    points: 30,
    target_value: 1,
  },
  {
    id: 'vacation-memory-keeper',
    slug: 'vacation-memory-keeper',
    title: 'Memory Keeper',
    description: 'Add photos to 5 vacations',
    icon: 'camera',
    category: 'vacations',
    points: 20,
    target_value: 5,
  },
  {
    id: 'vacation-travel-writer',
    slug: 'vacation-travel-writer',
    title: 'Travel Writer',
    description: 'Write trip notes for 10 vacations',
    icon: 'pen-tool',
    category: 'vacations',
    points: 25,
    target_value: 10,
  },
];

export async function initializeAchievements() {
  for (const achievement of ACHIEVEMENTS) {
    await execute(
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
    case 'exercise':
      await checkExerciseAchievements(userId);
      break;
    case 'duolingo':
      await checkDuolingoAchievements(userId);
      break;
    case 'relationship':
      await checkRelationshipAchievements(userId);
      break;
    case 'vacations':
      await checkVacationAchievements(userId);
      break;
  }
}

async function unlockAchievement(userId: string, achievementId: string, progress: number = 0) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return;

  // Check if already unlocked
  const existing = await queryOne<{ unlocked: number }>(
    `SELECT unlocked FROM user_achievements WHERE userId = ? AND achievementId = ?`,
    [userId, achievementId]
  );

  if (existing?.unlocked) {
    // Just update progress if needed
    await execute(
      `UPDATE user_achievements SET progress = ? WHERE userId = ? AND achievementId = ?`,
      [progress, userId, achievementId]
    );
    return;
  }

  // Unlock if progress meets target
  if (progress >= achievement.target_value) {
    await execute(
      `INSERT INTO user_achievements (userId, achievementId, unlocked, unlocked_at, progress)
       VALUES (?, ?, 1, CURRENT_TIMESTAMP, ?)
       ON CONFLICT(userId, achievementId) DO UPDATE SET
       unlocked = 1, unlocked_at = CURRENT_TIMESTAMP, progress = ?`,
      [userId, achievementId, progress, progress]
    );

    console.log(`Achievement Unlocked: ${achievement.title} for user ${userId}`);
  } else {
    // Update progress
    await execute(
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
  const countResult = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM mood_entries WHERE userId = ?",
    [userId]
  );
  const count = countResult?.count || 0;

  if (count >= 1) {
    await unlockAchievement(userId, 'mood-first', count);
  }

  // Check Mood Streak (7 and 30 days)
  const streak = await queryOne<{ streak: number }>(
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
  const books = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM media_content WHERE userId = ? AND type = 'book' AND status = 'completed'`,
    [userId]
  );

  await unlockAchievement(userId, 'bookworm-1', books?.count || 0);
  await unlockAchievement(userId, 'bookworm-5', books?.count || 0);
  await unlockAchievement(userId, 'bookworm-10', books?.count || 0);
  await unlockAchievement(userId, 'bookworm-25', books?.count || 0);
  await unlockAchievement(userId, 'bookworm-50', books?.count || 0);

  // Movie Buff
  const movies = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM media_content WHERE userId = ? AND type = 'movie' AND status = 'completed'`,
    [userId]
  );

  await unlockAchievement(userId, 'movie-buff-1', movies?.count || 0);
  await unlockAchievement(userId, 'movie-buff-10', movies?.count || 0);
  await unlockAchievement(userId, 'movie-buff-25', movies?.count || 0);
  await unlockAchievement(userId, 'movie-buff-50', movies?.count || 0);
  await unlockAchievement(userId, 'movie-buff-100', movies?.count || 0);
}

async function checkHabitAchievements(userId: string) {
  // Habit Streak 30
  // Placeholder:
  const completions = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM habit_completions WHERE userId = ?`,
    [userId]
  );
  await unlockAchievement(userId, 'habit-streak-30', completions?.count || 0);

  // Total Habits
  await unlockAchievement(userId, 'habit-master-1', completions?.count || 0);
  await unlockAchievement(userId, 'habit-master-10', completions?.count || 0);
  await unlockAchievement(userId, 'habit-master-50', completions?.count || 0);
  await unlockAchievement(userId, 'habit-master-100', completions?.count || 0);
}

async function checkTaskAchievements(userId: string) {
  // Productive Day (5 tasks in a day)
  const todayTasks = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND completed = 1 AND date(completed_date) = date('now')`,
    [userId]
  );
  await unlockAchievement(userId, 'task-master-5', todayTasks?.count || 0);

  // Total Tasks
  const totalTasks = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND completed = 1`,
    [userId]
  );
  await unlockAchievement(userId, 'task-master-1', totalTasks?.count || 0);
  await unlockAchievement(userId, 'task-master-10', totalTasks?.count || 0);
  await unlockAchievement(userId, 'task-master-50', totalTasks?.count || 0);
  await unlockAchievement(userId, 'task-master-100', totalTasks?.count || 0);
}

async function checkParkAchievements(userId: string) {
  const parks = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM parks WHERE userId = ? AND visited IS NOT NULL`,
    [userId]
  );

  await unlockAchievement(userId, 'explorer-1', parks?.count || 0);
  await unlockAchievement(userId, 'explorer-5', parks?.count || 0);
  await unlockAchievement(userId, 'explorer-10', parks?.count || 0);
}

async function checkJournalAchievements(userId: string) {
  const journals = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM journals WHERE userId = ?`,
    [userId]
  );

  await unlockAchievement(userId, 'memory-keeper-1', journals?.count || 0);
  await unlockAchievement(userId, 'memory-keeper-10', journals?.count || 0);
  await unlockAchievement(userId, 'memory-keeper-50', journals?.count || 0);
  await unlockAchievement(userId, 'memory-keeper-100', journals?.count || 0);
}

async function checkExerciseAchievements(userId: string) {
  // Count Strava activities and manual workout activities
  // We'll just sum them up for now, assuming minimal overlap or that overlap is acceptable for "total activity"
  const stravaResult = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM strava_activities WHERE userId = ?`,
    [userId]
  );
  const stravaCount = stravaResult?.count || 0;

  const manualResult = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM workout_activities WHERE userId = ? AND completed = 1`,
    [userId]
  );
  const manualCount = manualResult?.count || 0;

  const totalWorkouts = stravaCount + manualCount;

  await unlockAchievement(userId, 'fitness-1', totalWorkouts);
  await unlockAchievement(userId, 'fitness-10', totalWorkouts);
  await unlockAchievement(userId, 'fitness-50', totalWorkouts);
  await unlockAchievement(userId, 'fitness-100', totalWorkouts);
}

async function checkDuolingoAchievements(userId: string) {
  const completions = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM duolingo_completions WHERE userId = ?`,
    [userId]
  );

  const count = completions?.count || 0;

  await unlockAchievement(userId, 'duolingo-1', count);
  await unlockAchievement(userId, 'duolingo-7', count);
  await unlockAchievement(userId, 'duolingo-30', count);
  await unlockAchievement(userId, 'duolingo-100', count);
}

async function checkRelationshipAchievements(userId: string) {
  // Count relationship dates
  const dates = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM relationship_dates WHERE userId = ?`,
    [userId]
  );
  const dateCount = dates?.count || 0;

  await unlockAchievement(userId, 'relationship-first-date', dateCount);
  await unlockAchievement(userId, 'relationship-10-dates', dateCount);
  await unlockAchievement(userId, 'relationship-25-dates', dateCount);
  await unlockAchievement(userId, 'relationship-50-dates', dateCount);

  // Count intimacy entries
  const intimacy = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM intimacy_entries WHERE userId = ?`,
    [userId]
  );
  const intimacyCount = intimacy?.count || 0;

  await unlockAchievement(userId, 'relationship-first-intimacy', intimacyCount);
  await unlockAchievement(userId, 'relationship-10-intimacy', intimacyCount);
  await unlockAchievement(userId, 'relationship-50-intimacy', intimacyCount);

  // Count perfect dates (5-star ratings)
  const perfectDates = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM relationship_dates WHERE userId = ? AND rating = 5`,
    [userId]
  );
  const perfectDateCount = perfectDates?.count || 0;

  await unlockAchievement(userId, 'relationship-perfect-dates-5', perfectDateCount);

  // Count variety (distinct date types)
  const variety = await queryOne<{ count: number }>(
    `SELECT COUNT(DISTINCT type) as count FROM relationship_dates WHERE userId = ?`,
    [userId]
  );
  const varietyCount = variety?.count || 0;

  await unlockAchievement(userId, 'relationship-variety', varietyCount);

  // Count relationship milestones
  const milestones = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM relationship_milestones WHERE userId = ?`,
    [userId]
  );
  const milestoneCount = milestones?.count || 0;

  await unlockAchievement(userId, 'relationship-first-milestone', milestoneCount);
  await unlockAchievement(userId, 'relationship-5-milestones', milestoneCount);
  await unlockAchievement(userId, 'relationship-10-milestones', milestoneCount);

  // Check for blissful (average satisfaction >= 4.5 with at least 10 entries)
  const avgSatisfaction = await queryOne<{ avg: number; count: number }>(
    `SELECT AVG(satisfaction_rating) as avg, COUNT(*) as count
     FROM intimacy_entries
     WHERE userId = ? AND satisfaction_rating IS NOT NULL`,
    [userId]
  );

  if (avgSatisfaction && avgSatisfaction.count >= 10 && avgSatisfaction.avg >= 4.5) {
    await unlockAchievement(userId, 'relationship-blissful', 1);
  } else {
    await unlockAchievement(userId, 'relationship-blissful', 0);
  }
}

async function checkVacationAchievements(userId: string) {
  // Count total vacations planned
  const totalVacations = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM vacations WHERE userId = ?`,
    [userId]
  );
  const vacationCount = totalVacations?.count || 0;

  await unlockAchievement(userId, 'vacation-first', vacationCount);
  await unlockAchievement(userId, 'vacation-5', vacationCount);
  await unlockAchievement(userId, 'vacation-10', vacationCount);
  await unlockAchievement(userId, 'vacation-25', vacationCount);
  await unlockAchievement(userId, 'vacation-50', vacationCount);

  // Count completed vacations
  const completedVacations = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM vacations WHERE userId = ? AND status = 'completed'`,
    [userId]
  );
  const completedCount = completedVacations?.count || 0;

  await unlockAchievement(userId, 'vacation-completed-1', completedCount);
  await unlockAchievement(userId, 'vacation-completed-5', completedCount);
  await unlockAchievement(userId, 'vacation-completed-10', completedCount);

  // Check perfect trip (10/10 rating)
  const perfectTrip = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM vacations WHERE userId = ? AND status = 'completed' AND rating = 10`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-perfect-trip', perfectTrip?.count || 0);

  // Check five star traveler (5 trips with 9+ rating)
  const fiveStarTrips = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM vacations WHERE userId = ? AND status = 'completed' AND rating >= 9`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-perfect-5', fiveStarTrips?.count || 0);

  // Check detailed planner (vacation with complete itinerary)
  const detailedPlan = await queryOne<{ count: number }>(
    `SELECT COUNT(DISTINCT v.id) as count
     FROM vacations v
     WHERE v.userId = ?
     AND (julianday(v.end_date) - julianday(v.start_date) + 1) <=
         (SELECT COUNT(DISTINCT i.date) FROM vacation_itinerary_days i WHERE i.vacationId = v.id)`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-detailed-planner', detailedPlan?.count || 0);

  // Check booking master (vacation with 5+ confirmed bookings)
  const organizedVacations = await queryOne<{ count: number }>(
    `SELECT COUNT(DISTINCT v.id) as count
     FROM vacations v
     WHERE v.userId = ?
     AND (SELECT COUNT(*) FROM vacation_bookings b
          WHERE b.vacationId = v.id AND b.status = 'confirmed') >= 5`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-organized', organizedVacations?.count || 0);

  // Check budget keeper (stayed within budget)
  const budgetKept = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'
     AND budget_planned IS NOT NULL
     AND budget_actual IS NOT NULL
     AND budget_actual <= budget_planned`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-budget-keeper', budgetKept?.count || 0);
  await unlockAchievement(userId, 'vacation-budget-master', budgetKept?.count || 0);

  // Check weekend warrior (5 short trips of 3 days or less)
  const weekendTrips = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'
     AND (julianday(end_date) - julianday(start_date) + 1) <= 3`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-weekend-warrior', weekendTrips?.count || 0);

  // Check long haul (14+ days)
  const longHaul = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'
     AND (julianday(end_date) - julianday(start_date) + 1) >= 14`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-long-haul', longHaul?.count || 0);

  // Check epic journey (30+ days)
  const epicJourney = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'
     AND (julianday(end_date) - julianday(start_date) + 1) >= 30`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-epic-journey', epicJourney?.count || 0);

  // Check destination collector (10 unique destinations)
  const uniqueDestinations = await queryOne<{ count: number }>(
    `SELECT COUNT(DISTINCT destination) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-destination-collector', uniqueDestinations?.count || 0);

  // Check activity seeker (20+ activities in itinerary)
  const activitySeeker = await queryOne<{ count: number }>(
    `SELECT COUNT(DISTINCT v.id) as count
     FROM vacations v
     WHERE v.userId = ?
     AND (SELECT SUM(json_array_length(i.activities))
          FROM vacation_itinerary_days i
          WHERE i.vacationId = v.id) >= 20`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-activity-seeker', activitySeeker?.count || 0);

  // Check spontaneous adventurer (planning to completion within 7 days)
  const spontaneous = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'
     AND (julianday(start_date) - julianday(created_at)) <= 7`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-spontaneous', spontaneous?.count || 0);

  // Check early planner (planned 90+ days in advance)
  const earlyPlanner = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND (julianday(start_date) - julianday(created_at)) >= 90`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-early-bird', earlyPlanner?.count || 0);

  // Check jet setter (10+ flights)
  const flights = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacation_bookings b
     JOIN vacations v ON b.vacationId = v.id
     WHERE v.userId = ?
     AND b.type = 'flight'`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-jet-setter', flights?.count || 0);

  // Check luxury traveler ($5000+ budget)
  const luxuryTravel = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'
     AND budget_actual >= 5000`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-luxury-traveler', luxuryTravel?.count || 0);

  // Check budget backpacker (under $500)
  const budgetBackpacker = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND status = 'completed'
     AND budget_actual < 500
     AND budget_actual > 0`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-budget-backpacker', budgetBackpacker?.count || 0);

  // Check memory keeper (photos on 5 vacations)
  const withPhotos = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND poster IS NOT NULL
     AND poster != ''`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-memory-keeper', withPhotos?.count || 0);

  // Check travel writer (trip notes for 10 vacations)
  const withNotes = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count
     FROM vacations
     WHERE userId = ?
     AND content IS NOT NULL
     AND content != ''`,
    [userId]
  );
  await unlockAchievement(userId, 'vacation-travel-writer', withNotes?.count || 0);
}
