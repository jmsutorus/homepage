import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-7xl">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 sm:p-4 rounded-lg border bg-card">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Parks Grid Skeleton */}
      <div className="space-y-6 sm:space-y-8">
        {Array.from({ length: 2 }).map((_, categoryIndex) => (
          <div key={categoryIndex}>
            <Skeleton className="h-8 w-48 mb-3 sm:mb-4" />
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, parkIndex) => (
                <div key={parkIndex} className="rounded-lg border bg-card overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                    <Skeleton className="h-4 w-1/2" />
                    <div className="pt-2 flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
