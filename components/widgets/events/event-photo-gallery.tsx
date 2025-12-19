'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  ImageIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { Event, EventPhoto } from '@/lib/db/events';

interface EventPhotoGalleryProps {
  event: Event;
  photos: EventPhoto[];
  onUpdate: () => void;
}

export function EventPhotoGallery({ event, photos, onUpdate }: EventPhotoGalleryProps) {
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<EventPhoto | null>(null);

  // Form state
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [dateTaken, setDateTaken] = useState('');

  const resetForm = () => {
    setUrl('');
    setCaption('');
    setDateTaken('');
  };

  const handleAddPhoto = async () => {
    if (!url.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${event.slug}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          caption: caption.trim() || undefined,
          date_taken: dateTaken || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add photo');
      }

      resetForm();
      setIsAddingPhoto(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding photo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/events/${event.slug}/photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          caption: caption.trim() || null,
          date_taken: dateTaken || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update photo');
      }

      resetForm();
      setEditingPhoto(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating photo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/events/${event.slug}/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      if (lightboxIndex !== null) {
        setLightboxIndex(null);
      }
      onUpdate();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const openEditDialog = (photo: EventPhoto) => {
    setEditingPhoto(photo);
    setUrl(photo.url);
    setCaption(photo.caption || '');
    setDateTaken(photo.date_taken || '');
  };

  const closeEditDialog = () => {
    setEditingPhoto(null);
    resetForm();
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (lightboxIndex === null) return;
    
    if (direction === 'prev') {
      setLightboxIndex(lightboxIndex === 0 ? photos.length - 1 : lightboxIndex - 1);
    } else {
      setLightboxIndex(lightboxIndex === photos.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Photo Gallery
        </CardTitle>
        <Dialog open={isAddingPhoto} onOpenChange={setIsAddingPhoto}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { resetForm(); setIsAddingPhoto(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="photo-url">Image URL *</Label>
                <Input
                  id="photo-url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo-caption">Caption</Label>
                <Input
                  id="photo-caption"
                  placeholder="Describe this photo..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo-date">Date Taken</Label>
                <Input
                  id="photo-date"
                  type="date"
                  value={dateTaken}
                  onChange={(e) => setDateTaken(e.target.value)}
                />
              </div>
              {url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative h-40 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddPhoto} disabled={isSubmitting || !url.trim()}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Photo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No photos yet</p>
            <p className="text-sm mt-1">Add photos to create your event gallery</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Event photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {photo.caption && (
                    <p className="text-white text-sm truncate">{photo.caption}</p>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(photo);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>
            
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox('prev');
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox('next');
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            <div 
              className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].caption || 'Event photo'}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <div className="mt-4 text-center text-white">
                {photos[lightboxIndex].caption && (
                  <p className="text-lg">{photos[lightboxIndex].caption}</p>
                )}
                {photos[lightboxIndex].date_taken && (
                  <p className="text-sm text-white/70 mt-1">
                    {new Date(photos[lightboxIndex].date_taken + 'T00:00:00').toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-white/50 mt-2">
                  {lightboxIndex + 1} of {photos.length}
                </p>
                <a
                  href={photos[lightboxIndex].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mt-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open original
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editingPhoto !== null} onOpenChange={(open) => !open && closeEditDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-photo-url">Image URL *</Label>
                <Input
                  id="edit-photo-url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-photo-caption">Caption</Label>
                <Input
                  id="edit-photo-caption"
                  placeholder="Describe this photo..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-photo-date">Date Taken</Label>
                <Input
                  id="edit-photo-date"
                  type="date"
                  value={dateTaken}
                  onChange={(e) => setDateTaken(e.target.value)}
                />
              </div>
              {url && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="relative h-40 bg-muted rounded-lg overflow-hidden">
                    <img
                      src={url}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog}>Cancel</Button>
              <Button onClick={handleUpdatePhoto} disabled={isSubmitting || !url.trim()}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
