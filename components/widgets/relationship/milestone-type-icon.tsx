"use client";

import { HeartHandshake, Sparkles, Trophy, Star, Bookmark, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneTypeIconProps extends LucideProps {
  category: string;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  anniversary: HeartHandshake,
  first: Sparkles,
  achievement: Trophy,
  special: Star,
  other: Bookmark,
};

export function MilestoneTypeIcon({ category, className, ...props }: MilestoneTypeIconProps) {
  const Icon = iconMap[category.toLowerCase()] || Bookmark;

  return <Icon className={cn("h-4 w-4", className)} {...props} />;
}
