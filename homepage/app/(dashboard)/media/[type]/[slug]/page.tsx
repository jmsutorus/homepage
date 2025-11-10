import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getMediaBySlug, getAllMedia } from "@/lib/mdx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";

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
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/media">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Media
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-4">
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
        {(frontmatter.dateWatched || frontmatter.dateStarted) && (
          <p className="text-sm text-muted-foreground">
            {frontmatter.dateWatched
              ? `Watched on ${new Date(frontmatter.dateWatched).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`
              : `Started on ${new Date(frontmatter.dateStarted!).toLocaleDateString("en-US", {
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
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <MDXRemote source={content} />
      </div>
    </div>
  );
}
