'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { Drink, DrinkType, DrinkStatus } from '@/lib/db/drinks';
import { Send, X, Infinity, Image as ImageIcon, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { TreeSuccess } from "@/components/ui/animations/tree-success";
import { useSuccessDialog } from "@/hooks/use-success-dialog";
import { useRef } from 'react';

interface DrinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: Drink;
}

export function DrinkFormDialog({ open, onOpenChange, onSuccess, initialData }: DrinkFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { showSuccess, triggerSuccess, resetSuccess } = useSuccessDialog({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const formFields = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Heady Topper" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as DrinkType)}>
            <SelectTrigger className="text-base h-12 border-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beer">Beer</SelectItem>
              <SelectItem value="wine">Wine</SelectItem>
              <SelectItem value="cocktail">Cocktail</SelectItem>
              <SelectItem value="spirit">Spirit</SelectItem>
              <SelectItem value="coffee">Coffee</SelectItem>
              <SelectItem value="tea">Tea</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="producer">Producer (Brewery/Winery)</Label>
        <Input 
          id="producer"
          value={producer}
          onChange={(e) => setProducer(e.target.value)}
          placeholder="The Alchemist" 
          className="text-base h-12 border-2 focus-visible:ring-brand"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input 
            id="year"
            type="number" 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2023" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="abv">ABV %</Label>
          <Input 
            id="abv"
            type="number" 
            step="0.1" 
            value={abv}
            onChange={(e) => setAbv(e.target.value)}
            placeholder="8.0" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-10)</Label>
          <Input 
            id="rating"
            type="number" 
            min="1" 
            max="10" 
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="10" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as DrinkStatus)}>
          <SelectTrigger className="text-base h-12 border-2">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tasted">Tasted</SelectItem>
            <SelectItem value="want_to_try">Want to Try</SelectItem>
            <SelectItem value="stocked">Stocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-media-primary">Drink Photo</Label>
        <div className="bg-media-surface-container border-2 border-media-outline-variant/30 rounded-xl overflow-hidden">
          <div className="flex border-b-2 border-media-outline-variant/20">
            <button
              type="button"
              onClick={() => setPhotoMode("upload")}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                photoMode === "upload" ? "bg-media-secondary text-white" : "text-media-on-surface-variant hover:bg-media-surface-container-high"
              )}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setPhotoMode("url")}
              className={cn(
                "flex-1 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors",
                photoMode === "url" ? "bg-media-secondary text-white" : "text-media-on-surface-variant hover:bg-media-surface-container-high"
              )}
            >
              <LinkIcon className="w-4 h-4" />
              URL
            </button>
          </div>

          <div className="p-4">
            {photoMode === "upload" ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-media-outline-variant/30 rounded-xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-media-surface-container-high transition-colors min-h-[120px]"
              >
                {previewUrl ? (
                  isNoPreviewFormat ? (
                    <div className="relative w-24 h-24 rounded-2xl bg-media-surface-container-high flex flex-col items-center justify-center gap-1 border-2 border-dashed border-media-outline-variant/50 text-media-primary p-2">
                      <ImageIcon className="w-6 h-6 text-media-secondary/80" />
                      <p className="text-[8px] font-bold text-center leading-tight">No preview for {selectedFile?.name.split('.').pop()?.toUpperCase()}</p>
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-media-secondary/20 shadow-inner">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-media-surface-container-high flex items-center justify-center text-media-on-surface-variant/30 border border-media-outline-variant/10">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-[10px] font-bold text-media-primary uppercase tracking-tight">Click to select photo</p>
                  <p className="text-[9px] text-media-on-surface-variant uppercase">PNG, JPG, WebP, HEIC or DNG</p>
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
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/photo.jpg"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setPreviewUrl(e.target.value || null);
                    }}
                    className="text-base h-12 border-2 focus-visible:ring-brand pr-10"
                  />
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-media-on-surface-variant pointer-events-none" />
                </div>
                {previewUrl && (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-media-outline-variant/20 mx-auto">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setPreviewUrl(null)} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bodyFeel">Body & Feel</Label>
          <Input 
            id="bodyFeel"
            value={bodyFeel}
            onChange={(e) => setBodyFeel(e.target.value)}
            placeholder="Creamy & Unfiltered" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="servingTemp">Serving Temp</Label>
          <Input 
            id="servingTemp"
            value={servingTemp}
            onChange={(e) => setServingTemp(e.target.value)}
            placeholder="6-8°C / 43-46°F" 
            className="text-base h-12 border-2 focus-visible:ring-brand"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pairings">Pairings</Label>
        <Input 
          id="pairings"
          value={pairings}
          onChange={(e) => setPairings(e.target.value)}
          placeholder="Pretzels, Weisswurst" 
          className="text-base h-12 border-2 focus-visible:ring-brand"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Hazy, juicy, delicious..." 
          className="min-h-[100px] text-base border-2 focus-visible:ring-brand"
        />
      </div>

      <div className="flex items-center gap-3 rounded-lg border-2 p-3 shadow-sm border-input">
        <Switch
          id="favorite"
          checked={favorite}
          onCheckedChange={setFavorite}
        />
        <div className="space-y-0.5">
          <Label htmlFor="favorite">Favorite</Label>
          <div className="text-sm text-muted-foreground">
            Mark as one of your favorites
          </div>
        </div>
      </div>
    </>
  );

  const buttonText = loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Drink';

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="p-0 border-none sm:max-w-3xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-3xl max-h-[90vh] flex flex-col font-lexend"
        >
          {/* Premium Header */}
          <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative shrink-0">
            <div className="flex justify-between items-start z-10 relative">
              <h2 className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend uppercase">
                {initialData ? 'Refine Entry' : 'Record Your Selection'}
              </h2>
              <button 
                type="button"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-media-on-primary-container/80 text-sm max-w-md z-10 relative font-medium leading-relaxed">
              Document the nuances of your selection, from the producer&apos;s terroir to the aromatic finish.
            </p>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-media-secondary opacity-10 blur-[80px] rounded-full translate-x-16 translate-y-16"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
            {showSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
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
              <>
            {/* Section 01: Core Identity */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
                <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Drink Identity</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-12 space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Drink Name *</label>
                  <input 
                    autoFocus
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl font-lexend placeholder:text-media-on-surface-variant/20"
                    placeholder="e.g. Chateau Margaux 2015"
                  />
                </div>

                <div className="md:col-span-6 space-y-3">
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

                <div className="md:col-span-6 space-y-3">
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

                <div className="md:col-span-8 space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Producer</label>
                  <input 
                    type="text"
                    value={producer}
                    onChange={(e) => setProducer(e.target.value)}
                    className="w-full px-8 py-4 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend placeholder:text-media-on-surface-variant/20"
                    placeholder="Estate name or producer"
                  />
                </div>

                <div className="md:col-span-4 space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Year</label>
                  <input 
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-8 py-4 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend placeholder:text-media-on-surface-variant/20"
                    placeholder="2023"
                  />
                </div>
              </div>
            </div>

            {/* Section 02: Technicals */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
                <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Technical Specs</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">ABV %</label>
                  <input 
                    type="text"
                    value={abv}
                    onChange={(e) => setAbv(e.target.value)}
                    className="w-full px-8 py-4 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend"
                    placeholder="13.5"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Serving Temp</label>
                  <input 
                    type="text"
                    value={servingTemp}
                    onChange={(e) => setServingTemp(e.target.value)}
                    className="w-full px-8 py-4 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend"
                    placeholder="18°C"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Rating</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-8 py-4 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend"
                    placeholder="1-10"
                  />
                </div>
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
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Body & Feel</label>
                    <input 
                      type="text"
                      value={bodyFeel}
                      onChange={(e) => setBodyFeel(e.target.value)}
                      className="w-full px-8 py-4 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend"
                      placeholder="Full-bodied, tannic..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Pairings</label>
                    <input 
                      type="text"
                      value={pairings}
                      onChange={(e) => setPairings(e.target.value)}
                      className="w-full px-8 py-4 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend"
                      placeholder="Roasted lamb..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Aromatic Notes</label>
                  <textarea 
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg resize-none placeholder:text-media-on-surface-variant/20 font-lexend"
                    placeholder="Additional tasting notes..."
                  />
                </div>

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

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-10 pt-10 border-t border-media-outline-variant/10 shrink-0">
              <button 
                type="button"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] text-media-on-surface-variant hover:text-media-primary transition-colors font-lexend"
              >
                Terminate
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="cursor-pointer px-10 py-5 bg-media-secondary text-media-on-secondary rounded-2xl font-bold tracking-tight shadow-2xl shadow-media-secondary/30 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-3 font-lexend uppercase"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-media-on-secondary/30 border-t-media-on-secondary animate-spin" />
                    Syncing...
                  </>
                ) : (
                  initialData ? 'Update Drink' : (isUploading ? 'Uploading...' : 'Save Drink')
                )}
              </button>
            </div>
          </>
        )}
      </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-3xl p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pt-6 pb-4 border-b text-left">
            <SheetTitle>{initialData ? 'Edit Drink' : 'Add Drink'}</SheetTitle>
            <SheetDescription>
              {initialData ? 'Update drink details' : 'Add a new drink to track'}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {showSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 space-y-8 animate-in fade-in slide-in-from-bottom-8">
                <div className="relative">
                  <TreeSuccess size={160} showText={false} />
                  <div className="absolute inset-0 bg-media-secondary/10 blur-3xl rounded-full -z-10 scale-150 animate-pulse" />
                </div>
                <div className="text-center space-y-3">
                  <h3 className="text-3xl font-bold text-media-primary font-lexend tracking-tight uppercase">Saved drink</h3>
                  <p className="text-media-on-surface-variant font-medium max-w-[280px] mx-auto">
                    Drink profile archived. Sensory data and producer technicals synced to the library.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {formFields}
                </div>
                <div className="border-t px-6 py-4 bg-background">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-16 text-lg font-black uppercase tracking-widest bg-media-secondary hover:brightness-110 text-media-on-secondary rounded-2xl shadow-xl shadow-media-secondary/20 transition-all active:scale-95"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    {loading ? 'Saving...' : (isUploading ? 'Uploading...' : (initialData ? 'Update Drink' : 'Save Drink'))}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
