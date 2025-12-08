"use client";

import { YearlyStats } from "@/lib/data/yearly-data";
import { SummaryCard } from "./summary-card";
import { MonthlyChart } from "./monthly-chart";
import { CategoryBreakdown } from "./category-breakdown";
import { ShareYearDialog } from "./share-year-dialog";
import { StoryMode, StoryModeButton } from "./story-mode";
import { AchievementGrid, AchievementSummary } from "./achievement-badge";
import { MoodTimeline } from "./mood-timeline";
import { ExerciseTimeline } from "./exercise-timeline";
import { MediaTimeline } from "./media-timeline";
import { BooksTimeline } from "./books-timeline";
import { getYearlyAchievements, getAchievementStats, getUnlockedAchievements } from "@/lib/data/yearly-achievements";
import { generateYearlyInsights } from "@/lib/data/yearly-insights";
import {
  Film,
  TreePine,
  Dumbbell,
  Smile,
  BookOpen,
  Github,
  Gamepad2,
  RefreshCw,
  Calendar,
  CheckCircle2,
  ListTodo,
  Target,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { syncSteamDataAction } from "@/app/actions/yearly-actions";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { staggerContainer, cardEntrance } from "@/lib/animation-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface YearlySummaryProps {
  stats: YearlyStats;
  year: number;
}

export function YearlySummary({ stats, year }: YearlySummaryProps) {
  const [isPending, startTransition] = useTransition();
  const [showStoryMode, setShowStoryMode] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const router = useRouter();

  const handleSteamSync = () => {
    startTransition(async () => {
      await syncSteamDataAction(year);
    });
  };

  const handleYearChange = (newYear: string) => {
    router.push(`/year/${newYear}`);
  };

  // Generate year options (e.g., last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Get achievements and insights
  const achievements = getYearlyAchievements(stats);
  const achievementStats = getAchievementStats(stats);
  const unlockedAchievements = getUnlockedAchievements(stats);
  const insights = generateYearlyInsights(stats);

  // Show only top unlocked achievements (max 8)
  const topAchievements = unlockedAchievements
    .sort((a, b) => {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    })
    .slice(0, 8);

  // Get fun facts and highlights
  const funFacts = insights.filter(i => i.type === "fun_fact" || i.type === "highlight").slice(0, 4);

  return (
    <>
      {/* Story Mode */}
      {showStoryMode && (
        <StoryMode
          stats={stats}
          year={year}
          onClose={() => setShowStoryMode(false)}
          onShare={() => {
            setShowStoryMode(false);
            setShowShareDialog(true);
          }}
        />
      )}

      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {year} Year in Review
            </h1>
            <p className="text-muted-foreground mt-2">
              A look back at your activities, achievements, and memories.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <StoryModeButton onClick={() => setShowStoryMode(true)} />
            <ShareYearDialog stats={stats} year={year} />
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      {/* Fun Facts & Insights */}
      {funFacts.length > 0 && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2"
        >
          {funFacts.map((insight, index) => (
            <motion.div key={index} variants={cardEntrance}>
              <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className={`p-2 rounded-lg ${insight.color}`}>
                    <insight.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold">Achievements Unlocked</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {achievementStats.unlocked} / {achievementStats.total}
            </div>
          </div>

          <AchievementSummary
            total={achievementStats.total}
            unlocked={achievementStats.unlocked}
            byRarity={achievementStats.byRarity}
          />

          {topAchievements.length > 0 && (
            <AchievementGrid achievements={topAchievements} columns={4} showProgress={false} />
          )}
        </div>
      )}

      {/* Mood Journey Timeline */}
      {stats.mood.totalEntries > 0 && (
        <MoodTimeline stats={stats} />
      )}

      {/* Exercise Journey Timeline */}
      {stats.exercises.total > 0 && (
        <ExerciseTimeline stats={stats} />
      )}

      {/* Media Journey Timeline */}
      {stats.media.total > 0 && (
        <MediaTimeline stats={stats} />
      )}

      {/* Books Journey Timeline */}
      {stats.media.total > 0 && (
        <BooksTimeline stats={stats} />
      )}

      {/* Top Level Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Media Consumed"
            value={stats.media.total}
            icon={Film}
            description={`${stats.media.averageRating.toFixed(1)} avg rating`}
            color="text-blue-500"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Parks Visited"
            value={stats.parks.total}
            icon={TreePine}
            description={`${stats.parks.states.length} states explored`}
            color="text-green-500"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Workouts"
            value={stats.exercises.total}
            icon={Dumbbell}
            description={`${Math.round(stats.exercises.totalDuration / 60)} hours active`}
            color="text-orange-500"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Avg Mood"
            value={stats.mood.average.toFixed(1)}
            icon={Smile}
            description={`${stats.mood.totalEntries} days tracked`}
            color="text-yellow-500"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Journals Written"
            value={stats.journals.total}
            icon={BookOpen}
            description={`${stats.journals.dailyCount} daily entries`}
            color="text-indigo-500"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Habits Completed"
            value={stats.habits.completed}
            icon={CheckCircle2}
            description="Goals reached"
            color="text-emerald-500"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Tasks Completed"
            value={stats.tasks.completed}
            icon={ListTodo}
            description={`${stats.tasks.completionRate.toFixed(0)}% completion rate`}
            color="text-blue-600"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Goals Achieved"
            value={stats.goals.completed}
            icon={Target}
            description={`${stats.goals.inProgress} in progress`}
            color="text-purple-600"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="GitHub Contributions"
            value={stats.github.totalEvents}
            icon={Github}
            description="Commits, PRs, issues"
            color="text-slate-500"
          />
        </motion.div>
        <motion.div variants={cardEntrance}>
          <SummaryCard
            title="Steam Achievements"
            value={stats.steam.totalAchievements}
            icon={Gamepad2}
            description={`${stats.steam.gamesPlayed} games played`}
            color="text-blue-700"
          />
        </motion.div>
      </motion.div>

      {/* Steam Sync Button */}
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSteamSync} 
          disabled={isPending}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Syncing Steam Data..." : "Sync Steam Data"}
        </Button>
      </div>

      {/* Monthly Trends */}
      <div className="grid gap-4 md:grid-cols-2">
        <MonthlyChart
          title="Media & Reading Trend"
          data={stats.monthlyActivity}
          dataKey="media"
          color="#3b82f6" // blue-500
        />
        <MonthlyChart
          title="Exercise Frequency"
          data={stats.monthlyActivity}
          dataKey="exercises"
          color="#f97316" // orange-500
        />
        <MonthlyChart
          title="Journaling Habit"
          data={stats.monthlyActivity}
          dataKey="journals"
          color="#6366f1" // indigo-500
        />
        <MonthlyChart
          title="GitHub Activity"
          data={stats.monthlyActivity}
          dataKey="github"
          color="#64748b" // slate-500
        />
      </div>

      {/* Breakdowns */}
      <div className="grid gap-4 md:grid-cols-3">
        <CategoryBreakdown
          title="Media Types"
          data={Object.entries(stats.media.byType).map(([name, value]) => ({ name, value }))}
          colors={["#3b82f6", "#a855f7", "#ec4899", "#10b981"]}
        />
        <CategoryBreakdown
          title="Park Categories"
          data={Object.entries(stats.parks.byCategory).map(([name, value]) => ({ name, value }))}
          type="bar"
          colors={["#22c55e", "#16a34a", "#15803d", "#14532d"]}
        />
        <CategoryBreakdown
          title="Top Genres"
          data={stats.media.topGenres.map(g => ({ name: g.genre, value: g.count }))}
          type="bar"
          colors={["#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337"]}
        />
      </div>

      {/* Tasks & Goals Breakdowns */}
      <div className="grid gap-4 md:grid-cols-3">
        <CategoryBreakdown
          title="Tasks by Priority"
          data={Object.entries(stats.tasks.byPriority).map(([name, value]) => ({ name, value }))}
          type="bar"
          colors={["#ef4444", "#f97316", "#eab308"]}
        />
        <CategoryBreakdown
          title="Goals by Status"
          data={Object.entries(stats.goals.byStatus).map(([name, value]) => ({
            name: name.replace(/_/g, ' '),
            value
          }))}
          colors={["#10b981", "#3b82f6", "#8b5cf6", "#6b7280"]}
        />
        {Object.keys(stats.tasks.byCategory).length > 0 && (
          <CategoryBreakdown
            title="Tasks by Category"
            data={Object.entries(stats.tasks.byCategory).map(([name, value]) => ({ name, value }))}
            type="bar"
            colors={["#06b6d4", "#0891b2", "#0e7490", "#155e75"]}
          />
        )}
      </div>

      {/* Steam Top Games */}
      {stats.steam.topGames.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-blue-700" />
            Top Games by Achievements
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {stats.steam.topGames.map((game, i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/50 flex flex-col gap-2">
                <div className="font-medium truncate" title={game.name}>{game.name}</div>
                <div className="text-2xl font-bold text-blue-700">{game.achievements}</div>
                <div className="text-xs text-muted-foreground">achievements</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
