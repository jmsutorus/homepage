import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your personal homepage
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Mood Tracker Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Tracker</CardTitle>
            <CardDescription>Track your daily mood</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Year-in-pixels view coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Media Tracker Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Media Library</CardTitle>
            <CardDescription>Movies, TV shows, and books</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Media grid coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Tasks Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your todo list</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Task manager coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Exercise Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise</CardTitle>
            <CardDescription>Strava activity tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Exercise stats coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Steam Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Steam</CardTitle>
            <CardDescription>Gaming activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Steam status coming soon...
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
              Server status coming soon...
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
              Sensor data coming soon...
            </p>
          </CardContent>
        </Card>

        {/* Quick Links Widget */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Frequently accessed sites</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Quick links coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
