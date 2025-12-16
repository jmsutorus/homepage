"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Heart, TrendingUp, Calendar } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";

interface MoodTimelineProps {
  stats: YearlyStats;
}

/**
 * Mood Journey Timeline Component
 * Visualizes emotional journey through the year
 */
export function MoodTimeline({ stats }: MoodTimelineProps) {

  // Calculate mood insights
  const moodInsights = calculateMoodInsights(stats);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <CardTitle>Mood Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.mood.totalEntries} days tracked
            </div>
          </div>
          <CardDescription>
            Your emotional journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Average Mood Display */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <div className="text-sm font-medium text-muted-foreground">Average Mood</div>
              </div>
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {stats.mood.average.toFixed(1)}
                <span className="text-lg text-muted-foreground">/5</span>
              </div>
            </div>

            {moodInsights.bestMood && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div className="text-sm font-medium text-muted-foreground">Best Month</div>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {moodInsights.bestMood.month}
                </div>
                <div className="text-sm text-muted-foreground">
                  {moodInsights.bestMood.rating.toFixed(1)} avg mood
                </div>
              </div>
            )}

            {moodInsights.consistency && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div className="text-sm font-medium text-muted-foreground">Consistency</div>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {moodInsights.consistency}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Days logged
                </div>
              </div>
            )}
          </div>

          {/* Mood Distribution */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Mood Distribution</h4>
            <div className="space-y-2">
              {Object.entries(stats.mood.distribution)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([rating, count]) => {
                  const percentage = (count / stats.mood.totalEntries) * 100;
                  const moodLabel = getMoodLabel(parseInt(rating));
                  const moodColor = getMoodColor(parseInt(rating));

                  return (
                    <div key={rating} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rating}</span>
                          <span className="text-muted-foreground">{moodLabel}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {count} days ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", moodColor)}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Insights */}
          {moodInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {moodInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-purple-500 shrink-0" />
                    <span>{insight.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Calculate mood insights from stats
 */
function calculateMoodInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best and worst months (would need monthly mood data)
  // For now, using placeholder logic
  const bestMood = {
    month: monthNames[0], // Would calculate from actual data
    rating: stats.mood.average,
  };

  // Consistency
  const consistency = ((stats.mood.totalEntries / 365) * 100).toFixed(0);

  // Generate insights
  if (stats.mood.average >= 4) {
    insights.push({
      icon: Heart,
      text: `You maintained a positive mindset with an average mood of ${stats.mood.average.toFixed(1)}/5`,
    });
  }

  if (stats.mood.totalEntries >= 365) {
    insights.push({
      icon: Calendar,
      text: "You tracked your mood every single day this year! That's incredible consistency.",
    });
  } else if (stats.mood.totalEntries >= 250) {
    insights.push({
      icon: Calendar,
      text: `You tracked your mood for ${stats.mood.totalEntries} days, showing strong commitment to self-awareness.`,
    });
  }

  // Find most common mood
  const mostCommonMood = Object.entries(stats.mood.distribution)
    .sort(([, a], [, b]) => b - a)[0];

  if (mostCommonMood) {
    const [rating, count] = mostCommonMood;
    const percentage = ((count / stats.mood.totalEntries) * 100).toFixed(0);
    insights.push({
      icon: TrendingUp,
      text: `Your most common mood was ${rating}/5 (${getMoodLabel(parseInt(rating))}), occurring ${percentage}% of the time.`,
    });
  }

  // Check for positive trend (more high ratings than low)
  const highMoods = (stats.mood.distribution[4] || 0) + (stats.mood.distribution[5] || 0);
  const lowMoods = (stats.mood.distribution[1] || 0) + (stats.mood.distribution[2] || 0);

  if (highMoods > lowMoods * 2) {
    insights.push({
      icon: TrendingUp,
      text: "You experienced significantly more positive days than negative ones this year.",
    });
  }

  return {
    bestMood: stats.mood.totalEntries > 0 ? bestMood : null,
    consistency: stats.mood.totalEntries > 0 ? consistency : null,
    insights,
  };
}

/**
 * Get mood label from rating
 */
function getMoodLabel(rating: number): string {
  switch (rating) {
    case 1:
      return "Very Bad";
    case 2:
      return "Bad";
    case 3:
      return "Neutral";
    case 4:
      return "Good";
    case 5:
      return "Great";
    default:
      return "Unknown";
  }
}

/**
 * Get mood color from rating
 */
function getMoodColor(rating: number): string {
  switch (rating) {
    case 1:
      return "bg-red-500";
    case 2:
      return "bg-orange-500";
    case 3:
      return "bg-yellow-500";
    case 4:
      return "bg-green-500";
    case 5:
      return "bg-emerald-500";
    default:
      return "bg-gray-500";
  }
}
