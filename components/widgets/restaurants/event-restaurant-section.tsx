'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, UtensilsCrossed, Trash2, Star, ExternalLink } from 'lucide-react';
import type { Restaurant, RestaurantVisit } from '@/lib/db/restaurants';

interface EventRestaurantSectionProps {
  eventId: number;
  eventDate: string;
  visits: (RestaurantVisit & { restaurantName: string; restaurantSlug: string })[];
  onUpdate: () => void;
}

export function EventRestaurantSection({
  eventId,
  eventDate,
  visits,
  onUpdate,
}: EventRestaurantSectionProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [rating, setRating] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (showAddDialog) {
      fetchRestaurants();
    }
  }, [showAddDialog]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRestaurant) {
      toast.error('Please select a restaurant');
      return;
    }

    setLoading(true);

    try {
      const restaurant = restaurants.find(r => r.id.toString() === selectedRestaurant);
      if (!restaurant) throw new Error('Restaurant not found');

      const response = await fetch(`/api/restaurants/${restaurant.slug}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visit_date: eventDate,
          eventId,
          rating: rating ? parseInt(rating) : undefined,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to link restaurant');
      }

      toast.success('Restaurant linked to event');
      setShowAddDialog(false);
      setSelectedRestaurant('');
      setRating('');
      setNotes('');
      onUpdate();
    } catch (error) {
      console.error('Error linking restaurant:', error);
      toast.error('Failed to link restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (visit: RestaurantVisit & { restaurantSlug: string }) => {
    try {
      const response = await fetch(
        `/api/restaurants/${visit.restaurantSlug}/visits?visitId=${visit.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to remove restaurant');
      }

      toast.success('Restaurant removed from event');
      onUpdate();
    } catch (error) {
      console.error('Error removing restaurant:', error);
      toast.error('Failed to remove restaurant');
    }
  };

  // Filter out restaurants already linked to this event
  const availableRestaurants = restaurants.filter(
    r => !visits.some(v => v.restaurantId === r.id)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5" />
          Restaurants
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </CardHeader>
      <CardContent>
        {visits.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No restaurants linked to this event
          </p>
        ) : (
          <div className="space-y-3">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <Link
                      href={`/restaurants/${visit.restaurantSlug}`}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      {visit.restaurantName}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {visit.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {visit.rating}
                        </span>
                      )}
                      {visit.notes && (
                        <span className="line-clamp-1">{visit.notes}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(visit)}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Restaurant Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Restaurant to Event</DialogTitle>
            <DialogDescription>
              Select a restaurant to link to this event
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRestaurant} className="space-y-4">
            <div className="space-y-2">
              <Label>Restaurant *</Label>
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {availableRestaurants.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No restaurants available
                    </div>
                  ) : (
                    availableRestaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{restaurant.name}</span>
                          {restaurant.cuisine && (
                            <Badge variant="outline" className="text-xs">
                              {restaurant.cuisine}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rating (optional)</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Rate this visit 1-10" />
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
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you order?"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading || !selectedRestaurant} className="flex-1">
                {loading ? 'Linking...' : 'Link Restaurant'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
