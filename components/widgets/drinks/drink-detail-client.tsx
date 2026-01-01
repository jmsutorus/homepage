'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Star, Calendar, MapPin, Pencil, Trash2, Plus, Wine, Heart } from 'lucide-react';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'tasted':
        return <Badge variant="default">Tasted</Badge>;
      case 'want_to_try':
        return <Badge variant="secondary">Want to Try</Badge>;
      case 'stocked':
        return <Badge variant="outline" className="text-green-600 border-green-600">Stocked</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 sm:py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => router.push('/drinks')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Drinks
      </Button>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <div className="relative h-48 w-full bg-muted overflow-hidden rounded-t-lg">
              {drink.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={drink.image_url}
                  alt={drink.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/20">
                  <Wine className="w-16 h-16" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              
              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{drink.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <span className="capitalize">{drink.type}</span>
                    {drink.producer && <span>• {drink.producer}</span>}
                  </div>
                </div>
                {drink.favorite && (
                   <Heart className="w-6 h-6 text-red-500 fill-red-500 mb-2" />
                )}
              </div>
            </div>

            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {getStatusBadge(drink.status)}
                
                {drink.rating && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {drink.rating}/10
                  </div>
                )}

                {drink.year && (
                  <Badge variant="outline">{drink.year}</Badge>
                )}

                {drink.abv && (
                  <Badge variant="outline">{drink.abv}% ABV</Badge>
                )}
              </div>

              {drink.notes && (
                <div className="bg-muted/50 p-4 rounded-lg mb-6 text-sm italic">
                  &ldquo;{drink.notes}&rdquo;
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit details
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tasting Log</h2>
              <Button size="sm" onClick={() => {
                setEditingLog(null);
                setShowLogDialog(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Log Drink
              </Button>
            </div>

            {drink.logs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  No tastings logged yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {drink.logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(log.date), 'MMM d, yyyy')}
                            {log.location && (
                              <>
                                <span>•</span>
                                <MapPin className="w-3 h-3" />
                                {log.location}
                              </>
                            )}
                          </div>
                          
                          {log.notes && (
                            <p className="text-sm mt-2">{log.notes}</p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {log.rating && (
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {log.rating}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => {
                                setEditingLog(log);
                                setShowLogDialog(true);
                              }}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteLog(log.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar stats? Maybe later */}
      </div>

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
    </div>
  );
}
