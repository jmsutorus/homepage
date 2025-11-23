"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Search } from "lucide-react";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMac, setIsMac] = React.useState(true);

  // Detect OS on mount
  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-6">
        <div className="mr-4 flex">
          <Link href="/home" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">Homepage</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/calendar"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Calendar
            </Link>
            <Link
              href="/mood"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Mood
            </Link>
            <Link
              href="/media"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Media
            </Link>
            <Link
              href="/parks"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Parks
            </Link>
            <Link
              href="/journals"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Journals
            </Link>
            <Link
              href="/tasks"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Tasks
            </Link>
            <Link
              href="/exercise"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Exercise
            </Link>
            <Link
              href="/habits"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Habits
            </Link>
            <Link
              href="/goals"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Goals
            </Link>
            <Link
              href={`/year/${new Date().getFullYear()}`}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Year in Review
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="outline"
              className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2 text-muted-foreground"
              onClick={() => {
                // Dispatch keyboard event to trigger command palette
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
            >
              <Search className="h-4 w-4 xl:mr-2" />
              <span className="hidden xl:inline-flex">Search...</span>
              <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
                <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
              </kbd>
            </Button>
          </div>
          <nav className="flex items-center gap-3">
            {isAuthenticated && user && (
              <>
                <span className="hidden md:inline-block text-sm text-muted-foreground">
                  {user.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline-block">Sign out</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4" />
                    <span className="hidden md:inline-block">Settings</span>
                  </Link>
                </Button>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
