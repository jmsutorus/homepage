"use client";

import { useState, useEffect, useCallback } from "react";
import { ParkPerson } from "@/lib/db/parks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParkPersonFormDialog } from "./park-person-form-dialog";

interface ParkCompanionsEditorialProps {
  parkSlug: string;
}

export function ParkCompanionsEditorial({ parkSlug }: ParkCompanionsEditorialProps) {
  const [people, setPeople] = useState<ParkPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<ParkPerson | null>(null);

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

  const handleAddCompanion = () => {
    setSelectedPerson(null);
    setIsDialogOpen(true);
  };

  const handleEditPerson = (person: ParkPerson) => {
    setSelectedPerson(person);
    setIsDialogOpen(true);
  };

  return (
    <section className="mb-24 font-lexend">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-baseline gap-4">
          <span className="text-media-secondary font-black text-5xl md:text-7xl opacity-20 leading-none">03</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-media-primary">Travel Companions</h2>
        </div>
        <Button 
          onClick={handleAddCompanion}
          className="bg-media-secondary text-white rounded-2xl px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform shadow-xl border-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Companion
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-media-secondary/20" />
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-24 bg-media-surface-container-low rounded-[2rem] border border-dashed border-media-outline-variant/30 flex flex-col items-center gap-6">
           <Users className="w-16 h-16 text-media-primary/20" />
           <p className="text-media-on-surface-variant font-light italic">Every journey is better with friends. Who shared this one?</p>
           <Button 
            onClick={handleAddCompanion}
            variant="outline"
            className="rounded-xl border-media-outline-variant/20 font-black uppercase tracking-widest text-[10px]"
          >
            Add Your First Companion
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {people.map((person) => (
            <button 
              key={person.id} 
              onClick={() => handleEditPerson(person)}
              className="cursor-pointer bg-media-surface-container-high rounded-3xl p-8 flex items-center gap-6 group hover:bg-media-surface-container-highest transition-all duration-500 shadow-xl border border-media-outline-variant/5 hover:translate-y-[-4px] text-left"
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
                <div className="text-2xl font-black text-media-primary mb-1 tracking-tight">{person.name}</div>
                <div className="text-[10px] md:text-xs uppercase text-media-secondary font-black tracking-[0.2em]">
                  {person.relationshipTypeName || person.relationship || "Fellow Explorer"}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <ParkPersonFormDialog 
        parkSlug={parkSlug}
        person={selectedPerson}
        existingPeople={people}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchPeople}
      />
    </section>
  );
}
