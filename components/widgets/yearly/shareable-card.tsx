"use client";

import { forwardRef } from "react";
import { YearlyStats } from "@/lib/data/yearly-data";
import {
  Film,
  TreePine,
  Dumbbell,
  Smile,
  BookOpen,
  Github,
  Gamepad2,
  CheckCircle2,
} from "lucide-react";

interface ShareableCardProps {
  stats: YearlyStats;
  year: number;
}

export const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  function ShareableCard({ stats, year }, ref) {
    return (
      <div
        ref={ref}
        className="w-[600px] h-[800px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {year}
          </h1>
          <p className="text-2xl font-light text-slate-300 mt-2">Year in Review</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            icon={<Film className="h-6 w-6" />}
            value={stats.media.total}
            label="Media Consumed"
            sublabel={`${stats.media.averageRating.toFixed(1)} avg rating`}
            color="text-blue-400"
          />
          <StatItem
            icon={<TreePine className="h-6 w-6" />}
            value={stats.parks.total}
            label="Parks Visited"
            sublabel={`${stats.parks.states.length} states`}
            color="text-green-400"
          />
          <StatItem
            icon={<Dumbbell className="h-6 w-6" />}
            value={stats.exercises.total}
            label="Workouts"
            sublabel={`${Math.round(stats.exercises.totalDuration / 60)}h active`}
            color="text-orange-400"
          />
          <StatItem
            icon={<Smile className="h-6 w-6" />}
            value={stats.mood.average.toFixed(1)}
            label="Avg Mood"
            sublabel={`${stats.mood.totalEntries} days`}
            color="text-yellow-400"
          />
          <StatItem
            icon={<BookOpen className="h-6 w-6" />}
            value={stats.journals.total}
            label="Journals"
            sublabel={`${stats.journals.dailyCount} daily`}
            color="text-indigo-400"
          />
          <StatItem
            icon={<CheckCircle2 className="h-6 w-6" />}
            value={stats.habits.completed}
            label="Habits Done"
            sublabel="Goals reached"
            color="text-emerald-400"
          />
          <StatItem
            icon={<Github className="h-6 w-6" />}
            value={stats.github.totalEvents}
            label="GitHub"
            sublabel="Contributions"
            color="text-slate-400"
          />
          <StatItem
            icon={<Gamepad2 className="h-6 w-6" />}
            value={stats.steam.totalAchievements}
            label="Achievements"
            sublabel={`${stats.steam.gamesPlayed} games`}
            color="text-blue-300"
          />
        </div>

        {/* Highlights */}
        <div className="mt-8 p-4 rounded-xl bg-white/10 backdrop-blur">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Highlights
          </h3>
          <div className="space-y-2 text-sm">
            {stats.media.topGenres[0] && (
              <div className="flex items-center gap-2">
                <span className="text-purple-400">Top Genre:</span>
                <span className="text-white">{stats.media.topGenres[0].genre}</span>
              </div>
            )}
            {stats.steam.topGames[0] && (
              <div className="flex items-center gap-2">
                <span className="text-purple-400">Most Played:</span>
                <span className="text-white truncate">{stats.steam.topGames[0].name}</span>
              </div>
            )}
            {stats.exercises.totalDuration > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-purple-400">Active Time:</span>
                <span className="text-white">
                  {Math.round(stats.exercises.totalDuration / 60)} hours
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
            <span>My Personal Dashboard</span>
          </div>
        </div>
      </div>
    );
  }
);

interface StatItemProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  sublabel: string;
  color: string;
}

function StatItem({ icon, value, label, sublabel, color }: StatItemProps) {
  return (
    <div className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm font-medium text-slate-200">{label}</div>
      <div className="text-xs text-slate-400">{sublabel}</div>
    </div>
  );
}
