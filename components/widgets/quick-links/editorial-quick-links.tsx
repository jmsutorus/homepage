"use client";

import { useEffect, useState } from "react";

interface QuickLink {
  id: number;
  title: string;
  url: string;
  icon: string;
  order_index: number;
}

interface QuickLinkCategory {
  id: number;
  name: string;
  order_index: number;
  links: QuickLink[];
}

export function EditorialQuickLinks() {
  const [categories, setCategories] = useState<QuickLinkCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuickLinks = async () => {
    try {
      const response = await fetch("/api/quick-links");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch quick links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickLinks();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 h-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-media-surface-container-low rounded-xl p-4 h-24 border border-media-outline-variant/30" />
        ))}
      </div>
    );
  }

  // Flatten all links across categories and taking the first 4 for the 2x2 grid
  const allLinks = categories.flatMap(c => c.links).slice(0, 4);

  return (
    <div className="lg:col-span-4 flex flex-col gap-4">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-media-on-surface-variant font-bold">Quick Navigation</h4>
      <div className="grid grid-cols-2 gap-4 h-full min-h-[200px]">
        {allLinks.map((link) => {
          return (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-media-surface-container-low hover:bg-media-primary-container hover:text-white transition-all duration-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group border border-media-outline-variant/30 text-media-on-surface"
            >
              <span className="text-xs font-bold tracking-tight text-center line-clamp-2 uppercase">{link.title}</span>
            </a>
          );
        })}
        {/* Fill empty spots if less than 4 */}
        {Array.from({ length: Math.max(0, 4 - allLinks.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-media-surface-container-low border border-media-outline-variant/30 rounded-xl p-4 opacity-50 flex items-center justify-center" />
        ))}
      </div>
    </div>
  );
}
