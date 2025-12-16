"use client";

import { useState } from "react";
import { CalendarView } from "@/components/widgets/calendar/calendar-view";
import { EventCategoryManager } from "@/components/widgets/calendar/event-category-manager";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PageTabsList } from "@/components/ui/page-tabs-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Settings } from "lucide-react";
import type { CalendarDaySummary } from "@/lib/db/calendar";

type ViewTab = "calendar" | "manage";

interface CalendarPageClientProps {
  year: number;
  month: number;
  summaryData: Map<string, CalendarDaySummary>;
  colors: any;
}

export function CalendarPageClient({
  year,
  month,
  summaryData,
  colors,
}: CalendarPageClientProps) {
  const [viewTab, setViewTab] = useState<ViewTab>("calendar");

  const handleCategoriesChanged = () => {
    // Categories changed - could trigger a refresh if needed
    // For now, the EventCategoryManager handles its own state
  };

  return (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as ViewTab)}>
      <PageTabsList
        tabs={[
          { value: "calendar", label: "Calendar", icon: CalendarIcon, showLabel: false },
          { value: "manage", label: "Manage", icon: Settings, showLabel: false },
        ]}
      />

      <TabsContent value="calendar" className="space-y-6 mt-6 pb-20 md:pb-0">
        <CalendarView
          year={year}
          month={month}
          summaryData={summaryData}
          colors={colors}
        />
      </TabsContent>

      <TabsContent value="manage" className="space-y-6 md:mt-6 pb-20 md:pb-0">
        {/* Event Category Manager */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Event Categories</CardTitle>
            <CardDescription>Add, edit, or remove event categories</CardDescription>
          </CardHeader>
          <CardContent>
            <EventCategoryManager onCategoriesChanged={handleCategoriesChanged} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
