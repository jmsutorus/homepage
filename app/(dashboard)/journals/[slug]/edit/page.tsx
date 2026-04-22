import { notFound } from "next/navigation";
import { getJournalBySlug, getLinksForJournal, getMoodForDate } from "@/lib/db/journals";
import { JournalEditorialEditor } from "@/components/widgets/journal/journal-editorial-editor";
import { getUserId } from "@/lib/auth/server";

interface EditJournalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditJournalPage({ params }: EditJournalPageProps) {
  const { slug } = await params;
  const userId = await getUserId();
  const journal = await getJournalBySlug(slug, userId);

  if (!journal) {
    notFound();
  }

  // Get linked items
  const links = await getLinksForJournal(journal.id);

  // For daily journals, get mood from mood_entries
  let mood = journal.mood;
  if (journal.journal_type === "daily" && journal.daily_date) {
    const moodRating = await getMoodForDate(journal.daily_date, userId);
    if (moodRating !== null) {
      mood = moodRating;
    }
  }

  // Convert journal data to frontmatter format
  const initialFrontmatter = {
    title: journal.title,
    journal_type: journal.journal_type,
    daily_date: journal.daily_date || undefined,
    mood: mood !== null ? mood : undefined,
    tags: journal.tags,
    featured: journal.featured,
    published: journal.published,
  };

  return (
    <JournalEditorialEditor
      mode="edit"
      initialFrontmatter={initialFrontmatter}
      initialContent={journal.content}
      initialLinks={links}
      existingSlug={slug}
    />
  );
}
