import { YearlyStats } from "./yearly-data";
import { LucideIcon, Trophy, Target, BookOpen, Film, Dumbbell, TreePine, Heart, Zap, Code, Gamepad2, Calendar, Sparkles, Award, Medal, Crown, Star } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  progress?: number; // 0-100 percentage
  threshold?: number; // For display purposes
  category: "tasks" | "media" | "fitness" | "journaling" | "mood" | "parks" | "goals" | "github" | "steam" | "general";
}

/**
 * Get all achievements and their unlock status
 */
export function getYearlyAchievements(stats: YearlyStats): Achievement[] {
  return [
    // Task Achievements
    {
      id: "task_10",
      name: "Getting Started",
      description: "Complete 10 tasks",
      icon: Target,
      rarity: "common",
      unlocked: stats.tasks.completed >= 10,
      progress: Math.min((stats.tasks.completed / 10) * 100, 100),
      threshold: 10,
      category: "tasks",
    },
    {
      id: "task_50",
      name: "Task Master",
      description: "Complete 50 tasks",
      icon: Target,
      rarity: "common",
      unlocked: stats.tasks.completed >= 50,
      progress: Math.min((stats.tasks.completed / 50) * 100, 100),
      threshold: 50,
      category: "tasks",
    },
    {
      id: "task_100",
      name: "Century Club",
      description: "Complete 100 tasks",
      icon: Trophy,
      rarity: "rare",
      unlocked: stats.tasks.completed >= 100,
      progress: Math.min((stats.tasks.completed / 100) * 100, 100),
      threshold: 100,
      category: "tasks",
    },
    {
      id: "task_250",
      name: "Task Titan",
      description: "Complete 250 tasks",
      icon: Trophy,
      rarity: "epic",
      unlocked: stats.tasks.completed >= 250,
      progress: Math.min((stats.tasks.completed / 250) * 100, 100),
      threshold: 250,
      category: "tasks",
    },
    {
      id: "task_500",
      name: "Task Legend",
      description: "Complete 500 tasks",
      icon: Crown,
      rarity: "legendary",
      unlocked: stats.tasks.completed >= 500,
      progress: Math.min((stats.tasks.completed / 500) * 100, 100),
      threshold: 500,
      category: "tasks",
    },
    {
      id: "task_completion_80",
      name: "Finisher",
      description: "Achieve 80% task completion rate",
      icon: Award,
      rarity: "rare",
      unlocked: stats.tasks.completionRate >= 80,
      progress: Math.min(stats.tasks.completionRate, 100),
      threshold: 80,
      category: "tasks",
    },

    // Media Achievements
    {
      id: "media_50",
      name: "Culture Consumer",
      description: "Consume 50 pieces of media",
      icon: Film,
      rarity: "common",
      unlocked: stats.media.total >= 50,
      progress: Math.min((stats.media.total / 50) * 100, 100),
      threshold: 50,
      category: "media",
    },
    {
      id: "media_100",
      name: "Media Maestro",
      description: "Consume 100 pieces of media",
      icon: Film,
      rarity: "rare",
      unlocked: stats.media.total >= 100,
      progress: Math.min((stats.media.total / 100) * 100, 100),
      threshold: 100,
      category: "media",
    },
    {
      id: "media_200",
      name: "Binge Master",
      description: "Consume 200 pieces of media",
      icon: Film,
      rarity: "epic",
      unlocked: stats.media.total >= 200,
      progress: Math.min((stats.media.total / 200) * 100, 100),
      threshold: 200,
      category: "media",
    },
    {
      id: "media_critic",
      name: "Distinguished Critic",
      description: "Maintain a 4+ average rating",
      icon: Star,
      rarity: "rare",
      unlocked: stats.media.averageRating >= 4,
      progress: Math.min((stats.media.averageRating / 5) * 100, 100),
      threshold: 4,
      category: "media",
    },

    // Fitness Achievements
    {
      id: "workout_50",
      name: "Fitness Beginner",
      description: "Complete 50 workouts",
      icon: Dumbbell,
      rarity: "common",
      unlocked: stats.exercises.total >= 50,
      progress: Math.min((stats.exercises.total / 50) * 100, 100),
      threshold: 50,
      category: "fitness",
    },
    {
      id: "workout_100",
      name: "Fitness Enthusiast",
      description: "Complete 100 workouts",
      icon: Dumbbell,
      rarity: "rare",
      unlocked: stats.exercises.total >= 100,
      progress: Math.min((stats.exercises.total / 100) * 100, 100),
      threshold: 100,
      category: "fitness",
    },
    {
      id: "workout_200",
      name: "Fitness Fanatic",
      description: "Complete 200 workouts",
      icon: Dumbbell,
      rarity: "epic",
      unlocked: stats.exercises.total >= 200,
      progress: Math.min((stats.exercises.total / 200) * 100, 100),
      threshold: 200,
      category: "fitness",
    },
    {
      id: "workout_365",
      name: "Daily Grind",
      description: "Complete 365 workouts (avg 1 per day)",
      icon: Crown,
      rarity: "legendary",
      unlocked: stats.exercises.total >= 365,
      progress: Math.min((stats.exercises.total / 365) * 100, 100),
      threshold: 365,
      category: "fitness",
    },
    {
      id: "active_50h",
      name: "Time Invested",
      description: "Log 50+ hours of active time",
      icon: Zap,
      rarity: "common",
      unlocked: stats.exercises.totalDuration >= 3000, // 50 hours in minutes
      progress: Math.min((stats.exercises.totalDuration / 3000) * 100, 100),
      threshold: 50,
      category: "fitness",
    },
    {
      id: "active_100h",
      name: "Century Hours",
      description: "Log 100+ hours of active time",
      icon: Zap,
      rarity: "rare",
      unlocked: stats.exercises.totalDuration >= 6000, // 100 hours in minutes
      progress: Math.min((stats.exercises.totalDuration / 6000) * 100, 100),
      threshold: 100,
      category: "fitness",
    },
    {
      id: "active_200h",
      name: "Endurance Legend",
      description: "Log 200+ hours of active time",
      icon: Crown,
      rarity: "epic",
      unlocked: stats.exercises.totalDuration >= 12000, // 200 hours in minutes
      progress: Math.min((stats.exercises.totalDuration / 12000) * 100, 100),
      threshold: 200,
      category: "fitness",
    },
    {
      id: "exercise_variety",
      name: "Cross Trainer",
      description: "Try 5+ different workout types",
      icon: Sparkles,
      rarity: "rare",
      unlocked: stats.exercises.byType.length >= 5,
      progress: Math.min((stats.exercises.byType.length / 5) * 100, 100),
      threshold: 5,
      category: "fitness",
    },

    // Journaling Achievements
    {
      id: "journal_30",
      name: "Reflection Rookie",
      description: "Write 30 journal entries",
      icon: BookOpen,
      rarity: "common",
      unlocked: stats.journals.total >= 30,
      progress: Math.min((stats.journals.total / 30) * 100, 100),
      threshold: 30,
      category: "journaling",
    },
    {
      id: "journal_100",
      name: "Journaling Pro",
      description: "Write 100 journal entries",
      icon: BookOpen,
      rarity: "rare",
      unlocked: stats.journals.total >= 100,
      progress: Math.min((stats.journals.total / 100) * 100, 100),
      threshold: 100,
      category: "journaling",
    },
    {
      id: "journal_365",
      name: "Daily Discipline",
      description: "Journal every day of the year",
      icon: Calendar,
      rarity: "legendary",
      unlocked: stats.journals.total >= 365,
      progress: Math.min((stats.journals.total / 365) * 100, 100),
      threshold: 365,
      category: "journaling",
    },

    // Mood Achievements
    {
      id: "mood_tracker",
      name: "Mood Tracker",
      description: "Log mood for 100 days",
      icon: Heart,
      rarity: "common",
      unlocked: stats.mood.totalEntries >= 100,
      progress: Math.min((stats.mood.totalEntries / 100) * 100, 100),
      threshold: 100,
      category: "mood",
    },
    {
      id: "mood_year",
      name: "Year of Reflection",
      description: "Log mood for 365 days",
      icon: Heart,
      rarity: "epic",
      unlocked: stats.mood.totalEntries >= 365,
      progress: Math.min((stats.mood.totalEntries / 365) * 100, 100),
      threshold: 365,
      category: "mood",
    },
    {
      id: "mood_zen",
      name: "Mood Zen Master",
      description: "Maintain 4+ average mood",
      icon: Sparkles,
      rarity: "epic",
      unlocked: stats.mood.average >= 4,
      progress: Math.min((stats.mood.average / 5) * 100, 100),
      threshold: 4,
      category: "mood",
    },

    // Parks Achievements
    {
      id: "parks_10",
      name: "Nature Lover",
      description: "Visit 10 parks",
      icon: TreePine,
      rarity: "common",
      unlocked: stats.parks.total >= 10,
      progress: Math.min((stats.parks.total / 10) * 100, 100),
      threshold: 10,
      category: "parks",
    },
    {
      id: "parks_25",
      name: "Park Explorer",
      description: "Visit 25 parks",
      icon: TreePine,
      rarity: "rare",
      unlocked: stats.parks.total >= 25,
      progress: Math.min((stats.parks.total / 25) * 100, 100),
      threshold: 25,
      category: "parks",
    },
    {
      id: "parks_50",
      name: "Park Ranger",
      description: "Visit 50 parks",
      icon: TreePine,
      rarity: "epic",
      unlocked: stats.parks.total >= 50,
      progress: Math.min((stats.parks.total / 50) * 100, 100),
      threshold: 50,
      category: "parks",
    },
    {
      id: "parks_states_5",
      name: "Multi-State Explorer",
      description: "Visit parks in 5 states",
      icon: TreePine,
      rarity: "rare",
      unlocked: stats.parks.states.length >= 5,
      progress: Math.min((stats.parks.states.length / 5) * 100, 100),
      threshold: 5,
      category: "parks",
    },
    {
      id: "parks_states_10",
      name: "Coast to Coast",
      description: "Visit parks in 10 states",
      icon: Crown,
      rarity: "legendary",
      unlocked: stats.parks.states.length >= 10,
      progress: Math.min((stats.parks.states.length / 10) * 100, 100),
      threshold: 10,
      category: "parks",
    },

    // Goals Achievements
    {
      id: "goals_5",
      name: "Goal Setter",
      description: "Complete 5 goals",
      icon: Target,
      rarity: "common",
      unlocked: stats.goals.completed >= 5,
      progress: Math.min((stats.goals.completed / 5) * 100, 100),
      threshold: 5,
      category: "goals",
    },
    {
      id: "goals_10",
      name: "Goal Getter",
      description: "Complete 10 goals",
      icon: Trophy,
      rarity: "rare",
      unlocked: stats.goals.completed >= 10,
      progress: Math.min((stats.goals.completed / 10) * 100, 100),
      threshold: 10,
      category: "goals",
    },
    {
      id: "goals_20",
      name: "Goal Master",
      description: "Complete 20 goals",
      icon: Crown,
      rarity: "epic",
      unlocked: stats.goals.completed >= 20,
      progress: Math.min((stats.goals.completed / 20) * 100, 100),
      threshold: 20,
      category: "goals",
    },

    // Habits Achievements
    {
      id: "habits_5",
      name: "Habit Builder",
      description: "Complete 5 habit goals",
      icon: Zap,
      rarity: "common",
      unlocked: stats.habits.completed >= 5,
      progress: Math.min((stats.habits.completed / 5) * 100, 100),
      threshold: 5,
      category: "goals",
    },
    {
      id: "habits_10",
      name: "Habit Master",
      description: "Complete 10 habit goals",
      icon: Zap,
      rarity: "rare",
      unlocked: stats.habits.completed >= 10,
      progress: Math.min((stats.habits.completed / 10) * 100, 100),
      threshold: 10,
      category: "goals",
    },

    // GitHub Achievements
    {
      id: "github_100",
      name: "Code Contributor",
      description: "Make 100 GitHub contributions",
      icon: Code,
      rarity: "common",
      unlocked: stats.github.totalEvents >= 100,
      progress: Math.min((stats.github.totalEvents / 100) * 100, 100),
      threshold: 100,
      category: "github",
    },
    {
      id: "github_500",
      name: "Code Warrior",
      description: "Make 500 GitHub contributions",
      icon: Code,
      rarity: "rare",
      unlocked: stats.github.totalEvents >= 500,
      progress: Math.min((stats.github.totalEvents / 500) * 100, 100),
      threshold: 500,
      category: "github",
    },
    {
      id: "github_1000",
      name: "Code Legend",
      description: "Make 1000 GitHub contributions",
      icon: Crown,
      rarity: "epic",
      unlocked: stats.github.totalEvents >= 1000,
      progress: Math.min((stats.github.totalEvents / 1000) * 100, 100),
      threshold: 1000,
      category: "github",
    },

    // Steam Achievements
    {
      id: "steam_50",
      name: "Achievement Hunter",
      description: "Unlock 50 Steam achievements",
      icon: Gamepad2,
      rarity: "common",
      unlocked: stats.steam.totalAchievements >= 50,
      progress: Math.min((stats.steam.totalAchievements / 50) * 100, 100),
      threshold: 50,
      category: "steam",
    },
    {
      id: "steam_100",
      name: "Achievement Master",
      description: "Unlock 100 Steam achievements",
      icon: Trophy,
      rarity: "rare",
      unlocked: stats.steam.totalAchievements >= 100,
      progress: Math.min((stats.steam.totalAchievements / 100) * 100, 100),
      threshold: 100,
      category: "steam",
    },
    {
      id: "steam_200",
      name: "Achievement Legend",
      description: "Unlock 200 Steam achievements",
      icon: Crown,
      rarity: "epic",
      unlocked: stats.steam.totalAchievements >= 200,
      progress: Math.min((stats.steam.totalAchievements / 200) * 100, 100),
      threshold: 200,
      category: "steam",
    },
    {
      id: "steam_games_10",
      name: "Diverse Gamer",
      description: "Play 10+ different games",
      icon: Gamepad2,
      rarity: "common",
      unlocked: stats.steam.gamesPlayed >= 10,
      progress: Math.min((stats.steam.gamesPlayed / 10) * 100, 100),
      threshold: 10,
      category: "steam",
    },

    // General/Combo Achievements
    {
      id: "all_rounder",
      name: "Well-Rounded",
      description: "Log activity in all 10 categories",
      icon: Medal,
      rarity: "epic",
      unlocked:
        stats.tasks.total > 0 &&
        stats.media.total > 0 &&
        stats.exercises.total > 0 &&
        stats.journals.total > 0 &&
        stats.mood.totalEntries > 0 &&
        stats.parks.total > 0 &&
        stats.goals.total > 0 &&
        stats.habits.completed > 0 &&
        stats.github.totalEvents > 0 &&
        stats.steam.totalAchievements > 0,
      category: "general",
    },
    {
      id: "super_productive",
      name: "Super Productive",
      description: "Complete 100+ tasks AND 10+ goals",
      icon: Crown,
      rarity: "legendary",
      unlocked: stats.tasks.completed >= 100 && stats.goals.completed >= 10,
      category: "general",
    },
    {
      id: "balanced_life",
      name: "Balanced Life",
      description: "Achieve high activity in fitness, media, and mood",
      icon: Sparkles,
      rarity: "legendary",
      unlocked:
        stats.exercises.total >= 100 &&
        stats.media.total >= 100 &&
        stats.mood.average >= 4,
      category: "general",
    },
  ];
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(stats: YearlyStats): Achievement[] {
  return getYearlyAchievements(stats).filter((a) => a.unlocked);
}

/**
 * Get achievement count by rarity
 */
export function getAchievementStats(stats: YearlyStats) {
  const achievements = getYearlyAchievements(stats);
  const unlocked = achievements.filter((a) => a.unlocked);

  return {
    total: achievements.length,
    unlocked: unlocked.length,
    byRarity: {
      common: unlocked.filter((a) => a.rarity === "common").length,
      rare: unlocked.filter((a) => a.rarity === "rare").length,
      epic: unlocked.filter((a) => a.rarity === "epic").length,
      legendary: unlocked.filter((a) => a.rarity === "legendary").length,
    },
  };
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "text-slate-400";
    case "rare":
      return "text-blue-500";
    case "epic":
      return "text-purple-500";
    case "legendary":
      return "text-yellow-500";
  }
}

/**
 * Get rarity background
 */
export function getRarityBackground(rarity: Achievement["rarity"]): string {
  switch (rarity) {
    case "common":
      return "bg-slate-500/10";
    case "rare":
      return "bg-blue-500/10";
    case "epic":
      return "bg-purple-500/10";
    case "legendary":
      return "bg-yellow-500/10";
  }
}
