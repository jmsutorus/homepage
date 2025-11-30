import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMediaBySlug, getAllMedia } from "@/lib/media";
import { formatDateLongSafe } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Pencil } from "lucide-react";
import { DeleteMediaButton } from "@/components/widgets/media/delete-media-button";
import { ExportButton } from "@/components/widgets/shared/export-button";
import { getRelatedMedia } from "@/lib/actions/related-content";
import { RelatedMedia } from "@/components/widgets/shared/related-content";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";

interface MediaDetailPageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { type, slug } = await params;
  const media = getMediaBySlug(`media/${type}`, slug);

  if (!media) {
    notFound();
  }

  const { frontmatter, content } = media;

  // Fetch related media based on genres and tags
  const relatedMedia = await getRelatedMedia(
    slug,
    frontmatter.genres || [],
    frontmatter.tags || [],
    6
  );

  // Status color mapping
  const statusColors: Record<string, string> = {
    completed: "bg-green-500/10 text-green-500",
    watching: "bg-blue-500/10 text-blue-500",
    planned: "bg-gray-500/10 text-gray-500",
  };

  // Format media type for display (capitalize first letter)
  const formattedType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageBreadcrumb
          items={[
            { label: "Media", href: "/media" },
            { label: formattedType, href: `/media?type=${type}` },
            { label: frontmatter.title.replace(/-/g, ' ') },
          ]}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {content && (
            <ExportButton
              content={content}
              filename={slug}
            />
          )}
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
            <Link href={`/media/${type}/${slug}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteMediaButton slug={slug} mediaType={type} />
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 sm:gap-6">
        {/* Poster Image */}
        {frontmatter.poster && (
          <div className="w-full max-w-[200px] mx-auto md:max-w-none md:mx-0 md:w-[300px] rounded-lg overflow-hidden bg-muted">
            <img
              src={frontmatter.poster}
              alt={frontmatter.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{frontmatter.title.replace(/-/g, ' ')}</h1>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Type Badge */}
            <Badge variant="outline" className="capitalize">
              {frontmatter.type}
            </Badge>

            {/* Status Badge */}
            <Badge className={statusColors[frontmatter.status]}>
              {frontmatter.status}
            </Badge>

            {/* Rating */}
            {frontmatter.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{frontmatter.rating} / 10</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {frontmatter.genres && frontmatter.genres.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {frontmatter.genres.map((genre) => (
                <Link key={genre} href={`/media?genres=${encodeURIComponent(genre)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                    {genre}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Tags */}
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {frontmatter.tags.map((tag) => (
                <Link key={tag} href={`/media?tags=${encodeURIComponent(tag)}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent transition-colors">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Date */}
          {(frontmatter.completed || frontmatter.started) && (
            <p className="text-sm text-muted-foreground">
              {frontmatter.completed
                ? `Completed on ${formatDateLongSafe(frontmatter.completed, "en-US")}`
                : `Started on ${formatDateLongSafe(frontmatter.started!, "en-US")}`}
            </p>
          )}

          {/* Description */}
          {frontmatter.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {frontmatter.description}
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Content */}
      {content && content.trim() ? (
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-7 prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-strong:font-semibold prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-img:rounded-lg">
          <MDXRemote source={content} />
        </article>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No content available. Click &quot;Edit&quot; to add a description.</p>
        </div>
      )}

      {/* Related Media */}
      {relatedMedia.length > 0 && (
        <>
          <hr className="border-border" />
          <RelatedMedia items={relatedMedia} title="You might also like" />
        </>
      )}
    </div>
  );
}
