import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <Skeleton className="h-8 w-32 sm:w-48 mb-2" />
        <Skeleton className="h-4 w-64 sm:w-96" />
      </div>

      <div className="space-y-4">
        {/* Calendar Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[140px]" />
            <div className="flex items-center rounded-md border p-1">
              <Skeleton className="h-8 w-8 rounded-sm" />
              <Skeleton className="h-8 w-8 rounded-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-[100px]" />
            <Skeleton className="h-10 w-full sm:w-[100px]" />
          </div>
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="rounded-md border">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b p-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            ))}
          </div>
          
          {/* Calendar Cells */}
          <div className="grid grid-cols-7 h-[600px]">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="border-b border-r p-2 min-h-[100px] relative">
                <Skeleton className="h-4 w-4 mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-3 w-2/3 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
