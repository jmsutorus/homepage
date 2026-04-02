'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PageTabsList } from '@/components/ui/page-tabs-list';
import type { JournalContent } from '@/lib/db/journals';

interface JournalsPageClientProps {
  journals: JournalContent[];
  children?: React.ReactNode;
}

export function JournalsPageClient({ journals, children }: JournalsPageClientProps) {
  const router = useRouter();
  const [viewTab, setViewTab] = useState('journals');

  // Calculate stats
  const journalsWithMood = journals.filter(j => j.mood !== null);
  const avgMood = journalsWithMood.length > 0
    ? (journalsWithMood.reduce((sum, j) => sum + (j.mood || 0), 0) / journalsWithMood.length).toFixed(1)
    : '—';

  // Get all unique tags
  const allTags = new Set<string>();
  journals.forEach(j => j.tags.forEach(tag => allTags.add(tag)));
  const uniqueTagsCount = allTags.size;

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 mb-2 sm:mb-0">
            <BookOpen className="w-7 h-7" />
            Journals
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">
            Document your thoughts, experiences, and daily reflections
          </p>
        </div>
        <div className="hidden md:block">
          <Button onClick={() => router.push('/journals/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Journal
          </Button>
        </div>
      </div>

      <Tabs value={viewTab} onValueChange={setViewTab}>
        <PageTabsList
          tabs={[
            { value: "journals", label: "Journals", icon: BookOpen, showLabel: false }
          ]}
          actionButton={{
            label: "New Journal",
            onClick: () => router.push('/journals/new'),
            icon: Plus,
          }}
        />

        <TabsContent value="journals" className="mt-6 sm:mt-8 pb-20 md:pb-0">
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
              <p className="text-xl sm:text-2xl font-bold">{uniqueTagsCount}</p>
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
              <Button onClick={() => router.push('/journals/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Journal
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {children}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
