import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getJournalBySlug, getAllJournals, getLinksForJournal, getMoodForDate } from "@/lib/db/journals";
import { formatDateLongSafe } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Pencil, Calendar } from "lucide-react";
import { LinkedItemsDisplay } from "@/components/widgets/shared/linked-items-display";
import { ExportButton } from "@/components/widgets/shared/export-button";
import { getRelatedJournals } from "@/lib/actions/related-content";
import { RelatedJournals } from "@/components/widgets/shared/related-content";

interface JournalDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function JournalDetailPage({ params }: JournalDetailPageProps) {
  const { slug } = await params;
  const journal = getJournalBySlug(slug);

  if (!journal) {
    notFound();
  }

  // Get linked items
  const links = getLinksForJournal(journal.id);

  // For daily journals, get mood from mood_entries
  let displayMood = journal.mood;
  if (journal.journal_type === "daily" && journal.daily_date) {
    const moodRating = getMoodForDate(journal.daily_date);
    if (moodRating !== null) {
      displayMood = moodRating;
    }
  }

  // Fetch related journals based on tags and mood
  const relatedJournals = await getRelatedJournals(
    slug,
    journal.tags || [],
    displayMood !== null && displayMood !== undefined ? displayMood : undefined,
    6
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6 cursor-pointer">
        <Link href="/journals">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Journals
        </Link>
      </Button>

      <div className="space-y-6">
        {/* Title and Edit Button */}
        <div className="flex items-start justify-between">
          <h1 className="text-4xl font-bold">{journal.title}</h1>
          <div className="flex gap-2">
            {journal.content && (
              <ExportButton
                content={journal.content}
                filename={journal.slug}
              />
            )}
            <Button variant="outline" size="sm" asChild className="cursor-pointer">
              <Link href={`/journals/${slug}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 items-center">
          <Badge variant="secondary" className="capitalize">
            {journal.journal_type} Journal
          </Badge>

          {journal.journal_type === "daily" && journal.daily_date && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDateLongSafe(journal.daily_date, "en-US")}
            </div>
          )}

          {displayMood !== null && displayMood !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">Mood: {displayMood}/10</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {journal.tags && journal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {journal.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Created/Updated Dates */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Created: {formatDateLongSafe(journal.created_at, "en-US")}</p>
          {journal.updated_at !== journal.created_at && (
            <p>Last updated: {formatDateLongSafe(journal.updated_at, "en-US")}</p>
          )}
        </div>

        {/* Linked Items */}
        {links.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Linked Items</h2>
            <LinkedItemsDisplay links={links} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-8 border-t" />

      {/* Markdown Content */}
      {journal.content && (
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXRemote source={journal.content} />
        </article>
      )}

      {/* Related Journals */}
      {relatedJournals.length > 0 && (
        <>
          <div className="my-8 border-t" />
          <RelatedJournals items={relatedJournals} title="Related Journal Entries" />
        </>
      )}
    </div>
  );
}
