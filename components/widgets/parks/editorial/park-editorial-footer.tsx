"use client";

export function ParkMapSection() {
  return (
    <section className="rounded-[3rem] overflow-hidden h-96 relative group cursor-pointer shadow-2xl mb-24 border border-media-outline-variant/10 font-lexend">
      <img 
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
        alt="Topographic Route" 
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-media-primary/20 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-700">
        <div className="bg-media-surface px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 transform group-hover:scale-110 transition-transform duration-500">
          <span className="material-symbols-outlined text-media-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
          <span className="text-sm font-black text-media-primary uppercase tracking-[0.2em]">Explore Topographic Route</span>
        </div>
      </div>
    </section>
  );
}

export function ParkFooterQuote({ title }: { title: string }) {
  return (
    <footer className="mt-24 py-24 border-t border-media-outline-variant/10 text-center font-lexend">
      <div className="max-w-3xl mx-auto px-4">
        <span className="material-symbols-outlined text-media-secondary text-6xl mb-10" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
        <p className="text-4xl md:text-5xl font-black text-media-primary dark:text-media-surface leading-tight mb-12 tracking-tighter">
          &quot;{title} is not just a destination; it is a monument to the untamed spirit of the wilderness.&quot;
        </p>
        <div className="flex justify-center items-center gap-6">
          <div className="h-[1px] w-16 bg-media-outline-variant/30"></div>
          <span className="text-xs uppercase tracking-[0.4em] font-black text-media-on-surface-variant/60">Earthbound Journal — 2024</span>
          <div className="h-[1px] w-16 bg-media-outline-variant/30"></div>
        </div>
      </div>
    </footer>
  );
}
