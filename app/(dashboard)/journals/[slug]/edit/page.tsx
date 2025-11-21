import { notFound } from "next/navigation";
import { getJournalBySlug, getLinksForJournal, getMoodForDate } from "@/lib/db/journals";
import { JournalEditor } from "@/components/widgets/journal/journal-editor";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";

interface EditJournalPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditJournalPage({ params }: EditJournalPageProps) {
  const { slug } = await params;
  const journal = getJournalBySlug(slug);

  if (!journal) {
    notFound();
  }

  // Get linked items
  const links = getLinksForJournal(journal.id);

  // For daily journals, get mood from mood_entries
  let mood = journal.mood;
  if (journal.journal_type === "daily" && journal.daily_date) {
    const moodRating = getMoodForDate(journal.daily_date);
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
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 space-y-4">
        <PageBreadcrumb
          items={[
            { label: "Journals", href: "/journals" },
            { label: journal.title, href: `/journals/${slug}` },
            { label: "Edit" },
          ]}
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Journal</h1>
          <p className="text-muted-foreground">
            Update your journal entry for {journal.title}
          </p>
        </div>
      </div>

      <JournalEditor
        mode="edit"
        initialFrontmatter={initialFrontmatter}
        initialContent={journal.content}
        initialLinks={links}
        existingSlug={slug}
      />
    </div>
  );
}
