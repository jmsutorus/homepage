import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMediaBySlug, getAllMedia } from "@/lib/media";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Pencil } from "lucide-react";
import { DeleteMediaButton } from "@/components/widgets/delete-media-button";

interface MediaDetailPageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const movies = getAllMedia("media/movies").map((item) => ({
    type: "movies",
    slug: item.slug,
  }));

  const tv = getAllMedia("media/tv").map((item) => ({
    type: "tv",
    slug: item.slug,
  }));

  const books = getAllMedia("media/books").map((item) => ({
    type: "books",
    slug: item.slug,
  }));

  return [...movies, ...tv, ...books];
}

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { type, slug } = await params;
  const media = getMediaBySlug(`media/${type}`, slug);

  if (!media) {
    notFound();
  }

  const { frontmatter, content } = media;

  // Status color mapping
  const statusColors: Record<string, string> = {
    completed: "bg-green-500/10 text-green-500",
    watching: "bg-blue-500/10 text-blue-500",
    planned: "bg-gray-500/10 text-gray-500",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/media">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Media
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/media/${type}/${slug}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteMediaButton slug={slug} mediaType={type} />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-4">
        {/* Image */}
        {frontmatter.poster && (
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
            <img
              src={frontmatter.poster}
              alt={frontmatter.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-4xl font-bold tracking-tight">{frontmatter.title}</h1>

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
              <span className="font-semibold">{frontmatter.rating} / 5</span>
            </div>
          )}
        </div>

        {/* Genres */}
        {frontmatter.genres && frontmatter.genres.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {frontmatter.genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
        )}

        {/* Date */}
        {(frontmatter.completed || frontmatter.started) && (
          <p className="text-sm text-muted-foreground">
            {frontmatter.completed
              ? `Completed on ${new Date(frontmatter.completed).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`
              : `Started on ${new Date(frontmatter.started!).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`}
          </p>
        )}
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
          <p>No content available. Click "Edit" to add a description.</p>
        </div>
      )}
    </div>
  );
}
