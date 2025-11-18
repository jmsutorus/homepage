import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import type { ParkContent } from "@/lib/db/parks";
import { DBParkCategory, ParkCategoryValue } from "@/lib/db/enums/park-enums";

interface ParkCardProps {
  park: ParkContent;
}

export function ParkCard({ park }: ParkCardProps) {
  const href = `/parks/${park.slug}`;

  // Category color mapping
  const categoryColors: Record<ParkCategoryValue, string> = {
    [DBParkCategory.NationalPark]: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    [DBParkCategory.StatePark]: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    [DBParkCategory.Wilderness]: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
    [DBParkCategory.Monument]: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
    [DBParkCategory.RecreationArea]: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
    [DBParkCategory.CityPark]: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
    [DBParkCategory.NationalSeashore]: "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20",
    [DBParkCategory.NationalForest]: "bg-lime-500/10 text-lime-500 hover:bg-lime-500/20",
    [DBParkCategory.Other]: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  };

  return (
    <Link href={href} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Image */}
        {park.poster && (
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={park.poster}
              alt={park.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <CardContent className="p-4 space-y-2">
          {/* Title */}
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {park.title}
          </h3>

          {/* Category and Rating */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={categoryColors[park.category] || categoryColors[DBParkCategory.Other]}
            >
              {park.category}
            </Badge>

            {park.rating !== null && park.rating !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{park.rating}</span>
              </div>
            )}
          </div>

          {/* State */}
          {park.state && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{park.state}</span>
            </div>
          )}

          {/* Tags */}
          {park.tags && park.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {park.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {park.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{park.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Visited Date */}
          {park.visited && (
            <p className="text-xs text-muted-foreground">
              Visited: {new Date(park.visited).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
