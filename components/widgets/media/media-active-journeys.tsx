"use client";

import { MediaItem } from "@/lib/media";
import Link from "next/link";

interface MediaActiveJourneysProps {
  items: MediaItem[];
}

export function MediaActiveJourneys({ items }: MediaActiveJourneysProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-8 mb-12 font-lexend">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight text-media-primary dark:text-media-surface">Active Journeys</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {items.map((item) => {
          const { slug, frontmatter } = item;
          const directory = frontmatter.type === "movie" ? "movies" : frontmatter.type === "tv" ? "tv" : frontmatter.type === "book" ? "books" : "albums";
          const href = `/media/${directory}/${slug}`;
          
          // Calculate progress percentage
          // For now, if length is like "200 pages" and we have timeSpent, we'd need some unit conversion.
          // But per user instruction: "Should the progress bars be calculated purely as a percentage... yes"
          // I will look for a number in frontmatter or use a default if not found.
          // Actually, let's assume `timeSpent` is current and `length` (parsed for numbers) is total.
          
          const progress = frontmatter.progress || 0;

          return (
            <Link key={slug} href={href} className="group cursor-pointer">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-media-surface-container mb-4 transition-all duration-500 group-hover:scale-102 group-hover:-translate-y-2 shadow-sm hover:shadow-xl">
                <img 
                  alt={frontmatter.title} 
                  className="w-full h-full object-cover" 
                  src={frontmatter.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop"} 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-media-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-media-primary flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
                
                {frontmatter.type === "movie" && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-media-primary-container/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-sm border border-white/10">
                    4K HDR
                  </div>
                )}
                
                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-media-surface-container-highest/50 backdrop-blur-sm">
                  <div 
                    className="h-full bg-media-secondary transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold group-hover:text-media-secondary transition-colors truncate tracking-tight">{frontmatter.title}</h3>
                <p className="text-xs font-medium ring-offset-background opacity-60">
                  {frontmatter.type === "movie" ? "Movie" : frontmatter.type === "tv" ? "TV Show" : frontmatter.type === "book" ? "Book" : "Game"} • {progress}% Complete
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
