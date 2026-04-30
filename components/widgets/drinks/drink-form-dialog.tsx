'use client';

import { useState, useEffect, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Drink, DrinkType, DrinkStatus } from '@/lib/db/drinks';
import { Infinity, Image as ImageIcon, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { EditorialInput, EditorialTextarea } from '@/components/ui/editorial-input';

interface DrinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Drink;
}

export function DrinkFormDialog({ open, onOpenChange, onSuccess, initialData }: DrinkFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const { showSuccess, triggerSuccess } = useSuccessDialog({
    duration: 2000,
    onClose: () => {
      onOpenChange(false);
      onSuccess();
    },
  });

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<DrinkType>('beer');
  const [producer, setProducer] = useState('');
  const [year, setYear] = useState('');
  const [abv, setAbv] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [status, setStatus] = useState<DrinkStatus>('tasted');
  const [bodyFeel, setBodyFeel] = useState('');
  const [servingTemp, setServingTemp] = useState('');
  const [pairings, setPairings] = useState('');

  // Photo upload state
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type || 'beer');
      setProducer(initialData.producer || '');
      setYear(initialData.year?.toString() || '');
      setAbv(initialData.abv?.toString() || '');
      setRating(initialData.rating?.toString() || '');
      setNotes(initialData.notes || '');
      setImageUrl(initialData.image_url || '');
      setPreviewUrl(initialData.image_url || null);
      setFavorite(initialData.favorite);
      setStatus(initialData.status);
      setBodyFeel(initialData.body_feel || '');
      setServingTemp(initialData.serving_temp || '');
      setPairings(initialData.pairings || '');
    } else {
      setName('');
      setType('beer');
      setProducer('');
      setYear('');
      setAbv('');
      setRating('');
      setNotes('');
      setImageUrl('');
      setPreviewUrl(null);
      setSelectedFile(null);
      setFavorite(false);
      setStatus('tasted');
      setBodyFeel('');
      setServingTemp('');
      setPairings('');
    }
  }, [initialData, open]);

  const isNoPreviewFormat = selectedFile && 
    (selectedFile.name.toLowerCase().endsWith(".heic") || 
     selectedFile.name.toLowerCase().endsWith(".dng"));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/drinks/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to upload photo");
    }
    return data.photoUrl;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      // Handle file upload if a file is selected
      if (photoMode === "upload" && selectedFile) {
        setIsUploading(true);
        try {
          finalImageUrl = await uploadPhoto(selectedFile);
        } catch (error) {
          toast.error("Photo upload failed. Proceeding with existing URL.");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      }

      const data = {
        name,
        type,
        producer: producer || undefined,
        year: year ? parseInt(year) : undefined,
        abv: abv ? parseFloat(abv) : undefined,
        rating: rating ? parseInt(rating) : undefined,
        notes: notes || undefined,
        image_url: finalImageUrl || undefined,
        favorite,
        status,
        body_feel: bodyFeel || undefined,
        serving_temp: servingTemp || undefined,
        pairings: pairings || undefined,
      };

      const url = initialData 
        ? `/api/drinks/${initialData.slug}`
        : '/api/drinks';
      
      const method = initialData ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to save drink');
      }

      if (initialData) {
        toast.success('Drink updated');
        onOpenChange(false);
        onSuccess();
      } else {
        triggerSuccess();
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? 'Refine Entry' : 'Record Drink'}
      description={initialData ? 'Update drink details' : 'Add a new selection to your library.'}
      submitText={loading ? 'Syncing...' : (initialData ? 'Update Drink' : 'Save Drink')}
      isLoading={loading}
      onSubmit={handleSubmit}
      maxWidth="sm:max-w-4xl"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
          <div className="relative">
            <TreeSuccess size={160} showText={false} />
            <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Drink saved</h3>
            <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
              Drink profile archived. Sensory data and producer technicals synced to the library.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 01: Core Identity */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Drink Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <EditorialInput 
                label="Drink Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Heady Topper"
                required
                containerClassName="md:col-span-2"
                sizeVariant="xl"
              />

              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Type</label>
                <Select value={type} onValueChange={(v) => setType(v as DrinkType)}>
                  <SelectTrigger className="w-full px-8 py-8 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container border-media-outline-variant">
                    <SelectItem value="beer" className="font-lexend">Beer</SelectItem>
                    <SelectItem value="wine" className="font-lexend">Wine</SelectItem>
                    <SelectItem value="cocktail" className="font-lexend">Cocktail</SelectItem>
                    <SelectItem value="spirit" className="font-lexend">Spirit</SelectItem>
                    <SelectItem value="coffee" className="font-lexend">Coffee</SelectItem>
                    <SelectItem value="tea" className="font-lexend">Tea</SelectItem>
                    <SelectItem value="other" className="font-lexend">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as DrinkStatus)}>
                  <SelectTrigger className="w-full px-8 py-8 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container border-media-outline-variant">
                    <SelectItem value="tasted" className="font-lexend">Tasted</SelectItem>
                    <SelectItem value="want_to_try" className="font-lexend">Want to Try</SelectItem>
                    <SelectItem value="stocked" className="font-lexend">Stocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <EditorialInput 
                label="Producer"
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                placeholder="The Alchemist"
                sizeVariant="lg"
              />

              <EditorialInput 
                label="Year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2023"
                sizeVariant="lg"
              />
            </div>
          </div>

          {/* Section 02: Technicals */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Technical Specs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <EditorialInput 
                label="ABV %"
                value={abv}
                onChange={(e) => setAbv(e.target.value)}
                placeholder="8.0"
                sizeVariant="lg"
              />
              <EditorialInput 
                label="Serving Temp"
                value={servingTemp}
                onChange={(e) => setServingTemp(e.target.value)}
                placeholder="6-8°C"
                sizeVariant="lg"
              />
              <EditorialInput 
                label="Rating (1-10)"
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="10"
                sizeVariant="lg"
              />
            </div>
          </div>

          {/* Section 03: Profile */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 03</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Sensory Profile</h3>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <EditorialInput 
                  label="Body & Feel"
                  value={bodyFeel}
                  onChange={(e) => setBodyFeel(e.target.value)}
                  placeholder="Creamy & Unfiltered"
                  sizeVariant="lg"
                />
                <EditorialInput 
                  label="Pairings"
                  value={pairings}
                  onChange={(e) => setPairings(e.target.value)}
                  placeholder="Pretzels, Weisswurst"
                  sizeVariant="lg"
                />
              </div>

              <EditorialTextarea 
                label="Aromatic Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hazy, juicy, delicious..."
                className="min-h-[120px]"
                sizeVariant="lg"
              />

              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Temporal Nature</label>
                <div 
                  className="flex items-center justify-between px-8 py-6 bg-media-surface-container-low rounded-2xl border-2 border-transparent cursor-pointer group"
                  onClick={() => setFavorite(!favorite)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${favorite ? 'bg-media-secondary/20' : 'bg-media-secondary/10'}`}>
                      <Infinity className={`h-6 w-6 transition-colors ${favorite ? 'text-media-secondary' : 'text-media-on-surface-variant/40'}`} />
                    </div>
                    <div>
                      <span className="block text-media-primary font-bold font-lexend">Favorite Selection</span>
                      <span className="text-xs text-media-on-surface-variant/60 font-medium">Mark this as a priority in your collection.</span>
                    </div>
                  </div>
                  <Switch checked={favorite} onCheckedChange={setFavorite} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Visual Reference</label>
                <div className="bg-media-surface-container-low border-2 border-transparent rounded-2xl overflow-hidden">
                  <div className="flex border-b-2 border-media-outline-variant/5">
                    <button
                      type="button"
                      onClick={() => setPhotoMode("upload")}
                      className={cn(
                        "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all",
                        photoMode === "upload" ? "bg-media-secondary text-media-on-secondary" : "text-media-on-surface-variant hover:bg-media-surface-container-high"
                      )}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode("url")}
                      className={cn(
                        "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all",
                        photoMode === "url" ? "bg-media-secondary text-media-on-secondary" : "text-media-on-surface-variant hover:bg-media-surface-container-high"
                      )}
                    >
                      <LinkIcon className="w-4 h-4" />
                      URL
                    </button>
                  </div>

                  <div className="p-6">
                    {photoMode === "upload" ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-media-outline-variant/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-media-surface-container-high transition-all min-h-[160px] group"
                      >
                        {previewUrl ? (
                          isNoPreviewFormat ? (
                            <div className="relative w-32 h-32 rounded-2xl bg-media-surface-container-high flex flex-col items-center justify-center gap-2 border-2 border-dashed border-media-outline-variant/50 text-media-primary p-4 transition-transform group-hover:scale-105">
                              <ImageIcon className="w-10 h-10 text-media-secondary/80" />
                              <p className="text-[10px] font-bold text-center">Preview unavailable for {selectedFile?.name.split('.').pop()?.toUpperCase()}</p>
                              {isUploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-media-secondary/20 shadow-2xl transition-transform group-hover:scale-105">
                              <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                              {isUploading && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-media-surface-container-high flex items-center justify-center text-media-on-surface-variant/20 border-2 border-media-outline-variant/10 transition-all group-hover:border-media-secondary/30">
                            <ImageIcon className="w-10 h-10" />
                          </div>
                        )}
                        <div className="text-center space-y-1">
                          <p className="text-[10px] font-black text-media-primary uppercase tracking-[0.1em]">Select Asset</p>
                          <p className="text-[9px] text-media-on-surface-variant uppercase font-bold opacity-40 tracking-widest">PNG, JPG, WebP, HEIC or DNG</p>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <input 
                            type="url"
                            value={imageUrl}
                            onChange={(e) => {
                              setImageUrl(e.target.value);
                              setPreviewUrl(e.target.value || null);
                            }}
                            className="w-full px-8 py-5 bg-media-surface-container border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend placeholder:text-media-on-surface-variant/20 pr-16"
                            placeholder="https://assets.library.com/drink-photo.jpg"
                          />
                          <LinkIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-media-on-surface-variant/20 pointer-events-none" />
                        </div>
                        {previewUrl && (
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-media-outline-variant/10 mx-auto shadow-xl">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewUrl(null)} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </ResponsiveDialog>
  );
}

