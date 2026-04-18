"use client";

import { Star, MapPin, Calendar, Quote } from "lucide-react";
import { ParkContent } from "@/lib/db/parks";
import { formatDateLongSafe } from "@/lib/utils";

interface ParkHeroEditorialProps {
  park: ParkContent;
}

export function ParkHeroEditorial({ park }: ParkHeroEditorialProps) {
  return (
    <header className="relative rounded-3xl overflow-hidden h-[600px] md:h-[819px] group font-lexend mb-24">
      {park.poster ? (
        <img
          src={park.poster}
          alt={park.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-media-primary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-8xl text-media-primary-fixed/20">terrain</span>
        </div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-media-primary/90 via-media-primary/20 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 p-8 lg:p-16 w-full flex flex-col lg:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-media-surface mb-2">
            <span className="material-symbols-outlined text-media-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <span className="tracking-widest uppercase text-xs font-bold text-media-surface/80">
              {park.state || "Wilderness"}, USA
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-media-surface tracking-tighter mb-4 leading-[0.9]">
            {park.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="bg-media-secondary/90 backdrop-blur px-4 py-2 rounded-xl text-media-on-secondary flex items-center gap-2 shadow-xl border border-white/10">
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold">{park.rating ? (park.rating / 2).toFixed(1) : "5.0"}/5</span>
            </div>
            
            <div className="flex items-center gap-2 text-media-surface/90 font-medium text-sm lg:text-base uppercase tracking-widest bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
               <span className="material-symbols-outlined text-sm">calendar_today</span>
               <span>{park.visited ? formatDateLongSafe(park.visited, "en-US") : "Undated Expedition"}</span>
            </div>
          </div>
        </div>
        
        {park.description && (
          <div className="hidden lg:block bg-media-surface/5 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 max-w-sm shadow-2xl skew-y-[-1deg]">
            <Quote className="w-8 h-8 text-media-secondary mb-4 opacity-50" />
            <p className="text-media-surface/90 text-sm italic leading-relaxed font-light">
              &quot;{park.description.length > 150 ? park.description.substring(0, 150) + "..." : park.description}&quot;
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
