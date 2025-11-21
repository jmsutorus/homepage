import { JournalEditor } from '@/components/widgets/journal/journal-editor';

export const dynamic = "force-dynamic";

interface NewJournalPageProps {
  searchParams: Promise<{
    type?: string;
    date?: string;
  }>;
}

export default async function NewJournalPage({ searchParams }: NewJournalPageProps) {
  const params = await searchParams;
  const journalType = params.type === 'daily' ? 'daily' : 'general';
  const dailyDate = params.date || undefined;

  const initialFrontmatter = {
    title: '',
    journal_type: journalType as 'daily' | 'general',
    daily_date: dailyDate,
    tags: [],
    featured: false,
    published: true,
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {journalType === 'daily' ? 'New Daily Journal Entry' : 'New Journal Entry'}
        </h1>
        <p className="text-muted-foreground">
          {journalType === 'daily'
            ? `Create a daily journal entry${dailyDate ? ` for ${dailyDate}` : ''}.`
            : 'Create a new journal entry to document your thoughts and experiences.'}
        </p>
      </div>

      <JournalEditor mode="create" initialFrontmatter={initialFrontmatter} />
    </div>
  );
}
