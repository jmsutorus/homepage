import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="space-y-6">
        {/* Tabs Skeleton */}
        <div className="border-b">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Heatmap Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
