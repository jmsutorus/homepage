"use client";

import { TurkeyIcon } from "./turkey-icon";
import { ChristmasTreeIcon } from "./christmas-tree-icon";
import { FireworkIcon } from "./firework-icon";
import { BirthdayIcon } from "./birthday-icon";
import { WeddingIcon } from "./wedding-icon";
import { AnniversaryIcon } from "./anniversary-icon";
import { VeteransIcon } from "./veterans-icon";
import { LaborDayIcon } from "./labor-day-icon";

interface HolidayIconProps {
  type: string;
  className?: string;
}

// Holiday keyword to icon component mapping
const HOLIDAY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  // Major holidays
  "thanksgiving": TurkeyIcon,
  "christmas": ChristmasTreeIcon,
  "new year": FireworkIcon,
  "independence day": FireworkIcon,
  "july 4": FireworkIcon,
  "4th of july": FireworkIcon,
  "veterans day": VeteransIcon,
  "labor day": LaborDayIcon,
  
  // Personal celebrations
  "birthday": BirthdayIcon,
  "wedding": WeddingIcon,
  "anniversary": AnniversaryIcon,
};

/**
 * Checks if a title contains a holiday keyword and returns the appropriate icon
 */
export function getHolidayIconType(title: string): string | null {
  const lowerTitle = title.toLowerCase();
  for (const keyword of Object.keys(HOLIDAY_ICONS)) {
    if (lowerTitle.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

/**
 * Returns the holiday icon component for a given title
 */
export function HolidayIcon({ type, className }: HolidayIconProps) {
  const lowerType = type.toLowerCase();
  
  // Find matching icon
  for (const [keyword, IconComponent] of Object.entries(HOLIDAY_ICONS)) {
    if (lowerType.includes(keyword)) {
      return <IconComponent className={className} />;
    }
  }
  
  return null;
}

/**
 * Checks if a title should show a holiday icon
 */
export function hasHolidayIcon(title: string): boolean {
  return getHolidayIconType(title) !== null;
}
