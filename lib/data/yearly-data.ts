import { getAllMedia } from "@/lib/db/media";
import { getAllParks } from "@/lib/db/parks";
import { getMoodEntriesForYear } from "@/lib/db/mood";
import { getAllJournals } from "@/lib/db/journals";
import { getAllTasks } from "@/lib/db/tasks";
import { getGoals } from "@/lib/db/goals";
import { getEventsInRange } from "@/lib/db/events";
import { getGithubEventsByDateRange } from "@/lib/db/github";
import { getVacationsByYear } from "@/lib/db/vacations";
import { calculateDurationDays } from "@/lib/types/vacations";
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
    lowestRatedTV: { title: string; type: string; rating: number; completed: string }[];
    topRatedBooks: { title: string; type: string; rating: number; completed: string }[];
    totalTimeSpent: number; // Total time spent in minutes
    timeSpentByType: {
      tv: number;
      movie: number;
      book: number;
      game: number;
    };
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
  albums: {
    total: number;
    averageRating: number;
    uniqueGenres: number;
    uniqueArtists: number;
    topGenres: { genre: string; count: number }[];
    topRatedAlbums: { title: string; rating: number; completed: string; creator?: string }[];
    topCreators: { creator: string; count: number }[];
  };
  monthlyActivity: {
    month: number; // 0-11
    media: number;
    books: number;
    movies: number;
    tv: number;
    games: number;
    albums: number;
    parks: number;
    exercises: number;
    journals: number;
    github: number;
    steam: number;
    events: number;
    meals: number;
    vacations: number;
  }[];
  events: {
    total: number;
    allDayCount: number;
    timedCount: number;
    multiDayCount: number;
    byCategory: Record<string, number>;
    topCategories: { category: string; count: number }[];
  };
  duolingo: {
    totalDays: number;
    byMonth: Record<number, number>;
    longestStreak: number;
    currentStreak: number;
  };
  relationship: {
    totalDates: number;
    totalIntimacy: number;
    totalMilestones: number;
    averageDateRating: number;
    averageSatisfactionRating: number;
    perfectDates: number; // 5-star ratings
    dateTypes: { type: string; count: number }[];
    topRatedDates: { date: string; type: string; venue?: string; rating: number }[];
    positions: { name: string; count: number }[];
    uniquePositions: number;
  };
  meals: {
    total: number;
    byType: {
      breakfast: number;
      lunch: number;
      dinner: number;
    };
    uniqueRecipes: number;
    daysWithMeals: number;
    topRecipes: { name: string; count: number }[];
    byMonth: Record<number, number>;
  };
  vacations: {
    total: number;
    completed: number;
    totalDays: number;
    avgDuration: number;
    avgRating: number;
    totalBudgetSpent: number;
    avgBudgetPerDay: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    topDestinations: { destination: string; count: number }[];
    topRatedVacations: { title: string; destination: string; rating: number; type: string }[];
    longestTrip: { title: string; destination: string; days: number } | null;
    byMonth: Record<number, number>;
  };
  restaurants: {
    totalVisits: number;
    uniqueRestaurants: number;
    avgRating: number;
    byCuisine: Record<string, number>;
    topRated: { name: string; cuisine: string | null; rating: number; visitDate: string }[];
    topCuisines: { cuisine: string; count: number }[];
    byMonth: Record<number, number>;
  };
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
    let albumRatingSum = 0;
    let albumRatingCount = 0;
    const genreCounts: Record<string, number> = {};
    const bookGenreCounts: Record<string, number> = {};
    const movieTVGenreCounts: Record<string, number> = {};
    const gameGenreCounts: Record<string, number> = {};
    const albumGenreCounts: Record<string, number> = {};
    const albumCreatorCounts: Record<string, number> = {};

    let totalTimeSpent = 0;
    const timeSpentByType = {
      tv: 0,
      movie: 0,
      book: 0,
      game: 0,
    };

    yearMedia.forEach((m) => {
      mediaByType[m.type] = (mediaByType[m.type] || 0) + 1;
      const type = m.type.toLowerCase();

      // Sum up time spent
      if (m.time_spent) {
        totalTimeSpent += m.time_spent;

        // Track time by type
        if (type === 'book') {
          timeSpentByType.book += m.time_spent;
        } else if (type === 'movie') {
          timeSpentByType.movie += m.time_spent;
        } else if (type === 'tv' || type === 'tv_show' || type === 'show') {
          timeSpentByType.tv += m.time_spent;
        } else if (type === 'game') {
          timeSpentByType.game += m.time_spent;
        }
      }

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
        } else if (type === 'album') {
          albumRatingSum += m.rating;
          albumRatingCount++;
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
            } else if (type === 'album') {
              albumGenreCounts[g] = (albumGenreCounts[g] || 0) + 1;
            }
          });
        } catch {}
      }
      // Track creators for albums
      if (type === 'album' && m.creator) {
        try {
          const creators = JSON.parse(m.creator) as string[];
          creators.forEach((c) => {
            albumCreatorCounts[c] = (albumCreatorCounts[c] || 0) + 1;
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

    const topAlbumGenres = Object.entries(albumGenreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    const topAlbumCreators = Object.entries(albumCreatorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([creator, count]) => ({ creator, count }));

    const ratedMoviesTV = yearMedia
      .filter((m) => {
        const type = m.type.toLowerCase();
        return (type === 'movie' || type === 'tv' || type === 'tv_show' || type === 'show') && m.rating && m.rating > 0;
      });

    const topRated = ratedMoviesTV
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map((m) => ({
        title: m.title,
        type: m.type,
        rating: m.rating || 0,
        completed: m.completed || '',
      }));

    // Get lowest rated TV shows only
    const lowestRatedTV = yearMedia
      .filter((m) => {
        const type = m.type.toLowerCase();
        return (type === 'tv' || type === 'tv_show' || type === 'show') && m.rating && m.rating > 0;
      })
      .sort((a, b) => (a.rating || 0) - (b.rating || 0))
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

    const topRatedAlbums = yearMedia
      .filter((m) => {
        const type = m.type.toLowerCase();
        return type === 'album' && m.rating && m.rating > 0;
      })
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map((m) => ({
        title: m.title,
        rating: m.rating || 0,
        completed: m.completed || '',
        creator: m.creator || undefined,
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
        lowestRatedTV,
        topRatedBooks,
        totalTimeSpent,
        timeSpentByType,
      },
      gameStats: {
        dbGamesCount: yearMedia.filter(m => m.type.toLowerCase() === 'game').length,
        averageRating: gameRatingCount > 0 ? gameRatingSum / gameRatingCount : 0,
        topRatedGames,
        topGenres: topGameGenres,
      },
      albumStats: {
        total: yearMedia.filter(m => m.type.toLowerCase() === 'album').length,
        averageRating: albumRatingCount > 0 ? albumRatingSum / albumRatingCount : 0,
        uniqueGenres: Object.keys(albumGenreCounts).length,
        uniqueArtists: Object.keys(albumCreatorCounts).length,
        topRatedAlbums,
        topGenres: topAlbumGenres,
        topCreators: topAlbumCreators,
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

  // 6. GitHub (from synced database)
  const githubPromise = (async () => {
    let githubEvents: any[] = [];
    try {
      // Read from synced database instead of API
      githubEvents = await getGithubEventsByDateRange(userId, startDate, endDate);
    } catch (e) {
      console.error("Failed to fetch GitHub activity from database", e);
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

  // 11. Duolingo
  const duolingoPromise = (async () => {
    const duolingoCompletions = await query<{ date: string }>(
      `SELECT date FROM duolingo_completions 
       WHERE userId = ? 
       AND date >= ? 
       AND date <= ?
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    );

    // Calculate completions by month
    // Parse month directly from YYYY-MM-DD string to avoid timezone issues
    const byMonth: Record<number, number> = {};
    duolingoCompletions.forEach(c => {
      // c.date is in format YYYY-MM-DD, extract month (0-indexed)
      const month = parseInt(c.date.split('-')[1], 10) - 1;
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    // Calculate streaks
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 1;
    
    if (duolingoCompletions.length > 0) {
      const dates = duolingoCompletions.map(c => c.date).sort();
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      
      // Check current streak (from end of year or today)
      const today = new Date().toISOString().split('T')[0];
      const lastDate = dates[dates.length - 1];
      const todayDate = new Date(today);
      const lastCompletionDate = new Date(lastDate);
      const daysSinceLastCompletion = Math.floor((todayDate.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastCompletion <= 1) {
        // Count current streak backwards
        currentStreak = 1;
        for (let i = dates.length - 2; i >= 0; i--) {
          const prevDate = new Date(dates[i]);
          const currDate = new Date(dates[i + 1]);
          const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    return {
      totalDays: duolingoCompletions.length,
      byMonth,
      longestStreak,
      currentStreak,
    };
  })();

  // 12. Relationship
  const relationshipPromise = (async () => {
    // Fetch dates
    const dates = await query<{ date: string; type: string; venue: string | null; rating: number | null }>(
      `SELECT date, type, venue, rating FROM relationship_dates
       WHERE userId = ?
       AND date >= ?
       AND date <= ?
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    );

    // Fetch intimacy entries
    const intimacyEntries = await query<{ satisfaction_rating: number | null; positions: string | null }>(
      `SELECT satisfaction_rating, positions FROM intimacy_entries
       WHERE userId = ?
       AND date >= ?
       AND date <= ?`,
      [userId, startDate, endDate]
    );

    // Fetch milestones
    const milestones = await query<{ date: string }>(
      `SELECT date FROM relationship_milestones
       WHERE userId = ?
       AND date >= ?
       AND date <= ?`,
      [userId, startDate, endDate]
    );

    // Calculate stats
    const totalDates = dates.length;
    const totalIntimacy = intimacyEntries.length;
    const totalMilestones = milestones.length;

    // Average date rating
    const datesWithRating = dates.filter(d => d.rating !== null);
    const averageDateRating = datesWithRating.length > 0
      ? datesWithRating.reduce((sum, d) => sum + (d.rating || 0), 0) / datesWithRating.length
      : 0;

    // Average satisfaction rating
    const entriesWithRating = intimacyEntries.filter(e => e.satisfaction_rating !== null);
    const averageSatisfactionRating = entriesWithRating.length > 0
      ? entriesWithRating.reduce((sum, e) => sum + (e.satisfaction_rating || 0), 0) / entriesWithRating.length
      : 0;

    // Perfect dates (5-star)
    const perfectDates = dates.filter(d => d.rating === 5).length;

    // Date types distribution
    const dateTypeCounts: Record<string, number> = {};
    dates.forEach(d => {
      dateTypeCounts[d.type] = (dateTypeCounts[d.type] || 0) + 1;
    });
    const dateTypes = Object.entries(dateTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Top rated dates
    const topRatedDates = dates
      .filter(d => d.rating !== null && d.rating >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map(d => ({
        date: d.date,
        type: d.type,
        venue: d.venue || undefined,
        rating: d.rating || 0,
      }));

    // Positions statistics
    const positionCounts: Record<string, number> = {};

    intimacyEntries.forEach(e => {
      if (e.positions) {
        try {
          const positionsArray = JSON.parse(e.positions) as string[];
          if (Array.isArray(positionsArray)) {
            positionsArray.forEach(pos => {
              positionCounts[pos] = (positionCounts[pos] || 0) + 1;
            });
          }
        } catch {
          // Skip invalid JSON
        }
      }
    });

    const positions = Object.entries(positionCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const uniquePositions = positions.length;

    return {
      totalDates,
      totalIntimacy,
      totalMilestones,
      averageDateRating,
      averageSatisfactionRating,
      perfectDates,
      dateTypes,
      topRatedDates,
      positions,
      uniquePositions,
    };
  })();

  // 13. Events
  const eventsPromise = (async () => {
    const yearEvents = await getEventsInRange(startDate, endDate, userId);

    // Calculate stats
    const allDayCount = yearEvents.filter(e => e.all_day).length;
    const timedCount = yearEvents.filter(e => !e.all_day).length;
    const multiDayCount = yearEvents.filter(e => e.end_date && e.end_date !== e.date).length;

    // Calculate category breakdown
    const eventsByCategory: Record<string, number> = {};
    yearEvents.forEach(e => {
      if (e.category) {
        eventsByCategory[e.category] = (eventsByCategory[e.category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(eventsByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return {
      yearEvents,
      stats: {
        total: yearEvents.length,
        allDayCount,
        timedCount,
        multiDayCount,
        byCategory: eventsByCategory,
        topCategories,
      }
    };
  })();

  // 14. Meals
  const mealsPromise = (async () => {
    // Get all daily meals for the year with recipe names
    const yearMeals = await query<{ 
      date: string; 
      meal_type: string; 
      mealId: number; 
      mealName: string 
    }>(
      `SELECT dm.date, dm.meal_type, dm.mealId, m.name as mealName
       FROM daily_meals dm
       JOIN meals m ON dm.mealId = m.id
       WHERE dm.userId = ?
       AND dm.date >= ?
       AND dm.date <= ?
       ORDER BY dm.date ASC`,
      [userId, startDate, endDate]
    );

    // Calculate stats
    const byType = {
      breakfast: yearMeals.filter(m => m.meal_type === 'breakfast').length,
      lunch: yearMeals.filter(m => m.meal_type === 'lunch').length,
      dinner: yearMeals.filter(m => m.meal_type === 'dinner').length,
    };

    const uniqueRecipeIds = new Set(yearMeals.map(m => m.mealId));
    const uniqueDates = new Set(yearMeals.map(m => m.date));

    // Count recipe occurrences
    const recipeCounts: Record<string, number> = {};
    yearMeals.forEach(m => {
      recipeCounts[m.mealName] = (recipeCounts[m.mealName] || 0) + 1;
    });

    const topRecipes = Object.entries(recipeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Calculate by month
    const byMonth: Record<number, number> = {};
    yearMeals.forEach(m => {
      const month = parseInt(m.date.split('-')[1], 10) - 1;
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    return {
      yearMeals,
      stats: {
        total: yearMeals.length,
        byType,
        uniqueRecipes: uniqueRecipeIds.size,
        daysWithMeals: uniqueDates.size,
        topRecipes,
        byMonth,
      }
    };
  })();

  // 14. Vacations
  const vacationsPromise = (async () => {
    const yearVacations = await getVacationsByYear(year, userId);

    // Calculate vacation statistics
    const completedVacations = yearVacations.filter(v => v.status === 'completed');
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const destinationCounts: Record<string, number> = {};
    const byMonth: Record<number, number> = {};

    let totalDays = 0;
    let totalBudgetSpent = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    let longestTrip: { title: string; destination: string; days: number } | null = null;

    yearVacations.forEach(v => {
      // Duration calculation
      const duration = calculateDurationDays(v.start_date, v.end_date);
      totalDays += duration;

      if (!longestTrip || duration > longestTrip.days) {
        longestTrip = { title: v.title, destination: v.destination, days: duration };
      }

      // Type distribution
      byType[v.type] = (byType[v.type] || 0) + 1;

      // Status distribution
      byStatus[v.status] = (byStatus[v.status] || 0) + 1;

      // Destination counts
      destinationCounts[v.destination] = (destinationCounts[v.destination] || 0) + 1;

      // Monthly distribution (by start date)
      const month = parseInt(v.start_date.split('-')[1], 10) - 1;
      byMonth[month] = (byMonth[month] || 0) + 1;

      // Budget (actual spent)
      if (v.budget_actual) {
        totalBudgetSpent += v.budget_actual;
      }

      // Ratings
      if (v.rating) {
        ratingSum += v.rating;
        ratingCount++;
      }
    });

    // Top destinations
    const topDestinations = Object.entries(destinationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }));

    // Top rated vacations
    const topRatedVacations = yearVacations
      .filter(v => v.rating && v.rating > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3)
      .map(v => ({
        title: v.title,
        destination: v.destination,
        rating: v.rating || 0,
        type: v.type,
      }));

    const avgDuration = yearVacations.length > 0 ? totalDays / yearVacations.length : 0;
    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;
    const avgBudgetPerDay = totalDays > 0 ? totalBudgetSpent / totalDays : 0;

    return {
      yearVacations,
      stats: {
        total: yearVacations.length,
        completed: completedVacations.length,
        totalDays,
        avgDuration,
        avgRating,
        totalBudgetSpent,
        avgBudgetPerDay,
        byType,
        byStatus,
        topDestinations,
        topRatedVacations,
        longestTrip,
        byMonth,
      }
    };
  })();

  // 16. Restaurants
  const restaurantsPromise = (async () => {
    // Get restaurant visits for the year with restaurant details
    const yearVisits = await query<{
      id: number;
      visit_date: string;
      rating: number | null;
      restaurantId: number;
      restaurantName: string;
      cuisine: string | null;
    }>(
      `SELECT rv.id, rv.visit_date, rv.rating, rv.restaurantId, 
              r.name as restaurantName, r.cuisine
       FROM restaurant_visits rv
       JOIN restaurants r ON r.id = rv.restaurantId
       WHERE rv.userId = ?
       AND rv.visit_date >= ?
       AND rv.visit_date <= ?
       ORDER BY rv.visit_date ASC`,
      [userId, startDate, endDate]
    );

    // Calculate stats
    const uniqueRestaurantIds = new Set(yearVisits.map(v => v.restaurantId));
    const visitsWithRating = yearVisits.filter(v => v.rating !== null);
    const avgRating = visitsWithRating.length > 0
      ? visitsWithRating.reduce((sum, v) => sum + (v.rating || 0), 0) / visitsWithRating.length
      : 0;

    // Cuisine breakdown
    const byCuisine: Record<string, number> = {};
    yearVisits.forEach(v => {
      if (v.cuisine) {
        byCuisine[v.cuisine] = (byCuisine[v.cuisine] || 0) + 1;
      }
    });

    const topCuisines = Object.entries(byCuisine)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cuisine, count]) => ({ cuisine, count }));

    // Top rated visits
    const topRated = yearVisits
      .filter(v => v.rating !== null && v.rating > 0)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map(v => ({
        name: v.restaurantName,
        cuisine: v.cuisine,
        rating: v.rating || 0,
        visitDate: v.visit_date,
      }));

    // By month
    const byMonth: Record<number, number> = {};
    yearVisits.forEach(v => {
      const month = parseInt(v.visit_date.split('-')[1], 10) - 1;
      byMonth[month] = (byMonth[month] || 0) + 1;
    });

    return {
      yearVisits,
      stats: {
        totalVisits: yearVisits.length,
        uniqueRestaurants: uniqueRestaurantIds.size,
        avgRating,
        byCuisine,
        topRated,
        topCuisines,
        byMonth,
      }
    };
  })();

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
    goalsData,
    duolingoStats,
    relationshipStats,
    eventsData,
    mealsData,
    vacationsData,
    restaurantsData
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
    goalsPromise,
    duolingoPromise,
    relationshipPromise,
    eventsPromise,
    mealsPromise,
    vacationsPromise,
    restaurantsPromise
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
    albums: 0,
    parks: 0,
    exercises: 0,
    journals: 0,
    github: githubData.stats.contributionsByMonth[i] || 0,
    steam: 0,
    events: 0,
    meals: 0,
    vacations: 0,
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
      } else if (type === 'album') {
        monthlyActivity[month].albums++;
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

  eventsData.yearEvents.forEach(e => {
    // Parse month directly from YYYY-MM-DD string to avoid timezone issues
    const month = parseInt(e.date.split('-')[1], 10) - 1;
    monthlyActivity[month].events++;
  });

  mealsData.yearMeals.forEach(m => {
    // Parse month directly from YYYY-MM-DD string to avoid timezone issues
    const month = parseInt(m.date.split('-')[1], 10) - 1;
    monthlyActivity[month].meals++;
  });

  vacationsData.yearVacations.forEach(v => {
    // Parse month directly from YYYY-MM-DD string to avoid timezone issues
    const month = parseInt(v.start_date.split('-')[1], 10) - 1;
    monthlyActivity[month].vacations++;
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
    albums: {
      total: mediaData.albumStats.total,
      averageRating: mediaData.albumStats.averageRating,
      uniqueGenres: mediaData.albumStats.uniqueGenres,
      uniqueArtists: mediaData.albumStats.uniqueArtists,
      topGenres: mediaData.albumStats.topGenres,
      topRatedAlbums: mediaData.albumStats.topRatedAlbums,
      topCreators: mediaData.albumStats.topCreators,
    },
    monthlyActivity,
    duolingo: duolingoStats,
    relationship: relationshipStats,
    events: eventsData.stats,
    meals: mealsData.stats,
    vacations: vacationsData.stats,
    restaurants: restaurantsData.stats,
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
