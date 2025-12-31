'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Globe,
  Star,
  Heart,
  DollarSign,
  Calendar,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import type { RestaurantWithVisits } from '@/lib/db/restaurants';
import { RestaurantFormDialog } from './restaurant-form-dialog';
import { AddVisitDialog } from './add-visit-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RestaurantDetailClientProps {
  restaurantData: RestaurantWithVisits;
}

export function RestaurantDetailClient({ restaurantData: initialData }: RestaurantDetailClientProps) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(initialData);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getPriceRange = (range: number | null) => {
    if (!range) return null;
    return '$'.repeat(range);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'visited':
        return <Badge variant="default">Visited</Badge>;
      case 'want_to_try':
        return <Badge variant="secondary">Want to Try</Badge>;
      case 'closed':
        return <Badge variant="destructive">Closed</Badge>;
      default:
        return null;
    }
  };

  const handleUpdate = async () => {
    const response = await fetch(`/api/restaurants/${restaurant.slug}`, {
      cache: 'no-store',
    });
    if (response.ok) {
      const freshData = await response.json();
      setRestaurant(freshData);
    }
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurant.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete restaurant');
      }

      toast.success('Restaurant deleted');
      router.push('/restaurants');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteVisit = async (visitId: number) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurant.slug}/visits?visitId=${visitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete visit');
      }

      toast.success('Visit removed');
      handleUpdate();
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast.error('Failed to delete visit');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <Button variant="ghost" asChild className="w-fit">
          <Link href="/restaurants">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Restaurants
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              {restaurant.favorite && (
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {getStatusBadge(restaurant.status)}
              {restaurant.cuisine && (
                <Badge variant="outline">{restaurant.cuisine}</Badge>
              )}
              {restaurant.price_range && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {getPriceRange(restaurant.price_range)}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowEditForm(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {restaurant.poster && (
        <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6">
{/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={restaurant.poster}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Rating */}
            {restaurant.rating && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold">{restaurant.rating}</span>
                <span className="text-muted-foreground">/10</span>
              </div>
            )}

            {/* Location */}
            {(restaurant.address || restaurant.city || restaurant.state) && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  {restaurant.address && <div>{restaurant.address}</div>}
                  {(restaurant.city || restaurant.state) && (
                    <div className="text-muted-foreground">
                      {[restaurant.city, restaurant.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phone */}
            {restaurant.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${restaurant.phone}`} className="hover:underline">
                  {restaurant.phone}
                </a>
              </div>
            )}

            {/* Website */}
            {restaurant.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a
                  href={restaurant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Notes */}
            {restaurant.notes && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">{restaurant.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold">{restaurant.visitCount}</div>
                <div className="text-sm text-muted-foreground">
                  {restaurant.visitCount === 1 ? 'Visit' : 'Visits'}
                </div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl font-bold">
                  {restaurant.visits.filter(v => v.eventId).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Linked Events
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Visit History</CardTitle>
          <Button size="sm" onClick={() => setShowAddVisit(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Visit
          </Button>
        </CardHeader>
        <CardContent>
          {restaurant.visits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No visits recorded yet
            </p>
          ) : (
            <div className="space-y-4">
              {restaurant.visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(visit.visit_date)}</span>
                      {visit.rating && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {visit.rating}
                        </Badge>
                      )}
                    </div>
                    {visit.eventTitle && (
                      <Link
                        href={`/events/${visit.eventSlug}`}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {visit.eventTitle}
                      </Link>
                    )}
                    {visit.notes && (
                      <p className="text-sm text-muted-foreground">{visit.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteVisit(visit.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <RestaurantFormDialog
        open={showEditForm}
        onOpenChange={setShowEditForm}
        restaurant={restaurant}
        onSuccess={handleUpdate}
      />

      {/* Add Visit Dialog */}
      <AddVisitDialog
        open={showAddVisit}
        onOpenChange={setShowAddVisit}
        restaurantSlug={restaurant.slug}
        onSuccess={handleUpdate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{restaurant.name}&quot; and all its visit history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
