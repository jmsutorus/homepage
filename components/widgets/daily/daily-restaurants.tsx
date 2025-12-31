"use client";

import { useRouter } from "next/navigation";
import { UtensilsCrossed, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CalendarRestaurantVisit } from "@/lib/db/calendar";

interface DailyRestaurantsProps {
  visits: CalendarRestaurantVisit[];
}

export function DailyRestaurants({ visits }: DailyRestaurantsProps) {
  const router = useRouter();

  const handleClick = (slug: string) => {
    router.push(`/restaurants/${slug}`);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <UtensilsCrossed className="h-4 w-4" />
        Restaurants ({visits.length})
      </h3>
      <div className="space-y-2">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="pl-6 border-l-2 border-orange-500 cursor-pointer hover:bg-accent/50 rounded-r-md transition-colors -ml-1 pl-7 py-2"
            onClick={() => handleClick(visit.restaurantSlug)}
          >
            <p className="font-medium text-orange-700 dark:text-orange-400">
              {visit.restaurantName}
            </p>
            <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
              {visit.cuisine && (
                <Badge variant="outline" className="text-xs">
                  {visit.cuisine}
                </Badge>
              )}
              {visit.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  {visit.rating}/10
                </span>
              )}
              {visit.notes && (
                <span className="line-clamp-1">{visit.notes}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
