"use client";

import Link from "next/link";
import type { ParkContent } from "@/lib/db/parks";
import { cn } from "@/lib/utils";

interface ParkListItemEditorialProps {
  park: ParkContent;
  className?: string;
}

export function ParkListItemEditorial({ park, className }: ParkListItemEditorialProps) {
  const href = `/parks/${park.slug}`;
  const visitedDate = park.visited ? new Date(park.visited) : null;
  const dateFormatted = visitedDate ? visitedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown Date';

  return (
    <article 
      className={cn(
        "group flex flex-col md:flex-row gap-8 bg-media-surface rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-transform duration-500 font-lexend",
        className
      )}
    >
      <div className="w-full md:w-1/2 h-80 relative overflow-hidden rounded-xl shadow-sm">
        {park.poster ? (
          <img
            src={park.poster}
            alt={park.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-media-primary-container flex items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-media-primary-fixed/20">terrain</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-media-primary/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          {(park.rating ? (park.rating / 2).toFixed(1) : "5.0")}/5
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center py-4">
        <span className="text-xs font-black text-media-secondary uppercase tracking-[0.15em] mb-2 leading-none">
          {park.state || "Wilderness"}, USA
        </span>
        <h3 className="text-3xl font-black text-media-primary tracking-tight mb-4 group-hover:text-media-secondary transition-colors duration-300">
          {park.title}
        </h3>
        <p className="text-media-on-surface-variant text-sm leading-relaxed mb-6 italic font-light line-clamp-3">
          &quot;{park.description || "The wilderness here offers a sanctuary for the spirit, with every trail revealing a new facet of nature\'s grandeur."}&quot;
        </p>
        
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-media-on-surface-variant uppercase tracking-widest">
            Visited {dateFormatted}
          </span>
          <div className="h-[1px] flex-grow bg-media-outline-variant/30"></div>
          <Link 
            href={href}
            className="text-media-primary hover:text-media-secondary transition-colors duration-300"
          >
            <span className="material-symbols-outlined text-2xl font-black">arrow_outward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
