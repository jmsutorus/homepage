'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Send, X } from "lucide-react";
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from 'sonner';
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

interface RestaurantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  restaurant?: Restaurant;
}

export function RestaurantFormDialog({
  open,
  onOpenChange,
  onSuccess,
  restaurant,
}: RestaurantFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const isEditing = !!restaurant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Restaurant name is required');
      return;
    }

    setLoading(true);

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

      const url = isEditing
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

      toast.success(isEditing ? 'Restaurant updated' : 'Restaurant added');
      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save restaurant');
      } finally {
      setLoading(false);
    }
  };

  const buttonText = loading ? 'Processing...' : isEditing ? 'Update Blueprint' : 'Establish Registry';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        showCloseButton={false} 
        className="p-0 border-none sm:max-w-3xl bg-media-surface-container-lowest overflow-hidden shadow-[0_32px_64px_-12px_rgba(6,27,14,0.12)] rounded-3xl max-h-[90vh] flex flex-col"
      >
        {/* Premium Header */}
        <div className="bg-media-primary-container px-10 py-12 flex flex-col gap-2 relative shrink-0">
          <div className="flex justify-between items-start z-10 relative">
            <DialogTitle className="text-3xl font-bold tracking-tight text-media-on-primary-container font-lexend uppercase">
              {isEditing ? 'Refine Registry' : 'Define New Entry'}
            </DialogTitle>
            <button 
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer text-media-on-primary-container/60 hover:text-media-on-primary-container transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-media-on-primary-container/80 text-sm max-w-md z-10 relative font-medium leading-relaxed">
            Curate your gastronomic registry. Document the atmosphere, geography, and sensory evaluation of your dining experiences.
          </p>
          {/* Decorative element */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-media-secondary opacity-10 blur-[80px] rounded-full translate-x-16 translate-y-16"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Section 01: Identity */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 01</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Identity</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-12 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Restaurant Designation</label>
                <div className="relative">
                  <input 
                    autoFocus
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-2xl font-lexend placeholder:text-media-on-surface-variant/20"
                    placeholder="e.g. The Silver Spruce"
                  />
                </div>
              </div>

              <div className="md:col-span-12 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Narrative Context (Description/Notes)</label>
                <div className="relative">
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg resize-none placeholder:text-media-on-surface-variant/20 font-lexend"
                    placeholder="Capture the atmosphere, specialty dishes, or overall vibe..."
                  />
                </div>
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Cuisine Portfolio</label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger className="w-full px-8 py-7 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-base font-lexend">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container-lowest border-media-outline-variant rounded-xl shadow-2xl">
                    {CUISINE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option} className="font-lexend py-3 focus:bg-media-primary/10">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Financial Tier (Price)</label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full px-8 py-7 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-base font-lexend">
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container-lowest border-media-outline-variant rounded-xl shadow-2xl">
                    <SelectItem value="1" className="font-lexend py-3 px-8">$ (Budget)</SelectItem>
                    <SelectItem value="2" className="font-lexend py-3 px-8">$$ (Moderate)</SelectItem>
                    <SelectItem value="3" className="font-lexend py-3 px-8">$$$ (Upscale)</SelectItem>
                    <SelectItem value="4" className="font-lexend py-3 px-8">$$$$ (Fine Dining)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Visitation Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as RestaurantStatus)}>
                  <SelectTrigger className="w-full px-8 py-7 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-base font-lexend">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container-lowest border-media-outline-variant rounded-xl shadow-2xl">
                    <SelectItem value="visited" className="font-lexend py-3 px-8 uppercase tracking-widest">Visited</SelectItem>
                    <SelectItem value="want_to_try" className="font-lexend py-3 px-8 uppercase tracking-widest">Want to Try</SelectItem>
                    <SelectItem value="closed" className="font-lexend py-3 px-8 uppercase tracking-widest">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Digital Frontier (Website)</label>
                <input 
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Section 02: Geography */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 02</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Geography</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-12 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Street Address</label>
                <input 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="Street address"
                />
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">City</label>
                <input 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend"
                  placeholder="City"
                />
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">State / Territory</label>
                <input 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-lg font-lexend"
                  placeholder="State"
                />
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Vocal Link (Phone)</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-lg font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="Phone number"
                />
              </div>

              <div className="md:col-span-6 space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Visual Asset (Cover URL)</label>
                <input 
                  value={poster}
                  onChange={(e) => setPoster(e.target.value)}
                  className="w-full px-8 py-5 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-medium text-base font-lexend placeholder:text-media-on-surface-variant/20"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </div>

          {/* Section 03: Experience */}
          <div className="space-y-8 pb-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-media-secondary px-3 py-1 bg-media-secondary/10 rounded-full">Section 03</span>
              <h3 className="text-xl font-bold text-media-primary tracking-tight font-lexend">Experience</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-media-on-surface-variant">Sensory Evaluation (Rating)</label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger className="w-full px-8 py-7 bg-media-surface-container-low border-2 border-transparent rounded-2xl focus:ring-0 focus:border-media-secondary focus:bg-media-surface-container-high transition-all text-media-primary font-bold text-base font-lexend">
                    <SelectValue placeholder="Rate 1-10" />
                  </SelectTrigger>
                  <SelectContent className="bg-media-surface-container-lowest border-media-outline-variant rounded-xl shadow-2xl">
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()} className="font-lexend py-3 px-8 text-center font-black">
                        {(i + 1).toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 flex flex-col justify-end">
                <div 
                  onClick={() => setFavorite(!favorite)}
                  className={`flex items-center justify-between px-8 py-5 rounded-2xl border-2 transition-all cursor-pointer ${favorite ? 'bg-media-secondary/10 border-media-secondary/30' : 'bg-media-surface-container-low border-transparent'}`}
                >
                  <label className="text-[10px] uppercase tracking-widest font-bold text-media-primary">Portfolio Favorite</label>
                  <Switch
                    checked={favorite}
                    onCheckedChange={setFavorite}
                    className="data-[state=checked]:bg-media-secondary"
                  />
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
              disabled={loading || !name.trim()}
              className="cursor-pointer px-10 py-5 bg-media-secondary text-media-on-secondary rounded-2xl font-bold tracking-tight shadow-2xl shadow-media-secondary/30 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50 disabled:scale-100 flex items-center gap-3 font-lexend uppercase"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-media-on-secondary/30 border-t-media-on-secondary animate-spin" />
                  Processing...
                </>
              ) : (
                buttonText
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
