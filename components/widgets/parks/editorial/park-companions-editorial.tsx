"use client";

import { useState, useEffect, useCallback } from "react";
import { ParkPerson } from "@/lib/db/parks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface ParkCompanionsEditorialProps {
  parkSlug: string;
}

export function ParkCompanionsEditorial({ parkSlug }: ParkCompanionsEditorialProps) {
  const [people, setPeople] = useState<ParkPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPeople = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/people`);
      if (response.ok) {
        const data = await response.json();
        setPeople(data);
      }
    } catch (error) {
      console.error("Error fetching park people:", error);
    } finally {
      setIsLoading(false);
    }
  }, [parkSlug]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  if (isLoading || people.length === 0) return null;

  return (
    <section className="mb-24 font-lexend">
      <div className="flex items-baseline gap-4 mb-12">
        <span className="text-media-secondary font-black text-5xl md:text-7xl opacity-20 leading-none">03</span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-media-primary dark:text-media-surface">Travel Companions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {people.map((person) => (
          <div 
            key={person.id} 
            className="bg-media-surface-container-high rounded-3xl p-8 flex items-center gap-6 group hover:bg-media-surface-container-highest transition-all duration-500 shadow-xl border border-media-outline-variant/5 hover:translate-y-[-4px]"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-2xl border-4 border-white/50 group-hover:border-media-secondary/30 transition-colors duration-500">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src={person.photo || undefined} alt={person.name} className="object-cover" />
                <AvatarFallback className="text-2xl font-black bg-media-primary-container text-media-primary-fixed">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="text-2xl font-black text-media-primary dark:text-media-surface mb-1 tracking-tight">{person.name}</div>
              <div className="text-[10px] md:text-xs uppercase text-media-secondary font-black tracking-[0.2em]">
                {person.relationshipTypeName || person.relationship || "Fellow Explorer"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {people.length > 2 && (
        <div className="mt-8 flex items-center justify-center gap-4 py-6 border-y border-media-outline-variant/10">
          <div className="flex -space-x-4">
             {people.slice(2).map((_, i) => (
               <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-media-primary flex items-center justify-center text-white font-black text-xs">
                 +{people.length - 2}
               </div>
             ))}
          </div>
          <div className="text-media-on-surface-variant text-sm font-bold tracking-tight uppercase">Others joined for the expedition</div>
        </div>
      )}
    </section>
  );
}
