"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { YearlyStats } from "@/lib/data/yearly-data";
import { UtensilsCrossed, TrendingUp, Calendar, BookOpen, Sparkles, ChefHat } from "lucide-react";
import { cardEntrance } from "@/lib/animation-variants";

interface MealsTimelineProps {
  stats: YearlyStats;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Meals Timeline Component
 * Visualizes meal logging journey through the year
 */
export function MealsTimeline({ stats }: MealsTimelineProps) {
  // Get days in each month for the year
  const getDaysInMonth = (monthIndex: number, year: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  // Maximum meals per day is 3 (breakfast, lunch, dinner)
  const getMaxMealsInMonth = (monthIndex: number, year: number) => {
    return getDaysInMonth(monthIndex, year) * 3;
  };

  // Prepare monthly data
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: MONTH_NAMES[i],
    count: stats.meals.byMonth[i] || 0,
    maxMeals: getMaxMealsInMonth(i, stats.year),
    daysInMonth: getDaysInMonth(i, stats.year),
  }));

  // Calculate insights
  const insights = calculateMealsInsights(stats);

  // Calculate percentage of potential meals logged
  const totalPossibleMeals = 365 * 3;
  const yearPercentage = ((stats.meals.total / totalPossibleMeals) * 100).toFixed(1);

  return (
    <motion.div variants={cardEntrance} initial="hidden" animate="show">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              <CardTitle>Meals & Recipes</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.meals.total} meals logged
            </div>
          </div>
          <CardDescription>
            Your meal tracking journey through {stats.year}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                <div className="text-sm font-medium text-muted-foreground">Total Meals</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.meals.total}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {yearPercentage}% of possible
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-purple-500" />
                <div className="text-sm font-medium text-muted-foreground">Unique Recipes</div>
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.meals.uniqueRecipes}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                recipes used
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <div className="text-sm font-medium text-muted-foreground">Days Tracked</div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.meals.daysWithMeals}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                days with meals
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <div className="text-sm font-medium text-muted-foreground">Avg per Day</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.meals.daysWithMeals > 0 
                  ? (stats.meals.total / stats.meals.daysWithMeals).toFixed(1) 
                  : "0"}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                meals per tracked day
              </div>
            </div>
          </div>

          {/* Meal Type Breakdown */}
          <div>
            <h4 className="text-sm font-semibold mb-3">By Meal Type</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.meals.byType.breakfast}
                </div>
                <div className="text-sm text-muted-foreground">Breakfasts</div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.meals.byType.lunch}
                </div>
                <div className="text-sm text-muted-foreground">Lunches</div>
              </div>
              <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.meals.byType.dinner}
                </div>
                <div className="text-sm text-muted-foreground">Dinners</div>
              </div>
            </div>
          </div>

          {/* Top Recipes */}
          {stats.meals.topRecipes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Recipes</h4>
              <div className="space-y-2">
                {stats.meals.topRecipes.map((recipe, index) => {
                  const percentage = (recipe.count / stats.meals.total) * 100;
                  return (
                    <div key={recipe.name} className="flex items-center gap-3">
                      <div className="w-6 text-sm text-muted-foreground font-medium">
                        {index + 1}.
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{recipe.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">{recipe.count}x</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Monthly Activity Chart */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Meals by Month</h4>
            <div className="space-y-2">
              {monthlyData.map((item, index) => {
                // Percentage based on maximum possible meals (3 per day)
                const percentage = (item.count / item.maxMeals) * 100;
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <div className="w-8 text-sm text-muted-foreground font-medium">
                      {item.month}
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + index * 0.05 }}
                      />
                    </div>
                    <div className="w-12 text-sm text-right font-medium">
                      {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
 * Calculate meal insights from stats
 */
function calculateMealsInsights(stats: YearlyStats) {
  const insights: Array<{ icon: typeof UtensilsCrossed; text: string }> = [];

  // Total meals insights
  if (stats.meals.total >= 500) {
    insights.push({
      icon: Sparkles,
      text: `You logged ${stats.meals.total} meals this year! That's incredible dedication to meal tracking.`,
    });
  } else if (stats.meals.total >= 200) {
    insights.push({
      icon: TrendingUp,
      text: `${stats.meals.total} meals tracked - you're keeping a great record of your eating habits!`,
    });
  } else if (stats.meals.total >= 50) {
    insights.push({
      icon: UtensilsCrossed,
      text: `You tracked ${stats.meals.total} meals this year.`,
    });
  }

  // Unique recipes insight
  if (stats.meals.uniqueRecipes >= 50) {
    insights.push({
      icon: ChefHat,
      text: `With ${stats.meals.uniqueRecipes} unique recipes, you've got quite the diverse menu!`,
    });
  } else if (stats.meals.uniqueRecipes >= 20) {
    insights.push({
      icon: BookOpen,
      text: `You used ${stats.meals.uniqueRecipes} different recipes throughout the year.`,
    });
  }

  // Day tracking insights
  if (stats.meals.daysWithMeals >= 300) {
    insights.push({
      icon: Calendar,
      text: `Meal tracking on ${stats.meals.daysWithMeals} days - that's ${((stats.meals.daysWithMeals / 365) * 100).toFixed(0)}% of the year!`,
    });
  } else if (stats.meals.daysWithMeals >= 100) {
    insights.push({
      icon: Calendar,
      text: `You tracked meals on ${stats.meals.daysWithMeals} days this year.`,
    });
  }

  // Meal type balance
  const { breakfast, lunch, dinner } = stats.meals.byType;
  const total = breakfast + lunch + dinner;
  if (total > 0) {
    const dinnerPercentage = (dinner / total) * 100;
    const breakfastPercentage = (breakfast / total) * 100;
    
    if (dinnerPercentage > 50) {
      insights.push({
        icon: UtensilsCrossed,
        text: `Dinner was your most tracked meal at ${dinnerPercentage.toFixed(0)}% of all meals.`,
      });
    } else if (breakfastPercentage > 40) {
      insights.push({
        icon: UtensilsCrossed,
        text: `You're a breakfast person! ${breakfastPercentage.toFixed(0)}% of your tracked meals were breakfast.`,
      });
    }
  }

  // Top recipe insight
  if (stats.meals.topRecipes.length > 0) {
    const topRecipe = stats.meals.topRecipes[0];
    if (topRecipe.count >= 20) {
      insights.push({
        icon: Sparkles,
        text: `"${topRecipe.name}" was your go-to recipe, appearing ${topRecipe.count} times!`,
      });
    } else if (topRecipe.count >= 10) {
      insights.push({
        icon: ChefHat,
        text: `Your favorite recipe was "${topRecipe.name}" with ${topRecipe.count} appearances.`,
      });
    }
  }

  return insights;
}
