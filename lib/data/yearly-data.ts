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
    total: number;
    completed: number;
    active: number;
    totalCompletions: number;
    byFrequency: Record<string, number>;
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
  games: {
    total: number; // From database games
    averageRating: number;
    totalSteamGames: number; // Games played on Steam
    totalAchievements: number;
    totalPlaytime: number; // in minutes
    topRatedGames: { title: string; rating: number; completed: string }[];
    topGenres: { genre: string; count: number }[];
    topSteamGames: { name: string; achievements: number; playtime: number }[];
  };
  monthlyActivity: {
    month: number; // 0-11
    media: number;
    books: number;
    movies: number;
    tv: number;
    games: number;
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

  // Define promises for each data source
  
  // 1. Media
  const mediaPromise = (async () => {
    const allMedia = await getAllMedia(userId);
    const yearMedia = allMedia.filter((m) => {
      if (!m.completed) return false;
      if (m.status !== 'completed') return false;
      return m.completed.startsWith(year.toString());
    });
    
    const mediaByType: Record<string, number> = {};
    let mediaRatingSum = 0;
    let mediaRatingCount = 0;
    let bookRatingSum = 0;
    let bookRatingCount = 0;
    let movieTVRatingSum = 0;
    let movieTVRatingCount = 0;
    let gameRatingSum = 0;
    let gameRatingCount = 0;
    const genreCounts: Record<string, number> = {};
    const bookGenreCounts: Record<string, number> = {};
    const movieTVGenreCounts: Record<string, number> = {};
    const gameGenreCounts: Record<string, number> = {};

    yearMedia.forEach((m) => {
      mediaByType[m.type] = (mediaByType[m.type] || 0) + 1;
      const type = m.type.toLowerCase();

      if (m.rating) {
        mediaRatingSum += m.rating;
        mediaRatingCount++;

        if (type === 'book') {
          bookRatingSum += m.rating;
          bookRatingCount++;
        } else if (type === 'movie' || type === 'tv' || type === 'tv_show' || type === 'show') {
          movieTVRatingSum += m.rating;
          movieTVRatingCount++;
        } else if (type === 'game') {
          gameRatingSum += m.rating;
          gameRatingCount++;
        }
      }
      if (m.genres) {
        try {
          const genres = JSON.parse(m.genres) as string[];
          genres.forEach((g) => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
            if (type === 'book') {
              bookGenreCounts[g] = (bookGenreCounts[g] || 0) + 1;
            } else if (type === 'movie' || type === 'tv' || type === 'tv_show' || type === 'show') {
              movieTVGenreCounts[g] = (movieTVGenreCounts[g] || 0) + 1;
            } else if (type === 'game') {
              gameGenreCounts[g] = (gameGenreCounts[g] || 0) + 1;
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

    const topGameGenres = Object.entries(gameGenreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

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

    const topRatedGames = yearMedia
      .filter((m) => {
        const type = m.type.toLowerCase();
        return type === 'game' && m.rating && m.rating > 0;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map((m) => ({
        title: m.title,
        rating: m.rating || 0,
        completed: m.completed || '',
      }));

    return {
      yearMedia,
      stats: {
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
      gameStats: {
        dbGamesCount: yearMedia.filter(m => m.type.toLowerCase() === 'game').length,
        averageRating: gameRatingCount > 0 ? gameRatingSum / gameRatingCount : 0,
        topRatedGames,
        topGenres: topGameGenres,
      }
    };
  })();

  // 2. Parks
  const parksPromise = (async () => {
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

    return {
      yearParks,
      stats: {
        total: yearParks.length,
        byCategory: parksByCategory,
        states: Array.from(parkStates),
      }
    };
  })();

  // 3. Exercises (Strava)
  const exercisesPromise = (async () => {
    let yearExercises: any[] = [];
    let exerciseStats = {
      total: 0,
      totalDuration: 0,
      totalDistance: 0,
      byType: [] as { type: string; count: number; distance?: number }[],
    };

    try {
      const athlete = await queryOne<{ id: number }>(
        "SELECT id FROM strava_athlete WHERE userId = ?",
        [userId]
      );

      if (athlete) {
        yearExercises = await query(
          `SELECT * FROM strava_activities
           WHERE athlete_id = ?
           AND start_date >= ?
           AND start_date <= ?`,
          [athlete.id, startDate, endDate]
        );

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
          totalDuration: yearExercises.reduce((acc, e) => acc + (e.moving_time || 0), 0) / 60,
          totalDistance: yearExercises.reduce((acc, e) => acc + (e.distance || 0), 0),
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
    return { yearExercises, stats: exerciseStats };
  })();

  // 4. Mood
  const moodPromise = (async () => {
    const yearMoods = await getMoodEntriesForYear(year, userId);
    const moodDistribution: Record<number, number> = {};
    let moodSum = 0;

    yearMoods.forEach((m) => {
      moodDistribution[m.rating] = (moodDistribution[m.rating] || 0) + 1;
      moodSum += m.rating;
    });

    return {
      yearMoods,
      stats: {
        average: yearMoods.length > 0 ? moodSum / yearMoods.length : 0,
        distribution: moodDistribution,
        totalEntries: yearMoods.length,
      }
    };
  })();

  // 5. Journals
  const journalsPromise = (async () => {
    const allJournals = await getAllJournals(userId);
    const yearJournals = allJournals.filter((j) => {
      const date = j.journal_type === 'daily' && j.daily_date 
        ? j.daily_date 
        : j.created_at.split(' ')[0];
      return date.startsWith(year.toString());
    });

    return {
      yearJournals,
      stats: {
        total: yearJournals.length,
        dailyCount: yearJournals.filter(j => j.journal_type === 'daily').length,
        generalCount: yearJournals.filter(j => j.journal_type === 'general').length,
      }
    };
  })();

  // 6. GitHub
  const githubPromise = (async () => {
    let githubEvents: any[] = [];
    try {
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

    return {
      githubEvents,
      stats: {
        totalEvents: githubEvents.length,
        contributionsByMonth: githubEvents.reduce((acc, e) => {
          const month = new Date(e.created_at).getMonth();
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {} as Record<number, number>),
      }
    };
  })();

  // 7. Steam
  const steamPromise = getCachedSteamStats(year, userId);

  // 8. Habits
  const habitsPromise = (async () => {
    const habitStats = {
      total: 0,
      completed: 0,
      active: 0,
      totalCompletions: 0,
      byFrequency: {} as Record<string, number>,
    };

    try {
      const yearHabits = await query<{ id: number; frequency: string; target: number; active: number }>(
        `SELECT id, frequency, target, active FROM habits WHERE userId = ? AND strftime('%Y', created_at) = ?`,
        [userId, year.toString()]
      );

      habitStats.total = yearHabits.length;
      habitStats.active = yearHabits.filter(h => h.active === 1).length;

      yearHabits.forEach(h => {
        const freq = h.frequency || 'daily';
        habitStats.byFrequency[freq] = (habitStats.byFrequency[freq] || 0) + 1;
      });

      if (yearHabits.length > 0) {
        const habitIds = yearHabits.map(h => h.id).join(',');
        const completionData = await query<{ habit_id: number; completion_count: number }>(
          `SELECT habit_id, COUNT(*) as completion_count
           FROM habit_completions
           WHERE habit_id IN (${habitIds})
           AND strftime('%Y', date) = ?
           GROUP BY habit_id`,
          [year.toString()]
        );

        habitStats.totalCompletions = completionData.reduce((sum, h) => sum + h.completion_count, 0);

        completionData.forEach(cd => {
          const habit = yearHabits.find(h => h.id === cd.habit_id);
          if (habit && cd.completion_count >= habit.target) {
            habitStats.completed++;
          }
        });
      }
    } catch (e) {
      console.error("Failed to fetch habit data", e);
    }
    return habitStats;
  })();

  // 9. Tasks
  const tasksPromise = (async () => {
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

    return {
      yearTasks,
      stats: {
        total: yearTasks.length,
        completed: completedTasks.length,
        completionRate: yearTasks.length > 0 ? (completedTasks.length / yearTasks.length) * 100 : 0,
        byPriority: tasksByPriority,
        byCategory: tasksByCategory,
      }
    };
  })();

  // 10. Goals
  const goalsPromise = (async () => {
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

    return {
      yearGoals,
      stats: {
        total: yearGoals.length,
        completed: completedGoals.length,
        inProgress: inProgressGoals.length,
        completionRate: yearGoals.length > 0 ? (completedGoals.length / yearGoals.length) * 100 : 0,
        byStatus: goalsByStatus,
      }
    };
  })();

  // Execute all promises in parallel
  const [
    mediaData,
    parksData,
    exercisesData,
    moodData,
    journalsData,
    githubData,
    steamStats,
    habitStats,
    tasksData,
    goalsData
  ] = await Promise.all([
    mediaPromise,
    parksPromise,
    exercisesPromise,
    moodPromise,
    journalsPromise,
    githubPromise,
    steamPromise,
    habitsPromise,
    tasksPromise,
    goalsPromise
  ]);

  // Process Steam Stats
  const totalPlaytime = steamStats.reduce((acc, s) => acc + s.total_playtime, 0);
  const topSteamGames = steamStats
    .sort((a, b) => b.achievements_count - a.achievements_count)
    .slice(0, 5)
    .map(s => ({
      name: s.gameName,
      achievements: s.achievements_count,
      playtime: s.total_playtime
    }));

  // Calculate Monthly Activity
  const monthlyActivity = Array.from({ length: 12 }, (_, i) => ({
    month: i,
    media: 0,
    books: 0,
    movies: 0,
    tv: 0,
    games: 0,
    parks: 0,
    exercises: 0,
    journals: 0,
    github: githubData.stats.contributionsByMonth[i] || 0,
    steam: 0,
  }));

  mediaData.yearMedia.forEach(m => {
    if (m.completed) {
      const month = new Date(m.completed).getMonth();
      monthlyActivity[month].media++;

      const type = m.type.toLowerCase();
      if (type === 'book') {
        monthlyActivity[month].books++;
      } else if (type === 'movie') {
        monthlyActivity[month].movies++;
      } else if (type === 'tv' || type === 'tv_show' || type === 'show') {
        monthlyActivity[month].tv++;
      } else if (type === 'game') {
        monthlyActivity[month].games++;
      }
    }
  });

  parksData.yearParks.forEach(p => {
    if (p.visited) {
      const month = new Date(p.visited).getMonth();
      monthlyActivity[month].parks++;
    }
  });

  exercisesData.yearExercises.forEach(e => {
    const date = e.start_date || e.date;
    if (date) {
      const month = new Date(date).getMonth();
      monthlyActivity[month].exercises++;
    }
  });

  journalsData.yearJournals.forEach(j => {
    const dateStr = j.journal_type === 'daily' && j.daily_date 
      ? j.daily_date 
      : j.created_at;
    const month = new Date(dateStr).getMonth();
    monthlyActivity[month].journals++;
  });

  return {
    year,
    media: mediaData.stats,
    parks: parksData.stats,
    exercises: exercisesData.stats,
    mood: moodData.stats,
    journals: journalsData.stats,
    habits: habitStats,
    tasks: tasksData.stats,
    goals: goalsData.stats,
    github: githubData.stats,
    steam: {
      totalAchievements: steamStats.reduce((acc, s) => acc + s.achievements_count, 0),
      gamesPlayed: steamStats.length,
      topGames: steamStats
        .sort((a, b) => b.achievements_count - a.achievements_count)
        .slice(0, 5)
        .map(s => ({ name: s.gameName, achievements: s.achievements_count })),
    },
    games: {
      total: mediaData.gameStats.dbGamesCount,
      averageRating: mediaData.gameStats.averageRating,
      totalSteamGames: steamStats.length,
      totalAchievements: steamStats.reduce((acc, s) => acc + s.achievements_count, 0),
      totalPlaytime: totalPlaytime,
      topRatedGames: mediaData.gameStats.topRatedGames,
      topGenres: mediaData.gameStats.topGenres,
      topSteamGames,
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
