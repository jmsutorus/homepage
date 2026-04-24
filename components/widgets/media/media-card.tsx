import Link from "next/link";
import { MediaItem } from "@/lib/media";
import { Star } from "lucide-react";

interface MediaCardProps {
  item: MediaItem;
}

export function MediaCard({ item }: MediaCardProps) {
  const { slug, frontmatter } = item;

  // Determine the directory based on type
  const directory = frontmatter.type === "movie" ? "movies" : frontmatter.type === "tv" ? "tv" : frontmatter.type === "book" ? "books" : "albums";
  const href = `/media/${directory}/${slug}`;

  return (
    <Link href={href} className="block group font-lexend">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-media-surface-container mb-4 transition-all duration-500 group-hover:scale-102 group-hover:-translate-y-2 shadow-sm hover:shadow-xl">
        {frontmatter.poster ? (
          <img
            src={frontmatter.poster}
            alt={frontmatter.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-media-primary/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-media-primary/20">image</span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-media-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white text-media-primary flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <span className="material-symbols-outlined font-bold">visibility</span>
          </div>
        </div>

        {/* Rating Badge */}
        {frontmatter.rating && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-media-surface/90 backdrop-blur-md text-media-primary text-[10px] font-black rounded-lg shadow-sm flex items-center gap-1">
            <Star className="h-3 w-3 fill-media-secondary text-media-secondary" />
            {frontmatter.rating}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-bold truncate tracking-tight group-hover:text-media-secondary transition-colors">
          {frontmatter.title.replace(/-/g, ' ')}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-60">
          <span>{frontmatter.type}</span>
          {frontmatter.genres && frontmatter.genres.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-media-outline-variant"></span>
              <span className="truncate">{frontmatter.genres[0]}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
