"use client";

import { MediaItem } from "@/lib/media";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MediaHeroProps {
  item: MediaItem;
}

export function MediaHero({ item }: MediaHeroProps) {
  const { slug, frontmatter } = item;
  
  // Determine directory based on type
  const directory = frontmatter.type === "movie" ? "movies" : frontmatter.type === "tv" ? "tv" : frontmatter.type === "book" ? "books" : "albums";
  const href = `/media/${directory}/${slug}`;

  return (
    <section className="px-4 sm:px-8 mb-16 font-lexend">
      <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden group shadow-2xl border border-media-outline-variant/10">
        {/* Hero Background Image */}
        <img 
          src={frontmatter.poster || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2670&auto=format&fit=crop"} 
          alt={frontmatter.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-media-primary/95 via-media-primary/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block px-4 py-1.5 bg-media-secondary text-media-on-secondary text-[10px] font-bold tracking-[0.2em] uppercase rounded-full shadow-lg">
              Latest Arrival
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
              {frontmatter.title}
            </h1>
            <p className="text-white/80 text-lg font-light leading-relaxed mb-6 line-clamp-2 max-w-xl">
              {frontmatter.description || "Enter a world of discovery and adventure as you track your journey through this latest addition to your media library."}
            </p>
            
            <div className="flex gap-4">
              <Button asChild className="px-8 py-6 bg-white text-media-primary font-bold rounded-xl hover:scale-105 hover:bg-media-secondary hover:text-media-on-secondary transition-all duration-300 active:scale-95 flex items-center gap-2 border-none shadow-xl hover:shadow-2xl hover:shadow-media-secondary/30">
                <Link href={href}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Continue Journey
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Creator</p>
              <p className="text-white font-semibold truncate max-w-[150px]">
                {Array.isArray(frontmatter.creator) ? frontmatter.creator[0] : frontmatter.creator || "Unknown"}
              </p>
            </div>
            <div className="w-[1px] h-10 bg-white/20"></div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Progress</p>
              <p className="text-white font-semibold">
                {frontmatter.status === "completed" ? "Finished" : frontmatter.status === "in-progress" ? `${frontmatter.progress || 0}% Complete` : "Planned"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
