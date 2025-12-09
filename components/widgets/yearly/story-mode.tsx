"use client";

import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { StorySlide, StorySlideProps } from "./story-slide";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { YearlyStats } from "@/lib/data/yearly-data";
import { generateYearlyInsights, getYearSummary } from "@/lib/data/yearly-insights";
import { getYearlyAchievements } from "@/lib/data/yearly-achievements";
import { storyCompleteConfetti } from "@/lib/confetti";

interface StoryModeProps {
  stats: YearlyStats;
  year: number;
  previousYearStats?: YearlyStats;
  onClose: () => void;
  onShare?: () => void;
}

/**
 * Story Mode Component
 * Full-screen Spotify Wrapped-style experience
 */
export function StoryMode({ stats, year, previousYearStats, onClose, onShare }: StoryModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Generate slides from data
  const slides = generateSlides(stats, year, previousYearStats);
  const totalSlides = slides.length;

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      // Reached the end
      storyCompleteConfetti();
    }
  }, [currentSlide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Track mounted state for portal
  useLayoutEffect(() => {
    queueMicrotask(() => setMounted(true));
    // Prevent body scroll when story mode is active
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentSlide < totalSlides - 1) {
        nextSlide();
      } else {
        setIsPlaying(false);
      }
    }, 4000); // 4 seconds per slide

    return () => clearTimeout(timer);
  }, [isPlaying, currentSlide, totalSlides, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }, [currentSlide]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Don't render on server or before mount
  if (!mounted) return null;

  const storyModeContent = (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {/* Navigation Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <span className="text-white text-sm font-medium">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-20 left-0 right-0 z-10 px-4">
        <div className="flex gap-1 max-w-4xl mx-auto">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-1 flex-1 rounded-full transition-all",
                index <= currentSlide ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
        </div>
      </div>

      {/* Slide Content */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={{
            enter: (direction: number) => ({
              x: direction > 0 ? "100%" : "-100%",
              opacity: 0,
            }),
            center: {
              x: 0,
              opacity: 1,
            },
            exit: (direction: number) => ({
              x: direction < 0 ? "100%" : "-100%",
              opacity: 0,
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <StorySlide {...slides[currentSlide]} />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center gap-4">
        {currentSlide > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}
        {currentSlide < totalSlides - 1 ? (
          <Button
            onClick={nextSlide}
            className="bg-white text-black hover:bg-white/90 px-8"
          >
            Next
          </Button>
        ) : (
          <div className="flex gap-2">
            {onShare && (
              <Button
                onClick={onShare}
                className="bg-purple-600 text-white hover:bg-purple-700 px-8"
              >
                Share
              </Button>
            )}
            <Button
              onClick={onClose}
              className="bg-white text-black hover:bg-white/90 px-8"
            >
              View Dashboard
            </Button>
          </div>
        )}
        {currentSlide < totalSlides - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="text-white hover:bg-white/20 h-12 w-12"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}
      </div>

      {/* Click areas for navigation (mobile) */}
      <div className="absolute inset-0 flex">
        <div
          className="flex-1 cursor-pointer"
          onClick={prevSlide}
          style={{ visibility: currentSlide > 0 ? "visible" : "hidden" }}
        />
        <div
          className="flex-1 cursor-pointer"
          onClick={nextSlide}
          style={{ visibility: currentSlide < totalSlides - 1 ? "visible" : "hidden" }}
        />
      </div>
    </div>
  );

  return createPortal(storyModeContent, document.body);
}

/**
 * Generate slides from yearly stats
 */
function generateSlides(
  stats: YearlyStats,
  year: number,
  previousYearStats?: YearlyStats
): StorySlideProps[] {
  const slides: StorySlideProps[] = [];

  // 1. Welcome Slide
  slides.push({
    type: "welcome",
    title: "Year in Review",
    description: "A journey through your year",
    year,
    gradient: "from-purple-900 via-blue-900 to-slate-900",
  });

  // 2. Year Summary
  const summary = getYearSummary(stats);
  slides.push({
    type: "stat",
    title: "Your Year at a Glance",
    value: stats.media.total + stats.parks.total + stats.exercises.total + stats.journals.total + stats.tasks.completed + stats.goals.completed,
    label: "Total Activities",
    description: "Across all categories",
    gradient: "from-blue-900 via-purple-900 to-pink-900",
    confetti: true,
  });

  // 3. Top Stats
  if (stats.tasks.completed > 0) {
    slides.push({
      type: "stat",
      title: "You were productive",
      value: stats.tasks.completed,
      label: "Tasks Completed",
      subtitle: `${stats.tasks.completionRate.toFixed(0)}% completion rate`,
      gradient: "from-blue-900 via-cyan-900 to-teal-900",
      confetti: stats.tasks.completed >= 100,
    });
  }

  if (stats.media.total > 0) {
    slides.push({
      type: "stat",
      title: "Culture Consumer",
      value: stats.media.total,
      label: "Pieces of Media",
      subtitle: `${stats.media.averageRating.toFixed(1)} average rating`,
      gradient: "from-purple-900 via-pink-900 to-rose-900",
    });
  }

  if (stats.exercises.total > 0) {
    const hours = Math.round(stats.exercises.totalDuration / 60);
    slides.push({
      type: "stat",
      title: "Fitness Journey",
      value: stats.exercises.total,
      label: "Workouts",
      subtitle: `${hours} hours of activity`,
      gradient: "from-orange-900 via-red-900 to-pink-900",
      confetti: stats.exercises.total >= 100,
    });
  }

  if (stats.journals.total > 0) {
    slides.push({
      type: "stat",
      title: "Self Reflection",
      value: stats.journals.total,
      label: "Journal Entries",
      subtitle: "Taking time for yourself",
      gradient: "from-indigo-900 via-purple-900 to-violet-900",
      confetti: stats.journals.total >= 365,
    });
  }

  if (stats.mood.totalEntries > 0) {
    slides.push({
      type: "stat",
      title: "Mood Tracking",
      value: stats.mood.average,
      label: "Average Mood",
      subtitle: `${stats.mood.totalEntries} days logged`,
      decimals: 1,
      gradient: "from-yellow-900 via-amber-900 to-orange-900",
    });
  }

  if (stats.parks.total > 0) {
    slides.push({
      type: "stat",
      title: "Nature Explorer",
      value: stats.parks.total,
      label: "Parks Visited",
      subtitle: `${stats.parks.states.length} states explored`,
      gradient: "from-green-900 via-emerald-900 to-teal-900",
    });
  }

  if (stats.goals.completed > 0) {
    slides.push({
      type: "stat",
      title: "Goal Achievement",
      value: stats.goals.completed,
      label: "Goals Completed",
      subtitle: `${stats.goals.inProgress} still in progress`,
      gradient: "from-purple-900 via-fuchsia-900 to-pink-900",
      confetti: stats.goals.completed >= 10,
    });
  }

  // 4. Achievements
  const achievements = getYearlyAchievements(stats);
  const unlockedAchievements = achievements.filter((a) => a.unlocked);

  if (unlockedAchievements.length > 0) {
    // Show top 3 achievements
    const topAchievements = unlockedAchievements
      .sort((a, b) => {
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      })
      .slice(0, 3);

    topAchievements.forEach((achievement) => {
      slides.push({
        type: "achievement",
        title: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        gradient: "from-slate-900 via-purple-900 to-slate-900",
        confetti: achievement.rarity === "epic" || achievement.rarity === "legendary",
      });
    });
  }

  // 5. Year-over-year comparisons
  if (previousYearStats) {
    const insights = generateYearlyInsights(stats, previousYearStats);
    const comparisons = insights.filter((i) => i.type === "comparison");

    comparisons.forEach((comparison) => {
      if (comparison.type === "comparison") {
        // This is just for TypeScript narrowing
        slides.push({
          type: "comparison",
          title: comparison.title,
          description: comparison.description,
          currentValue: 0, // Would need to extract from description
          previousValue: 0,
          label: "",
          gradient: "from-blue-900 via-indigo-900 to-purple-900",
          isImprovement: comparison.icon.name === "TrendingUp",
          confetti: comparison.confetti,
        });
      }
    });
  }

  // 6. Highlights
  const highlights = generateYearlyInsights(stats).filter((i) => i.type === "highlight");
  if (highlights.length > 0) {
    const topHighlight = highlights[0];
    slides.push({
      type: "stat",
      title: topHighlight.title,
      value: "🎉",
      label: topHighlight.description,
      gradient: "from-pink-900 via-purple-900 to-indigo-900",
    });
  }

  // 7. Share Slide
  slides.push({
    type: "share",
    title: "Share Your Year",
    description: "Let the world see your achievements",
    year,
    gradient: "from-purple-900 via-blue-900 to-slate-900",
  });

  return slides;
}

/**
 * Story Mode Trigger Button
 */
interface StoryModeButtonProps {
  onClick: () => void;
  className?: string;
}

export function StoryModeButton({ onClick, className }: StoryModeButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold gap-2",
        className
      )}
    >
      <Play className="h-5 w-5" />
      Watch Story
    </Button>
  );
}
