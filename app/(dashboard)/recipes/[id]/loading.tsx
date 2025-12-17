import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MealDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Banner Skeleton */}
      <div className="relative h-48 sm:h-64 md:h-80 bg-muted" />

      {/* Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Title Card Skeleton */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <div className="flex gap-4 mt-6 pt-4 border-t">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>

          {/* Two Column Skeleton */}
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-28" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-16 flex-1" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-16 flex-1" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-16 flex-1" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
