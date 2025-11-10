import { MediaItem } from "@/lib/mdx";
import { MediaCard } from "./media-card";

interface MediaGridProps {
  items: MediaItem[];
  emptyMessage?: string;
}

export function MediaGrid({ items, emptyMessage = "No media items found" }: MediaGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <MediaCard key={`${item.frontmatter.type}-${item.slug}`} item={item} />
      ))}
    </div>
  );
}
