"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavLink {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  title?: string;
  links: NavLink[];
}

export function SideNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [currentYear] = React.useState(new Date().getFullYear());

  const mainLinks: NavLink[] = [
    { href: "/tasks", label: "Tasks", icon: "check_circle" },
    { href: "/habits", label: "Habits", icon: "repeat" },
    { href: "/goals", label: "Goals", icon: "flag" },
    { href: "/exercise", label: "Exercise", icon: "fitness_center" },
    { href: "/mood", label: "Mood", icon: "mood" },
    { href: "/relationship", label: "Relationship", icon: "favorite" },
    { href: "/people", label: "People", icon: "groups" },
    { href: "/finances", label: "Finances", icon: "payments" },
    { href: "/media", label: "Media", icon: "movie" },
  ];

  const explorationLinks: NavLink[] = [
    { href: "/parks", label: "Parks", icon: "park" },
    { href: "/journals", label: "Journals", icon: "menu_book" },
    { href: "/recipes", label: "Recipes", icon: "restaurant" },
    { href: "/restaurants", label: "Restaurants", icon: "storefront" },
    { href: "/drinks", label: "Drinks", icon: "local_bar" },
    { href: "/vacations", label: "Vacations", icon: "flight" },
    { href: "/events", label: "Events", icon: "event" },
    { href: "/achievements", label: "Achievements", icon: "emoji_events" },
    { href: `/year/${currentYear}`, label: "Year in Review", icon: "calendar_month" },
  ];

  const renderLink = (link: NavLink) => {
    const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "px-4 py-2 mx-4 flex items-center gap-3 rounded-lg transition-all group",
          isActive
            ? "bg-[#9f402d] text-[#faf9f6] font-semibold"
            : "text-[#434843] dark:text-[#e3e2e0] hover:bg-emerald-100/30 dark:hover:bg-emerald-900/20 active:scale-95 transition-transform duration-200 hover:translate-x-1"
        )}
      >
        <span className="material-symbols-outlined text-lg">{link.icon}</span>
        <span className="text-sm tracking-normal">{link.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex h-screen w-72 fixed left-0 top-0 overflow-y-auto bg-[#f4f3f1] dark:bg-[#082212] z-40 border-none">
      <div className="flex flex-col gap-1 py-6 h-full w-full">
        <div className="px-8 mb-8">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#061b0e] flex items-center justify-center text-[#ffffff]">
              <span className="material-symbols-outlined">temp_preferences_custom</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#061b0e] dark:text-[#faf9f6] tracking-tighter group-hover:text-[#9f402d] transition-colors">
                Homepage
              </h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#434843] dark:text-[#c3c8c1] font-medium">
                Personal Dashboard
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          {mainLinks.map(renderLink)}
          
          <div className="px-8 mt-4 mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#737973] font-bold">
              Exploration
            </p>
          </div>
          
          {explorationLinks.map(renderLink)}
        </nav>

        {/* <div className="px-6 mt-auto pt-4">
          <div className="bg-[#1b3022] dark:bg-[#1b3022]/40 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#b4cdb8] bg-[#061b0e] flex items-center justify-center text-[#ffffff] overflow-hidden shrink-0">
               {user?.image ? (
                 <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
               ) : (
                 <span className="material-symbols-outlined text-xl">person</span>
               )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-[#ffffff] truncate">
                {user?.name || user?.email || "Guest"}
              </p>
              <p className="text-[10px] text-[#b4cdb8] truncate">
                Premium Curator
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </aside>
  );
}
