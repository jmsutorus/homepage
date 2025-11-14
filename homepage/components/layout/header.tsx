import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4 md:px-6">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
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
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
