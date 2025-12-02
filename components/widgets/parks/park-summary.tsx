import Link from "next/link";
import { ParkContent } from "@/lib/db/parks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, TreePine } from "lucide-react";
import Image from "next/image";

interface ParkSummaryProps {
  park: ParkContent | null;
}

export function ParkSummary({ park }: ParkSummaryProps) {
  if (!park) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            Parks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">No parks found.</p>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link href="/parks">Explore Parks</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-24 w-full">
        {park.poster ? (
          <Image
            src={park.poster}
            alt={park.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <TreePine className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-white font-semibold truncate">{park.title}</h3>
          {park.state && (
            <div className="flex items-center text-white/80 text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {park.state}
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
                {park.visited ? `Visited ${park.visited}` : "Want to visit"}
            </span>
          <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
            <Link href={`/parks/${park.slug}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
