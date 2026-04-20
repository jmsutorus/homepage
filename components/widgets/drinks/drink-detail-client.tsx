'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Calendar, MapPin, Pencil, Trash2, Plus, Wine, Heart, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DrinkWithLogs } from '@/lib/db/drinks';
import { DrinkFormDialog } from './drink-form-dialog';
import { DrinkLogDialog } from './drink-log-dialog';

interface DrinkDetailClientProps {
  drink: DrinkWithLogs;
}

export function DrinkDetailClient({ drink }: DrinkDetailClientProps) {
  const router = useRouter();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null); // Using any for simplicity with log type matching

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this drink?')) return;

    try {
      const res = await fetch(`/api/drinks/${drink.slug}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Drink deleted');
      router.push('/drinks');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete drink');
    }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const res = await fetch(`/api/drinks/logs/${logId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete log');

      toast.success('Log deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete log');
    }
  };

  // Prefill defaults based on type
  const getDefaults = (type: string | null) => {
    switch (type) {
      case 'beer':
        return {
          body_feel: 'Carbonated & Refreshing',
          serving_temp: '3-7°C / 38-45°F',
          pairings: 'Burgers, Pretzels, Salty Snacks'
        };
      case 'wine':
        return {
          body_feel: 'Smooth & Elegant',
          serving_temp: '8-18°C / 46-64°F',
          pairings: 'Cheese, Pasta, Roasted Meats'
        };
      case 'cocktail':
        return {
          body_feel: 'Balanced & Spirit-Forward',
          serving_temp: 'Served Chilled',
          pairings: 'Appetizers, Citrusy Bites'
        };
      case 'spirit':
        return {
          body_feel: 'Intense & Complex',
          serving_temp: 'Room Temperature or On Rocks',
          pairings: 'Chocolate, Cigars, Nuts'
        };
      case 'coffee':
        return {
          body_feel: 'Rich & Aromatic',
          serving_temp: '85-95°C / 185-205°F',
          pairings: 'Pastries, Breakfast'
        };
      case 'tea':
        return {
          body_feel: 'Delicate & Soothing',
          serving_temp: '70-100°C / 160-212°F',
          pairings: 'Biscuits, Scones'
        };
      default:
        return {
          body_feel: 'N/A',
          serving_temp: 'N/A',
          pairings: 'N/A'
        };
    }
  };

  const defaults = getDefaults(drink.type);
  const bodyFeel = drink.body_feel || defaults.body_feel;
  const servingTemp = drink.serving_temp || defaults.serving_temp;
  const pairings = drink.pairings || defaults.pairings;

  return (
    <main className="min-h-screen bg-media-background max-w-screen-2xl mx-auto px-6 pt-8 pb-12 font-lexend text-media-on-surface">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-8 pl-0 hover:bg-transparent hover:text-media-secondary group flex items-center gap-2"
        onClick={() => router.push('/drinks')}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-bold tracking-tight text-media-on-surface">Library Archive</span>
      </Button>

      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 relative">
        <div className="lg:col-span-7 relative z-10">
          <div className="relative aspect-[4/5] md:aspect-[16/10] overflow-hidden rounded-xl bg-media-surface-container-low shadow-sm group">
            {drink.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={drink.image_url}
                alt={drink.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-media-primary-container to-media-surface-container flex items-center justify-center">
                <Wine className="w-24 h-24 text-media-primary/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-media-primary/40 to-transparent"></div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-end lg:pl-12 pt-8 lg:pt-0">
          <div className="mb-4">
            <span className="inline-block text-media-secondary font-medium uppercase tracking-[0.3em] text-[10px] mb-4">
              {drink.producer || drink.type || 'Private Collection'}
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-media-primary tracking-tighter leading-[0.85] mb-6 break-words">
              {drink.name}
            </h1>
            <p className="text-xl text-media-on-surface-variant font-medium tracking-tight capitalize">
              {drink.type} {drink.year ? `• ${drink.year}` : ''}
            </p>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="bg-media-surface-container-low px-4 py-2.5 rounded-full flex items-center gap-2 border border-media-outline-variant/30">
              <Star className="w-4 h-4 text-media-secondary fill-media-secondary" />
              <span className="text-media-primary font-bold">{drink.rating || '—'}</span>
              <span className="text-media-on-surface-variant text-sm">/ 10</span>
            </div>
            {drink.abv && (
               <div className="bg-media-surface-container-low px-4 py-2.5 rounded-full border border-media-outline-variant/30">
                <span className="text-media-on-surface-variant font-medium text-[10px] uppercase tracking-widest">Strength:</span>
                <span className="text-media-primary font-bold ml-1">{drink.abv}% ABV</span>
              </div>
            )}
            <div className="bg-media-surface-container-low px-4 py-2.5 rounded-full border border-media-outline-variant/30">
              <span className="text-media-on-surface-variant font-medium text-[10px] uppercase tracking-widest">Status:</span>
              <span className="text-media-primary font-bold ml-1 capitalize">{drink.status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={() => setShowEditDialog(true)}
              className="bg-media-secondary text-media-on-secondary px-8 py-4 rounded-xl font-bold tracking-tight hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-media-secondary/10"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
            <button 
              onClick={handleDelete}
              className="bg-media-primary-fixed text-media-on-primary-fixed px-6 py-4 rounded-xl font-bold tracking-tight hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95 flex items-center justify-center group border border-media-outline-variant/20"
            >
              <Trash2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
            </button>
          </div>
        </div>
      </section>

      {/* Detailed Metadata Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="bg-media-surface-container-low p-6 rounded-2xl border border-media-surface-container-high flex items-center gap-4 group transition-colors hover:border-media-secondary/20">
          <div className="w-12 h-12 rounded-xl bg-media-surface-container-highest flex items-center justify-center group-hover:bg-media-secondary/10 transition-colors">
            <Wine className="w-6 h-6 text-media-primary group-hover:text-media-secondary transition-colors" />
          </div>
          <div>
            <p className="text-media-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Body & Feel</p>
            <h4 className="text-lg font-bold text-media-primary tracking-tight">{bodyFeel}</h4>
          </div>
        </div>

        <div className="bg-media-primary text-media-on-primary p-6 rounded-2xl flex items-center gap-4 shadow-xl shadow-media-primary/10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-media-secondary-fixed-dim" />
          </div>
          <div>
            <p className="text-media-primary-fixed-dim text-[10px] uppercase tracking-widest font-bold">Serving Guide</p>
            <h4 className="text-lg font-bold tracking-tight">{servingTemp}</h4>
          </div>
        </div>

        <div className="bg-media-surface-container-highest p-6 rounded-2xl flex items-center gap-4 group transition-colors hover:border-media-secondary/20 border border-transparent">
          <div className="w-12 h-12 rounded-xl bg-media-surface-container-low flex items-center justify-center group-hover:bg-media-secondary/10 transition-colors">
             <Utensils className="w-6 h-6 text-media-primary group-hover:text-media-secondary transition-colors" />
          </div>
          <div>
            <p className="text-media-on-surface-variant text-[10px] uppercase tracking-widest font-bold">Pairings</p>
            <h4 className="text-lg font-bold text-media-primary tracking-tight">{pairings}</h4>
          </div>
        </div>
      </section>

      {/* Tasting Log Section */}
      <section className="mb-32">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-media-primary tracking-tighter">Tasting Log</h2>
            <p className="text-media-on-surface-variant mt-2 font-medium">A curated chronicle of your sensory journeys.</p>
          </div>
          <button 
            onClick={() => {
              setEditingLog(null);
              setShowLogDialog(true);
            }}
            className="text-media-secondary font-bold flex items-center gap-2 hover:opacity-70 transition-opacity active:scale-95"
          >
            <Plus className="w-5 h-5 bg-media-secondary/10 rounded-full p-1" />
            Add Chapter
          </button>
        </div>

        {drink.logs.length === 0 ? (
          <div className="bg-media-surface-container-lowest py-20 rounded-2xl border border-dashed border-media-outline-variant/50 text-center">
            <Wine className="w-12 h-12 text-media-on-surface-variant/20 mx-auto mb-4" />
            <p className="text-media-on-surface-variant font-medium">No experiences recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drink.logs.map((log, index) => (
              <div 
                key={log.id}
                className={`group relative p-6 md:p-8 rounded-2xl transition-all duration-300 border border-media-outline-variant/10 hover:scale-[1.01] hover:shadow-xl hover:shadow-media-primary/5 ${
                  index % 2 === 0 ? 'bg-media-surface-container-lowest' : 'bg-media-surface-container'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-2">
                    <p className="text-media-secondary font-bold text-lg leading-none mb-1">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                    <p className="text-media-on-surface-variant text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {log.location || 'Private Tasting'}
                    </p>
                  </div>
                  <div className="md:col-span-7">
                    <p className="text-media-primary leading-relaxed font-medium">
                      {log.notes || 'No detailed notes provided for this experience.'}
                    </p>
                  </div>
                  <div className="md:col-span-3 flex justify-end items-center gap-6">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < (log.rating ? log.rating / 2 : 0) ? 'text-media-secondary fill-media-secondary' : 'text-media-outline-variant'}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setEditingLog(log);
                          setShowLogDialog(true);
                        }}
                        className="p-2 hover:bg-media-secondary/10 rounded-lg text-media-on-surface-variant hover:text-media-secondary transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg text-media-on-surface-variant hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <DrinkFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          setShowEditDialog(false);
          router.refresh();
        }}
        initialData={drink}
      />

      <DrinkLogDialog
        drinkSlug={drink.slug}
        open={showLogDialog}
        onOpenChange={(open) => {
          setShowLogDialog(open);
          if (!open) setEditingLog(null);
        }}
        onSuccess={() => {
          setShowLogDialog(false);
          setEditingLog(null);
          router.refresh();
        }}
        initialData={editingLog || undefined}
      />
    </main>
  );
}
