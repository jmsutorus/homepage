"use client";

import { YearlyStats } from "@/lib/data/yearly-data";
import { SummaryCard } from "./summary-card";
import { MonthlyChart } from "./monthly-chart";
import { CategoryBreakdown } from "./category-breakdown";
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
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { syncSteamDataAction } from "@/app/actions/yearly-actions";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearlySummaryProps {
  stats: YearlyStats;
  year: number;
}

export function YearlySummary({ stats, year }: YearlySummaryProps) {
  const [isPending, startTransition] = useTransition();
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

  return (
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
        
        <div className="flex items-center gap-2">
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

      {/* Top Level Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Media Consumed"
          value={stats.media.total}
          icon={Film}
          description={`${stats.media.averageRating.toFixed(1)} avg rating`}
          color="text-blue-500"
        />
        <SummaryCard
          title="Parks Visited"
          value={stats.parks.total}
          icon={TreePine}
          description={`${stats.parks.states.length} states explored`}
          color="text-green-500"
        />
        <SummaryCard
          title="Workouts"
          value={stats.exercises.total}
          icon={Dumbbell}
          description={`${Math.round(stats.exercises.totalDuration / 60)} hours active`}
          color="text-orange-500"
        />
        <SummaryCard
          title="Avg Mood"
          value={stats.mood.average.toFixed(1)}
          icon={Smile}
          description={`${stats.mood.totalEntries} days tracked`}
          color="text-yellow-500"
        />
        <SummaryCard
          title="Journals Written"
          value={stats.journals.total}
          icon={BookOpen}
          description={`${stats.journals.dailyCount} daily entries`}
          color="text-indigo-500"
        />
        <SummaryCard
          title="Habits Completed"
          value={stats.habits.completed}
          icon={CheckCircle2}
          description="Goals reached"
          color="text-emerald-500"
        />
        <SummaryCard
          title="GitHub Contributions"
          value={stats.github.totalEvents}
          icon={Github}
          description="Commits, PRs, issues"
          color="text-slate-500"
        />
        <SummaryCard
          title="Steam Achievements"
          value={stats.steam.totalAchievements}
          icon={Gamepad2}
          description={`${stats.steam.gamesPlayed} games played`}
          color="text-blue-700"
        />
      </div>

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
  );
}
