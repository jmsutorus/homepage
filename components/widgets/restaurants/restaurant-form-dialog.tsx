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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Restaurant' : 'Add Restaurant'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update restaurant details' : 'Add a new restaurant to track'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Restaurant name"
              required
            />
          </div>

          {/* Cuisine & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine">Cuisine</Label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_range">Price Range</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">$ (Budget)</SelectItem>
                  <SelectItem value="2">$$ (Moderate)</SelectItem>
                  <SelectItem value="3">$$$ (Upscale)</SelectItem>
                  <SelectItem value="4">$$$$ (Fine Dining)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street address"
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="poster">Cover Image URL</Label>
            <Input
              id="poster"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Rating & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Your Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Rate 1-10" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RestaurantStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visited">Visited</SelectItem>
                  <SelectItem value="want_to_try">Want to Try</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Personal notes about the restaurant..."
              rows={3}
            />
          </div>

          {/* Favorite */}
          <div className="flex items-center gap-3">
            <Switch
              id="favorite"
              checked={favorite}
              onCheckedChange={setFavorite}
            />
            <Label htmlFor="favorite">Mark as favorite</Label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Restaurant'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
