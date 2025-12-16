"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Heart, Star, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";

interface RelationshipTimelineProps {
  stats: YearlyStats;
}

/**
 * Relationship Journey Timeline Component
 * Visualizes relationship milestones and activities through the year
 */
export function RelationshipTimeline({ stats }: RelationshipTimelineProps) {
  const relationshipInsights = calculateRelationshipInsights(stats);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <CardTitle>Relationship Journey</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.relationship.totalDates} dates tracked
            </div>
          </div>
          <CardDescription>
            Your relationship moments through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-pink-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Dates</div>
              </div>
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {stats.relationship.totalDates}
              </div>
              {stats.relationship.averageDateRating > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.relationship.averageDateRating.toFixed(1)}/5 avg rating
                </div>
              )}
            </div>

            {stats.relationship.perfectDates > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <div className="text-sm font-medium text-muted-foreground">Perfect Dates</div>
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.relationship.perfectDates}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  5-star ratings
                </div>
              </div>
            )}

            {stats.relationship.totalMilestones > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div className="text-sm font-medium text-muted-foreground">Milestones</div>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.relationship.totalMilestones}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Special moments
                </div>
              </div>
            )}

            {stats.relationship.totalIntimacy > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <div className="text-sm font-medium text-muted-foreground">Intimacy</div>
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.relationship.totalIntimacy}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Intimate moments
                </div>
              </div>
            )}

          </div>

          {/* Date Types Distribution */}
          {stats.relationship.dateTypes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Date Types</h4>
              <div className="space-y-2">
                {stats.relationship.dateTypes.slice(0, 5).map((dateType) => {
                  const percentage = (dateType.count / stats.relationship.totalDates) * 100;
                  const typeLabel = formatDateType(dateType.type);
                  const typeColor = getDateTypeColor(dateType.type);

                  return (
                    <div key={dateType.type} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{typeLabel}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {dateType.count} dates ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={cn("h-full rounded-full", typeColor)}
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
          )}

          

          {/* Top Rated Dates */}
          {stats.relationship.topRatedDates.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated Dates</h4>
              <div className="space-y-2">
                {stats.relationship.topRatedDates.map((date, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{formatDateType(date.type)}</div>
                      {date.venue && (
                        <div className="text-muted-foreground text-xs mt-0.5">{date.venue}</div>
                      )}
                      <div className="text-muted-foreground text-xs mt-0.5">
                        {new Date(date.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="font-medium">{date.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Stats */}
          {stats.relationship.totalIntimacy > 0 && stats.relationship.averageSatisfactionRating > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-rose-500" />
                <div className="text-sm font-medium">Intimacy Tracking</div>
              </div>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.relationship.totalIntimacy} entries
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stats.relationship.averageSatisfactionRating.toFixed(1)}/5 avg satisfaction
              </div>
            </div>
          )}

          {/* Positions Distribution */}
          {stats.relationship.positions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Sex Positions</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {stats.relationship.uniquePositions} unique
                </span>
              </div>
              <div className="space-y-2">
                {stats.relationship.positions.slice(0, 8).map((position) => {
                  const totalPositions = stats.relationship.positions.reduce((sum, p) => sum + p.count, 0);
                  const percentage = (position.count / totalPositions) * 100;

                  return (
                    <div key={position.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{position.name}</span>
                        <span className="text-muted-foreground">
                          {position.count}x ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-rose-100 dark:bg-rose-900/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Insights */}
          {relationshipInsights.insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {relationshipInsights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-pink-500 shrink-0" />
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
 * Calculate relationship insights from stats
 */
function calculateRelationshipInsights(stats: YearlyStats) {
  const insights: Array<{ icon: any; text: string }> = [];

  // Quality insights
  if (stats.relationship.averageDateRating >= 4.5) {
    insights.push({
      icon: Star,
      text: `You had an amazing year with an average date rating of ${stats.relationship.averageDateRating.toFixed(1)}/5!`,
    });
  } else if (stats.relationship.averageDateRating >= 4.0) {
    insights.push({
      icon: Heart,
      text: `You maintained great date quality with a ${stats.relationship.averageDateRating.toFixed(1)}/5 average rating.`,
    });
  }

  // Perfect dates
  if (stats.relationship.perfectDates >= 5) {
    insights.push({
      icon: Sparkles,
      text: `You had ${stats.relationship.perfectDates} perfect 5-star dates this year!`,
    });
  }

  // Date frequency
  if (stats.relationship.totalDates >= 52) {
    insights.push({
      icon: Calendar,
      text: "You averaged more than one date per week! That's impressive consistency.",
    });
  } else if (stats.relationship.totalDates >= 26) {
    insights.push({
      icon: Calendar,
      text: "You averaged about one date every two weeks, maintaining regular quality time together.",
    });
  } else if (stats.relationship.totalDates >= 12) {
    insights.push({
      icon: Calendar,
      text: `You went on ${stats.relationship.totalDates} dates this year, averaging about once a month.`,
    });
  }

  // Variety
  if (stats.relationship.dateTypes.length >= 5) {
    insights.push({
      icon: TrendingUp,
      text: `You tried ${stats.relationship.dateTypes.length} different types of dates, keeping things fresh and exciting!`,
    });
  }

  // Milestones
  if (stats.relationship.totalMilestones >= 3) {
    insights.push({
      icon: Sparkles,
      text: `You celebrated ${stats.relationship.totalMilestones} special milestones together this year.`,
    });
  }

  // Satisfaction
  if (stats.relationship.averageSatisfactionRating >= 4.5) {
    insights.push({
      icon: Heart,
      text: `Your intimacy satisfaction average of ${stats.relationship.averageSatisfactionRating.toFixed(1)}/5 shows a deeply connected relationship.`,
    });
  }

  // Positions variety
  if (stats.relationship.uniquePositions >= 10) {
    insights.push({
      icon: Sparkles,
      text: `You explored ${stats.relationship.uniquePositions} different positions this year, showing great variety and adventurousness!`,
    });
  } else if (stats.relationship.uniquePositions >= 5) {
    insights.push({
      icon: TrendingUp,
      text: `You tried ${stats.relationship.uniquePositions} different positions, maintaining a nice variety in your intimate moments.`,
    });
  }

  // Favorite position
  if (stats.relationship.positions.length > 0) {
    const topPosition = stats.relationship.positions[0];
    const totalPositions = stats.relationship.positions.reduce((sum, p) => sum + p.count, 0);
    const percentage = ((topPosition.count / totalPositions) * 100).toFixed(0);

    if (topPosition.count >= 5) {
      insights.push({
        icon: Heart,
        text: `Your most frequent position was ${topPosition.name}, occurring ${percentage}% of the time (${topPosition.count}x).`,
      });
    }
  }

  return {
    insights,
  };
}

/**
 * Format date type for display
 */
function formatDateType(type: string): string {
  const formatted = type.replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Get color for date type
 */
function getDateTypeColor(type: string): string {
  const colors: Record<string, string> = {
    dinner: "bg-pink-500",
    movie: "bg-purple-500",
    activity: "bg-blue-500",
    outing: "bg-green-500",
    concert: "bg-indigo-500",
    event: "bg-amber-500",
    other: "bg-gray-500",
  };
  return colors[type.toLowerCase()] || "bg-pink-500";
}
