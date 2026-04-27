'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Image as ImageIcon, Plus, Star } from "lucide-react";
import { toast } from 'sonner';
import { SuccessOverlay } from '@/components/ui/animations/success-overlay';
import { useHaptic } from "@/hooks/use-haptic";
import type { Restaurant, RestaurantStatus } from '@/lib/db/restaurants';

const CUISINE_OPTIONS = [
  'American',
  'Chinese',
  'Italian',
  'Japanese',
  'Mexican',
  'Indian',
  'Thai',
  'French',
  'Mediterranean',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'Middle Eastern',
  'BBQ',
  'Seafood',
  'Pizza',
  'Burger',
  'Steakhouse',
  'Sushi',
  'Brunch',
  'Cafe',
  'Bakery',
  'Dessert',
  'Fast Food',
  'Food Truck',
  'Other',
];

interface RestaurantEditorialEditorProps {
  mode: 'create' | 'edit';
  restaurant?: Restaurant;
}

export function RestaurantEditorialEditor({
  mode,
  restaurant,
}: RestaurantEditorialEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { trigger } = useHaptic();
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Form state
  const [name, setName] = useState(restaurant?.name ?? '');
  const [cuisine, setCuisine] = useState(restaurant?.cuisine ?? '');
  const [priceRange, setPriceRange] = useState(restaurant?.price_range?.toString() ?? '');
  const [address, setAddress] = useState(restaurant?.address ?? '');
  const [city, setCity] = useState(restaurant?.city ?? '');
  const [state, setState] = useState(restaurant?.state ?? '');
  const [phone, setPhone] = useState(restaurant?.phone ?? '');
  const [website, setWebsite] = useState(restaurant?.website ?? '');
  const [poster, setPoster] = useState(restaurant?.poster ?? '');
  const [rating, setRating] = useState(restaurant?.rating?.toString() ?? '');
  const [notes, setNotes] = useState(restaurant?.notes ?? '');
  const [favorite, setFavorite] = useState(restaurant?.favorite ?? false);
  const [status, setStatus] = useState<RestaurantStatus>(restaurant?.status ?? 'visited');

  const isEditing = mode === 'edit' || !!restaurant;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        name: name.trim(),
        cuisine: cuisine || undefined,
        price_range: priceRange ? parseInt(priceRange) : undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        phone: phone || undefined,
        website: website || undefined,
        poster: poster || undefined,
        rating: rating ? parseInt(rating) : undefined,
        notes: notes || undefined,
        favorite,
        status,
      };

      const url = isEditing && restaurant
        ? `/api/restaurants/${restaurant.slug}`
        : '/api/restaurants';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save restaurant');
      }

      const result = await response.json();
      const slug = isEditing ? restaurant!.slug : result.slug;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const photoRes = await fetch(`/api/restaurants/${slug}/photo`, {
          method: "POST",
          body: formData,
        });

        if (!photoRes.ok) {
          const errorData = await photoRes.json();
          throw new Error(errorData.error || 'Failed to upload image file');
        }
      }

      if (isEditing) {
        toast.success('Restaurant updated');
        router.push(`/restaurants/${slug}`);
        router.refresh();
      } else {
        setSavedSlug(slug);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save restaurant');
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen text-media-primary selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed font-lexend pb-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-12">
        {/* Editorial Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-media-secondary font-bold uppercase tracking-[0.2em] text-xs mb-4 block">
              {isEditing ? 'Editorial Reflection' : 'New Gastronomy'}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-media-primary tracking-tighter leading-none">
              {isEditing ? (
                <>Refine Your <span className="italic font-light">Experience</span></>
              ) : (
                <>Establish a New <span className="italic font-light">Registry</span></>
              )}
            </h1>
            <p className="mt-6 text-media-on-surface-variant text-lg leading-relaxed font-light">
              Curate your gastronomic registry. Document the atmosphere, geography, and sensory evaluation of your dining experiences.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="cursor-pointer px-6 py-3 bg-media-surface-container text-media-primary rounded-lg font-medium hover:bg-media-surface-container-high transition-all"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => handleSave()}
              disabled={isSaving}
              className="cursor-pointer flex items-center gap-2 px-8 py-3 bg-media-secondary text-media-on-secondary rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-md shadow-media-secondary/20 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Establish Registry')}
            </button>
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column: Identity & Image */}
          <div className="md:col-span-4 space-y-12">
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-4">
                <h2 className="text-2xl font-bold text-media-primary tracking-tight">Identity</h2>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Restaurant Designation</label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant text-lg font-medium" 
                    placeholder="e.g. The Silver Spruce" 
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Cuisine Portfolio</label>
                  <Select value={cuisine} onValueChange={setCuisine}>
                    <SelectTrigger className="w-full bg-media-surface-container-low border-none rounded-lg p-6 h-auto focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary font-medium">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container-low border-media-outline-variant/10">
                      {CUISINE_OPTIONS.map(opt => (
                        <SelectItem key={opt} value={opt} className="focus:bg-media-secondary/10 transition-colors cursor-pointer">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Financial Tier (Price)</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full bg-media-surface-container-low border-none rounded-lg p-6 h-auto focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary font-medium">
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container-low border-media-outline-variant/10">
                      <SelectItem value="1">$ (Budget)</SelectItem>
                      <SelectItem value="2">$$ (Moderate)</SelectItem>
                      <SelectItem value="3">$$$ (Upscale)</SelectItem>
                      <SelectItem value="4">$$$$ (Fine Dining)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Visitation Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as RestaurantStatus)}>
                    <SelectTrigger className="w-full bg-media-surface-container-low border-none rounded-lg p-6 h-auto focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container-low border-media-outline-variant/10">
                      <SelectItem value="visited">Visited</SelectItem>
                      <SelectItem value="want_to_try">Want to Try</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Visual Element / Poster Preview */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div 
              className="relative group overflow-hidden rounded-xl bg-media-surface-container border border-media-outline-variant/10 shadow-xl cursor-pointer aspect-video md:aspect-[3/4]"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl || poster ? (
                <Image 
                  src={previewUrl || poster} 
                  alt="Restaurant Preview" 
                  fill
                  className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-media-on-surface-variant/30">
                  <ImageIcon className="w-16 h-16 stroke-[1]" />
                  <span className="text-xs uppercase font-bold tracking-widest">No Visual Reference</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-media-primary/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-8 left-8 text-media-on-primary font-bold text-2xl tracking-tight">
                {previewUrl || poster ? 'Visual Reference' : 'Assign Placeholder'}
              </div>
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30">
                   <Plus className="text-white w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Geography */}
          <div className="md:col-span-8 bg-media-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-[0_24px_80px_rgba(6,27,14,0.03)] border border-media-outline-variant/5 space-y-12">
            {/* Experience */}
            <section className="space-y-12">
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-4">
                <h2 className="text-2xl font-bold text-media-primary tracking-tight">Experience</h2>
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => {
                      trigger("light");
                      setFavorite(!favorite);
                    }}
                    className="cursor-pointer group relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-media-secondary/10 active:scale-90 transition-all"
                    title={favorite ? "Remove from Favorites" : "Mark as Favorite"}
                  >
                    <Star 
                      className={`w-6 h-6 transition-all ${favorite ? 'fill-media-secondary text-media-secondary' : 'text-media-on-surface-variant/40 group-hover:text-media-secondary'}`} 
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Sensory Evaluation (Rating)</label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger className="w-full bg-media-surface-container-low border-none rounded-lg p-6 h-auto focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary font-medium">
                      <SelectValue placeholder="Rate 1-10" />
                    </SelectTrigger>
                    <SelectContent className="bg-media-surface-container-low border-media-outline-variant/10">
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()} className="font-lexend py-3 px-8 text-center font-black">
                          {(i + 1).toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Digital Frontier (Website)</label>
                  <input 
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="https://..." 
                  />
                </div>
              </div>
            </section>

            {/* Geography section */}
            <section className="space-y-12">
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-4">
                <h2 className="text-2xl font-bold text-media-primary tracking-tight">Geography</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-12 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Street Address</label>
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="Street address" 
                  />
                </div>

                <div className="md:col-span-6 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">City</label>
                  <input 
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="City" 
                  />
                </div>

                <div className="md:col-span-6 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">State / Territory</label>
                  <input 
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="State" 
                  />
                </div>

                <div className="md:col-span-6 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Vocal Link (Phone)</label>
                  <input 
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="Phone number" 
                  />
                </div>

                <div className="md:col-span-6 group">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1">Visual Asset (Cover URL)</label>
                  <input 
                    type="url"
                    value={poster}
                    onChange={(e) => setPoster(e.target.value)}
                    className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline-variant" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>
              </div>
            </section>

            {/* Narrative Area */}
            <section className="space-y-8 flex flex-col">
              <div className="flex items-center justify-between border-b border-media-outline-variant/10 pb-4">
                <h2 className="text-2xl font-bold text-media-primary tracking-tight">Narrative Context</h2>
              </div>

              <div className="flex flex-col">
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full flex-1 bg-transparent border-none focus:ring-0 p-0 text-xl leading-[1.8] text-media-on-surface-variant font-light resize-none placeholder:text-media-outline-variant/30 min-h-[150px]" 
                  placeholder="Capture the atmosphere, specialty dishes, or overall vibe..." 
                />
              </div>
            </section>
            {/* Mobile Create/Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              onClick={() => {
                trigger("success");
              }}
              className="md:hidden w-full py-4 mt-8 bg-media-secondary text-media-on-secondary font-bold text-lg rounded-xl shadow-lg shadow-media-secondary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Establish Registry')}
            </button>
          </div>
        </form>
      </div>

      <SuccessOverlay 
        show={showSuccess} 
        onComplete={() => {
          if (savedSlug) {
            router.push(`/restaurants/${savedSlug}`);
          } else {
            router.push('/restaurants');
          }
          router.refresh();
        }} 
      />
    </main>
  );
}
