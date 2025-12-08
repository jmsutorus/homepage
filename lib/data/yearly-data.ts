import { getAllMedia } from "@/lib/db/media";
import { getAllParks } from "@/lib/db/parks";
import { getMoodEntriesForYear } from "@/lib/db/mood";
import { getAllJournals } from "@/lib/db/journals";
import { getAllTasks } from "@/lib/db/tasks";
import { getGoals } from "@/lib/db/goals";
import { getGithubActivity } from "@/lib/github";
import { execute, query, queryOne } from "@/lib/db";

export interface YearlyStats {
  year: number;
  media: {
    total: number;
    byType: Record<string, number>;
    averageRating: number;
    averageBookRating: number;
    averageMovieTVRating: number;
    topGenres: { genre: string; count: number }[];
    topBookGenres: { genre: string; count: number }[];
    topMovieTVGenres: { genre: string; count: number }[];
    topRated: { title: string; type: string; rating: number; completed: string }[];
    topRatedBooks: { title: string; type: string; rating: number; completed: string }[];
  };
  parks: {
    total: number;
    byCategory: Record<string, number>;
    states: string[];
  };
  exercises: {
    total: number;
    totalDuration: number;
    totalDistance: number; // in meters
    byType: { type: string; count: number; distance?: number }[];
  };
  mood: {
    average: number;
    distribution: Record<number, number>;
    totalEntries: number;
  };
  journals: {
    total: number;
    dailyCount: number;
    generalCount: number;
  };
  habits: {
    completed: number;
  };
  tasks: {
    total: number;
    completed: number;
    completionRate: number;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  };
  goals: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
    byStatus: Record<string, number>;
  };
  github: {
    totalEvents: number;
    contributionsByMonth: Record<number, number>;
  };
  steam: {
    totalAchievements: number;
    gamesPlayed: number;
    topGames: { name: string; achievements: number }[];
  };
  monthlyActivity: {
    month: number; // 0-11
    media: number;
    books: number;
    movies: number;
    tv: number;
    parks: number;
    exercises: number;
    journals: number;
    github: number;
    steam: number;
  }[];
}

/**
 * Get aggregated data for a specific year
 */
export async function getYearlyData(year: number, userId: string): Promise<YearlyStats> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Media
  const allMedia = await getAllMedia(userId);
  const yearMedia = allMedia.filter((m) => {
    if (!m.completed) return false;
    return m.completed.startsWith(year.toString());
  });
  
  const mediaByType: Record<string, number> = {};
  let mediaRatingSum = 0;
  let mediaRatingCount = 0;
  let bookRatingSum = 0;
  let bookRatingCount = 0;
  let movieTVRatingSum = 0;
  let movieTVRatingCount = 0;
  const genreCounts: Record<string, number> = {};
  const bookGenreCounts: Record<string, number> = {};
  const movieTVGenreCounts: Record<string, number> = {};

  yearMedia.forEach((m) => {
    mediaByType[m.type] = (mediaByType[m.type] || 0) + 1;
    const type = m.type.toLowerCase();

    if (m.rating) {
      mediaRatingSum += m.rating;
      mediaRatingCount++;

      // Track book ratings separately
      if (type === 'book') {
        bookRatingSum += m.rating;
        bookRatingCount++;
      }
      // Track movie/TV ratings separately
      else if (type === 'movie' || type === 'tv' || type === 'tv_show' || type === 'show') {
        movieTVRatingSum += m.rating;
        movieTVRatingCount++;
      }
    }
    if (m.genres) {
      try {
        const genres = JSON.parse(m.genres) as string[];

        genres.forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;

          // Track book genres separately
          if (type === 'book') {
            bookGenreCounts[g] = (bookGenreCounts[g] || 0) + 1;
          }
          // Track movie/TV genres separately
          else if (type === 'movie' || type === 'tv' || type === 'tv_show' || type === 'show') {
            movieTVGenreCounts[g] = (movieTVGenreCounts[g] || 0) + 1;
          }
        });
      } catch {}
    }
  });

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  const topBookGenres = Object.entries(bookGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  const topMovieTVGenres = Object.entries(movieTVGenreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));

  // Get top rated movies and TV shows
  const topRated = yearMedia
    .filter((m) => {
      const type = m.type.toLowerCase();
      return (type === 'movie' || type === 'tv' || type === 'tv_show' || type === 'show') && m.rating && m.rating > 0;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3)
    .map((m) => ({
      title: m.title,
      type: m.type,
      rating: m.rating || 0,
      completed: m.completed || '',
    }));

  // Get top rated books
  const topRatedBooks = yearMedia
    .filter((m) => {
      const type = m.type.toLowerCase();
      return type === 'book' && m.rating && m.rating > 0;
    })
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 3)
    .map((m) => ({
      title: m.title,
      type: m.type,
      rating: m.rating || 0,
      completed: m.completed || '',
    }));

  // Parks
  const allParks = await getAllParks(userId);
  const yearParks = allParks.filter((p) => {
    if (!p.visited) return false;
    return p.visited.startsWith(year.toString());
  });

  const parksByCategory: Record<string, number> = {};
  const parkStates = new Set<string>();

  yearParks.forEach((p) => {
    parksByCategory[p.category] = (parksByCategory[p.category] || 0) + 1;
    if (p.state) parkStates.add(p.state);
  });

  // Exercises (Strava)
  let yearExercises: any[] = [];
  let exerciseStats = {
    total: 0,
    totalDuration: 0,
    totalDistance: 0,
    byType: [] as { type: string; count: number; distance?: number }[],
  };

  try {
    // Get Strava athlete for user
    const athlete = await queryOne<{ id: number }>(
      "SELECT id FROM strava_athlete WHERE userId = ?",
      [userId]
    );

    if (athlete) {
      // Fetch activities from Strava DB
      yearExercises = await query(
        `SELECT * FROM strava_activities
         WHERE athlete_id = ?
         AND start_date >= ?
         AND start_date <= ?`,
        [athlete.id, startDate, endDate]
      );

      // Aggregate by type with distance
      const typeAggregation = yearExercises.reduce((acc, e) => {
        const type = e.type || "Unknown";
        if (!acc[type]) {
          acc[type] = { count: 0, distance: 0 };
        }
        acc[type].count += 1;
        acc[type].distance += e.distance || 0;
        return acc;
      }, {} as Record<string, { count: number; distance: number }>);

      exerciseStats = {
        total: yearExercises.length,
        totalDuration: yearExercises.reduce((acc, e) => acc + (e.moving_time || 0), 0) / 60, // Convert seconds to minutes
        totalDistance: yearExercises.reduce((acc, e) => acc + (e.distance || 0), 0), // in meters
        byType: (Object.entries(typeAggregation) as [string, { count: number; distance: number }][]).map(([type, data]) => ({
          type,
          count: data.count,
          distance: data.distance
        })),
      };
    }
  } catch (e) {
    console.error("Failed to fetch Strava data", e);
  }

  // Mood
  const yearMoods = await getMoodEntriesForYear(year, userId);
  const moodDistribution: Record<number, number> = {};
  let moodSum = 0;

  yearMoods.forEach((m) => {
    moodDistribution[m.rating] = (moodDistribution[m.rating] || 0) + 1;
    moodSum += m.rating;
  });

  // Journals
  const allJournals = await getAllJournals(userId);
  const yearJournals = allJournals.filter((j) => {
    // Use daily_date for daily journals, created_at for general
    const date = j.journal_type === 'daily' && j.daily_date 
      ? j.daily_date 
      : j.created_at.split(' ')[0]; // created_at is "YYYY-MM-DD HH:MM:SS"
    return date.startsWith(year.toString());
  });

  const journalStats = {
    total: yearJournals.length,
    dailyCount: yearJournals.filter(j => j.journal_type === 'daily').length,
    generalCount: yearJournals.filter(j => j.journal_type === 'general').length,
  };

  // GitHub
  let githubEvents: any[] = [];
  try {
    // Get GitHub token from account table
    const account = await queryOne<{ accessToken: string }>(
      "SELECT accessToken FROM account WHERE userId = ? AND providerId = 'github'",
      [userId]
    );

    if (account?.accessToken) {
      githubEvents = await getGithubActivity(account.accessToken, startDate, endDate);
    }
  } catch (e) {
    console.error("Failed to fetch GitHub activity", e);
  }

  const githubStats = {
    totalEvents: githubEvents.length,
    contributionsByMonth: githubEvents.reduce((acc, e) => {
      const month = new Date(e.created_at).getMonth();
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
  };

  // Steam (from DB cache)
  const steamStats = await getCachedSteamStats(year, userId);

  // Monthly Activity
  const monthlyActivity = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    media: 0,
    books: 0,
    movies: 0,
    tv: 0,
    parks: 0,
    exercises: 0,
    journals: 0,
    github: githubStats.contributionsByMonth[i] || 0,
    steam: 0,
  }));

  yearMedia.forEach(m => {
    if (m.completed) {
      const month = new Date(m.completed).getMonth();
      monthlyActivity[month].media++;

      // Track books, movies, and TV separately
      const type = m.type.toLowerCase();
      if (type === 'book') {
        monthlyActivity[month].books++;
      } else if (type === 'movie') {
        monthlyActivity[month].movies++;
      } else if (type === 'tv' || type === 'tv_show' || type === 'show') {
        monthlyActivity[month].tv++;
      }
    }
  });

  yearParks.forEach(p => {
    if (p.visited) {
      const month = new Date(p.visited).getMonth();
      monthlyActivity[month].parks++;
    }
  });

  yearExercises.forEach(e => {
    const date = e.start_date || e.date; // Handle both Strava and potential fallback
    if (date) {
      const month = new Date(date).getMonth();
      monthlyActivity[month].exercises++;
    }
  });

  yearJournals.forEach(j => {
    const dateStr = j.journal_type === 'daily' && j.daily_date 
      ? j.daily_date 
      : j.created_at;
    const month = new Date(dateStr).getMonth();
    monthlyActivity[month].journals++;
  });

  // Habits
  let completedHabitsCount = 0;
  try {
    const habitsData = await query<{ target: number; completion_count: number }>(
      `SELECT h.target, COUNT(hc.id) as completion_count
       FROM habits h
       LEFT JOIN habit_completions hc ON h.id = hc.habit_id AND strftime('%Y', hc.date) = ?
       WHERE h.userId = ?
       AND strftime('%Y', h.created_at) = ?
       GROUP BY h.id`,
      [year.toString(), userId, year.toString()]
    );

    completedHabitsCount = habitsData.filter(h => h.completion_count >= h.target).length;
  } catch (e) {
    console.error("Failed to fetch habit data", e);
  }

  // Tasks
  const allTasks = await getAllTasks(undefined, userId);
  const yearTasks = allTasks.filter((t) => {
    const taskDate = t.completed_date || t.created_at;
    return taskDate.startsWith(year.toString());
  });

  const completedTasks = yearTasks.filter((t) => t.completed);
  const tasksByPriority: Record<string, number> = {};
  const tasksByCategory: Record<string, number> = {};

  yearTasks.forEach((t) => {
    tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
    if (t.category) {
      tasksByCategory[t.category] = (tasksByCategory[t.category] || 0) + 1;
    }
  });

  const taskStats = {
    total: yearTasks.length,
    completed: completedTasks.length,
    completionRate: yearTasks.length > 0 ? (completedTasks.length / yearTasks.length) * 100 : 0,
    byPriority: tasksByPriority,
    byCategory: tasksByCategory,
  };

  // Goals
  const allGoals = await getGoals(userId);
  const yearGoals = allGoals.filter((g) => {
    const goalDate = g.completed_date || g.created_at;
    return goalDate.startsWith(year.toString());
  });

  const completedGoals = yearGoals.filter((g) => g.status === "completed");
  const inProgressGoals = yearGoals.filter((g) => g.status === "in_progress");
  const goalsByStatus: Record<string, number> = {};

  yearGoals.forEach((g) => {
    goalsByStatus[g.status] = (goalsByStatus[g.status] || 0) + 1;
  });

  const goalStats = {
    total: yearGoals.length,
    completed: completedGoals.length,
    inProgress: inProgressGoals.length,
    completionRate: yearGoals.length > 0 ? (completedGoals.length / yearGoals.length) * 100 : 0,
    byStatus: goalsByStatus,
  };

  return {
    year,
    media: {
      total: yearMedia.length,
      byType: mediaByType,
      averageRating: mediaRatingCount > 0 ? mediaRatingSum / mediaRatingCount : 0,
      averageBookRating: bookRatingCount > 0 ? bookRatingSum / bookRatingCount : 0,
      averageMovieTVRating: movieTVRatingCount > 0 ? movieTVRatingSum / movieTVRatingCount : 0,
      topGenres,
      topBookGenres,
      topMovieTVGenres,
      topRated,
      topRatedBooks,
    },
    parks: {
      total: yearParks.length,
      byCategory: parksByCategory,
      states: Array.from(parkStates),
    },
    exercises: exerciseStats,
    mood: {
      average: yearMoods.length > 0 ? moodSum / yearMoods.length : 0,
      distribution: moodDistribution,
      totalEntries: yearMoods.length,
    },
    journals: journalStats,
    habits: {
      completed: completedHabitsCount,
    },
    tasks: taskStats,
    goals: goalStats,
    github: githubStats,
    steam: {
      totalAchievements: steamStats.reduce((acc, s) => acc + s.achievements_count, 0),
      gamesPlayed: steamStats.length,
      topGames: steamStats
        .sort((a, b) => b.achievements_count - a.achievements_count)
        .slice(0, 5)
        .map(s => ({ name: s.gameName, achievements: s.achievements_count })),
    },
    monthlyActivity,
  };
}

// Steam DB Helpers

interface SteamYearlyStat {
  id: number;
  userId: string;
  year: number;
  gameId: number;
  gameName: string;
  achievements_count: number;
  total_playtime: number;
}

async function getCachedSteamStats(year: number, userId: string): Promise<SteamYearlyStat[]> {
  return await query<SteamYearlyStat>(
    "SELECT * FROM steam_yearly_stats WHERE year = ? AND userId = ?",
    [year, userId]
  );
}

export async function syncYearlySteamData(userId: string, year: number) {
  console.log(`Syncing Steam data for user ${userId}, year ${year}`);
  
  // 1. Get all owned games
  // We need to import getOwnedGames from lib/api/steam.ts (I need to fix the import above)
  const { getOwnedGames, getPlayerAchievements } = await import("@/lib/api/steam");
  
  try {
    const games = await getOwnedGames(undefined, true, true);
    console.log(`Found ${games.length} games`);

    // 2. For each game, check achievements
    // Optimization: Only check games with > 0 playtime or recently played?
    // The user said "only make the call to get all the achievments for the full year only once".
    // So we should iterate all games that might have activity.
    // Checking *all* games might be too many requests if they have 1000+ games.
    // Let's filter for games with playtime > 0.
    const playedGames = games.filter(g => g.playtime_forever > 0);
    console.log(`Found ${playedGames.length} played games`);

    for (const game of playedGames) {
      try {
        // We need to respect API rate limits.
        // Maybe add a small delay?
        
        const achievements = await getPlayerAchievements(game.appid);
        if (!achievements || achievements.length === 0) continue;

        // Filter achievements unlocked in the target year
        const yearStart = new Date(`${year}-01-01`).getTime() / 1000;
        const yearEnd = new Date(`${year}-12-31 23:59:59`).getTime() / 1000;

        const unlockedInYear = achievements.filter(a => 
          a.achieved === 1 && a.unlocktime >= yearStart && a.unlocktime <= yearEnd
        );

        if (unlockedInYear.length > 0) {
          // Upsert into DB
          await execute(
            `INSERT INTO steam_yearly_stats (userId, year, gameId, gameName, achievements_count, total_playtime)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(userId, year, gameId) DO UPDATE SET
               achievements_count = excluded.achievements_count,
               total_playtime = excluded.total_playtime,
               updated_at = CURRENT_TIMESTAMP`,
            [userId, year, game.appid, game.name, unlockedInYear.length, game.playtime_forever]
          );
          console.log(`Updated stats for ${game.name}: ${unlockedInYear.length} achievements`);
        }
      } catch (err) {
        console.error(`Failed to process game ${game.name} (${game.appid})`, err);
      }
    }
  } catch (error) {
    console.error("Steam sync failed:", error);
    throw error;
  }
}
