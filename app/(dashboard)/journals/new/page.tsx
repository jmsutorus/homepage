import { JournalEditorialEditor } from '@/components/widgets/journal/journal-editorial-editor';

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
    <JournalEditorialEditor mode="create" initialFrontmatter={initialFrontmatter} />
  );
}
