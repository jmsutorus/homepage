import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MediaCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="relative aspect-[2/3] w-full" />

      <CardContent className="p-4 space-y-2">
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4" />

        {/* Status and Rating skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
        </div>

        {/* Genres skeleton */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Date skeleton */}
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Renders a grid of skeleton cards
 */
export function MediaGridSkeleton({ count = 25 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}
