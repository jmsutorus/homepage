"use client";

import { Header } from "@/components/layout/header";
import { SideNav } from "@/components/layout/side-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { DashboardFooter } from "@/components/layout/dashboard-footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enable global keyboard shortcuts (G+C, G+T, etc.)
  useGlobalShortcuts();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#faf9f6]/50 dark:bg-[#061b0e]/50">
      <SideNav />
      <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">
          <div className="container mx-auto py-8 max-w-screen-2xl px-4 md:px-8 flex-1">
            {children}
          </div>
          <DashboardFooter />
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
