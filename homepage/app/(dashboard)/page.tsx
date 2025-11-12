import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuickLinks } from "@/components/widgets/quick-links";
import { getAllMediaItems } from "@/lib/media";
import { MediaCard } from "@/components/widgets/media-card";
import { SteamStatus } from "@/components/widgets/steam-status";
import { HomeAssistantWidget } from "@/components/widgets/home-assistant-widget";
import { PlexStatus } from "@/components/widgets/plex-status";
import { MoodMonthView } from "@/components/widgets/mood-month-view";
import { RecentTasks } from "@/components/widgets/recent-tasks";
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

      {/* Mood Tracker & Recent Tasks */}
      <section className="grid gap-4 md:grid-cols-2">
        <MoodMonthView />
        <RecentTasks />
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

      {/* Gaming & Services */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Gaming & Services</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Steam Widget */}
          <SteamStatus />

          {/* Plex Widget */}
          <PlexStatus />

          {/* Home Assistant Widget */}
          <HomeAssistantWidget />
        </div>
      </section>
    </div>
  );
}
