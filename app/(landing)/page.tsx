import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Activity, Smile, Film, CheckSquare, Trees } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center space-y-10 py-24 md:py-32 lg:py-40 text-center px-4">
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your Personal Life Dashboard
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Track your mood, media, exercise, and tasks in one beautiful, centralized place. 
            Take control of your data and your day.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
          <Link href="/sign-up">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-12">
              Get Started
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-12">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-12 md:py-24 lg:py-32 px-4 md:px-6 bg-muted/50 rounded-3xl mb-12">
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <Calendar className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sync with Google Calendar to see your upcoming events and schedule at a glance.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <Smile className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Mood Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Log your daily mood and visualize trends over time to understand your well-being.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <Film className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep track of what you&apos;re watching on Plex and see your media server status.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <Activity className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Exercise</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Integrate with Strava to monitor your workouts and fitness progress.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <CheckSquare className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your daily to-dos and stay organized with a simple, effective task list.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm border-muted">
            <CardHeader>
              <Trees className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Parks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explore and track your visits to national and state parks.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
