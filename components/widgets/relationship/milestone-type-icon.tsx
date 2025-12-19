"use client";

import { HeartHandshake, Sparkles, Trophy, Star, Bookmark, Flag, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

interface MilestoneTypeIconProps extends LucideProps {
  category: string;
}

export function MilestoneTypeIcon({ category, className, ...props }: MilestoneTypeIconProps) {
  const getIcon = () => {
    switch (category.toLowerCase()) {
      case "anniversary":
        return HeartHandshake;
      case "first":
        return Sparkles;
      case "achievement":
        return Trophy;
      case "special":
        return Star;
      case "other":
      default:
        return Bookmark;
    }
  };

  const Icon = getIcon();

  return <Icon className={cn("h-4 w-4", className)} {...props} />;
}
