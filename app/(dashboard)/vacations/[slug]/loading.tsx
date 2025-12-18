import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function VacationDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Skeleton className="h-10 w-40" />

      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Poster */}
      <Skeleton className="h-96 w-full rounded-lg" />

      {/* Tabs */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />

        {/* Content */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
