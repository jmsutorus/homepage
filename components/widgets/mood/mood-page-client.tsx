"use client";

import { useState, useMemo } from "react";
import { MoodEntry } from "@/lib/db/mood";
import { format, subDays, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/use-haptic";

interface MoodPageClientProps {
  initialMoodData: MoodEntry[];
  userId: string;
}

const MOODS = [
  { label: "Radiant", rating: 5, icon: "wb_sunny", color: "bg-media-secondary", textColor: "text-media-on-secondary", containerColor: "bg-media-secondary-container/20" },
  { label: "Serene", rating: 4, icon: "filter_vintage", color: "bg-media-primary-container", textColor: "text-media-on-primary", containerColor: "bg-media-primary-container/20" },
  { label: "Flowing", rating: 3, icon: "waves", color: "bg-media-on-primary-container", textColor: "text-media-on-primary", containerColor: "bg-media-on-primary-container/20" },
  { label: "Reflective", rating: 2, icon: "cloud", color: "bg-media-tertiary", textColor: "text-media-on-tertiary", containerColor: "bg-media-tertiary-container/20" },
  { label: "Shadowed", rating: 1, icon: "nights_stay", color: "bg-media-inverse-surface", textColor: "text-media-inverse-on-surface", containerColor: "bg-media-inverse-surface/20" },
];

export function MoodPageClient({ initialMoodData, userId }: MoodPageClientProps) {
  const [moodData, setMoodData] = useState<MoodEntry[]>(initialMoodData);
  const [isLogging, setIsLogging] = useState(false);
  const haptic = useHaptic();

  // Last 30 days of mood data for the landscape
  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const entry = moodData.find((e) => e.date === dateStr);
      days.push({
        date,
        dateStr,
        rating: entry?.rating || 0,
        entry,
      });
    }
    return days;
  }, [moodData]);

  // Recent reflections (notes)
  const recentReflections = useMemo(() => {
    return [...moodData]
      .filter((e) => e.note && e.note.trim() !== "")
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  }, [moodData]);

  // Monthly resonance
  const monthlyResonance = useMemo(() => {
    const now = new Date();
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end = format(endOfMonth(now), "yyyy-MM-dd");
    const monthEntries = moodData.filter((e) => e.date >= start && e.date <= end);
    
    if (monthEntries.length === 0) return { label: "No Data", percentage: 0 };

    const counts: Record<number, number> = {};
    monthEntries.forEach((e) => {
      counts[e.rating] = (counts[e.rating] || 0) + 1;
    });

    let topRating = 5;
    let maxCount = 0;
    Object.entries(counts).forEach(([rating, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRating = parseInt(rating);
      }
    });

    const mood = MOODS.find((m) => m.rating === topRating) || MOODS[0];
    const percentage = Math.round((maxCount / monthEntries.length) * 100);

    return { label: mood.label, percentage, color: mood.color };
  }, [moodData]);

  const handleMoodSelect = async (rating: number) => {
    haptic.trigger("light");
    const today = format(new Date(), "yyyy-MM-dd");
    setIsLogging(true);

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: today, rating }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setMoodData((prev) => {
          const index = prev.findIndex((e) => e.date === today);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = newEntry;
            return updated;
          }
          return [...prev, newEntry];
        });
        toast.success(`Today is looking ${MOODS.find(m => m.rating === rating)?.label.toLowerCase()}.`);
      } else {
        toast.error("Failed to log mood.");
      }
    } catch (error) {
      console.error("Error logging mood:", error);
      toast.error("An error occurred.");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen text-media-on-surface font-body pb-24 md:pb-12">
      <main className="max-w-6xl mx-auto px-6 md:px-8 py-12">
        {/* Immersive Header */}
        <section className="mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-headline font-bold text-media-primary tracking-tight mb-4"
          >
            Mood Landscape
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-media-on-surface-variant mb-12"
          >
            How is your heart today?
          </motion.p>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
            {MOODS.map((mood, index) => (
              <motion.button
                key={mood.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => handleMoodSelect(mood.rating)}
                disabled={isLogging}
                className={cn(
                  "group flex flex-col items-center p-6 md:p-8 bg-media-surface-container-low rounded-xl transition-all duration-300 hover:bg-media-secondary-fixed border border-transparent hover:border-media-secondary/20 shadow-sm hover:shadow-md",
                  moodData.some(e => e.date === format(new Date(), "yyyy-MM-dd") && e.rating === mood.rating) && "ring-2 ring-media-secondary ring-offset-2 bg-media-secondary-fixed"
                )}
              >
                <div className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  mood.color
                )}>
                  <span className={cn("material-symbols-outlined text-3xl", mood.textColor)} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {mood.icon}
                  </span>
                </div>
                <span className="font-label uppercase tracking-widest text-[10px] md:text-xs font-bold text-media-on-surface-variant group-hover:text-media-primary transition-colors duration-300">
                  {mood.label}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* The Mood Landscape Visualization */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold text-media-primary mb-2">Emotional Horizons</h2>
              <p className="text-media-on-surface-variant uppercase tracking-widest text-[10px] font-bold">The Last 30 Cycles</p>
            </div>
            <div className="hidden md:flex gap-4">
              {MOODS.slice(0, 2).map(m => (
                <span key={m.label} className="flex items-center gap-2 text-xs font-label text-media-on-surface-variant">
                  <span className={cn("w-3 h-3 rounded-full", m.color)}></span> {m.label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="relative w-full h-[400px] bg-media-surface-container-low rounded-2xl overflow-hidden p-8 md:p-12 flex items-end gap-1 md:gap-2 shadow-inner border border-media-outline-variant/10 landscape-gradient">
            <div className="absolute inset-0 bg-gradient-to-t from-media-background/10 to-transparent pointer-events-none" />
            
            {last30Days.map((day, i) => {
              const mood = MOODS.find(m => m.rating === day.rating);
              const height = day.rating === 0 ? "5%" : `${(day.rating / 5) * 90}%`;
              
              return (
                <motion.div
                  key={day.dateStr}
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ delay: i * 0.02, duration: 0.5 }}
                  className={cn(
                    "flex-1 rounded-t-full transition-all hover:scale-x-110 relative group",
                    mood ? mood.color : "bg-media-outline-variant"
                  )}
                  style={{ opacity: mood ? 1 : 0.1 }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-media-surface-container-highest px-2 py-1 rounded text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-sm border border-media-outline-variant">
                    {format(day.date, "MMM d")}: {mood?.label || "None"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Bento Grid for Reflections and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Reflections (Large Bento Cell) */}
          <div className="lg:col-span-2 bg-media-surface-container rounded-3xl p-8 md:p-10 shadow-sm border border-media-outline-variant/10">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-headline font-bold text-media-primary">Emotional Echoes</h3>
              <span className="material-symbols-outlined text-media-secondary text-3xl">auto_stories</span>
            </div>
            
            <div className="space-y-10">
              {recentReflections.length > 0 ? (
                recentReflections.map((reflection, i) => (
                  <motion.div 
                    key={reflection.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="relative pl-8"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-media-outline-variant/50"></div>
                    <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-media-secondary"></div>
                    <span className="font-label uppercase tracking-widest text-[10px] text-media-on-surface-variant block mb-3">
                      {format(parseISO(reflection.date), "EEEE, MMM d")}
                    </span>
                    <p className={cn(
                      "text-lg font-body text-media-primary leading-relaxed",
                      reflection.rating <= 2 && "italic opacity-80"
                    )}>
                      &quot;{reflection.note}&quot;
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-media-on-surface-variant italic">
                  No reflections yet. Add a note to your mood entries to see them here.
                </div>
              )}
            </div>
          </div>

          {/* Editorial Insights */}
          <div className="flex flex-col gap-8">
            {/* Monthly Resonance */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-media-primary text-media-on-primary rounded-3xl p-10 flex flex-col justify-between h-[300px] shadow-lg relative overflow-hidden group"
            >
              <div className="relative z-10">
                <span className="font-label uppercase tracking-widest text-[10px] text-media-on-primary/60">Monthly Resonance</span>
                <div className="mt-8">
                  <span className="text-7xl font-headline font-bold text-media-on-primary">{monthlyResonance.percentage}%</span>
                  <p className="text-2xl font-headline text-media-on-primary/80 mt-1">{monthlyResonance.label}</p>
                </div>
              </div>
              <div className="relative z-10">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${monthlyResonance.percentage}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
                    className={cn(
                      "h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]", 
                      monthlyResonance.percentage > 0 ? "bg-media-secondary" : "bg-media-on-primary/20"
                    )} 
                  />
                </div>
              </div>
              <div className="absolute right-[-20%] top-[-20%] w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            </motion.div>

            {/* Wellbeing Trends */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-media-surface-container-highest rounded-3xl p-10 flex flex-col justify-between h-[300px] shadow-sm border border-media-outline-variant/10"
            >
              <div>
                <span className="font-label uppercase tracking-widest text-[10px] text-media-on-surface-variant">Wellbeing Trends</span>
                <h4 className="mt-8 text-2xl font-headline font-bold text-media-primary">Harmonic Ascent</h4>
                <p className="mt-4 text-sm text-media-on-surface-variant leading-relaxed">
                  Your emotional stability has increased by 12% following more frequent nature logs.
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="material-symbols-outlined text-media-secondary text-5xl">trending_up</span>
                <button className="cursor-pointer text-xs font-bold font-label uppercase tracking-widest text-media-primary border-b-2 border-media-primary/20 hover:border-media-primary pb-1 transition-all">
                  View Full Report
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Asymmetric Call to Action */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 relative overflow-hidden bg-media-primary-container rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-8"
        >
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-media-on-primary mb-4 tracking-tight">Deepen your exploration.</h2>
            <p className="text-media-on-primary-container max-w-md text-lg opacity-90">
              Connect your sleep data to see how the night shapes your morning horizon.
            </p>
          </div>
          <Button size="lg" className="relative z-10 bg-media-secondary text-white hover:bg-media-secondary/90 px-10 py-7 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all outline-none border-none">
            Connect Wellbeing Hub
          </Button>
          
          {/* Decorative gradients */}
          <div className="absolute right-[-10%] bottom-[-20%] w-96 h-96 bg-media-secondary opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute left-[-5%] top-[-10%] w-64 h-64 bg-media-primary opacity-30 rounded-full blur-3xl"></div>
        </motion.section>
      </main>

      <style jsx global>{`
        .landscape-gradient {
          background: linear-gradient(180deg, rgba(159, 64, 45, 0.05) 0%, rgba(6, 27, 14, 0.02) 100%);
        }
        .safe-area-bottom {
          padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
        }
        @font-face {
          font-family: 'Lexend';
          font-style: normal;
          font-weight: 100 900;
          font-display: swap;
          src: url(https://fonts.gstatic.com/s/lexend/v18/cy9S7m9PCW9A600P.woff2) format('woff2');
        }
        .font-headline { font-family: var(--font-font-lexend), 'Lexend', sans-serif; }
        .font-body { font-family: var(--font-font-lexend), 'Lexend', sans-serif; }
        .font-label { font-family: var(--font-font-lexend), 'Lexend', sans-serif; }
      `}</style>
    </div>
  );
}
