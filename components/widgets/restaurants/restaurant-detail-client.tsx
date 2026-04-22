'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft } from 'lucide-react';

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

  const formatVisitDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      monthDay: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase(),
      year: d.getFullYear().toString()
    };
  };

  const getPriceRange = (range: number | null) => {
    if (!range) return null;
    return '$'.repeat(range);
  };

  return (
    <div className="flex flex-col min-h-screen font-lexend text-media-on-surface bg-media-background -m-8">
      {/* Hero Section */}
      <section className="relative h-[614px] w-full overflow-hidden">
        <img
          src={restaurant.poster || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=2000'}
          alt={restaurant.name}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-media-primary/80 via-transparent to-transparent"></div>
        <div className="absolute top-8 left-12 z-10">
          <Link href="/restaurants" className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            The Culinary Archive
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 p-12 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <nav className="flex flex-wrap gap-2 mb-4">
              {restaurant.cuisine && (
                <span className="bg-media-secondary px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-media-on-secondary">
                  {restaurant.cuisine}
                </span>
              )}
              {restaurant.price_range && (
                <span className="bg-media-primary-container px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-media-on-primary-container">
                  {getPriceRange(restaurant.price_range)}
                </span>
              )}
              {(restaurant.city || restaurant.state) && (
                <span className="bg-media-surface-container-lowest/20 backdrop-blur-sm px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest text-media-surface">
                  {[restaurant.city, restaurant.state].filter(Boolean).join(', ')}
                </span>
              )}
            </nav>
            <h1 className="text-5xl md:text-7xl font-black text-media-surface tracking-tighter leading-none mb-2">
              {restaurant.name}
            </h1>
            <p className="text-media-surface/80 max-w-xl font-medium tracking-tight text-lg italic">
              {restaurant.notes ? (restaurant.notes.length > 150 ? `${restaurant.notes.substring(0, 150)}...` : restaurant.notes) : `Discover the unique flavors and atmosphere of ${restaurant.name}.`}
            </p>
          </div>
          <div className="flex gap-4 mb-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="cursor-pointer bg-media-surface text-media-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-media-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Entry
            </button>
            <button
              onClick={() => setShowAddVisit(true)}
              className="cursor-pointer bg-media-secondary text-media-on-secondary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Visit
            </button>
          </div>
        </div>
      </section>

      {/* Bento Layout Content */}
      <section className="p-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Overall Rating Card */}
        <div className="md:col-span-4 bg-media-surface-container-lowest rounded-xl p-8 flex flex-col justify-between border-b-4 border-media-secondary/20 h-64 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="uppercase tracking-widest text-xs text-media-on-surface-variant font-bold">Overall Rating</p>
            <span className="material-symbols-outlined text-media-secondary font-variation-settings-'FILL' 1">star</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-8xl font-black text-media-primary tracking-tighter">
              {restaurant.rating || '—'}
            </span>
            <span className="text-2xl font-bold text-media-outline">/10</span>
          </div>
          <p className="text-sm text-media-on-surface-variant italic font-medium leading-relaxed line-clamp-2">
            &quot;{restaurant.visits[0]?.notes || restaurant.notes || 'A culinary destination worth exploring.'}&quot;
          </p>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-media-primary-container rounded-xl p-8 flex flex-col justify-center text-media-on-primary-container">
            <span className="material-symbols-outlined text-3xl mb-4">calendar_month</span>
            <p className="text-4xl font-bold tracking-tight text-media-surface">{restaurant.visitCount} Visits</p>
            <p className="uppercase tracking-widest text-[10px] mt-1 opacity-60">Total visit count in records</p>
          </div>
          <div className="bg-media-surface-container rounded-xl p-8 flex flex-col justify-center border-l-4 border-media-secondary">
            <span className="material-symbols-outlined text-3xl mb-4 text-media-secondary">event_repeat</span>
            <p className="text-4xl font-bold tracking-tight text-media-primary">
              {restaurant.visits.filter(v => v.eventId).length} Events
            </p>
            <p className="uppercase tracking-widest text-[10px] mt-1 text-media-on-surface-variant">Linked Editorial collections</p>
          </div>
        </div>

        {/* Visit History - Wide Editorial List */}
        <div className="md:col-span-12 mt-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black text-media-primary tracking-tighter">Visit History</h3>
            <div className="h-px flex-grow mx-8 bg-media-outline-variant/30"></div>
          </div>
          
          <div className="space-y-4">
            {restaurant.visits.length === 0 ? (
              <div className="bg-media-surface-container-low rounded-xl p-12 text-center">
                <p className="text-media-on-surface-variant font-medium italic">No visits recorded yet. Add your first experience!</p>
              </div>
            ) : (
              restaurant.visits.map((visit) => {
                const date = formatVisitDate(visit.visit_date);
                return (
                  <div key={visit.id} className="group bg-media-surface-container-low hover:bg-media-surface-container-high transition-all duration-300 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
                    <div className="flex-shrink-0 w-24">
                      <p className="text-media-primary font-black text-xl">{date.monthDay}</p>
                      <p className="text-media-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{date.year}</p>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-xl font-bold text-media-primary tracking-tight">
                          {visit.eventTitle || 'Casual Visit'}
                        </h4>
                        {visit.rating && (
                          <span className="bg-media-primary/10 text-media-primary px-2 py-0.5 rounded text-[10px] font-bold">
                            {visit.rating}/10
                          </span>
                        )}
                      </div>
                      <p className="text-media-on-surface-variant leading-relaxed text-sm">
                        {visit.notes || 'No detailed notes for this visit.'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-4">
                      {visit.rating && visit.rating >= 9 && (
                        <span className="bg-media-secondary/10 text-media-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">FAVORITE</span>
                      )}
                      <button 
                        onClick={() => handleDeleteVisit(visit.id)}
                        className="cursor-pointer material-symbols-outlined text-media-outline hover:text-media-error transition-colors p-2"
                      >
                        delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gallery/Asymmetric Feature */}
        <div className="md:col-span-12 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="relative group overflow-hidden rounded-xl h-96 lg:col-span-2 shadow-lg">
            <img
              src={restaurant.poster || 'https://images.unsplash.com/photo-1551183053-bf91e1d81141?auto=format&fit=crop&q=80&w=2000'}
              alt="Atmosphere"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-media-primary/20 group-hover:bg-transparent transition-colors"></div>
            <div className="absolute bottom-6 left-6">
              <p className="text-media-surface font-black text-2xl tracking-tighter">Signature Atmosphere</p>
              <p className="text-media-surface/80 text-xs font-bold uppercase tracking-widest font-bold">Captured in your collection</p>
            </div>
          </div>
          <div className="bg-media-surface-container-low rounded-xl p-12 flex flex-col justify-center border border-media-outline-variant/10">
            <h5 className="text-media-primary font-black text-4xl tracking-tighter mb-6 leading-tight">
              Consistency is the key flavor.
            </h5>
            <p className="text-media-on-surface-variant font-medium leading-relaxed mb-8">
              {restaurant.notes ? (restaurant.notes.length > 200 ? `${restaurant.notes.substring(0, 200)}...` : restaurant.notes) : `Every visit to ${restaurant.name} adds a new chapter to your culinary journal.`}
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-media-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-media-primary">restaurant</span>
              </div>
              <div>
                <p className="text-media-primary font-bold text-sm tracking-tight">{restaurant.cuisine || 'Cuisine Experience'}</p>
                <p className="text-media-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Curated Category</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone/Management */}
        <div className="md:col-span-12 mt-20 p-12 bg-media-error-container/10 rounded-xl flex flex-col md:flex-row items-center justify-between border-t border-media-error/10 gap-6">
          <div>
            <h4 className="text-media-error font-bold text-lg tracking-tight">Administrative Actions</h4>
            <p className="text-media-on-surface-variant text-sm mt-1">Manage this restaurant entry within your personal journal collection.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="cursor-pointer flex-1 md:flex-none bg-media-error text-media-on-error px-6 py-3 rounded-lg font-bold hover:bg-media-error/90 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Remove Restaurant
            </button>
          </div>
        </div>
      </section>

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
        <AlertDialogContent className="bg-media-surface-container-lowest border-media-outline-variant/20 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-media-primary font-black text-2xl tracking-tighter">Delete Restaurant?</AlertDialogTitle>
            <AlertDialogDescription className="text-media-on-surface-variant font-medium">
              This will permanently delete &quot;{restaurant.name}&quot; and all its visit history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg font-bold uppercase tracking-widest text-[10px] border-media-outline-variant/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-media-error text-media-on-error hover:bg-media-error/90 rounded-lg font-bold uppercase tracking-widest text-[10px]"
            >
              {deleting ? 'Deleting...' : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
