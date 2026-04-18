"use client";

import * as React from "react";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Settings, Search, ChevronDown, User, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const [isMac, setIsMac] = React.useState(true);

  // Detect OS on mount
  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  return (
    <header className="w-full bg-[#faf9f6]/95 dark:bg-[#061b0e]/95 backdrop-blur supports-[backdrop-filter]:bg-[#faf9f6]/60 sticky top-0 z-50 shrink-0 border-b border-outline-variant/10">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="md:hidden flex items-center gap-2">
            <MobileNav />
            <Link href="/home" className="flex items-center gap-2">
               <div className="w-8 h-8 rounded bg-[#061b0e] flex items-center justify-center text-[#ffffff]">
                  <span className="material-symbols-outlined text-sm">temp_preferences_custom</span>
               </div>
               <span className="font-bold tracking-tighter">Homepage</span>
            </Link>
          </div>
          
          <div className="relative max-w-md w-full hidden sm:block md:ml-0">
            <span 
              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#434843] dark:text-[#e3e2e0] text-sm cursor-pointer"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
            >
              search
            </span>
            <input 
              readOnly
              className="w-full bg-[#f4f3f1] dark:bg-[#1b3022]/40 border-none rounded-full pl-10 pr-12 py-1.5 text-sm focus:ring-2 focus:ring-[#9f402d]/20 transition-all cursor-pointer" 
              placeholder="Search your dashboard..." 
              type="text"
              onClick={() => {
                const event = new KeyboardEvent("keydown", {
                  key: "k",
                  metaKey: true,
                  ctrlKey: true,
                  bubbles: true,
                });
                document.dispatchEvent(event);
              }}
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-[10px]">{isMac ? "⌘" : "Ctrl"}</span>K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-6">
            <Link className="text-[#9f402d] font-bold text-sm tracking-tight hover:opacity-80 transition-opacity" href="/home">Overview</Link>
            <Link className="text-[#434843] dark:text-[#e3e2e0] font-medium text-sm tracking-tight hover:text-[#9f402d] transition-colors" href="/calendar">Calendar</Link>
            <Link className="text-[#434843] dark:text-[#e3e2e0] font-medium text-sm tracking-tight hover:text-[#9f402d] transition-colors" href="/settings">Settings</Link>
          </nav>

          {isAuthenticated && user && (
            <div className="flex items-center gap-3 bg-[#f4f3f1] dark:bg-[#1b3022]/40 px-3 py-1 rounded-full border border-outline-variant/30">
               <div className="w-6 h-6 rounded-full border border-[#b4cdb8] bg-[#061b0e] flex items-center justify-center text-[#ffffff] overflow-hidden">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-xs">person</span>
                  )}
               </div>
               <span className="text-[11px] font-bold text-[#1a1c1a] dark:text-[#faf9f6] truncate hidden md:block max-w-[100px]">
                 {user.name || user.email}
               </span>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="cursor-pointer p-0.5 hover:bg-[#efeeeb] dark:hover:bg-[#4d6453]/20 rounded-full transition-colors">
                     <span className="material-symbols-outlined text-sm block">settings</span>
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                    {(user as any).role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="w-full cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
