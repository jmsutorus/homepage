import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      {/* Fun Facts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-l-4 border-l-muted">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-5 w-24" />
        </div>
        
        {/* Achievement Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-32">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full space-y-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline Skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card className="h-64">
            <CardContent className="p-6 flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
