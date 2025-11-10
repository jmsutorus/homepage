import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MediaItem } from "@/lib/mdx";
import { Star } from "lucide-react";

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  const { slug, frontmatter } = item;

  // Determine the directory based on type
  const directory = frontmatter.type === "movie" ? "movies" : frontmatter.type === "tv" ? "tv" : "books";
  const href = `/media/${directory}/${slug}`;

  // Status color mapping
  const statusColors: Record<string, string> = {
    completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    watching: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    planned: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  };

  return (
    <Link href={href} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
        {/* Image */}
        {frontmatter.imageUrl && (
          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              {frontmatter.title}
            </div>
          </div>
        )}

        <CardContent className="p-4 space-y-2">
          {/* Title */}
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {frontmatter.title}
          </h3>

          {/* Status and Rating */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={statusColors[frontmatter.status]}
            >
              {frontmatter.status}
            </Badge>

            {frontmatter.rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">{frontmatter.rating}</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {frontmatter.genres && frontmatter.genres.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {frontmatter.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Date */}
          {(frontmatter.dateWatched || frontmatter.dateStarted) && (
            <p className="text-xs text-muted-foreground">
              {frontmatter.dateWatched
                ? `Watched: ${new Date(frontmatter.dateWatched).toLocaleDateString()}`
                : `Started: ${new Date(frontmatter.dateStarted!).toLocaleDateString()}`}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
