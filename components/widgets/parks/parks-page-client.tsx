'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ParkCard } from '@/components/widgets/parks/park-card';
import { Plus, TreePine } from 'lucide-react';
import { ParkFormDialog } from './park-form-dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageTabsList } from '@/components/ui/page-tabs-list';


interface ParksPageClientProps {
  parks: any[]; // Assuming any for now or I can type it properly if I had the type.
  parksByCategory: Record<string, any[]>;
}

export function ParksPageClient({ parks, parksByCategory }: ParksPageClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [viewTab, setViewTab] = useState('parks');

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Parks</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Explore and track your visits to National Parks, State Parks, and more
          </p>
        </div>
        <div className="hidden md:block">
          <Button asChild className="cursor-pointer w-full sm:w-auto">
            <Link href="/parks/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Park
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={viewTab} onValueChange={setViewTab}>
        <PageTabsList
          tabs={[
            { value: "parks", label: "Parks", icon: TreePine, showLabel: false }
          ]}
          actionButton={{
            label: "Add Park",
            onClick: () => setShowForm(true),
            icon: Plus,
          }}
        />

        <TabsContent value="parks" className="pb-20 md:pb-0">
          {/* Stats */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-6 sm:mb-8">
            <div className="p-3 sm:p-4 rounded-lg border bg-card">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Visits</p>
              <p className="text-xl sm:text-2xl font-bold">{parks.length}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg border bg-card">
              <p className="text-xs sm:text-sm text-muted-foreground">National Parks</p>
              <p className="text-xl sm:text-2xl font-bold">
                {parks.filter((p: any) => p.category === 'National Park').length}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg border bg-card">
              <p className="text-xs sm:text-sm text-muted-foreground">State Parks</p>
              <p className="text-xl sm:text-2xl font-bold">
                {parks.filter((p: any) => p.category === 'State Park').length}
              </p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg border bg-card">
              <p className="text-xs sm:text-sm text-muted-foreground">Average Rating</p>
              <p className="text-xl sm:text-2xl font-bold">
                {parks.filter((p: any) => p.rating !== null && p.rating !== undefined).length > 0
                  ? (parks.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) /
                     parks.filter((p: any) => p.rating !== null && p.rating !== undefined).length).toFixed(1)
                  : '—'}
              </p>
            </div>
          </div>

          {/* Parks Grid - Grouped by Category */}
          {parks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No parks added yet.</p>
              <Button asChild className="hidden md:inline-flex cursor-pointer">
                <Link href="/parks/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Park
                </Link>
              </Button>
              <Button onClick={() => setShowForm(true)} className="md:hidden cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Park
              </Button>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {Object.entries(parksByCategory).map(([category, categoryParks]) => (
                <div key={category}>
                  <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">{category}s</h2>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryParks.map((park: any) => (
                      <ParkCard key={park.id} park={park} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ParkFormDialog open={showForm} onOpenChange={setShowForm} />
    </div>
  );
}
