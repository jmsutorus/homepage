"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { ParkContent } from "@/lib/db/parks";
import { cn } from "@/lib/utils";

interface ParkCardEditorialProps {
  park: ParkContent;
  className?: string;
  isAsymmetric?: boolean;
}

export function ParkCardEditorial({ park, className, isAsymmetric }: ParkCardEditorialProps) {
  const href = `/parks/${park.slug}`;
  const visitedDate = park.visited ? new Date(park.visited) : null;
  const dateFormatted = visitedDate ? visitedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown Date';

  return (
    <Link 
      href={href} 
      className={cn(
        "group bg-media-surface-container-lowest rounded-2xl overflow-hidden transition-all duration-500 hover:translate-y-[-8px] shadow-sm hover:shadow-2xl border border-media-outline-variant/10 font-lexend",
        isAsymmetric && "md:mt-12",
        className
      )}
    >
      <div className="relative h-64 overflow-hidden">
        {park.poster ? (
          <img
            src={park.poster}
            alt={park.title}
            className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-media-primary-container flex items-center justify-center">
             <span className="material-symbols-outlined text-4xl text-media-primary-fixed/20">terrain</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-media-primary text-media-on-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">
          Visited
        </div>
      </div>
      
      <div className="p-8">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-black tracking-tighter text-media-primary group-hover:text-media-secondary transition-colors duration-300">
            {park.title}
          </h3>
          <div className="flex items-center gap-1 bg-media-secondary/10 px-2 py-1 rounded-lg">
            <span className="material-symbols-outlined text-media-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-xs font-black text-media-secondary">{park.rating ? (park.rating / 2).toFixed(1) : "5.0"}</span>
          </div>
        </div>
        
        <p className="text-media-on-surface-variant/80 text-sm flex items-center gap-2 mb-8 font-medium">
          <MapPin className="w-4 h-4 text-media-secondary" /> {park.state || "Wilderness, USA"}
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-media-outline-variant/10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-media-on-surface-variant/40">
            {dateFormatted}
          </span>
          <div className="w-10 h-10 rounded-full bg-media-surface-variant/20 flex items-center justify-center text-media-primary transition-all duration-300 group-hover:bg-media-primary group-hover:text-white group-hover:translate-x-1">
             <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
