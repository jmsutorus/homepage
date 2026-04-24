"use client";

import { motion } from "framer-motion";
import { MaterialSymbol } from "@/components/ui/MaterialSymbol";
import { format } from "date-fns";
import type { EventWithCoverPhoto } from "@/lib/db/events";
import type { CalendarPersonEvent } from "@/lib/db/calendar";
import { cn } from "@/lib/utils";

interface ComingUpSectionProps {
  events: EventWithCoverPhoto[];
  peopleEvents: CalendarPersonEvent[];
  vacations: any[];
  milestones: any[];
}

export function ComingUpSection({ events, peopleEvents, vacations, milestones }: ComingUpSectionProps) {
  // Combine and sort the first 2 "hero" items
  const heroItems = [
    ...events.map(e => ({
      type: 'event',
      date: new Date(e.date),
      dateStr: format(new Date(e.date), 'MMMM do'),
      title: e.title,
      description: e.location || e.description || 'Upcoming Event',
      image: e.cover_photo,
      color: 'primary'
    })),
    ...peopleEvents.map(p => ({
      type: 'birthday',
      date: new Date(p.date),
      dateStr: format(new Date(p.date), 'MMMM do'),
      title: `${p.name}'s ${p.eventType === 'birthday' ? 'Birthday' : 'Anniversary'}`,
      description: p.age ? `${p.age} years old` : p.relationship,
      image: null,
      color: 'secondary'
    })),
    ...vacations.map(v => ({
      type: 'vacation',
      date: new Date(v.start_date || v.vacation?.start_date),
      dateStr: format(new Date(v.start_date || v.vacation?.start_date), 'MMMM do'),
      title: v.title || v.vacation?.title || 'Vacation',
      description: v.location || v.vacation?.location || 'Digital detox adventure',
      image: null,
      color: 'tertiary'
    }))
  ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 2);

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-media-primary">Coming Up</h3>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-media-secondary">April & May</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {heroItems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "relative group overflow-hidden rounded-xl h-64",
              item.color === 'primary' ? "bg-media-primary-container" : 
              item.color === 'secondary' ? "bg-media-surface-container-highest" : "bg-media-surface-container-low"
            )}
          >
            {item.image ? (
                <img 
                    src={item.image} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-soft-light group-hover:scale-110 transition-transform duration-700" 
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-media-surface-container to-transparent opacity-50" />
            )}
            
            <div className={cn(
                "absolute inset-0 p-6 flex flex-col justify-end",
                item.image || item.color === 'primary' ? "bg-gradient-to-t from-media-primary/60 to-transparent" : ""
            )}>
              <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest relative z-10",
                  item.image || item.color === 'primary' ? "text-media-secondary-fixed" : "text-media-secondary"
              )}>
                {item.dateStr}
              </span>
              <h4 className={cn(
                  "text-2xl font-bold tracking-tight",
                  item.image || item.color === 'primary' ? "text-white" : "text-media-primary"
              )}>
                {item.title}
              </h4>
              <p className={cn(
                  "text-xs mt-1",
                  item.image || item.color === 'primary' ? "text-media-on-primary-container/80" : "text-media-on-surface-variant"
              )}>
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Milestones Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-media-surface-container-low rounded-xl p-6 flex flex-col h-64"
        >
          <h5 className="text-[11px] font-bold uppercase tracking-widest mb-auto opacity-60">Upcoming Milestones</h5>
          <div className="flex flex-col gap-4">
            {milestones.length > 0 ? milestones.slice(0, 2).map((m, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-media-surface-container flex items-center justify-center">
                  <MaterialSymbol icon={m.title.toLowerCase().includes('car') ? 'airport_shuttle' : 'flag'} size={20} className="text-media-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold line-clamp-1">{m.title}</span>
                  <span className="text-[10px] opacity-60">
                    {format(new Date(m.target_date), 'MMMM do')}
                  </span>
                </div>
              </div>
            )) : (
              <div className="flex items-center gap-4 opacity-40">
                <div className="w-10 h-10 rounded-lg bg-media-surface-container flex items-center justify-center">
                  <MaterialSymbol icon="event_upcoming" size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">No Milestones</span>
                  <span className="text-[10px]">Stay focused</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
