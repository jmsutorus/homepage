"use client";

import { YearlyStats } from "@/lib/data/yearly-data";
import { ShareYearDialog } from "./share-year-dialog";
import { StoryMode, StoryModeButton } from "./story-mode";
import { AchievementGrid, AchievementSummary } from "./achievement-badge";
import { MoodTimeline } from "./mood-timeline";
import { EventsTimeline } from "./events-timeline";
import { ExerciseTimeline } from "./exercise-timeline";
import { MediaTimeline } from "./media-timeline";
import { BooksTimeline } from "./books-timeline";
import { GamesTimeline } from "./games-timeline";
import { AlbumsTimeline } from "./albums-timeline";
import { ParksTimeline } from "./parks-timeline";
import { JournalsTimeline } from "./journals-timeline";
import { ProductivityTimeline } from "./productivity-timeline";
import { HabitsTimeline } from "./habits-timeline";
import { DuolingoTimeline } from "./duolingo-timeline";
import { RelationshipTimeline } from "./relationship-timeline";
import { MealsTimeline } from "./meals-timeline";
import { VacationsTimeline } from "./vacations-timeline";
import { RestaurantsTimeline } from "./restaurants-timeline";
import { DrinksTimeline } from "./drinks-timeline";

import { TimeSpentChart } from "./time-spent-chart";
import { getAchievementStats, getUnlockedAchievements } from "@/lib/data/yearly-achievements";
import { generateYearlyInsights } from "@/lib/data/yearly-insights";
import {
  Calendar,
  Trophy,
} from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHaptic } from "@/hooks/use-haptic";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { staggerContainer, cardEntrance } from "@/lib/animation-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface YearlySummaryProps {
  stats: YearlyStats;
  year: number;
}

export function YearlySummary({ stats, year }: YearlySummaryProps) {
  const [showStoryMode, setShowStoryMode] = useState(false);
  const router = useRouter();
  const haptic = useHaptic();

  const handleYearChange = (newYear: string) => {
    router.push(`/year/${newYear}`);
  };

  // Generate year options (e.g., last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Get achievements and insights
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

  const hasNoData = 
    (stats.mood?.totalEntries || 0) === 0 &&
    (stats.exercises?.total || 0) === 0 &&
    (stats.media?.total || 0) === 0 &&
    (stats.games?.total || 0) === 0 &&
    (stats.parks?.total || 0) === 0 &&
    (stats.events?.total || 0) === 0 &&
    (stats.journals?.total || 0) === 0 &&
    (stats.tasks?.total || 0) === 0 &&
    (stats.goals?.total || 0) === 0 &&
    (stats.habits?.total || 0) === 0 &&
    (stats.duolingo?.totalDays || 0) === 0 &&
    (stats.relationship?.totalDates || 0) === 0 &&
    (stats.meals?.total || 0) === 0 &&
    (stats.restaurants?.totalVisits || 0) === 0 &&
    (stats.drinks?.total || 0) === 0 &&
    (stats.vacations?.total || 0) === 0;

  if (hasNoData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center w-full py-12 font-lexend">
        <div className="flex flex-col items-center text-center px-4 max-w-md">
          <div className="w-24 h-24 rounded-full bg-media-secondary/10 flex items-center justify-center text-media-secondary mb-6 shadow-inner">
            <span className="material-symbols-outlined text-5xl">history</span>
          </div>
          <h2 className="text-3xl font-black text-media-primary mb-3 tracking-tight">The Canvas is Blank</h2>
          <p className="text-media-on-surface-variant font-medium mb-8">
            Your {year} Year in Review is waiting to be written. Come back after you&apos;ve started tracking your workouts, media, habits, or meals!
          </p>
          <button 
            onClick={() => { haptic.trigger("light"); router.push("/home"); }}
            className="cursor-pointer bg-brand text-brand-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg border-none"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            <span>Return Home</span>
          </button>
        </div>
      </div>
    );
  }

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

      {/* Time Spent Chart - only show if total time is 100+ minutes */}
      {(() => {
        const totalTime = stats.media.totalTimeSpent + stats.exercises.totalDuration;
        return totalTime >= 100 && (
          <TimeSpentChart stats={stats} />
        );
      })()}

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
      {Object.keys(stats.media.byType).some(t => t.toLowerCase() === 'book') && (
        <BooksTimeline stats={stats} />
      )}

      {/* Games Journey Timeline */}
      {stats.games.total > 0 && (
        <GamesTimeline stats={stats} />
      )}

      {/* Albums Journey Timeline */}
      {(stats.media.byType['album'] || 0) > 0 && (
        <AlbumsTimeline stats={stats} />
      )}

      {/* Parks Journey Timeline */}
      {stats.parks.total > 0 && (
        <ParksTimeline stats={stats} />
      )}

      {/* Events Timeline */}
      {stats.events.total > 0 && (
        <EventsTimeline stats={stats} />
      )}

      {/* Journals Journey Timeline */}
      {stats.journals.total > 0 && (
        <JournalsTimeline stats={stats} />
      )}

      {/* Productivity Timeline */}
      {(stats.tasks.total > 0 || stats.goals.total > 0) && (
        <ProductivityTimeline stats={stats} />
      )}

      {/* Habits Timeline */}
      {stats.habits.total > 0 && (
        <HabitsTimeline stats={stats} />
      )}

      {/* Duolingo Timeline */}
      {stats.duolingo.totalDays > 0 && (
        <DuolingoTimeline stats={stats} />
      )}

      {/* Relationship Timeline */}
      {stats.relationship.totalDates > 0 && (
        <RelationshipTimeline stats={stats} />
      )}

      {/* Meals Timeline */}
      {stats.meals.total > 0 && (
        <MealsTimeline stats={stats} />
      )}

      {stats.restaurants.totalVisits > 0 && (
        <RestaurantsTimeline stats={stats} />
      )}

      {/* Drinks Timeline */}
      {stats.drinks.total > 0 && (
        <DrinksTimeline stats={stats} />
      )}


      {/* Vacations Timeline */}
      {stats.vacations.total > 0 && (
        <VacationsTimeline stats={stats} />
      )}
    </div>
    </>
  );
}
