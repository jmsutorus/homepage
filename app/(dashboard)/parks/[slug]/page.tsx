import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getParkBySlug, getAllParks } from "@/lib/db/parks";
import { formatDateLongSafe } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Pencil, MapPin } from "lucide-react";
import { ExportButton } from "@/components/widgets/shared/export-button";
import { getRelatedParks } from "@/lib/actions/related-content";
import { RelatedParks } from "@/components/widgets/shared/related-content";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";

interface ParkDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function ParkDetailPage({ params }: ParkDetailPageProps) {
  const { slug } = await params;
  const park = getParkBySlug(slug);

  if (!park) {
    notFound();
  }

  // Fetch related parks based on tags and category
  const relatedParks = await getRelatedParks(
    slug,
    park.tags || [],
    park.category,
    6
  );

  return (
    <div className="container mx-auto py-4 sm:py-8 px-4 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <PageBreadcrumb
        items={[
          { label: "Parks", href: "/parks" },
          { label: park.title },
        ]}
        className="mb-4 sm:mb-6"
      />

      {/* Header with poster */}
      {park.poster && (
        <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden">
          <img
            src={park.poster}
            alt={park.title}
            className="w-full h-auto max-h-64 sm:max-h-96 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Title and Edit Button */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{park.title}</h1>
          <div className="flex gap-2 flex-wrap">
            {park.content && (
              <ExportButton
                content={park.content}
                filename={park.slug}
              />
            )}
            <Button variant="outline" size="sm" asChild className="cursor-pointer flex-1 sm:flex-none">
              <Link href={`/parks/${slug}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 items-center">
          <Badge className="text-sm">{park.category}</Badge>

          {park.state && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {park.state}
            </div>
          )}

          {park.rating !== null && park.rating !== undefined && (
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{park.rating}/10</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {park.tags && park.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {park.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Visited Date */}
        {park.visited && (
          <p className="text-sm text-muted-foreground">
            Visited on {formatDateLongSafe(park.visited, "en-US")}
          </p>
        )}

        {/* Description */}
        {park.description && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {park.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="my-8 border-t" />

      {/* Markdown Content */}
      {park.content && (
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <MDXRemote source={park.content} />
        </article>
      )}

      {/* Related Parks */}
      {relatedParks.length > 0 && (
        <>
          <div className="my-8 border-t" />
          <RelatedParks items={relatedParks} title="Similar Parks You Might Like" />
        </>
      )}
    </div>
  );
}
