'use client';

import { useState, useEffect, useCallback } from 'react';
import { ParkTrail } from '@/lib/db/parks';
import { Mountain, Plus, ExternalLink } from 'lucide-react';
import { ParkTrailFormDialog } from './park-trail-form-dialog';
import { ParkTrailPhotoEditDialog } from './park-trail-photo-edit-dialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ParkTrailsEditorialProps {
  parkSlug: string;
}

export function ParkTrailsEditorial({ parkSlug }: ParkTrailsEditorialProps) {
  const [trails, setTrails] = useState<ParkTrail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState<ParkTrail | null>(null);
  const [trailForPhoto, setTrailForPhoto] = useState<ParkTrail | null>(null);

  const fetchTrails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/trails`);
      if (response.ok) {
        const data = await response.json();
        setTrails(data);
      }
    } catch (error) {
      console.error('Error fetching park trails:', error);
    } finally {
      setIsLoading(false);
    }
  }, [parkSlug]);

  useEffect(() => {
    fetchTrails();
  }, [fetchTrails]);

  const handleEditTrail = (trail: ParkTrail) => {
    setSelectedTrail(trail);
    setIsDialogOpen(true);
  };

  const handleEditPhoto = (e: React.MouseEvent, trail: ParkTrail) => {
    e.stopPropagation();
    setTrailForPhoto(trail);
    setIsPhotoDialogOpen(true);
  };

  const handleAddTrail = () => {
    setSelectedTrail(null);
    setIsDialogOpen(true);
  };

  return (
    <section className="mb-24 font-lexend">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-baseline gap-4">
          <span className="text-media-secondary font-black text-5xl md:text-7xl opacity-20 leading-none">04</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-media-primary">The Trails</h2>
        </div>
        <Button 
          onClick={handleAddTrail}
          className="bg-media-secondary text-white rounded-2xl px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform shadow-xl border-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Trail
        </Button>
      </div>

      {trails.length === 0 ? (
        <div className="text-center py-24 bg-media-surface-container-low rounded-[2rem] border border-dashed border-media-outline-variant/30 flex flex-col items-center gap-6">
           <Mountain className="w-16 h-16 text-media-primary/20" />
           <p className="text-media-on-surface-variant font-light italic">No trails documented for this expedition yet.</p>
           <Button 
            onClick={handleAddTrail}
            variant="outline"
            className="rounded-xl border-media-outline-variant/20 font-black uppercase tracking-widest text-[10px]"
          >
            Log Your First Trail
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {trails.map((trail) => (
            <button 
              key={trail.id} 
              onClick={() => handleEditTrail(trail)}
              className="w-full text-left group relative bg-media-surface-container-low rounded-[2rem] p-8 md:p-12 hover:bg-media-surface-container transition-all duration-700 overflow-hidden shadow-xl border border-media-outline-variant/10 cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-10">
                <div className="flex-1 space-y-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="bg-media-primary text-media-surface px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                        {trail.difficulty || "Moderate"}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-black text-media-primary tracking-tighter group-hover:text-media-secondary transition-colors duration-300">
                        {trail.name}
                      </h3>
                      {trail.alltrails_url && (
                        <a 
                          href={trail.alltrails_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-full bg-media-secondary/10 text-media-secondary hover:bg-media-secondary hover:text-white transition-all duration-300 shadow-sm"
                          title="View on AllTrails"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-media-on-surface-variant leading-relaxed text-lg font-light max-w-2xl italic opacity-80">
                      {trail.notes || "A transformative journey through the heart of the wilderness, offering unparalleled views and a deep connection to the land."}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-8 pt-8 border-t border-media-outline-variant/10">
                    <div>
                      <span className="block text-[10px] uppercase text-media-secondary font-black tracking-[0.2em] mb-2">Distance</span>
                      <span className="text-2xl md:text-3xl font-black text-media-primary tracking-tighter">
                        {trail.distance || "0.0"} <span className="text-sm opacity-50 font-medium">mi</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-media-secondary font-black tracking-[0.2em] mb-2">Elevation</span>
                      <span className="text-2xl md:text-3xl font-black text-media-primary tracking-tighter">
                        +{trail.elevation_gain || "0"} <span className="text-sm opacity-50 font-medium">ft</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-media-secondary font-black tracking-[0.2em] mb-2">Rating</span>
                      <span className="text-2xl md:text-3xl font-black text-media-primary tracking-tighter">
                        {trail.rating || "5.0"}/10
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:block w-full lg:w-72 h-72 rounded-3xl overflow-hidden shadow-2xl skew-y-1 group-hover:skew-y-0 transition-transform duration-700 relative">
                  <img 
                    src={trail.photo_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"} 
                    alt={trail.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  
                  {/* Photo Edit Button */}
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={(e) => handleEditPhoto(e, trail)}
                      size="icon"
                      variant="ghost"
                      className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 border border-white/20 transition-all shadow-lg hover:scale-110 h-10 w-10 group/btn"
                      title="Edit Trail Photo"
                    >
                      <Pencil className="w-5 h-5 group-hover/btn:scale-110 text-white transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Edit Indicator Overlay */}
              <div className="absolute top-8 right-8 text-media-secondary opacity-0 group-hover:opacity-40 transition-opacity">
                 <span className="material-symbols-outlined text-3xl">edit_note</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <ParkTrailFormDialog 
        parkSlug={parkSlug}
        trail={selectedTrail}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchTrails}
      />

      {trailForPhoto && (
        <ParkTrailPhotoEditDialog
          open={isPhotoDialogOpen}
          onOpenChange={setIsPhotoDialogOpen}
          parkSlug={parkSlug}
          trail={trailForPhoto}
          onSuccess={fetchTrails}
        />
      )}
    </section>
  );
}

