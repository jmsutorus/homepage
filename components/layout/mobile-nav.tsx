"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Calendar, CalendarDays, CheckSquare, Heart, Dumbbell, Smile, BookOpen, Image as ImageIcon, MapPin, Target, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Format today's date as YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const navSections: NavSection[] = [
    {
      title: "Calendar",
      links: [
        { href: "/calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
        { href: `/daily/${todayStr}`, label: "Today", icon: <CalendarDays className="h-5 w-5" /> },
      ],
    },
    {
      title: "Track",
      links: [
        { href: "/tasks", label: "Tasks", icon: <CheckSquare className="h-5 w-5" /> },
        { href: "/habits", label: "Habits", icon: <Heart className="h-5 w-5" /> },
        { href: "/exercise", label: "Exercise", icon: <Dumbbell className="h-5 w-5" /> },
        { href: "/mood", label: "Mood", icon: <Smile className="h-5 w-5" /> },
        { href: "/relationship", label: "Relationship", icon: <Heart className="h-5 w-5" /> },
        { href: "/goals", label: "Goals", icon: <Target className="h-5 w-5" /> },
      ],
    },
    {
      title: "Library",
      links: [
        { href: "/media", label: "Media", icon: <ImageIcon className="h-5 w-5" /> },
        { href: "/parks", label: "Parks", icon: <MapPin className="h-5 w-5" /> },
        { href: "/journals", label: "Journals", icon: <BookOpen className="h-5 w-5" /> },
      ],
    },
    {
      title: "Progress",
      links: [
        { href: "/achievements", label: "Achievements", icon: <Trophy className="h-5 w-5" /> },
        {
          href: `/year/${new Date().getFullYear()}`,
          label: "Year in Review",
          icon: <TrendingUp className="h-5 w-5" />
        },
      ],
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col space-y-6 overflow-y-auto flex-1 pb-4">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.links.map((link) => {
                  const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "min-h-[44px]", // Ensure minimum touch target
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
