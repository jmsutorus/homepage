"use client";

import { useState, useEffect, useCallback } from "react";
import { ParkPhoto } from "@/lib/db/parks";
import { cn } from "@/lib/utils";
import { Loader2, ImageIcon } from "lucide-react";

interface ParkGalleryEditorialProps {
  parkSlug: string;
}

export function ParkGalleryEditorial({ parkSlug }: ParkGalleryEditorialProps) {
  const [photos, setPhotos] = useState<ParkPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-12 h-12 animate-spin text-media-secondary opacity-50" />
      </div>
    );
  }

  if (photos.length === 0) return null;

  return (
    <section className="mb-24 font-lexend">
      <div className="flex items-baseline gap-4 mb-12">
        <span className="text-media-secondary font-black text-5xl md:text-7xl opacity-20 leading-none">02</span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-media-primary dark:text-media-surface">The Photo Gallery</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {photos.slice(0, 4).map((photo, index) => (
          <div
            key={photo.id}
            className={cn(
              "rounded-3xl overflow-hidden bg-media-surface-container shadow-2xl relative group",
              index === 0 ? "col-span-2 row-span-2 aspect-[4/3] md:aspect-auto" : "aspect-square"
            )}
          >
            <img
              src={photo.url}
              alt={photo.caption || `Park photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            {photo.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <p className="text-white text-sm font-medium">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}

        {photos.length > 4 && (
          <div className="col-span-2 md:col-span-3 rounded-3xl overflow-hidden bg-media-surface-container h-80 mt-2 relative group shadow-2xl">
            <img
              src={photos[4].url}
              alt={photos[4].caption || "Park photo large"}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
             {photos[4].caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <p className="text-white text-sm font-medium">{photos[4].caption}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {photos.length > 5 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
           {photos.slice(5, 9).map((photo) => (
             <div key={photo.id} className="aspect-square rounded-2xl overflow-hidden shadow-lg group relative">
                <img
                  src={photo.url}
                  alt={photo.caption || "Extra photo"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
             </div>
           ))}
        </div>
      )}
    </section>
  );
}
