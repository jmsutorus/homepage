"use client";

import { DinnerIcon } from "./date-icons/dinner-icon";
import { MovieIcon } from "./date-icons/movie-icon";
import { ActivityIcon } from "./date-icons/activity-icon";
import { OutingIcon } from "./date-icons/outing-icon";
import { ConcertIcon } from "./date-icons/concert-icon";
import { EventIcon } from "./date-icons/event-icon";
import { OtherIcon } from "./date-icons/other-icon";

interface DateTypeIconProps {
  type: string;
  className?: string;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  dinner: DinnerIcon,
  movie: MovieIcon,
  activity: ActivityIcon,
  outing: OutingIcon,
  concert: ConcertIcon,
  event: EventIcon,
  other: OtherIcon,
};

export function DateTypeIcon({ type, className }: DateTypeIconProps) {
  const IconComponent = iconMap[type.toLowerCase()] || OtherIcon;

  return <IconComponent className={className} />;
}
