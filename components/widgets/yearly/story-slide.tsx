"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animations/animated-number";
import { fadeInUp, statReveal } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { celebrationConfetti, achievementConfetti, improvementConfetti } from "@/lib/confetti";

export type SlideType = "welcome" | "stat" | "achievement" | "comparison" | "highlight" | "share";

interface BaseSlideProps {
  type: SlideType;
  title: string;
  description?: string;
  gradient?: string;
  confetti?: boolean;
  onConfetti?: () => void;
}

interface StatSlideProps extends BaseSlideProps {
  type: "stat";
  value: number | string;
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  decimals?: number;
}

interface AchievementSlideProps extends BaseSlideProps {
  type: "achievement";
  icon: LucideIcon;
  iconColor?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface ComparisonSlideProps extends BaseSlideProps {
  type: "comparison";
  currentValue: number;
  previousValue: number;
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  isImprovement?: boolean;
}

interface HighlightSlideProps extends BaseSlideProps {
  type: "highlight";
  items: { label: string; value: string | number; icon?: LucideIcon }[];
}

interface WelcomeSlideProps extends BaseSlideProps {
  type: "welcome";
  year: number;
  userName?: string;
}

interface ShareSlideProps extends BaseSlideProps {
  type: "share";
  year: number;
}

export type StorySlideProps =
  | WelcomeSlideProps
  | StatSlideProps
  | AchievementSlideProps
  | ComparisonSlideProps
  | HighlightSlideProps
  | ShareSlideProps;

/**
 * Story Slide Component
 * Individual slide for the Story Mode experience
 */
export function StorySlide(props: StorySlideProps) {
  const gradient = props.gradient || "from-purple-900 via-blue-900 to-slate-900";

  // Trigger confetti if specified
  useEffect(() => {
    if (props.confetti) {
      const timer = setTimeout(() => {
        if (props.type === "achievement") {
          achievementConfetti();
        } else if (props.type === "comparison" && (props as ComparisonSlideProps).isImprovement) {
          improvementConfetti();
        } else {
          celebrationConfetti();
        }
        props.onConfetti?.();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [props.confetti, props.type, props.onConfetti]);

  return (
    <div className={cn("relative w-full h-full bg-gradient-to-br", gradient, "flex items-center justify-center p-8")}>
      <div className="max-w-4xl w-full">
        {props.type === "welcome" && <WelcomeSlideContent {...(props as WelcomeSlideProps)} />}
        {props.type === "stat" && <StatSlideContent {...(props as StatSlideProps)} />}
        {props.type === "achievement" && <AchievementSlideContent {...(props as AchievementSlideProps)} />}
        {props.type === "comparison" && <ComparisonSlideContent {...(props as ComparisonSlideProps)} />}
        {props.type === "highlight" && <HighlightSlideContent {...(props as HighlightSlideProps)} />}
        {props.type === "share" && <ShareSlideContent {...(props as ShareSlideProps)} />}
      </div>
    </div>
  );
}

/**
 * Welcome Slide
 */
function WelcomeSlideContent({ year, userName, title, description }: WelcomeSlideProps) {
  return (
    <div className="text-center text-white">
      <motion.div variants={fadeInUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}>
        <h1 className="text-7xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {year}
        </h1>
      </motion.div>
      <motion.div variants={fadeInUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
        <h2 className="text-3xl md:text-5xl font-semibold mb-6">{title}</h2>
      </motion.div>
      {description && (
        <motion.p
          className="text-xl md:text-2xl text-slate-300"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.6 }}
        >
          {description}
        </motion.p>
      )}
      {userName && (
        <motion.p
          className="text-lg text-slate-400 mt-4"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.8 }}
        >
          Welcome back, {userName}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Stat Slide
 */
function StatSlideContent({ title, value, label, icon, iconColor, subtitle, decimals = 0, description }: StatSlideProps) {
  const Icon = icon;

  return (
    <div className="text-center text-white">
      <motion.h2
        className="text-2xl md:text-4xl font-semibold mb-8 text-slate-300"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h2>

      {Icon && (
        <motion.div
          className={cn("flex justify-center mb-6", iconColor || "text-purple-400")}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
        >
          <Icon className="h-20 w-20 md:h-24 md:w-24" />
        </motion.div>
      )}

      <motion.div variants={statReveal} initial="hidden" animate="show" transition={{ delay: 0.6 }}>
        <div className="text-8xl md:text-9xl font-bold mb-4">
          {typeof value === "number" ? (
            <AnimatedNumber value={value} duration={2} delay={0.8} decimals={decimals} />
          ) : (
            value
          )}
        </div>
      </motion.div>

      <motion.p
        className="text-2xl md:text-3xl font-medium text-slate-300"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.2 }}
      >
        {label}
      </motion.p>

      {subtitle && (
        <motion.p
          className="text-lg md:text-xl text-slate-400 mt-4"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.4 }}
        >
          {subtitle}
        </motion.p>
      )}

      {description && (
        <motion.p
          className="text-md text-slate-400 mt-6 max-w-2xl mx-auto"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.6 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Achievement Slide
 */
function AchievementSlideContent({ title, description, icon, rarity }: AchievementSlideProps) {
  const Icon = icon;
  const rarityColors = {
    common: "from-slate-400 to-slate-600",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-400 to-purple-600",
    legendary: "from-yellow-400 to-yellow-600",
  };

  return (
    <div className="text-center text-white">
      <motion.p
        className="text-lg uppercase tracking-widest text-slate-400 mb-6"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        Achievement Unlocked
      </motion.p>

      <motion.div
        className="flex justify-center mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
      >
        <div
          className={cn(
            "p-8 rounded-full bg-gradient-to-br",
            rarity ? rarityColors[rarity] : "from-purple-400 to-purple-600"
          )}
        >
          <Icon className="h-24 w-24 md:h-32 md:w-32" />
        </div>
      </motion.div>

      <motion.h2
        className="text-4xl md:text-6xl font-bold mb-4"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.8 }}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1 }}
        >
          {description}
        </motion.p>
      )}

      {rarity && (
        <motion.div
          className={cn("inline-block mt-6 px-6 py-2 rounded-full text-sm font-semibold uppercase", `bg-gradient-to-r ${rarityColors[rarity]}`)}
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 1.2 }}
        >
          {rarity}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Comparison Slide
 */
function ComparisonSlideContent({
  title,
  description,
  currentValue,
  previousValue,
  label,
  isImprovement,
}: ComparisonSlideProps) {
  const delta = currentValue - previousValue;
  const percentChange = previousValue > 0 ? ((delta / previousValue) * 100).toFixed(0) : "100";

  return (
    <div className="text-center text-white">
      <motion.h2
        className="text-2xl md:text-4xl font-semibold mb-12 text-slate-300"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-8 items-center mb-8">
        {/* Previous Year */}
        <motion.div variants={fadeInUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}>
          <div className="text-slate-400 text-lg mb-2">Last Year</div>
          <div className="text-5xl font-bold text-slate-400">{previousValue}</div>
        </motion.div>

        {/* Arrow/Icon */}
        <motion.div
          className={cn("text-6xl", isImprovement ? "text-green-500" : "text-orange-500")}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
        >
          {isImprovement ? "↑" : "↓"}
        </motion.div>

        {/* Current Year */}
        <motion.div variants={fadeInUp} initial="hidden" animate="show" transition={{ delay: 0.8 }}>
          <div className="text-slate-300 text-lg mb-2">This Year</div>
          <div className="text-6xl font-bold">
            <AnimatedNumber value={currentValue} duration={2} delay={1} />
          </div>
        </motion.div>
      </div>

      <motion.div
        className={cn(
          "text-3xl md:text-4xl font-bold mb-4",
          isImprovement ? "text-green-500" : "text-orange-500"
        )}
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.4 }}
      >
        {isImprovement ? "+" : ""}
        {percentChange}% {isImprovement ? "growth" : "change"}
      </motion.div>

      <motion.p
        className="text-xl text-slate-300"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.6 }}
      >
        {description || label}
      </motion.p>
    </div>
  );
}

/**
 * Highlight Slide
 */
function HighlightSlideContent({ title, description, items }: HighlightSlideProps) {
  return (
    <div className="text-center text-white">
      <motion.h2
        className="text-3xl md:text-5xl font-bold mb-4"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              className="p-6 rounded-xl bg-white/10 backdrop-blur border border-white/20"
              variants={fadeInUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              {Icon && (
                <div className="flex justify-center mb-3 text-purple-400">
                  <Icon className="h-10 w-10" />
                </div>
              )}
              <div className="text-4xl font-bold mb-2">{item.value}</div>
              <div className="text-sm text-slate-300">{item.label}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Share Slide
 */
function ShareSlideContent({ title, description, year }: ShareSlideProps) {
  return (
    <div className="text-center text-white">
      <motion.h2
        className="text-4xl md:text-6xl font-bold mb-6"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto"
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.p>
      )}

      <motion.div
        className="flex flex-col items-center gap-4"
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.6 }}
      >
        <div className="text-lg text-slate-400">Share your {year} journey</div>
      </motion.div>
    </div>
  );
}
