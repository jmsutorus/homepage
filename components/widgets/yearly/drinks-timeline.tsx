"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { Wine, Star, TrendingUp, MapPin, Beer, GlassWater } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface DrinksTimelineProps {
  stats: YearlyStats;
}

/**
 * Drinks Timeline Component
 * Visualizes drink logs and tasting experiences through the year
 */
export function DrinksTimeline({ stats }: DrinksTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for drinks visualization
  const monthlyData = monthNames.map((name, index) => ({
    name,
    count: stats.drinks.byMonth[index] || 0,
  }));

  // Calculate insights
  const insights = calculateDrinkInsights(stats);

  // Prepare type data for display
  const typeData = stats.drinks.topTypes.slice(0, 5);

  const COLORS = ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af']; // Rose/Pink palette

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wine className="h-5 w-5 text-rose-700 dark:text-rose-400" />
              <CardTitle>Drinks & Tastings</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.drinks.total} tastings
            </div>
          </div>
          <CardDescription>
            Your beverage discoveries throughout {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800">
              <div className="flex items-center gap-2 mb-2">
                <Wine className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <div className="text-sm font-medium text-muted-foreground">Total Tastings</div>
              </div>
              <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">
                {stats.drinks.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.drinks.total / 12).toFixed(1)} per month
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-fuchsia-50 dark:from-pink-950/20 dark:to-fuchsia-950/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-2 mb-2">
                <Beer className="h-4 w-4 text-pink-500" />
                <div className="text-sm font-medium text-muted-foreground">Unique Drinks</div>
              </div>
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {stats.drinks.uniqueDrinks}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                New favorites found
              </div>
            </div>

            {stats.drinks.avgRating > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/20 dark:to-purple-950/20 border border-fuchsia-200 dark:border-fuchsia-800">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-fuchsia-500" />
                  <div className="text-sm font-medium text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-3xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                  {stats.drinks.avgRating.toFixed(1)}/10
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Quality sips
                </div>
              </div>
            )}
          </div>

          {/* Monthly Trend */}
          {stats.drinks.total > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Drinking Activity</h4>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorDrinks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#be123c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#be123c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: "hsl(var(--popover-foreground))"
                      }}
                      itemStyle={{ color: "#be123c" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#be123c"
                      fillOpacity={1}
                      fill="url(#colorDrinks)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Type Breakdown */}
          {typeData.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Favorite Types</h4>
              <div className="space-y-3">
                {typeData.map((item, index) => {
                  const percentage = (item.count / stats.drinks.total) * 100;
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={item.type} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium capitalize">{item.type}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {item.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden ml-5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Rated Drinks */}
          {stats.drinks.topRated.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated Sips</h4>
              <div className="space-y-2">
                {stats.drinks.topRated.slice(0, 5).map((drink, index) => (
                  <div
                    key={`${drink.name}-${drink.date}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          {drink.name}
                          {drink.producer && <span className="text-muted-foreground font-normal"> - {drink.producer}</span>}
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">

                          {drink.type && <span className="capitalize">{drink.type}</span>}
                          {drink.location && <span>• {drink.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      <span className="font-medium">{drink.rating}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Insights</h4>
              <div className="grid gap-2">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                  >
                    <insight.icon className="h-4 w-4 mt-0.5 text-rose-600 shrink-0" />
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
 * Calculate drink insights from stats
 */
function calculateDrinkInsights(stats: YearlyStats) {

  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month
  let bestMonth = { month: "", count: 0 };
  Object.entries(stats.drinks.byMonth).forEach(([monthIndex, count]) => {
    if (count > bestMonth.count) {
      bestMonth = {
        month: monthNames[parseInt(monthIndex)],
        count,
      };
    }
  });

  // Volume insights
  if (stats.drinks.total >= 100) {
    insights.push({
      icon: Wine,
      text: `A connoisseur! You logged ${stats.drinks.total} drinks this year.`,
    });
  } else if (stats.drinks.total >= 50) {
    insights.push({
      icon: Wine,
      text: `You enjoyed ${stats.drinks.total} tastings this year. Cheers!`,
    });
  }

  // Type insight
  if (stats.drinks.topTypes.length > 0) {
    const topType = stats.drinks.topTypes[0];
    if (topType.count >= 10) {
      insights.push({
        icon: GlassWater,
        text: `Your drink of choice seems to be ${topType.type} (${topType.count} tastings).`,
      });
    }
  }

  // Best month insight
  if (bestMonth.count >= 5) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your most spirited month with ${bestMonth.count} drinks logged!`,
    });
  }

  // Rating insight
  if (stats.drinks.avgRating >= 8) {
    insights.push({
      icon: Star,
      text: `You have excellent taste! Average rating of ${stats.drinks.avgRating.toFixed(1)}/10.`,
    });
  }
  
 // Location insight (new)
  if (stats.drinks.locations && stats.drinks.locations.length > 0) {
      const topLoc = stats.drinks.locations[0];
       if (topLoc.count > 3) {
           insights.push({
               icon: MapPin,
               text: `${topLoc.location} was your favorite watering hole (${topLoc.count} visits).`
           });
       }
  }

  return insights;
}
