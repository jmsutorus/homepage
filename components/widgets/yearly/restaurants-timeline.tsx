"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { UtensilsCrossed, Star, TrendingUp, MapPin } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface RestaurantsTimelineProps {
  stats: YearlyStats;
}

/**
 * Restaurants Timeline Component
 * Visualizes restaurant visits and dining experiences through the year
 */
export function RestaurantsTimeline({ stats }: RestaurantsTimelineProps) {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Transform monthly activity data for restaurants visualization
  const monthlyData = monthNames.map((name, index) => ({
    name,
    count: stats.restaurants.byMonth[index] || 0,
  }));

  // Calculate insights
  const insights = calculateRestaurantInsights(stats);

  // Prepare cuisine data for display
  const cuisineData = stats.restaurants.topCuisines.slice(0, 5);

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              <CardTitle>Restaurants & Dining</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.restaurants.totalVisits} visits
            </div>
          </div>
          <CardDescription>
            Your dining adventures through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Visits</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.restaurants.totalVisits}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {(stats.restaurants.totalVisits / 12).toFixed(1)} per month
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                <div className="text-sm font-medium text-muted-foreground">Unique Restaurants</div>
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {stats.restaurants.uniqueRestaurants}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Different places tried
              </div>
            </div>

            {stats.restaurants.avgRating > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-lime-50 dark:from-yellow-950/20 dark:to-lime-950/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="text-sm font-medium text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.restaurants.avgRating.toFixed(1)}/10
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Across rated visits
                </div>
              </div>
            )}
          </div>

          {/* Monthly Visits Trend */}
          {stats.restaurants.totalVisits > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Monthly Visits</h4>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorRestaurants" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
                      itemStyle={{ color: "#f97316" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#f97316"
                      fillOpacity={1}
                      fill="url(#colorRestaurants)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Cuisine Breakdown */}
          {cuisineData.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Cuisines</h4>
              <div className="space-y-3">
                {cuisineData.map((item, index) => {
                  const percentage = (item.count / stats.restaurants.totalVisits) * 100;
                  const color = COLORS[index % COLORS.length];

                  return (
                    <div key={item.cuisine} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{item.cuisine}</span>
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

          {/* Top Rated Restaurants */}
          {stats.restaurants.topRated.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Rated Visits</h4>
              <div className="space-y-2">
                {stats.restaurants.topRated.slice(0, 5).map((visit, index) => (
                  <div
                    key={`${visit.name}-${visit.visitDate}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{visit.name}</div>
                        {visit.cuisine && (
                          <div className="text-xs text-muted-foreground">{visit.cuisine}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      <span className="font-medium">{visit.rating}/10</span>
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
                    <insight.icon className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
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
 * Calculate restaurant insights from stats
 */
function calculateRestaurantInsights(stats: YearlyStats) {

  const insights: Array<{ icon: any; text: string }> = [];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Find best month
  let bestMonth = { month: "", count: 0 };
  Object.entries(stats.restaurants.byMonth).forEach(([monthIndex, count]) => {
    if (count > bestMonth.count) {
      bestMonth = {
        month: monthNames[parseInt(monthIndex)],
        count,
      };
    }
  });

  // Volume insights
  if (stats.restaurants.totalVisits >= 50) {
    insights.push({
      icon: UtensilsCrossed,
      text: `You dined out ${stats.restaurants.totalVisits} times this year! You're a true foodie!`,
    });
  } else if (stats.restaurants.totalVisits >= 24) {
    insights.push({
      icon: UtensilsCrossed,
      text: `${stats.restaurants.totalVisits} restaurant visits - almost twice a month on average!`,
    });
  } else if (stats.restaurants.totalVisits >= 12) {
    insights.push({
      icon: UtensilsCrossed,
      text: `You visited restaurants ${stats.restaurants.totalVisits} times this year.`,
    });
  }

  // Variety insight
  if (stats.restaurants.uniqueRestaurants >= 20) {
    insights.push({
      icon: MapPin,
      text: `You tried ${stats.restaurants.uniqueRestaurants} different restaurants! Great variety!`,
    });
  } else if (stats.restaurants.uniqueRestaurants >= 10) {
    insights.push({
      icon: MapPin,
      text: `${stats.restaurants.uniqueRestaurants} unique restaurants visited this year.`,
    });
  }

  // Top cuisine insight
  if (stats.restaurants.topCuisines.length > 0) {
    const topCuisine = stats.restaurants.topCuisines[0];
    if (topCuisine.count >= 5) {
      insights.push({
        icon: Star,
        text: `${topCuisine.cuisine} was your favorite cuisine with ${topCuisine.count} visits.`,
      });
    }
  }

  // Best month insight
  if (bestMonth.count >= 5) {
    insights.push({
      icon: TrendingUp,
      text: `${bestMonth.month} was your peak dining month with ${bestMonth.count} visits!`,
    });
  } else if (bestMonth.count >= 3) {
    insights.push({
      icon: TrendingUp,
      text: `Most restaurant visits were in ${bestMonth.month} (${bestMonth.count} visits).`,
    });
  }

  // Rating insight
  if (stats.restaurants.avgRating >= 8) {
    insights.push({
      icon: Star,
      text: `Average rating of ${stats.restaurants.avgRating.toFixed(1)}/10 - you know how to pick great spots!`,
    });
  }

  return insights;
}
