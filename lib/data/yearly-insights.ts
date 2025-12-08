import { YearlyStats } from "./yearly-data";
import { LucideIcon, TrendingUp, TrendingDown, Sparkles, Target, Trophy, Zap, Heart, BookOpen, Dumbbell, Film, TreePine, Code, Gamepad2 } from "lucide-react";

export interface YearlyInsight {
  type: "fun_fact" | "achievement" | "comparison" | "streak" | "highlight";
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  confetti?: boolean;
}

/**
 * Generate personalized insights from yearly stats
 */
export function generateYearlyInsights(
  stats: YearlyStats,
  previousYearStats?: YearlyStats
): YearlyInsight[] {
  const insights: YearlyInsight[] = [];

  // Fun Facts
  insights.push(...generateFunFacts(stats));

  // Achievements
  insights.push(...generateAchievementInsights(stats));

  // Year-over-year comparisons (if previous year data available)
  if (previousYearStats) {
    insights.push(...generateComparisonInsights(stats, previousYearStats));
  }

  // Highlights
  insights.push(...generateHighlights(stats));

  return insights;
}

/**
 * Generate fun facts from the data
 */
function generateFunFacts(stats: YearlyStats): YearlyInsight[] {
  const facts: YearlyInsight[] = [];

  // Media fun facts
  if (stats.media.total > 100) {
    const avgPerWeek = (stats.media.total / 52).toFixed(1);
    facts.push({
      type: "fun_fact",
      title: "Media Master",
      description: `You consumed ${stats.media.total} pieces of media this year! That's ${avgPerWeek} per week.`,
      icon: Film,
      color: "text-blue-500",
    });
  }

  if (stats.media.averageRating >= 7.5) {
    facts.push({
      type: "fun_fact",
      title: "Great Taste",
      description: `Your average rating was ${stats.media.averageRating.toFixed(1)}/10. You know how to pick quality content!`,
      icon: Sparkles,
      color: "text-yellow-500",
    });
  }

  // Journals word count estimation
  if (stats.journals.total > 100) {
    const estimatedWords = stats.journals.total * 200; // Assume ~200 words per journal
    const pages = Math.floor(estimatedWords / 250); // ~250 words per page
    if (pages > 200) {
      facts.push({
        type: "fun_fact",
        title: "Author in the Making",
        description: `You wrote enough to fill approximately ${pages} pages. That's ${Math.floor(pages / 200)} novels!`,
        icon: BookOpen,
        color: "text-indigo-500",
      });
    }
  }

  // Exercise milestones - hours
  if (stats.exercises.totalDuration > 6000) { // 100+ hours
    const hours = Math.round(stats.exercises.totalDuration / 60);
    const days = (hours / 24).toFixed(1);
    facts.push({
      type: "fun_fact",
      title: "Fitness Champion",
      description: `You spent ${hours} hours being active. That's ${days} full days of exercise!`,
      icon: Dumbbell,
      color: "text-orange-500",
    });
  } else if (stats.exercises.totalDuration > 3000) { // 50+ hours
    const hours = Math.round(stats.exercises.totalDuration / 60);
    facts.push({
      type: "fun_fact",
      title: "Fitness Enthusiast",
      description: `You logged ${hours} hours of activity. That's dedication!`,
      icon: Dumbbell,
      color: "text-orange-500",
    });
  }

  // Exercise consistency
  if (stats.exercises.total >= 200) {
    const perWeek = (stats.exercises.total / 52).toFixed(1);
    facts.push({
      type: "fun_fact",
      title: "Workout Warrior",
      description: `${stats.exercises.total} workouts this year! That's ${perWeek} per week on average.`,
      icon: Dumbbell,
      color: "text-orange-600",
    });
  } else if (stats.exercises.total >= 100) {
    facts.push({
      type: "fun_fact",
      title: "Consistency King",
      description: `You completed ${stats.exercises.total} workouts this year. Keep the momentum going!`,
      icon: Dumbbell,
      color: "text-orange-600",
    });
  }

  // Exercise variety
  if (stats.exercises.byType.length >= 5) {
    const topType = stats.exercises.byType[0]?.type || "Exercise";
    facts.push({
      type: "fun_fact",
      title: "Diverse Training",
      description: `You tried ${stats.exercises.byType.length} different types of workouts! Your favorite was ${topType}.`,
      icon: Dumbbell,
      color: "text-orange-700",
    });
  }

  // Time-based milestones
  if (stats.exercises.totalDuration > 12000) { // 200+ hours = marathon-level commitment
    facts.push({
      type: "fun_fact",
      title: "Endurance Legend",
      description: `Over ${Math.round(stats.exercises.totalDuration / 60)} hours of training! That's serious athlete territory.`,
      icon: Dumbbell,
      color: "text-red-600",
    });
  }

  // Parks exploration
  if (stats.parks.states.length >= 5) {
    facts.push({
      type: "fun_fact",
      title: "Nature Explorer",
      description: `You explored parks in ${stats.parks.states.length} different states. What an adventure!`,
      icon: TreePine,
      color: "text-green-500",
    });
  }

  // Mood insights
  if (stats.mood.average >= 4) {
    facts.push({
      type: "fun_fact",
      title: "Mood Zen Master",
      description: `Your average mood was ${stats.mood.average.toFixed(1)}/5. You're living your best life!`,
      icon: Heart,
      color: "text-pink-500",
    });
  }

  // Task completion
  if (stats.tasks.completionRate >= 80) {
    facts.push({
      type: "fun_fact",
      title: "Productivity Pro",
      description: `You completed ${stats.tasks.completionRate.toFixed(0)}% of your tasks. That's impressive discipline!`,
      icon: Target,
      color: "text-blue-600",
    });
  }

  // GitHub activity
  if (stats.github.totalEvents > 1000) {
    const perDay = (stats.github.totalEvents / 365).toFixed(1);
    facts.push({
      type: "fun_fact",
      title: "Code Warrior",
      description: `${stats.github.totalEvents} GitHub contributions! That's ${perDay} actions per day.`,
      icon: Code,
      color: "text-slate-500",
    });
  }

  // Steam gaming
  if (stats.steam.totalAchievements > 100) {
    facts.push({
      type: "fun_fact",
      title: "Achievement Hunter",
      description: `You unlocked ${stats.steam.totalAchievements} Steam achievements across ${stats.steam.gamesPlayed} games!`,
      icon: Gamepad2,
      color: "text-blue-700",
    });
  }

  return facts;
}

/**
 * Generate achievement-style insights
 */
function generateAchievementInsights(stats: YearlyStats): YearlyInsight[] {
  const achievements: YearlyInsight[] = [];

  // Century clubs
  if (stats.tasks.completed >= 100) {
    achievements.push({
      type: "achievement",
      title: "Task Century Club",
      description: `Completed ${stats.tasks.completed} tasks this year!`,
      icon: Trophy,
      color: "text-yellow-500",
      confetti: true,
    });
  }

  if (stats.media.total >= 100) {
    achievements.push({
      type: "achievement",
      title: "Media Century",
      description: `Consumed ${stats.media.total} pieces of media!`,
      icon: Trophy,
      color: "text-purple-500",
      confetti: true,
    });
  }

  // Perfect habits
  if (stats.habits.completed >= 10) {
    achievements.push({
      type: "achievement",
      title: "Habit Master",
      description: `Completed ${stats.habits.completed} habit goals!`,
      icon: Zap,
      color: "text-emerald-500",
      confetti: true,
    });
  }

  // Goals completed
  if (stats.goals.completed >= 10) {
    achievements.push({
      type: "achievement",
      title: "Goal Getter",
      description: `Achieved ${stats.goals.completed} major goals!`,
      icon: Target,
      color: "text-purple-600",
      confetti: true,
    });
  }

  // Daily journaling streak (if 365 journals)
  if (stats.journals.total >= 365) {
    achievements.push({
      type: "achievement",
      title: "Daily Discipline",
      description: "Journaled every single day this year!",
      icon: BookOpen,
      color: "text-indigo-600",
      confetti: true,
    });
  }

  // Marathon runner (500+ miles estimated)
  if (stats.exercises.total >= 200) {
    achievements.push({
      type: "achievement",
      title: "Fitness Fanatic",
      description: `Completed ${stats.exercises.total} workouts!`,
      icon: Dumbbell,
      color: "text-orange-600",
      confetti: true,
    });
  }

  return achievements;
}

/**
 * Generate year-over-year comparison insights
 */
function generateComparisonInsights(
  stats: YearlyStats,
  previousStats: YearlyStats
): YearlyInsight[] {
  const comparisons: YearlyInsight[] = [];

  // Tasks comparison
  const taskDelta = stats.tasks.completed - previousStats.tasks.completed;
  const taskPercentChange = previousStats.tasks.completed > 0
    ? ((taskDelta / previousStats.tasks.completed) * 100).toFixed(0)
    : "100";

  if (Math.abs(parseInt(taskPercentChange)) >= 10) {
    const isImprovement = taskDelta > 0;
    comparisons.push({
      type: "comparison",
      title: isImprovement ? "Task Productivity Up!" : "Tasks Down",
      description: `${isImprovement ? "+" : ""}${taskPercentChange}% ${isImprovement ? "more" : "fewer"} tasks completed vs. last year (${Math.abs(taskDelta)} ${isImprovement ? "more" : "fewer"})`,
      icon: isImprovement ? TrendingUp : TrendingDown,
      color: isImprovement ? "text-green-500" : "text-orange-500",
      confetti: isImprovement && parseInt(taskPercentChange) >= 25,
    });
  }

  // Media comparison
  const mediaDelta = stats.media.total - previousStats.media.total;
  if (Math.abs(mediaDelta) >= 20) {
    const isMore = mediaDelta > 0;
    comparisons.push({
      type: "comparison",
      title: isMore ? "More Media Consumed" : "Quality Over Quantity",
      description: `${Math.abs(mediaDelta)} ${isMore ? "more" : "fewer"} titles than last year`,
      icon: isMore ? TrendingUp : TrendingDown,
      color: "text-blue-500",
    });
  }

  // Mood comparison
  const moodDelta = stats.mood.average - previousStats.mood.average;
  if (Math.abs(moodDelta) >= 0.3) {
    const isImprovement = moodDelta > 0;
    comparisons.push({
      type: "comparison",
      title: isImprovement ? "Happier Year!" : "Mood Dipped",
      description: `Average mood ${isImprovement ? "improved" : "decreased"} by ${Math.abs(moodDelta).toFixed(1)} points`,
      icon: isImprovement ? TrendingUp : TrendingDown,
      color: isImprovement ? "text-green-500" : "text-yellow-500",
      confetti: isImprovement && moodDelta >= 0.5,
    });
  }

  // Exercise comparison
  const exerciseDelta = stats.exercises.total - previousStats.exercises.total;
  const exercisePercentChange = previousStats.exercises.total > 0
    ? ((exerciseDelta / previousStats.exercises.total) * 100).toFixed(0)
    : "100";

  if (Math.abs(parseInt(exercisePercentChange)) >= 15) {
    const isImprovement = exerciseDelta > 0;
    comparisons.push({
      type: "comparison",
      title: isImprovement ? "Fitness Level Up!" : "Less Active",
      description: `${isImprovement ? "+" : ""}${exercisePercentChange}% ${isImprovement ? "more" : "fewer"} workouts than last year`,
      icon: isImprovement ? TrendingUp : TrendingDown,
      color: isImprovement ? "text-orange-500" : "text-slate-500",
      confetti: isImprovement && parseInt(exercisePercentChange) >= 30,
    });
  }

  // Goals comparison
  const goalsDelta = stats.goals.completed - previousStats.goals.completed;
  if (Math.abs(goalsDelta) >= 3) {
    const isImprovement = goalsDelta > 0;
    comparisons.push({
      type: "comparison",
      title: isImprovement ? "More Goals Achieved" : "Goals Reset",
      description: `${Math.abs(goalsDelta)} ${isImprovement ? "more" : "fewer"} goals completed`,
      icon: isImprovement ? TrendingUp : TrendingDown,
      color: isImprovement ? "text-purple-500" : "text-slate-500",
    });
  }

  return comparisons;
}

/**
 * Generate highlight insights (most productive month, etc.)
 */
function generateHighlights(stats: YearlyStats): YearlyInsight[] {
  const highlights: YearlyInsight[] = [];

  // Find most productive month
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Most media consumed
  const maxMediaMonth = stats.monthlyActivity.reduce((max, curr) =>
    curr.media > max.media ? curr : max
  );
  if (maxMediaMonth.media > 0) {
    highlights.push({
      type: "highlight",
      title: "Peak Media Month",
      description: `${monthNames[maxMediaMonth.month]} was your busiest media month with ${maxMediaMonth.media} titles!`,
      icon: Film,
      color: "text-blue-500",
    });
  }

  // Most active exercise month
  const maxExerciseMonth = stats.monthlyActivity.reduce((max, curr) =>
    curr.exercises > max.exercises ? curr : max
  );
  if (maxExerciseMonth.exercises >= 10) {
    highlights.push({
      type: "highlight",
      title: "Fitness Peak",
      description: `${monthNames[maxExerciseMonth.month]} was your most active month with ${maxExerciseMonth.exercises} workouts!`,
      icon: Dumbbell,
      color: "text-orange-500",
    });
  }

  // Most productive GitHub month
  const maxGithubMonth = stats.monthlyActivity.reduce((max, curr) =>
    curr.github > max.github ? curr : max
  );
  if (maxGithubMonth.github >= 50) {
    highlights.push({
      type: "highlight",
      title: "Code Sprint",
      description: `${monthNames[maxGithubMonth.month]} saw ${maxGithubMonth.github} GitHub contributions!`,
      icon: Code,
      color: "text-slate-500",
    });
  }

  // Top genre/type
  if (stats.media.topGenres.length > 0) {
    const topGenre = stats.media.topGenres[0];
    highlights.push({
      type: "highlight",
      title: "Favorite Genre",
      description: `You consumed ${topGenre.count} ${topGenre.genre} titles this year!`,
      icon: Sparkles,
      color: "text-purple-500",
    });
  }

  return highlights;
}

/**
 * Get a summary insight for the year
 */
export function getYearSummary(stats: YearlyStats): YearlyInsight {
  const totalActivities =
    stats.media.total +
    stats.parks.total +
    stats.exercises.total +
    stats.journals.total +
    stats.tasks.completed +
    stats.goals.completed;

  return {
    type: "highlight",
    title: `Your ${stats.year} in Numbers`,
    description: `${totalActivities} total activities tracked across all categories. What a year!`,
    icon: Trophy,
    color: "text-yellow-500",
    confetti: true,
  };
}
