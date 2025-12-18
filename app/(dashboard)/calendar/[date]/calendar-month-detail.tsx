"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from "@/lib/utils";
import type { CalendarDayData, CalendarGoal, CalendarRelationshipItem } from "@/lib/db/calendar";
import type { MediaContent } from "@/lib/db/media";
import type { DBStravaActivity } from "@/lib/db/strava";
import type { Event } from "@/lib/db/events";
import type { ParkContent } from "@/lib/db/parks";
import type { JournalContent } from "@/lib/db/journals";
import type { MoodEntry } from "@/lib/db/mood";
import type { HabitCompletion } from "@/lib/db/habits";
import type { GithubEvent } from "@/lib/github";
import type { DailyMeal, MealType } from "@/lib/types/meals";
import {
  Film,
  Tv,
  Book,
  Gamepad2,
  Music,
  Activity,
  Calendar,
  MapPin,
  Timer,
  Trees,
  BookOpen,
  Mountain,
  Clock,
  TrendingUp,
  ExternalLink,
  Target,
  Heart,
  Languages,
  CheckCircle2,
  GitCommit,
  Flame,
  Users,
  ListTodo,
  Star,
  ChevronDown,
  ChevronUp,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarMonthDetailProps {
  calendarData: Record<string, CalendarDayData>;
  year: number;
  month: number;
  habitNames?: Record<number, string>;
  mealNames?: Record<number, string>;
}

const MEDIA_ICONS: Record<string, typeof Film> = {
  movie: Film,
  tv: Tv,
  book: Book,
  game: Gamepad2,
  album: Music,
};

export function CalendarMonthDetail({
  calendarData,
  habitNames = {},
  mealNames = {},
}: CalendarMonthDetailProps) {
  const router = useRouter();
  const [tasksExpanded, setTasksExpanded] = useState(false);

  // Extract all media, activities, events, parks, journals, and goals from the calendar data
  const allMedia: MediaContent[] = [];
  const allActivities: DBStravaActivity[] = [];
  const allEvents: Event[] = [];
  const allParks: ParkContent[] = [];
  const allJournals: JournalContent[] = [];
  const allGoalsCompleted: CalendarGoal[] = [];

  Object.values(calendarData).forEach((dayData) => {
    allMedia.push(...dayData.media);
    allActivities.push(...dayData.activities);
    allEvents.push(...dayData.events);
    allParks.push(...dayData.parks);
    allJournals.push(...dayData.journals);
    allGoalsCompleted.push(...dayData.goalsCompleted);
  });

  // Deduplicate goals (same goal might appear in multiple days if completed date spans)
  const uniqueGoalsCompleted = Array.from(
    new Map(allGoalsCompleted.map((goal) => [goal.id, goal])).values()
  );

  // Extract mood, habits, duolingo, github, and relationship data
  const allMoods: MoodEntry[] = [];
  const allHabitCompletions: HabitCompletion[] = [];
  const allGithubEvents: GithubEvent[] = [];
  const allRelationshipItems: CalendarRelationshipItem[] = [];
  let duolingoDaysCompleted = 0;
  const totalDaysInMonth = Object.keys(calendarData).length;

  Object.values(calendarData).forEach((dayData) => {
    if (dayData.mood) allMoods.push(dayData.mood);
    allHabitCompletions.push(...dayData.habitCompletions);
    allGithubEvents.push(...dayData.githubEvents);
    allRelationshipItems.push(...dayData.relationshipItems);
    if (dayData.duolingoCompleted) duolingoDaysCompleted++;
  });

  // Extract daily meals data
  const allDailyMeals: DailyMeal[] = [];
  Object.values(calendarData).forEach((dayData) => {
    if (dayData.dailyMeals) {
      allDailyMeals.push(...dayData.dailyMeals);
    }
  });

  // Mood stats
  const moodStats = {
    totalEntries: allMoods.length,
    average: allMoods.length > 0 
      ? allMoods.reduce((sum, m) => sum + m.rating, 0) / allMoods.length 
      : 0,
    distribution: allMoods.reduce((acc, m) => {
      acc[m.rating] = (acc[m.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>),
    bestDay: allMoods.reduce((best, m) => 
      !best || m.rating > best.rating ? m : best, null as MoodEntry | null),
  };

  // Habit stats
  const uniqueHabitIds = new Set(allHabitCompletions.map(h => h.habit_id));
  const habitStats = {
    totalCompletions: allHabitCompletions.length,
    uniqueHabits: uniqueHabitIds.size,
  };

  // Duolingo stats
  const duolingoStats = {
    daysCompleted: duolingoDaysCompleted,
    completionRate: totalDaysInMonth > 0 
      ? (duolingoDaysCompleted / totalDaysInMonth) * 100 
      : 0,
  };

  // GitHub stats
  const githubDaysWithActivity = new Set(
    allGithubEvents.map(e => e.created_at.split('T')[0])
  ).size;
  const githubStats = {
    totalEvents: allGithubEvents.length,
    daysWithActivity: githubDaysWithActivity,
  };

  // Relationship stats
  const relationshipDates = allRelationshipItems.filter(r => r.type === 'date');
  const relationshipIntimacy = allRelationshipItems.filter(r => r.type === 'intimacy');
  const relationshipMilestones = allRelationshipItems.filter(r => r.type === 'milestone');
  const relationshipStats = {
    totalDates: relationshipDates.length,
    totalIntimacy: relationshipIntimacy.length,
    totalMilestones: relationshipMilestones.length,
    total: allRelationshipItems.length,
  };

  // Meals stats - group by meal type and count unique recipes
  const mealsByType: Record<MealType, DailyMeal[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };
  allDailyMeals.forEach((meal) => {
    if (mealsByType[meal.meal_type]) {
      mealsByType[meal.meal_type].push(meal);
    }
  });

  // Get unique recipes cooked this month
  const uniqueRecipeIds = new Set(allDailyMeals.map((m) => m.mealId));
  const mealStats = {
    total: allDailyMeals.length,
    breakfast: mealsByType.breakfast.length,
    lunch: mealsByType.lunch.length,
    dinner: mealsByType.dinner.length,
    uniqueRecipes: uniqueRecipeIds.size,
    daysWithMeals: new Set(allDailyMeals.map((m) => m.date)).size,
  };

  // Extract tasks from calendar data
  const allTasks: import("@/lib/db/tasks").Task[] = [];
  Object.values(calendarData).forEach((dayData) => {
    allTasks.push(...dayData.tasks);
  });
  // Deduplicate tasks (same task might appear in multiple days)
  const uniqueTasks = Array.from(
    new Map(allTasks.map((task) => [task.id, task])).values()
  );

  // Task stats
  const completedTasks = uniqueTasks.filter(t => t.completed);
  const taskStats = {
    total: uniqueTasks.length,
    completed: completedTasks.length,
    pending: uniqueTasks.filter(t => !t.completed).length,
    completionRate: uniqueTasks.length > 0 
      ? (completedTasks.length / uniqueTasks.length) * 100 
      : 0,
  };

  // Goal stats (using uniqueGoalsCompleted)
  const goalStats = {
    completed: uniqueGoalsCompleted.length,
  };

  // Check if we have tasks
  const hasTasks = taskStats.total > 0;

  // Sorted tasks for display
  const sortedTasks = [...uniqueTasks].sort((a, b) => {
    // Completed tasks first, then by due date
    if (a.completed !== b.completed) return a.completed ? -1 : 1;
    return (a.due_date || '').localeCompare(b.due_date || '');
  });
  const displayedTasks = tasksExpanded ? sortedTasks : sortedTasks.slice(0, 5);
  const hasMoreTasks = sortedTasks.length > 5;

  // Group media by type
  const mediaByType: Record<string, MediaContent[]> = {
    movie: [],
    tv: [],
    book: [],
    game: [],
    album: [],
  };

  allMedia.forEach((item) => {
    if (mediaByType[item.type]) {
      mediaByType[item.type].push(item);
    }
  });

  // Media stats (after mediaByType is populated)
  const mediaStats = {
    total: allMedia.length,
    movies: mediaByType.movie?.length || 0,
    tv: mediaByType.tv?.length || 0,
    books: mediaByType.book?.length || 0,
    games: mediaByType.game?.length || 0,
    albums: mediaByType.album?.length || 0,
    averageRating: allMedia.length > 0 
      ? allMedia.filter(m => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) / allMedia.filter(m => m.rating).length
      : 0,
  };

  // Deduplicate events (multi-day events appear on multiple days)
  const uniqueEvents = Array.from(
    new Map(allEvents.map((event) => [event.id, event])).values()
  );

  const handleMediaClick = (type: string, slug: string) => {
    router.push(`/media/${type}/${slug}`);
  };

  const handleEventClick = (event: Event) => {
    router.push(`/daily/${event.date}`);
  };

  const handleParkClick = (slug: string) => {
    router.push(`/parks/${slug}`);
  };

  const handleJournalClick = (slug: string) => {
    router.push(`/journals/${slug}`);
  };

  const handleGoalClick = (slug: string) => {
    router.push(`/goals/${slug}`);
  };

  const hasMedia = allMedia.length > 0;
  const hasActivities = allActivities.length > 0;
  const hasEvents = uniqueEvents.length > 0;
  const hasParks = allParks.length > 0;
  const hasJournals = allJournals.length > 0;
  const hasGoalsCompleted = uniqueGoalsCompleted.length > 0;
  const hasMood = moodStats.totalEntries > 0;
  const hasHabits = habitStats.totalCompletions > 0;
  const hasDuolingo = duolingoStats.daysCompleted > 0;
  const hasGithub = githubStats.totalEvents > 0;
  const hasRelationship = relationshipStats.total > 0;
  const hasMeals = mealStats.total > 0;

  const hasAnyData = hasMedia || hasActivities || hasEvents || hasParks || hasJournals || 
    hasGoalsCompleted || hasMood || hasHabits || hasDuolingo || hasGithub || hasRelationship || hasTasks || hasMeals;

  if (!hasAnyData) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            No activities recorded for this month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mood Summary */}
      {hasMood && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Mood Summary
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {moodStats.totalEntries} days tracked
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Mood Distribution */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Mood Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = moodStats.distribution[rating] || 0;
                    const percentage = moodStats.totalEntries > 0 
                      ? (count / moodStats.totalEntries) * 100 
                      : 0;
                    const moodLabels: Record<number, string> = {
                      5: "Great", 4: "Good", 3: "Neutral", 2: "Bad", 1: "Very Bad"
                    };
                    const moodColors: Record<number, string> = {
                      5: "bg-emerald-500", 4: "bg-green-500", 3: "bg-yellow-500", 
                      2: "bg-orange-500", 1: "bg-red-500"
                    };
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="w-16 text-sm text-muted-foreground">
                          {rating}
                        </div>
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${moodColors[rating]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-12 text-sm text-right">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Stats Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-lg border bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-pink-500/10">
                      <Heart className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {moodStats.average.toFixed(1)}<span className="text-lg text-muted-foreground">/5</span>
                      </p>
                      <p className="text-sm text-muted-foreground">Average Mood</p>
                    </div>
                  </div>
                </div>
                {moodStats.bestDay && (
                  <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/10">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{moodStats.bestDay.rating}/5</p>
                        <p className="text-sm text-muted-foreground">
                          Best: {formatDateSafe(moodStats.bestDay.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duolingo Summary */}
      {hasDuolingo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-[#58CC02]" />
                Language Learning
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {duolingoStats.daysCompleted} days completed
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-[#58CC02]/10 to-green-50 dark:from-[#58CC02]/20 dark:to-green-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-[#58CC02]/10">
                    <Calendar className="h-5 w-5 text-[#58CC02]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#58CC02]">{duolingoStats.daysCompleted}</p>
                    <p className="text-sm text-muted-foreground">Days Completed</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <Flame className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {duolingoStats.completionRate.toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habits Summary */}
      {hasHabits && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-500" />
                Habits
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {habitStats.totalCompletions} completions
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-teal-500/10">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {habitStats.totalCompletions}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Completions</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {habitStats.uniqueHabits}
                    </p>
                    <p className="text-sm text-muted-foreground">Unique Habits</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* GitHub Activity Summary */}
      {hasGithub && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GitCommit className="h-5 w-5 text-purple-600" />
                GitHub Activity
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {githubStats.totalEvents} events
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <GitCommit className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {githubStats.totalEvents}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {githubStats.daysWithActivity}
                    </p>
                    <p className="text-sm text-muted-foreground">Days Active</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationship Summary */}
      {hasRelationship && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-rose-500" />
                Relationship
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {relationshipStats.total} activities
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-rose-500/10">
                    <Heart className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                      {relationshipStats.totalDates}
                    </p>
                    <p className="text-sm text-muted-foreground">Dates</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-500/10">
                    <Flame className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {relationshipStats.totalIntimacy}
                    </p>
                    <p className="text-sm text-muted-foreground">Intimacy</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Target className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {relationshipStats.totalMilestones}
                    </p>
                    <p className="text-sm text-muted-foreground">Milestones</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals Summary */}
      {hasMeals && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                Meals & Recipes
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {mealStats.total} meals logged
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {mealStats.total}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Meals</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {mealStats.breakfast}
                    </p>
                    <p className="text-sm text-muted-foreground">Breakfasts</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <Calendar className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {mealStats.lunch}
                    </p>
                    <p className="text-sm text-muted-foreground">Lunches</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {mealStats.dinner}
                    </p>
                    <p className="text-sm text-muted-foreground">Dinners</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {mealStats.uniqueRecipes}
                    </p>
                    <p className="text-sm text-muted-foreground">Unique Recipes</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Summary */}
      {hasTasks && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-blue-500" />
                Tasks
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {taskStats.total} total
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {taskStats.completed}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-500/10">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {taskStats.pending}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {taskStats.completionRate.toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Completion</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Summary */}
      {hasGoalsCompleted && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-500" />
                Goals Accomplished
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {goalStats.completed} completed
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-teal-500/10">
                    <Target className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {goalStats.completed}
                    </p>
                    <p className="text-sm text-muted-foreground">Goals Completed This Month</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movies */}
      {mediaStats.movies > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-indigo-500" />
                Movies
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {mediaStats.movies} watched
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-500/10">
                    <Film className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {mediaStats.movies}
                    </p>
                    <p className="text-sm text-muted-foreground">Movies Watched</p>
                  </div>
                </div>
              </div>
              {mediaByType.movie.filter(m => m.rating).length > 0 && (
                <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {(mediaByType.movie.filter(m => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) / mediaByType.movie.filter(m => m.rating).length).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TV Shows */}
      {mediaStats.tv > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-blue-500" />
                TV Shows
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {mediaStats.tv} watched
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <Tv className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {mediaStats.tv}
                    </p>
                    <p className="text-sm text-muted-foreground">Shows Watched</p>
                  </div>
                </div>
              </div>
              {mediaByType.tv.filter(m => m.rating).length > 0 && (
                <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {(mediaByType.tv.filter(m => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) / mediaByType.tv.filter(m => m.rating).length).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Books */}
      {mediaStats.books > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5 text-amber-500" />
                Books
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {mediaStats.books} read
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Book className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {mediaStats.books}
                    </p>
                    <p className="text-sm text-muted-foreground">Books Read</p>
                  </div>
                </div>
              </div>
              {mediaByType.book.filter(m => m.rating).length > 0 && (
                <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {(mediaByType.book.filter(m => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) / mediaByType.book.filter(m => m.rating).length).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games */}
      {mediaStats.games > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-purple-500" />
                Games
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {mediaStats.games} played
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Gamepad2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {mediaStats.games}
                    </p>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                  </div>
                </div>
              </div>
              {mediaByType.game.filter(m => m.rating).length > 0 && (
                <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {(mediaByType.game.filter(m => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) / mediaByType.game.filter(m => m.rating).length).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Albums */}
      {mediaStats.albums > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-pink-500" />
                Albums
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {mediaStats.albums} listened
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pink-500/10">
                    <Music className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      {mediaStats.albums}
                    </p>
                    <p className="text-sm text-muted-foreground">Albums Listened</p>
                  </div>
                </div>
              </div>
              {mediaByType.album.filter(m => m.rating).length > 0 && (
                <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-500/10">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {(mediaByType.album.filter(m => m.rating).reduce((sum, m) => sum + (m.rating || 0), 0) / mediaByType.album.filter(m => m.rating).length).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Summary */}
      {hasEvents && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-500" />
                Events
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {uniqueEvents.length} events
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-500/10">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {uniqueEvents.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Events This Month</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Completed */}
      {hasMedia && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Media Completed ({allMedia.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(Object.keys(mediaByType) as Array<keyof typeof mediaByType>).map(
              (type) => {
                const items = mediaByType[type];
                if (items.length === 0) return null;

                const MediaIcon = MEDIA_ICONS[type] || Film;

                return (
                  <div key={type} className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 capitalize">
                      <MediaIcon className="h-4 w-4" />
                      {type === "tv" ? "TV Shows" : `${type}s`} ({items.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="cursor-pointer group"
                          onClick={() => handleMediaClick(item.type, item.slug)}
                        >
                          <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted">
                            {item.poster ? (
                              <img
                                src={item.poster}
                                alt={item.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <MediaIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                            {item.rating && (
                              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                {item.rating}/10
                              </div>
                            )}
                          </div>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            {item.completed && (
                              <p className="text-xs text-muted-foreground">
                                {formatDateSafe(item.completed)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      )}

      {/* Parks Visited */}
      {hasParks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trees className="h-5 w-5" />
              Parks Visited ({allParks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {allParks.map((park) => (
                <div
                  key={park.id}
                  className="cursor-pointer group"
                  onClick={() => handleParkClick(park.slug)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted">
                    {park.poster ? (
                      <img
                        src={park.poster}
                        alt={park.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Trees className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {park.rating && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {park.rating}/10
                      </div>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {park.title}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {park.category}
                      </Badge>
                      {park.state && (
                        <Badge variant="secondary" className="text-xs">
                          {park.state}
                        </Badge>
                      )}
                    </div>
                    {park.visited && (
                      <p className="text-xs text-muted-foreground">
                        {formatDateSafe(park.visited)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journals */}
      {hasJournals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Journals ({allJournals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allJournals.map((journal) => (
                <div
                  key={journal.id}
                  className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleJournalClick(journal.slug)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[#CC5500] dark:text-[#ff6a1a]">
                      {journal.title}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs capitalize">
                        {journal.journal_type}
                      </Badge>
                      {journal.tags && journal.tags.length > 0 && (
                        <span>{journal.tags.slice(0, 3).join(", ")}</span>
                      )}
                      {journal.journal_type === "daily" && journal.daily_date ? (
                        <span>{formatDateSafe(journal.daily_date)}</span>
                      ) : (
                        <span>{formatDateSafe(journal.created_at)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Accomplished */}
      {hasGoalsCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals Accomplished ({uniqueGoalsCompleted.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uniqueGoalsCompleted.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleGoalClick(goal.slug)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-teal-700 dark:text-teal-400">
                      {goal.title}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs capitalize">
                        {goal.priority} priority
                      </Badge>
                      {goal.completed_date && (
                        <span>Completed {formatDateSafe(goal.completed_date)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipes Logged */}
      {hasMeals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Recipes Logged ({allDailyMeals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Sort by date descending */}
              {[...allDailyMeals]
                .sort((a, b) => b.date.localeCompare(a.date) || 
                  (['breakfast', 'lunch', 'dinner'].indexOf(a.meal_type) - ['breakfast', 'lunch', 'dinner'].indexOf(b.meal_type)))
                .map((meal) => {
                  const recipeName = mealNames[meal.mealId] || `Recipe #${meal.mealId}`;
                  const mealTypeColors: Record<string, string> = {
                    breakfast: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                    lunch: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                    dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
                  };
                  return (
                    <div
                      key={`${meal.date}-${meal.meal_type}`}
                      className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => router.push(`/recipes/${meal.mealId}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-orange-700 dark:text-orange-400">
                            {recipeName}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <Badge 
                              variant="outline" 
                              className={`text-xs capitalize ${mealTypeColors[meal.meal_type] || ""}`}
                            >
                              {meal.meal_type}
                            </Badge>
                            <span>{formatDateSafe(meal.date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Activities */}
      {hasActivities && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Exercise Activities ({allActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Activities List */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold mb-3">Activities</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {allActivities.map((activity) => (
                    <a
                      key={activity.id}
                      href={`https://www.strava.com/activities/${activity.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group cursor-pointer"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-blue-700 dark:text-blue-400 group-hover:underline">
                            {activity.name}
                          </p>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          {activity.distance && (
                            <span>
                              {(activity.distance / 1000).toFixed(2)} km
                            </span>
                          )}
                          {activity.moving_time && (
                            <span>{Math.round(activity.moving_time / 60)} min</span>
                          )}
                          {activity.type && (
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateSafe(activity.start_date_local)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right: Monthly Stats */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold mb-3">Monthly Stats</h3>
                <div className="grid grid-cols-1 gap-4">
                  {/* Total Distance */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-500/10">
                        <Activity className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(allActivities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000).toFixed(2)} km
                        </p>
                        <p className="text-sm text-muted-foreground">Total Distance</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Time */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-500/10">
                        <Clock className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(() => {
                            const totalMinutes = Math.round(
                              allActivities.reduce((sum, a) => sum + (a.moving_time || 0), 0) / 60
                            );
                            const hours = Math.floor(totalMinutes / 60);
                            const minutes = totalMinutes % 60;
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                          })()}
                        </p>
                        <p className="text-sm text-muted-foreground">Total Time</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Elevation */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-orange-500/10">
                        <Mountain className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {Math.round(
                            allActivities.reduce((sum, a) => sum + (a.total_elevation_gain || 0), 0)
                          ).toLocaleString()} m
                        </p>
                        <p className="text-sm text-muted-foreground">Total Elevation</p>
                      </div>
                    </div>
                  </div>

                  {/* Average Pace */}
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-500/10">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(() => {
                            const activitiesWithSpeed = allActivities.filter(a => a.average_speed);
                            if (activitiesWithSpeed.length === 0) return "N/A";
                            const avgSpeed = activitiesWithSpeed.reduce((sum, a) => sum + (a.average_speed || 0), 0) / activitiesWithSpeed.length;
                            const speedKmH = avgSpeed * 3.6;
                            const paceMinPerKm = 60 / speedKmH;
                            const minutes = Math.floor(paceMinPerKm);
                            const seconds = Math.round((paceMinPerKm - minutes) * 60);
                            return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
                          })()}
                        </p>
                        <p className="text-sm text-muted-foreground">Average Pace</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events */}
      {hasEvents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Events ({uniqueEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uniqueEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="space-y-1">
                    <p className="font-medium text-indigo-700 dark:text-indigo-400">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDateSafe(event.date)}
                      </span>
                      {!event.all_day && event.start_time && (
                        <span className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {event.start_time}
                          {event.end_time && ` - ${event.end_time}`}
                        </span>
                      )}
                      {event.all_day && (
                        <Badge variant="outline" className="text-xs">
                          All Day
                        </Badge>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                      {event.end_date && event.end_date !== event.date && (
                        <Badge variant="secondary" className="text-xs">
                          Multi-day (until{" "}
                          {formatDateSafe(event.end_date)})
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationship Items */}
      {hasRelationship && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-500" />
              Relationship Activities ({allRelationshipItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allRelationshipItems
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((item) => {
                  const typeConfig: Record<string, { icon: typeof Heart; color: string; label: string }> = {
                    date: { icon: Heart, color: "text-rose-600 dark:text-rose-400", label: "Date" },
                    intimacy: { icon: Flame, color: "text-pink-600 dark:text-pink-400", label: "Intimacy" },
                    milestone: { icon: Target, color: "text-amber-600 dark:text-amber-400", label: "Milestone" },
                  };
                  const config = typeConfig[item.type] || typeConfig.date;
                  const ItemIcon = config.icon;
                  
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ItemIcon className={`h-4 w-4 ${config.color}`} />
                          <p className={`font-medium ${config.color}`}>
                            {item.title || config.label}
                          </p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {config.label}
                          </Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateSafe(item.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      {hasTasks && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-500" />
              Tasks ({uniqueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                      <p className={`font-medium ${task.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-blue-700 dark:text-blue-400'}`}>
                        {task.title}
                      </p>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground ml-6">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground ml-6">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {formatDateSafe(task.due_date)}
                        </span>
                      )}
                      {task.completed && task.completed_date && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          Completed {formatDateSafe(task.completed_date)}
                        </Badge>
                      )}
                      {task.category && (
                        <Badge variant="secondary" className="text-xs">
                          {task.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hasMoreTasks && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-muted-foreground"
                onClick={() => setTasksExpanded(!tasksExpanded)}
              >
                {tasksExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show {sortedTasks.length - 5} More
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Habits List */}
      {hasHabits && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-teal-500" />
              Habit Completions ({allHabitCompletions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Group completions by habit name */}
              {Array.from(
                allHabitCompletions.reduce((acc, completion) => {
                  const key = completion.habit_id;
                  if (!acc.has(key)) {
                    acc.set(key, {
                      habitId: completion.habit_id,
                      completions: [],
                    });
                  }
                  acc.get(key)!.completions.push(completion);
                  return acc;
                }, new Map<number, { habitId: number; completions: typeof allHabitCompletions }>())
                .values()
              )
                .sort((a, b) => b.completions.length - a.completions.length)
                .map((habitGroup) => (
                  <div
                    key={habitGroup.habitId}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-teal-500" />
                          <p className="font-medium text-teal-700 dark:text-teal-400">
                            {habitNames[habitGroup.habitId] || `Habit #${habitGroup.habitId}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {habitGroup.completions.length} times
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 ml-6 text-xs text-muted-foreground">
                        {habitGroup.completions
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .slice(0, 10)
                          .map((completion, idx) => (
                            <span
                              key={`${completion.habit_id}-${completion.date}-${idx}`}
                              className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 rounded text-teal-700 dark:text-teal-400"
                            >
                              {formatDateSafe(completion.date)}
                            </span>
                          ))}
                        {habitGroup.completions.length > 10 && (
                          <span className="px-2 py-0.5 text-muted-foreground">
                            +{habitGroup.completions.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
