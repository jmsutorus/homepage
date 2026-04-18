"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Library", icon: "subscriptions", href: "/media" },
  { label: "Genres", icon: "category", href: "/media/genres" },
  { label: "Playlists", icon: "queue_music", href: "/media/playlists" },
  { label: "Recent", icon: "history", href: "/media/recent" },
  { label: "Downloads", icon: "download", href: "/media/downloads" },
];

export function MediaSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-16 bg-media-surface dark:bg-media-primary flex flex-col p-6 space-y-8 z-40 hidden md:flex border-r border-media-outline-variant/20 font-lexend">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-media-primary dark:text-media-surface">MediaLibrary</span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs tracking-wide uppercase font-medium opacity-50 mb-4 px-2">Editorial Collection</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 hover:translate-x-1",
                isActive
                  ? "text-media-secondary font-bold border-r-4 border-media-secondary bg-white/50 dark:bg-white/5 scale-102 shadow-sm"
                  : "text-media-on-surface-variant dark:text-media-surface-variant opacity-70 hover:bg-media-surface-variant/50 dark:hover:bg-media-primary-container hover:opacity-100"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-4 pb-16">
        <Button 
          asChild
          className="w-full py-6 bg-media-secondary text-media-on-secondary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-md border-none"
        >
          <Link href="/media/new">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add New Media</span>
          </Link>
        </Button>
        
        <div className="flex items-center gap-3 px-2 pt-4 border-t border-media-outline-variant/10">
          <div className="w-10 h-10 rounded-full bg-media-surface-container-highest overflow-hidden flex-shrink-0 border border-media-outline-variant/20 shadow-inner">
            <div className="w-full h-full bg-media-primary/10 flex items-center justify-center text-media-primary font-bold">
              U
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-media-primary dark:text-media-primary-fixed truncate">Premium Tier</p>
            <p className="text-xs text-media-on-surface-variant truncate">Library User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
