"use client";

import { useState, useEffect, useCallback } from "react";
import { ParkPhoto } from "@/lib/db/parks";
import { cn } from "@/lib/utils";
import { Loader2, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParkPhotoFormDialog } from "@/components/widgets/parks/editorial/park-photo-form-dialog";

interface ParkGalleryEditorialProps {
  parkSlug: string;
}

export function ParkGalleryEditorial({ parkSlug }: ParkGalleryEditorialProps) {
  const [photos, setPhotos] = useState<ParkPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ParkPhoto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/parks/${parkSlug}/photos`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error("Error fetching park photos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [parkSlug]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleAddPhoto = () => {
    setSelectedPhoto(null);
    setIsFormOpen(true);
  };

  const handleEditPhoto = (photo: ParkPhoto) => {
    setSelectedPhoto(photo);
    setIsFormOpen(true);
  };

  return (
    <section className="mb-24 font-lexend">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-baseline gap-4">
          <span className="text-media-secondary font-black text-5xl md:text-7xl opacity-20 leading-none">02</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-media-primary">The Gallery</h2>
        </div>
        <Button 
          onClick={handleAddPhoto}
          className="bg-media-secondary text-white rounded-2xl px-8 py-6 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-transform shadow-xl border-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Photo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-12 h-12 animate-spin text-media-secondary opacity-50" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-24 bg-media-surface-container-low rounded-[2.5rem] border border-dashed border-media-outline-variant/30 flex flex-col items-center gap-6">
           <ImageIcon className="w-16 h-16 text-media-primary/20" />
           <p className="text-media-on-surface-variant font-light italic text-lg">Visual memories of the wild await. Start your gallery.</p>
           <Button 
            onClick={handleAddPhoto}
            variant="outline"
            className="rounded-xl border-media-outline-variant/20 font-black uppercase tracking-widest text-[10px] px-8"
          >
            Add Your First Photo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((photo, i) => (
            <div 
              key={photo.id}
              onClick={() => handleEditPhoto(photo)}
              className={cn(
                "group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer hover:translate-y-[-8px] transition-all duration-700",
                i % 3 === 1 ? "md:translate-y-12" : ""
              )}
            >
              <img 
                src={photo.url} 
                alt={photo.caption || "Park photo"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                {photo.caption && (
                  <p className="text-white text-lg font-bold leading-tight mb-2">{photo.caption}</p>
                )}
                <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-black">
                  {photo.date_taken ? new Date(photo.date_taken).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : "Captured in the Wild"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ParkPhotoFormDialog
        parkSlug={parkSlug}
        photo={selectedPhoto}
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchPhotos}
      />
    </section>
  );
}
