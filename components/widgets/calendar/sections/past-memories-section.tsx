"use client";

import { motion } from "framer-motion";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import type { MediaContent } from "@/lib/db/media";
import type { JournalContent } from "@/lib/db/journals";
import { cn } from "@/lib/utils";

interface PastMemoriesSectionProps {
  media: MediaContent[];
  journals: JournalContent[];
}

export function PastMemoriesSection({ media, journals }: PastMemoriesSectionProps) {
  // Combine journals and media for memories
  const memories = [
    ...journals.map(j => ({
      type: 'journal',
      date: j.daily_date || j.created_at?.split('T')[0],
      title: j.title,
      image: null, // Journals usually use placeholders
      id: j.id
    })),
    ...media.map(m => ({
      type: 'media',
      date: m.completed?.split('T')[0],
      title: m.title,
      image: m.poster,
      id: m.id
    }))
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  }).slice(0, 4);

  if (memories.length === 0) return null;

  return (
    <section className="mt-20 border-t border-media-surface-container pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-media-primary tracking-tight">Past Memories</h3>
          <p className="text-xs text-media-on-surface-variant opacity-60">Relive the highlights of last month</p>
        </div>
        <button className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-media-secondary flex items-center gap-2 hover:opacity-70 transition-opacity">
          View Full Archive
          <MaterialSymbol icon="arrow_forward" size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {memories.map((memory, idx) => (
          <motion.div
            key={`${memory.type}-${memory.id}`}
            whileHover={{ scale: 1.02 }}
            className="aspect-[3/4] rounded-lg overflow-hidden relative group cursor-pointer"
          >
            {memory.image ? (
              <img 
                src={memory.image} 
                alt="" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
              />
            ) : (
              <div className="w-full h-full bg-media-surface-container flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                <MaterialSymbol 
                  icon={memory.type === 'journal' ? 'edit_note' : 'movie'} 
                  size={48} 
                  className="text-media-on-surface-variant/20" 
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end text-white">
              <span className="text-[8px] font-bold tracking-widest uppercase opacity-80">
                {memory.date ? new Date(memory.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Past'}
              </span>
              <span className="text-xs font-bold line-clamp-1">{memory.title}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
