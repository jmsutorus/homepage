"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as TabsPrimitive from "@radix-ui/react-tabs";

export interface PageTab {
  value: string;
  label: string;
  icon?: LucideIcon;
  showLabel?: boolean;
}

interface PageTabsListProps {
  tabs: PageTab[];
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

/**
 * Reusable tab list component for page-level navigation between main content and analytics
 * Desktop: Left-aligned tabs with underline style
 * Mobile: Fixed bottom navigation bar with optional action button
 */
export function PageTabsList({ tabs, actionButton }: PageTabsListProps) {
  const ActionIcon = actionButton?.icon || Plus;

  return (
    <>
      {/* Desktop: Top horizontal tabs */}
      <TabsList className="hidden md:inline-flex justify-start h-auto w-auto bg-transparent p-0 gap-6 border-b border-border">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="cursor-pointer px-1 py-2 max-w-[125px] !bg-transparent !shadow-none rounded-none border-0 border-b-2 border-transparent data-[state=active]:!border-b-brand data-[state=active]:!text-brand data-[state=inactive]:text-muted-foreground hover:text-foreground transition-colors"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Mobile: Floating Action Button */}
      {actionButton && (
        <Button
          onClick={actionButton.onClick}
          size="icon"
          className="md:hidden fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-brand hover:bg-brand/90 text-brand-foreground"
        >
          <ActionIcon className="h-6 w-6" />
        </Button>
      )}

      {/* Mobile: Fixed bottom navigation bar */}
      <TabsPrimitive.List asChild>
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border shadow-lg">
          <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <div key={tab.value} className="flex-1 flex justify-center">
                  <TabsTrigger
                    value={tab.value}
                    className={cn(
                      "flex-col gap-1 h-full min-w-[44px] flex-1 max-w-[100px]",
                      "cursor-pointer !bg-transparent !shadow-none rounded-none border-0",
                      "data-[state=active]:!text-brand data-[state=inactive]:text-muted-foreground",
                      "transition-colors px-2"
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {tab.showLabel && tab.label && <span className="text-[10px] font-medium leading-none">{tab.label}</span>}
                  </TabsTrigger>
                </div>
              );
            })}
          </div>
        </div>
      </TabsPrimitive.List>
    </>
  );
}
