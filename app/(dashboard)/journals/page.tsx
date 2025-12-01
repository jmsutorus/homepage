import Link from "next/link";
import { Button } from "@/components/ui/button";
import { JournalCard } from "@/components/widgets/journal/journal-card";

export const dynamic = "force-dynamic";
import { getPublishedJournals } from "@/lib/db/journals";
import { Plus } from "lucide-react";
import { getUserId } from "@/lib/auth/server";

export default async function JournalsPage() {
  const userId = await getUserId();
  const journals = await getPublishedJournals(userId);

  // Calculate stats
  const journalsWithMood = journals.filter(j => j.mood !== null);
  const avgMood = journalsWithMood.length > 0
    ? (journalsWithMood.reduce((sum, j) => sum + (j.mood || 0), 0) / journalsWithMood.length).toFixed(1)
    : '—';

  // Get all unique tags
  const allTags = new Set<string>();
  journals.forEach(j => j.tags.forEach(tag => allTags.add(tag)));

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Journals</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Document your thoughts, experiences, and daily reflections
          </p>
        </div>
        <Button asChild className="cursor-pointer w-full sm:w-auto">
          <Link href="/journals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Journal
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4 mb-6 sm:mb-8">
        <div className="p-3 sm:p-4 rounded-lg border bg-card">
          <p className="text-xs sm:text-sm text-muted-foreground">Total Entries</p>
          <p className="text-xl sm:text-2xl font-bold">{journals.length}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-lg border bg-card">
          <p className="text-xs sm:text-sm text-muted-foreground">Average Mood</p>
          <p className="text-xl sm:text-2xl font-bold">{avgMood}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-lg border bg-card">
          <p className="text-xs sm:text-sm text-muted-foreground">Unique Tags</p>
          <p className="text-xl sm:text-2xl font-bold">{allTags.size}</p>
        </div>
        <div className="p-3 sm:p-4 rounded-lg border bg-card">
          <p className="text-xs sm:text-sm text-muted-foreground">Featured</p>
          <p className="text-xl sm:text-2xl font-bold">
            {journals.filter(j => j.featured).length}
          </p>
        </div>
      </div>

      {/* Journals List */}
      {journals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No journal entries yet.</p>
          <Button asChild className="cursor-pointer">
            <Link href="/journals/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Journal
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {journals.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      )}
    </div>
  );
}
