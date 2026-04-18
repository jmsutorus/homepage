"use client";

import { cn } from "@/lib/utils";

export function MediaCuratedBento() {
  return (
    <section className="px-8 mb-24 font-lexend">
      <h2 className="text-2xl font-black tracking-tight mb-8 ml-2">Curated Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[600px]">
        {/* Large Feature: High Fantasy */}
        <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-media-primary group cursor-pointer shadow-xl">
          <img 
            alt="Fantasy Collection" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" 
            src="https://images.unsplash.com/photo-1514565131-0ce08286a105?q=80&w=2670&auto=format&fit=crop" 
          />
          <div className="absolute inset-0 p-10 flex flex-col justify-end bg-gradient-to-t from-media-primary/90 via-media-primary/40 to-transparent">
            <span className="text-media-secondary text-[10px] font-black tracking-[0.4em] uppercase mb-4 shadow-sm">Masterpiece Collection</span>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">The High Fantasy Essentials</h3>
            <p className="text-white/70 max-w-sm font-light">From Tolkien to Sanderson, discover the worlds that defined a genre.</p>
          </div>
        </div>

        {/* Medium Grid 1: Lo-Fi Beats */}
        <div className="md:col-span-2 relative rounded-3xl overflow-hidden bg-media-surface-container-high group cursor-pointer shadow-lg border border-media-outline-variant/10">
          <div className="absolute inset-0 p-8 flex items-center justify-between">
            <div className="max-w-[60%]">
              <span className="text-media-primary/40 text-[10px] font-black tracking-widest uppercase block mb-2">Playlist</span>
              <h3 className="text-2xl font-black text-media-primary tracking-tight">Late Night Coding</h3>
              <p className="text-media-on-surface-variant text-sm font-light mt-2">Lo-fi beats to keep the focus sharp and the ambient flow consistent.</p>
            </div>
            <div className="w-24 h-24 bg-media-secondary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <span className="material-symbols-outlined text-media-secondary text-5xl">headphones</span>
            </div>
          </div>
        </div>

        {/* Small Grid 2: Unfinished Chapters */}
        <div className="md:col-span-1 relative rounded-3xl overflow-hidden bg-media-tertiary-container group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 p-8 flex flex-col justify-center text-center items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:-rotate-6 transition-transform">
              <span className="material-symbols-outlined text-media-on-tertiary-container text-4xl">auto_stories</span>
            </div>
            <h3 className="text-xl font-bold text-media-on-tertiary-container tracking-tight">Unfinished Chapters</h3>
            <p className="text-media-on-tertiary-container/60 text-xs mt-2 uppercase font-bold tracking-tighter">12 books waiting for you</p>
          </div>
        </div>

        {/* Small Grid 3: Director's Cut */}
        <div className="md:col-span-1 relative rounded-3xl overflow-hidden bg-media-secondary-container group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 p-8 flex flex-col justify-center text-center items-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-media-on-secondary-container text-4xl">movie</span>
            </div>
            <h3 className="text-xl font-bold text-media-on-secondary-container tracking-tight">Director&apos;s Cut</h3>
            <p className="text-media-on-secondary-container/60 text-xs mt-2 uppercase font-bold tracking-tighter">Exclusive Behind-The-Scenes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
