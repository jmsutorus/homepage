import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ParkCard } from "@/components/widgets/park-card";
import { getPublishedParks } from "@/lib/db/parks";
import { Plus } from "lucide-react";

export default function ParksPage() {
  const parks = getPublishedParks();

  // Group parks by category
  const parksByCategory = parks.reduce((acc, park) => {
    if (!acc[park.category]) {
      acc[park.category] = [];
    }
    acc[park.category].push(park);
    return acc;
  }, {} as Record<string, typeof parks>);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Parks</h1>
          <p className="text-muted-foreground">
            Explore and track your visits to National Parks, State Parks, and more
          </p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/parks/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Park
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Total Visits</p>
          <p className="text-2xl font-bold">{parks.length}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">National Parks</p>
          <p className="text-2xl font-bold">
            {parks.filter(p => p.category === 'National Park').length}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">State Parks</p>
          <p className="text-2xl font-bold">
            {parks.filter(p => p.category === 'State Park').length}
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <p className="text-2xl font-bold">
            {parks.filter(p => p.rating !== null).length > 0
              ? (parks.reduce((sum, p) => sum + (p.rating || 0), 0) /
                 parks.filter(p => p.rating !== null).length).toFixed(1)
              : '—'}
          </p>
        </div>
      </div>

      {/* Parks Grid - Grouped by Category */}
      {parks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No parks added yet.</p>
          <Button asChild className="cursor-pointer">
            <Link href="/parks/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Park
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(parksByCategory).map(([category, categoryParks]) => (
            <div key={category}>
              <h2 className="text-2xl font-semibold mb-4">{category}s</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryParks.map((park) => (
                  <ParkCard key={park.id} park={park} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
