import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickLinks } from "@/components/widgets/quick-links";
import { getAllMediaItems } from "@/lib/mdx";
import { MediaCard } from "@/components/widgets/media-card";
import { ExerciseStats } from "@/components/widgets/exercise-stats";
import { ExerciseCharts } from "@/components/widgets/exercise-charts";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  // Get recent media (last 4 items)
  const recentMedia = getAllMediaItems().slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your personal homepage
        </p>
      </div>

      {/* Quick Links */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Quick Links</h2>
        </div>
        <QuickLinks />
      </section>

      {/* Recent Media */}
      {recentMedia.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Media</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/media">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {recentMedia.map((item) => (
              <MediaCard key={`${item.frontmatter.type}-${item.slug}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Exercise Stats */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Exercise</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ExerciseStats />
          <ExerciseCharts />
        </div>
      </section>

      {/* Widget Placeholders */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Coming Soon</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Steam Widget */}
          <Card>
            <CardHeader>
              <CardTitle>Steam</CardTitle>
              <CardDescription>Gaming activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Steam status coming in Phase 4...
              </p>
            </CardContent>
          </Card>

          {/* Plex Widget */}
          <Card>
            <CardHeader>
              <CardTitle>Plex Server</CardTitle>
              <CardDescription>Media server status</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Server status coming in Phase 4...
              </p>
            </CardContent>
          </Card>

          {/* Home Assistant Widget */}
          <Card>
            <CardHeader>
              <CardTitle>Home Assistant</CardTitle>
              <CardDescription>Smart home sensors</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sensor data coming in Phase 4...
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
