"use client";

import { motion } from "framer-motion";
import { Achievement, getRarityColor, getRarityBackground } from "@/lib/data/yearly-achievements";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeUnlock, cardEntrance } from "@/lib/animation-variants";
import { Progress } from "@/components/ui/progress";

interface AchievementBadgeProps {
  achievement: Achievement;
  delay?: number;
  onClick?: () => void;
  showProgress?: boolean;
}

/**
 * Achievement Badge Component
 * Displays a single achievement with unlock status and progress
 */
export function AchievementBadge({
  achievement,
  delay = 0,
  onClick,
  showProgress = true,
}: AchievementBadgeProps) {
  const Icon = achievement.icon;
  const isUnlocked = achievement.unlocked;

  return (
    <motion.div
      variants={isUnlocked ? badgeUnlock : cardEntrance}
      initial="hidden"
      animate="show"
      custom={delay}
      whileHover={{ scale: 1.05, y: -5 }}
      className={cn(
        "relative p-4 rounded-xl border cursor-pointer transition-all",
        isUnlocked
          ? `${getRarityBackground(achievement.rarity)} border-opacity-50`
          : "bg-muted/50 border-muted",
        onClick && "hover:shadow-lg"
      )}
      onClick={onClick}
    >
      {/* Rarity indicator */}
      <div
        className={cn(
          "absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
          getRarityColor(achievement.rarity),
          getRarityBackground(achievement.rarity)
        )}
      >
        {achievement.rarity}
      </div>

      {/* Icon */}
      <div
        className={cn(
          "mb-3 flex items-center justify-center",
          isUnlocked ? getRarityColor(achievement.rarity) : "text-muted-foreground/50"
        )}
      >
        {isUnlocked ? (
          <Icon className="h-12 w-12" />
        ) : (
          <div className="relative">
            <Icon className="h-12 w-12 opacity-30" />
            <Lock className="absolute inset-0 m-auto h-6 w-6" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-semibold text-center mb-1",
          isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {achievement.name}
      </h3>

      {/* Description */}
      <p
        className={cn(
          "text-xs text-center mb-2",
          isUnlocked ? "text-muted-foreground" : "text-muted-foreground/70"
        )}
      >
        {achievement.description}
      </p>

      {/* Progress bar (for locked achievements) */}
      {!isUnlocked && showProgress && achievement.progress !== undefined && (
        <div className="mt-3">
          <Progress value={achievement.progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-center mt-1">
            {achievement.progress.toFixed(0)}%
          </p>
        </div>
      )}

      {/* Glow effect for legendary */}
      {isUnlocked && achievement.rarity === "legendary" && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-yellow-500/10"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Achievement Grid
 * Displays a grid of achievement badges
 */
interface AchievementGridProps {
  achievements: Achievement[];
  columns?: 2 | 3 | 4 | 5;
  showProgress?: boolean;
}

export function AchievementGrid({
  achievements,
  columns = 4,
  showProgress = true,
}: AchievementGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns])}>
      {achievements.map((achievement, index) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          delay={index * 0.05}
          showProgress={showProgress}
        />
      ))}
    </div>
  );
}

/**
 * Achievement Summary
 * Shows overall achievement stats
 */
interface AchievementSummaryProps {
  total: number;
  unlocked: number;
  byRarity: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

export function AchievementSummary({ total, unlocked, byRarity }: AchievementSummaryProps) {
  const percentage = total > 0 ? (unlocked / total) * 100 : 0;

  return (
    <motion.div
      className="rounded-xl border bg-card p-6"
      variants={cardEntrance}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Achievement Progress</h3>
        <div className="text-2xl font-bold">
          {unlocked}/{total}
        </div>
      </div>

      <Progress value={percentage} className="h-3 mb-4" />

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-lg bg-slate-500/10">
          <div className="text-lg font-bold text-slate-400">{byRarity.common}</div>
          <div className="text-xs text-muted-foreground">Common</div>
        </div>
        <div className="p-2 rounded-lg bg-blue-500/10">
          <div className="text-lg font-bold text-blue-500">{byRarity.rare}</div>
          <div className="text-xs text-muted-foreground">Rare</div>
        </div>
        <div className="p-2 rounded-lg bg-purple-500/10">
          <div className="text-lg font-bold text-purple-500">{byRarity.epic}</div>
          <div className="text-xs text-muted-foreground">Epic</div>
        </div>
        <div className="p-2 rounded-lg bg-yellow-500/10">
          <div className="text-lg font-bold text-yellow-500">{byRarity.legendary}</div>
          <div className="text-xs text-muted-foreground">Legendary</div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Achievement Category Filter
 */
interface AchievementCategoryFilterProps {
  categories: Achievement["category"][];
  selected: Achievement["category"] | "all";
  onSelect: (category: Achievement["category"] | "all") => void;
}

export function AchievementCategoryFilter({
  categories,
  selected,
  onSelect,
}: AchievementCategoryFilterProps) {
  const allCategories: (Achievement["category"] | "all")[] = ["all", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
            selected === category
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
