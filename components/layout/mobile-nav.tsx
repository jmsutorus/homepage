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
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

export function MobileNav() {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const [currentYear] = React.useState(new Date().getFullYear());

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation menu"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </Button>
    );
  }

  const navSections: NavSection[] = [
    {
      title: "Core Tracking",
      links: [
        { href: "/tasks", label: "Tasks", icon: "check_circle" },
        { href: "/habits", label: "Habits", icon: "repeat" },
        { href: "/goals", label: "Goals", icon: "flag" },
        { href: "/exercise", label: "Exercise", icon: "fitness_center" },
        { href: "/mood", label: "Mood", icon: "mood" },
        { href: "/relationship", label: "Relationship", icon: "favorite" },
        { href: "/people", label: "People", icon: "groups" },
        { href: "/finances", label: "Finances", icon: "payments" },
        { href: "/media", label: "Media", icon: "movie" },
      ],
    },
    {
      title: "Exploration",
      links: [
        { href: "/parks", label: "Parks", icon: "park" },
        { href: "/journals", label: "Journals", icon: "menu_book" },
        { href: "/recipes", label: "Recipes", icon: "restaurant" },
        { href: "/restaurants", label: "Restaurants", icon: "storefront" },
        { href: "/drinks", label: "Drinks", icon: "local_bar" },
        { href: "/vacations", label: "Vacations", icon: "flight" },
        { href: "/events", label: "Events", icon: "event" },
        { href: "/achievements", label: "Achievements", icon: "emoji_events" },
        { href: `/year/${currentYear}`, label: "Year in Review", icon: "calendar_month" },
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
          <span className="material-symbols-outlined text-2xl">menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 bg-[#faf9f6] dark:bg-[#061b0e]">
        <SheetHeader className="p-6 border-b border-outline-variant/10">
          <SheetTitle className="text-left flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#061b0e] flex items-center justify-center text-[#ffffff]">
              <span className="material-symbols-outlined text-sm">temp_preferences_custom</span>
            </div>
            <span className="font-bold tracking-tighter">Homepage</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-6 overflow-y-auto h-[calc(100vh-80px)] p-4 no-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#737973] font-bold px-2">
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
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                        isActive
                          ? "bg-[#9f402d] text-[#faf9f6] font-semibold"
                          : "text-[#434843] dark:text-[#e3e2e0] hover:bg-emerald-100/30 dark:hover:bg-emerald-900/20"
                      )}
                    >
                      <span className="material-symbols-outlined text-lg">{link.icon}</span>
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
