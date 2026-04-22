"use client";

import { ParkContent } from "@/lib/db/parks";

interface ParkExpeditionSummaryProps {
  park: ParkContent;
}

export function ParkExpeditionSummary({ park }: ParkExpeditionSummaryProps) {
  return (
    <section className="bg-media-primary text-media-surface rounded-3xl p-10 lg:p-16 mb-24 font-lexend">
      <div className="flex items-baseline gap-4 mb-12">
        <span className="text-media-secondary font-black text-5xl md:text-7xl opacity-20 leading-none">01</span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">Expedition Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="border-l border-media-surface/10 pl-6 space-y-2">
          <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary">Status</span>
          <span className="text-xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-media-secondary animate-pulse"></span>
            Visited
          </span>
        </div>
        
        <div className="border-l border-media-surface/10 pl-6 space-y-2">
          <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary">Category</span>
          <span className="text-xl font-bold">{park.category || "Wilderness"}</span>
        </div>
        
        <div className="border-l border-media-surface/10 pl-6 space-y-2">
          <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary">Established</span>
          <span className="text-xl font-bold">1929</span>
        </div>
        
        <div className="border-l border-media-surface/10 pl-6 space-y-2">
          <span className="block text-[10px] uppercase tracking-[0.2em] font-black text-media-secondary">Annual Visitors</span>
          <span className="text-xl font-bold">3.4M</span>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors duration-500">
        <div className="flex items-center gap-4 mb-4">
          <span className="material-symbols-outlined text-media-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          <span className="text-2xl font-black tracking-tight tracking-tight">Prime Exploration Route</span>
        </div>
        <p className="text-lg text-media-surface/70 leading-relaxed italic font-light">
          {park.description || "The wilderness here offers a sanctuary for the spirit, with every trail revealing a new facet of nature\'s grandeur."}
        </p>
      </div>
    </section>
  );
}
