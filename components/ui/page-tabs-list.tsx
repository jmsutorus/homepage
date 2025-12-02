import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface PageTab {
  value: string;
  label: string;
}

interface PageTabsListProps {
  tabs: PageTab[];
}

/**
 * Reusable tab list component for page-level navigation between main content and analytics
 * Includes cursor-pointer styling and responsive behavior
 */
export function PageTabsList({ tabs }: PageTabsListProps) {
  return (
    <TabsList className="w-full sm:w-auto">
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.value}
          value={tab.value}
          className="flex-1 sm:flex-none cursor-pointer"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
