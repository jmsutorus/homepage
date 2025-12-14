"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  const cachedPages = [
    { name: "Home", path: "/home" },
    { name: "Tasks", path: "/tasks" },
    { name: "Calendar", path: "/calendar" },
    { name: "Habits", path: "/habits" },
    { name: "Mood Journal", path: "/mood" },
    { name: "Media Library", path: "/media" },
    { name: "Activities", path: "/activities" },
    { name: "Goals", path: "/goals" },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">You&apos;re Offline</CardTitle>
          <CardDescription>
            It looks like you&apos;ve lost your internet connection. Some features may be unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-medium">Available Cached Pages</h3>
            <div className="space-y-2">
              {cachedPages.map((page) => (
                <Link
                  key={page.path}
                  href={page.path}
                  className="flex items-center justify-between rounded-md border px-4 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span>{page.name}</span>
                  <span className="text-xs text-muted-foreground">Cached</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleRetry}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Connection
            </Button>
            <Link href="/home" className="block">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </div>

          <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
            <p>
              You can still browse previously loaded pages while offline. Your data will sync when you&apos;re back online.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
